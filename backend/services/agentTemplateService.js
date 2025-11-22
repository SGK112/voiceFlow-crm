/**
 * Agent Template Service
 *
 * Provides utilities for managing, filtering, and configuring agent templates
 */

import { expandedAgentTemplates } from '../config/expandedAgentTemplates.js';

class AgentTemplateService {
  constructor() {
    this.templates = {};
    this.industries = new Set();
    this.categories = new Set();
    this.loadTemplates();
  }

  /**
   * Load and index all templates
   */
  loadTemplates() {
    // Load expanded templates
    Object.entries(expandedAgentTemplates).forEach(([key, template]) => {
      this.templates[key] = template;

      if (template.industry) {
        this.industries.add(template.industry);
      }

      if (template.category) {
        this.categories.add(template.category);
      }
    });
  }

  /**
   * Get all templates
   */
  getAllTemplates() {
    return Object.values(this.templates);
  }

  /**
   * Get template by ID
   */
  getTemplateById(id) {
    return this.templates[id] || null;
  }

  /**
   * Filter templates by criteria
   */
  filterTemplates(criteria = {}) {
    let filtered = Object.values(this.templates);

    // Filter by industry
    if (criteria.industry) {
      filtered = filtered.filter(t => t.industry === criteria.industry);
    }

    // Filter by category
    if (criteria.category) {
      filtered = filtered.filter(t => t.category === criteria.category);
    }

    // Search by name, description, or tags
    if (criteria.search) {
      const searchLower = criteria.search.toLowerCase();
      filtered = filtered.filter(t =>
        t.name?.toLowerCase().includes(searchLower) ||
        t.description?.toLowerCase().includes(searchLower) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }

    // Filter by tags
    if (criteria.tags && criteria.tags.length > 0) {
      filtered = filtered.filter(t =>
        t.tags && criteria.tags.some(tag => t.tags.includes(tag))
      );
    }

    return filtered;
  }

  /**
   * Get unique industries
   */
  getIndustries() {
    return Array.from(this.industries).sort();
  }

  /**
   * Get unique categories
   */
  getCategories() {
    return Array.from(this.categories).sort();
  }

  /**
   * Get templates by industry
   */
  getTemplatesByIndustry(industry) {
    return this.filterTemplates({ industry });
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category) {
    return this.filterTemplates({ category });
  }

  /**
   * Get all unique tags across templates
   */
  getAllTags() {
    const tags = new Set();
    Object.values(this.templates).forEach(template => {
      if (template.tags) {
        template.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }

  /**
   * Generate agent configuration from template
   */
  generateAgentConfig(templateId, customization = {}) {
    const template = this.getTemplateById(templateId);

    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Replace variables in script with customization values
    let script = template.script;
    let firstMessage = template.firstMessage;

    // Replace all {{variable}} placeholders
    Object.entries(customization).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      script = script.replace(regex, value);
      firstMessage = firstMessage.replace(regex, value);
    });

    return {
      name: customization.name || template.name,
      type: template.type || 'custom',
      customType: template.customType,
      script,
      firstMessage,
      voiceId: customization.voiceId || template.voiceId,
      voiceName: customization.voiceName || template.voiceName,
      configuration: {
        temperature: customization.temperature || 0.8,
        language: customization.language || 'en',
        maxDuration: customization.maxDuration || 300,
        ...customization.configuration
      }
    };
  }

  /**
   * Get recommended templates for a specific use case
   */
  getRecommendedTemplates(useCase) {
    const recommendations = {
      'missed-calls': ['lead-qualification', 'appointment-booking'],
      'customer-retention': ['review-request', 'patient-follow-up'],
      'collections': ['payment-collection'],
      'scheduling': ['medical-appointment-scheduling', 'auto-service-appointment'],
      'sales': ['property-inquiry-response', 'abandoned-cart-recovery'],
      'support': ['order-status-update']
    };

    const templateIds = recommendations[useCase] || [];
    return templateIds
      .map(id => this.getTemplateById(id))
      .filter(Boolean);
  }

  /**
   * Get template statistics
   */
  getStatistics() {
    const templates = Object.values(this.templates);

    return {
      total: templates.length,
      byIndustry: this.getIndustries().map(industry => ({
        industry,
        count: templates.filter(t => t.industry === industry).length
      })),
      byCategory: this.getCategories().map(category => ({
        category,
        count: templates.filter(t => t.category === category).length
      })),
      totalIndustries: this.industries.size,
      totalCategories: this.categories.size,
      totalTags: this.getAllTags().length
    };
  }

  /**
   * Validate template configuration
   */
  validateTemplate(template) {
    const errors = [];

    if (!template.id) errors.push('Template ID is required');
    if (!template.name) errors.push('Template name is required');
    if (!template.description) errors.push('Template description is required');
    if (!template.script) errors.push('Template script is required');
    if (!template.category) errors.push('Template category is required');

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Add custom template (for user-created templates)
   */
  addCustomTemplate(template) {
    const validation = this.validateTemplate(template);

    if (!validation.valid) {
      throw new Error(`Invalid template: ${validation.errors.join(', ')}`);
    }

    if (this.templates[template.id]) {
      throw new Error(`Template with ID ${template.id} already exists`);
    }

    this.templates[template.id] = {
      ...template,
      custom: true,
      createdAt: new Date()
    };

    if (template.industry) {
      this.industries.add(template.industry);
    }

    if (template.category) {
      this.categories.add(template.category);
    }

    return this.templates[template.id];
  }

  /**
   * Remove custom template
   */
  removeCustomTemplate(templateId) {
    const template = this.templates[templateId];

    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    if (!template.custom) {
      throw new Error('Cannot remove built-in templates');
    }

    delete this.templates[templateId];
    return true;
  }

  /**
   * Get popular templates (by usage count if tracking)
   */
  getPopularTemplates(limit = 5) {
    // For now, return a curated list of popular templates
    const popularIds = [
      'medical-appointment-scheduling',
      'property-inquiry-response',
      'abandoned-cart-recovery',
      'legal-consultation-booking',
      'auto-service-appointment'
    ];

    return popularIds
      .map(id => this.getTemplateById(id))
      .filter(Boolean)
      .slice(0, limit);
  }

  /**
   * Search templates with advanced filtering
   */
  advancedSearch(query) {
    const {
      search,
      industries = [],
      categories = [],
      tags = [],
      sortBy = 'name',
      sortOrder = 'asc',
      limit,
      offset = 0
    } = query;

    let results = Object.values(this.templates);

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      results = results.filter(t =>
        t.name?.toLowerCase().includes(searchLower) ||
        t.description?.toLowerCase().includes(searchLower) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(searchLower))) ||
        t.script?.toLowerCase().includes(searchLower)
      );
    }

    if (industries.length > 0) {
      results = results.filter(t => industries.includes(t.industry));
    }

    if (categories.length > 0) {
      results = results.filter(t => categories.includes(t.category));
    }

    if (tags.length > 0) {
      results = results.filter(t =>
        t.tags && tags.some(tag => t.tags.includes(tag))
      );
    }

    // Sort results
    results.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal?.toLowerCase() || '';
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    // Apply pagination
    const total = results.length;
    if (limit) {
      results = results.slice(offset, offset + limit);
    }

    return {
      templates: results,
      total,
      offset,
      limit: limit || total
    };
  }
}

// Export singleton instance
const agentTemplateService = new AgentTemplateService();
export default agentTemplateService;
