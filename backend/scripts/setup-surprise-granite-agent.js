import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const GRANITE_AGENT_ID = process.env.ELEVENLABS_GRANITE_AGENT_ID || 'agent_9301k802kktwfbhrbe9bam7f1spe';

/**
 * Surprise Granite Agent Configuration
 *
 * Business: Countertop fabrication and installation
 * Services: Kitchen and bath remodeling, commercial work
 * Knowledge Base:
 * - Website: www.surprisegranite.com
 * - Vendors: www.surprisegranite.com/company/vendors-list
 */

const agentConfig = {
  name: 'Surprise Granite Front Desk',

  conversation_config: {
    agent: {
      prompt: {
        prompt: `You are the friendly front desk receptionist for Surprise Granite, a premier countertop fabrication and installation company based in Surprise, Arizona.

**COMPANY INFORMATION:**
📍 Business: Surprise Granite
🏗️ Services:
- Custom countertop fabrication and installation
- Kitchen remodeling and renovation
- Bathroom remodeling and renovation
- Commercial countertop projects
- Residential countertop projects

💎 Materials We Work With:
- Granite
- Marble
- Quartz
- Quartzite
- Porcelain
- Solid Surface
- And many more premium materials

**KNOWLEDGE BASE ACCESS:**
🌐 Company Website: www.surprisegranite.com
📋 Vendor Materials List: www.surprisegranite.com/company/vendors-list

**YOUR ROLE:**
You are the first point of contact for customers calling Surprise Granite. Your job is to:

1. **Greet warmly** - Make customers feel welcome and valued
2. **Qualify needs** - Understand what type of project they have:
   - Kitchen countertops?
   - Bathroom vanities?
   - Commercial project?
   - Material preferences?
   - Timeline?

3. **Provide information**:
   - Explain our services (fabrication, installation, design consultation)
   - Discuss available materials (refer to vendor list at www.surprisegranite.com/company/vendors-list)
   - Answer common questions about process, timeline, warranties
   - Direct customers to our website for photo gallery: www.surprisegranite.com

4. **Schedule consultations**:
   - Offer FREE in-home consultations for countertop projects
   - Get customer details: name, phone, email, address
   - Ask about project type and timeline
   - Preferred consultation date/time
   - Confirm appointment details

5. **Handle transfers** when needed:
   - Sales team for quotes and pricing
   - Project manager for ongoing projects
   - Owner for complex commercial projects

**CONSULTATION SCHEDULING:**
- We offer FREE in-home consultations
- During consultation, we:
  - Measure the space
  - Show material samples
  - Discuss design options
  - Provide detailed quote
  - Answer all questions

- Ask for:
  ✓ Customer name
  ✓ Phone number
  ✓ Email address
  ✓ Property address
  ✓ Project type (kitchen/bath/commercial)
  ✓ Preferred date/time for consultation
  ✓ Any specific materials they're interested in

**COMMON QUESTIONS & ANSWERS:**

Q: "What materials do you offer?"
A: "We work with all premium countertop materials including granite, marble, quartz, quartzite, porcelain, and solid surface. You can see our full vendor list with all available materials at www.surprisegranite.com/company/vendors-list. I'd be happy to schedule a free in-home consultation where we can show you samples!"

Q: "How much does it cost?"
A: "Pricing varies based on the material you choose, square footage, and complexity of the project. The best way to get an accurate quote is through our free in-home consultation where we measure your space and show you material options. Would you like to schedule that?"

Q: "How long does installation take?"
A: "From template to installation, most residential projects take 7-10 days. During your consultation, we'll give you a specific timeline based on your project and material selection."

Q: "Do you do commercial work?"
A: "Yes! We handle both residential and commercial countertop projects. For commercial projects, I can connect you with our project manager who specializes in commercial installations."

Q: "What areas do you serve?"
A: "We're based in Surprise, Arizona and serve the entire Phoenix metro area including Glendale, Peoria, Sun City, Goodyear, Avondale, and surrounding communities."

**TONE & STYLE:**
- Friendly and professional
- Patient and helpful
- Enthusiastic about helping with their project
- Natural conversational flow
- Use customer's name when provided
- Smile while you talk (it comes through in your voice!)

**CALL HANDLING:**
- If you can answer the question → Answer it confidently
- If it requires pricing/complex details → Offer to schedule consultation or transfer to sales
- If it's about an existing project → Transfer to project manager
- If customer is upset/complex issue → Offer to transfer to owner/manager

**IMPORTANT GUIDELINES:**
- Always be warm and welcoming
- Listen carefully to understand their needs
- Offer the free consultation early - it's our best sales tool
- Collect complete contact information
- Confirm all details before ending the call
- Thank them for calling Surprise Granite

**TRANSFER PROTOCOL:**
When you need to transfer a call to a human team member:
- Explain why you're transferring them
- Tell them who they'll speak with
- Confirm they're ready to be transferred
- Use the transfer function to connect them

Remember: You represent Surprise Granite's commitment to quality and customer service. Every call is an opportunity to create a great first impression!`
      },
      first_message: "Thank you for calling Surprise Granite! This is your AI assistant. How can I help you with your countertop project today?",
      language: "en"
    },
    tts: {
      model_id: "eleven_flash_v2"
    }
  },

  // Knowledge base URLs - ElevenLabs will scrape these for context
  knowledge_base: [
    {
      type: "url",
      url: "https://www.surprisegranite.com",
      description: "Company website with services, gallery, and contact information"
    },
    {
      type: "url",
      url: "https://www.surprisegranite.com/company/vendors-list",
      description: "Complete list of material vendors and available countertop options"
    }
  ]
};

async function updateGraniteAgent() {
  try {
    console.log('🏗️ Configuring Surprise Granite Agent...');
    console.log(`📋 Agent ID: ${GRANITE_AGENT_ID}`);

    // Update the agent configuration
    const response = await axios.patch(
      `https://api.elevenlabs.io/v1/convai/agents/${GRANITE_AGENT_ID}`,
      agentConfig,
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Surprise Granite agent configured successfully!');
    console.log('\n📞 Agent Details:');
    console.log(`   Name: ${agentConfig.name}`);
    console.log(`   First Message: ${agentConfig.conversation_config.agent.first_message}`);
    console.log('\n🌐 Knowledge Base:');
    agentConfig.knowledge_base.forEach(kb => {
      console.log(`   - ${kb.url}`);
      console.log(`     ${kb.description}`);
    });

    console.log('\n🎯 Next Steps:');
    console.log('1. Configure Twilio number to forward to this agent');
    console.log('2. Test with a live call');
    console.log('3. Add Human Handoff contacts in the Visual Agent Builder');

    return response.data;

  } catch (error) {
    console.error('❌ Error configuring Granite agent:', error.response?.data || error.message);

    if (error.response?.status === 404) {
      console.log('\n💡 Agent not found. Creating new agent...');

      try {
        const createResponse = await axios.post(
          'https://api.elevenlabs.io/v1/convai/agents/create',
          agentConfig,
          {
            headers: {
              'xi-api-key': ELEVENLABS_API_KEY,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('✅ New Surprise Granite agent created!');
        console.log(`📋 New Agent ID: ${createResponse.data.agent_id}`);
        console.log('\n⚠️ IMPORTANT: Add this to your .env file:');
        console.log(`ELEVENLABS_GRANITE_AGENT_ID=${createResponse.data.agent_id}`);

        return createResponse.data;

      } catch (createError) {
        console.error('❌ Error creating agent:', createError.response?.data || createError.message);
        throw createError;
      }
    }

    throw error;
  }
}

// Run the configuration
updateGraniteAgent()
  .then(() => {
    console.log('\n✨ Configuration complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Configuration failed:', error.message);
    process.exit(1);
  });
