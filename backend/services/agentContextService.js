import BusinessProfile from '../models/BusinessProfile.js';
import KnowledgeBase from '../models/KnowledgeBase.js';

/**
 * Service for dynamically building agent context from business profile data
 * Auto-populates agent prompts with company info, price sheets, vendors, etc.
 */
class AgentContextService {
  /**
   * Build comprehensive context object for an agent
   * @param {String} userId - User ID
   * @returns {Object} Formatted context data
   */
  async buildAgentContext(userId) {
    try {
      const profile = await BusinessProfile.findOne({ userId });

      if (!profile) {
        return this.getDefaultContext();
      }

      const context = {
        // Company Information
        company: {
          name: profile.companyName || 'Your Company',
          legalName: profile.legalName,
          phone: profile.phone,
          email: profile.email,
          website: profile.website,
          yearsInBusiness: profile.yearsInBusiness,
          numberOfEmployees: profile.numberOfEmployees,
        },

        // Business Details
        business: {
          industry: profile.industry,
          businessType: profile.businessType,
          serviceArea: this.formatServiceArea(profile.serviceArea),
        },

        // Address Information
        address: profile.address ? {
          street: profile.address.street,
          city: profile.address.city,
          state: profile.address.state,
          zipCode: profile.address.zipCode,
          country: profile.address.country || 'USA',
          full: this.formatAddress(profile.address),
        } : null,

        // Pricing & Procedures
        pricing: {
          defaultMargin: profile.defaultMargin ? `${profile.defaultMargin}%` : '35%',
          paymentTerms: profile.paymentTerms || 'Due on Receipt',
          quoteApprovalRequired: profile.quoteApprovalRequired || false,
          warrantyPeriod: profile.warrantyPeriod ? `${profile.warrantyPeriod} months` : 'Standard Warranty',
        },

        // Team Members (for routing/escalation)
        team: (profile.teamMembers || [])
          .filter(member => member.active)
          .map(member => ({
            name: member.name,
            role: member.role,
            phone: member.phone,
            email: member.email,
          })),

        // Price Sheets
        priceSheets: (profile.priceSheets || []).map(sheet => ({
          name: sheet.fileName,
          uploadedAt: sheet.uploadedAt,
          url: sheet.url,
        })),

        // Integration Status
        integrations: {
          quickbooks: profile.quickbooksSync?.enabled || false,
          google: profile.googleSync?.enabled || false,
        },
      };

      return context;
    } catch (error) {
      console.error('Error building agent context:', error);
      return this.getDefaultContext();
    }
  }

  /**
   * Generate formatted prompt template with context variables
   * @param {Object} context - Context data from buildAgentContext
   * @returns {String} Formatted context for system prompt
   */
  generateContextPrompt(context) {
    const parts = [];

    // Company Information
    if (context.company.name) {
      parts.push(`Company Name: ${context.company.name}`);
      if (context.company.legalName && context.company.legalName !== context.company.name) {
        parts.push(`Legal Name: ${context.company.legalName}`);
      }
    }

    // Contact Information
    if (context.company.phone) {
      parts.push(`Phone: ${context.company.phone}`);
    }
    if (context.company.email) {
      parts.push(`Email: ${context.company.email}`);
    }
    if (context.company.website) {
      parts.push(`Website: ${context.company.website}`);
    }

    // Business Credentials
    if (context.company.yearsInBusiness) {
      parts.push(`Years in Business: ${context.company.yearsInBusiness}`);
    }

    // Industry & Type
    if (context.business.industry) {
      parts.push(`Industry: ${context.business.industry}`);
    }
    if (context.business.businessType) {
      parts.push(`Business Type: ${context.business.businessType}`);
    }

    // Service Area
    if (context.business.serviceArea) {
      parts.push(`Service Area: ${context.business.serviceArea}`);
    }

    // Address
    if (context.address && context.address.full) {
      parts.push(`Location: ${context.address.full}`);
    }

    // Pricing Information
    parts.push(`\nPricing & Payment Information:`);
    parts.push(`- Default Margin: ${context.pricing.defaultMargin}`);
    parts.push(`- Payment Terms: ${context.pricing.paymentTerms}`);
    parts.push(`- Warranty: ${context.pricing.warrantyPeriod}`);
    if (context.pricing.quoteApprovalRequired) {
      parts.push(`- All quotes require management approval before finalizing`);
    }

    // Team Information (for escalation)
    if (context.team && context.team.length > 0) {
      parts.push(`\nTeam Members for Escalation:`);
      context.team.forEach(member => {
        parts.push(`- ${member.name} (${member.role}): ${member.phone || member.email}`);
      });
    }

    // Price Sheets Available
    if (context.priceSheets && context.priceSheets.length > 0) {
      parts.push(`\nPrice Sheets Available: ${context.priceSheets.length} document(s)`);
      context.priceSheets.forEach(sheet => {
        parts.push(`- ${sheet.name}`);
      });
    }

    return parts.join('\n');
  }

  /**
   * Enhance agent system prompt with dynamic context
   * @param {String} basePrompt - Original system prompt
   * @param {String} userId - User ID
   * @returns {String} Enhanced prompt with business context
   */
  async enhanceAgentPrompt(basePrompt, userId) {
    const context = await this.buildAgentContext(userId);
    const contextPrompt = this.generateContextPrompt(context);

    // Replace placeholders if they exist
    let enhancedPrompt = basePrompt
      .replace(/\{\{company_name\}\}/g, context.company.name)
      .replace(/\{\{company_phone\}\}/g, context.company.phone || 'N/A')
      .replace(/\{\{company_email\}\}/g, context.company.email || 'N/A')
      .replace(/\{\{company_website\}\}/g, context.company.website || 'N/A')
      .replace(/\{\{service_area\}\}/g, context.business.serviceArea || 'N/A')
      .replace(/\{\{payment_terms\}\}/g, context.pricing.paymentTerms);

    // Append context if not already present
    if (!enhancedPrompt.includes('Company Name:')) {
      enhancedPrompt = `${enhancedPrompt}\n\n--- BUSINESS CONTEXT ---\n${contextPrompt}`;
    }

    return enhancedPrompt;
  }

  /**
   * Get context variables for template replacement
   * @param {String} userId - User ID
   * @returns {Object} Key-value pairs for template variables
   */
  async getContextVariables(userId) {
    const context = await this.buildAgentContext(userId);

    return {
      company_name: context.company.name,
      company_legal_name: context.company.legalName,
      company_phone: context.company.phone,
      company_email: context.company.email,
      company_website: context.company.website,
      years_in_business: context.company.yearsInBusiness,
      number_of_employees: context.company.numberOfEmployees,
      industry: context.business.industry,
      business_type: context.business.businessType,
      service_area: context.business.serviceArea,
      address_full: context.address?.full,
      address_city: context.address?.city,
      address_state: context.address?.state,
      default_margin: context.pricing.defaultMargin,
      payment_terms: context.pricing.paymentTerms,
      warranty_period: context.pricing.warrantyPeriod,
      team_count: context.team.length,
      price_sheets_count: context.priceSheets.length,
    };
  }

  /**
   * Format service area for display
   */
  formatServiceArea(serviceArea) {
    if (!serviceArea) return 'Local Service Area';

    if (serviceArea.type === 'radius') {
      return `${serviceArea.radiusMiles || 25} mile radius`;
    } else if (serviceArea.type === 'custom' && serviceArea.customAreas?.length > 0) {
      return `Custom areas: ${serviceArea.customAreas.join(', ')}`;
    }

    return 'Local Service Area';
  }

  /**
   * Format address for display
   */
  formatAddress(address) {
    if (!address) return '';

    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.zipCode) parts.push(address.zipCode);

    return parts.join(', ');
  }

  /**
   * Default context when no profile exists
   */
  getDefaultContext() {
    return {
      company: {
        name: 'Your Company',
        phone: '',
        email: '',
        website: '',
      },
      business: {
        industry: '',
        businessType: '',
        serviceArea: 'Local Service Area',
      },
      address: null,
      pricing: {
        defaultMargin: '35%',
        paymentTerms: 'Due on Receipt',
        quoteApprovalRequired: false,
        warrantyPeriod: 'Standard Warranty',
      },
      team: [],
      priceSheets: [],
      integrations: {
        quickbooks: false,
        google: false,
      },
    };
  }

  /**
   * Add price sheets to agent knowledge base
   * @param {String} userId - User ID
   * @param {String} agentId - Agent ID (optional, for specific agent)
   * @returns {Object} Result of KB sync
   */
  async syncPriceSheetsToKnowledgeBase(userId, agentId = null) {
    try {
      const profile = await BusinessProfile.findOne({ userId });

      if (!profile || !profile.priceSheets || profile.priceSheets.length === 0) {
        return { success: false, message: 'No price sheets found' };
      }

      const results = [];

      for (const sheet of profile.priceSheets) {
        // Create or update knowledge base entry for this price sheet
        const kbEntry = await KnowledgeBase.findOneAndUpdate(
          {
            userId,
            'source.fileName': sheet.fileName,
            category: 'pricing'
          },
          {
            userId,
            name: `Price Sheet: ${sheet.fileName}`,
            description: `Pricing information from ${sheet.fileName}`,
            type: 'document',
            category: 'pricing',
            source: {
              fileUrl: sheet.url,
              fileName: sheet.fileName,
              fileSize: sheet.fileSize,
              mimeType: sheet.fileType,
            },
            status: 'pending',
            tags: ['pricing', 'price-sheet', 'auto-synced'],
          },
          { upsert: true, new: true }
        );

        results.push({
          fileName: sheet.fileName,
          kbId: kbEntry._id,
          status: 'synced',
        });
      }

      return {
        success: true,
        message: `Synced ${results.length} price sheet(s) to knowledge base`,
        results,
      };
    } catch (error) {
      console.error('Error syncing price sheets to KB:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }
}

const agentContextService = new AgentContextService();
export default agentContextService;
