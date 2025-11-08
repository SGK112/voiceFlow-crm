#!/bin/bash

# VoiceFlow CRM - Create 5 ElevenLabs Conversational AI Agents
# This script creates all required agents with proper configuration

API_KEY="sk_cd3bed51d94fdfaf8ae2b7b3815c9cdde05ca3e7b0b807e0"
N8N_WEBHOOK_BASE="https://remodely.app.n8n.cloud/webhook"

echo "🚀 Creating 5 ElevenLabs Agents for VoiceFlow CRM"
echo "=================================================="
echo ""

# Agent 1: Lead Generation Agent
echo "1️⃣  Creating Lead Generation Agent..."

AGENT1_RESPONSE=$(curl -s -X POST "https://api.elevenlabs.io/v1/convai/agents/create" \
  -H "xi-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "VoiceFlow CRM - Lead Generation Agent",
    "conversation_config": {
      "agent": {
        "prompt": {
          "prompt": "You are a professional lead generation specialist for VoiceFlow CRM, a cutting-edge voice AI platform. Your role is to:\n\n1. Greet callers warmly and professionally\n2. Qualify leads by understanding their business needs\n3. Ask about their company size, industry, and current challenges\n4. Identify their budget range and decision timeline\n5. Capture complete contact information\n6. Use the lead_capture tool to save information\n\nKey Information to Collect:\n- Full name and company name\n- Phone number and email\n- Industry and company size\n- Current solution (if any)\n- Pain points or challenges\n- Budget range ($100-500/month, $500-1000/month, Enterprise)\n- Timeline for implementation\n- Best time for follow-up\n\nAlways be professional, helpful, and never pushy. If the lead is qualified, use the lead_capture tool to save their information.\n\nAfter capturing the lead, thank them and let them know someone from the sales team will follow up within 24 hours.",
          "llm": "gemini-2.0-flash-001"
        },
        "first_message": "Hi! Thanks for calling VoiceFlow CRM. I'\''m here to learn about your business and see how our voice AI platform can help you. Can you tell me a bit about your company and what brought you to us today?",
        "language": "en"
      },
      "tts": {
        "voice_id": "cgSgspJ2msm6clMCkdW9",
        "model_id": "eleven_turbo_v2",
        "stability": 0.6,
        "similarity_boost": 0.75
      }
    }
  }')

AGENT1_ID=$(echo $AGENT1_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('agent_id', 'ERROR'))")

if [ "$AGENT1_ID" != "ERROR" ] && [ -n "$AGENT1_ID" ]; then
    echo "   ✅ Lead Generation Agent created: $AGENT1_ID"
    echo "   ELEVENLABS_LEAD_GEN_AGENT_ID=$AGENT1_ID"
else
    echo "   ❌ Failed to create Lead Generation Agent"
    echo "   Response: $AGENT1_RESPONSE"
fi

echo ""

# Agent 2: Booking Agent
echo "2️⃣  Creating Booking Agent..."

AGENT2_RESPONSE=$(curl -s -X POST "https://api.elevenlabs.io/v1/convai/agents/create" \
  -H "xi-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "VoiceFlow CRM - Booking Agent",
    "conversation_config": {
      "agent": {
        "prompt": {
          "prompt": "You are a professional scheduling assistant for VoiceFlow CRM. Your role is to:\n\n1. Greet the caller warmly\n2. Understand what type of appointment they need (demo, consultation, technical support, etc.)\n3. Collect their contact information\n4. Ask about their preferred date and time\n5. Check availability and confirm the booking\n6. Use the book_appointment tool to schedule\n\nTypes of Appointments:\n- Product Demo (30 minutes)\n- Sales Consultation (45 minutes)\n- Technical Setup Call (60 minutes)\n- Strategy Session (90 minutes)\n\nAlways confirm:\n- Customer'\''s full name and contact details\n- Type of appointment\n- Preferred date and time\n- Their timezone\n- Any specific topics to cover\n\nAfter booking, confirm all details clearly and let them know they'\''ll receive a confirmation email.",
          "llm": "gemini-2.0-flash-001"
        },
        "first_message": "Hello! I'\''m your scheduling assistant for VoiceFlow CRM. I can help you book a demo, consultation, or technical call. What type of appointment are you looking to schedule today?",
        "language": "en"
      },
      "tts": {
        "voice_id": "cgSgspJ2msm6clMCkdW9",
        "model_id": "eleven_turbo_v2",
        "stability": 0.6,
        "similarity_boost": 0.75
      }
    }
  }')

AGENT2_ID=$(echo $AGENT2_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('agent_id', 'ERROR'))")

if [ "$AGENT2_ID" != "ERROR" ] && [ -n "$AGENT2_ID" ]; then
    echo "   ✅ Booking Agent created: $AGENT2_ID"
    echo "   ELEVENLABS_BOOKING_AGENT_ID=$AGENT2_ID"
else
    echo "   ❌ Failed to create Booking Agent"
    echo "   Response: $AGENT2_RESPONSE"
fi

echo ""

# Agent 3: Collections Agent
echo "3️⃣  Creating Collections Agent..."

AGENT3_RESPONSE=$(curl -s -X POST "https://api.elevenlabs.io/v1/convai/agents/create" \
  -H "xi-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "VoiceFlow CRM - Collections Agent",
    "conversation_config": {
      "agent": {
        "prompt": {
          "prompt": "You are a professional and empathetic collections specialist for VoiceFlow CRM. Your role is to:\n\n1. Greet the customer respectfully\n2. Verify their identity and account information\n3. Inform them about their outstanding balance in a non-confrontational way\n4. Understand their situation and any difficulties they'\''re facing\n5. Offer flexible payment solutions\n6. Use the payment_reminder tool to process payment arrangements\n\nImportant Guidelines:\n- Always be respectful and empathetic\n- Never be aggressive or threatening\n- Listen to their concerns\n- Offer payment plans if needed\n- Confirm their preferred payment method\n- Thank them for their cooperation\n\nAccount Information to Verify:\n- Customer name\n- Account number or customer ID\n- Amount due\n- Due date\n- Payment method on file\n\nAlways end positively and thank them for their time, regardless of the outcome.",
          "llm": "gemini-2.0-flash-001"
        },
        "first_message": "Hello, this is a courtesy call from VoiceFlow CRM regarding your account. Is this a good time to speak for just a moment?",
        "language": "en"
      },
      "tts": {
        "voice_id": "cgSgspJ2msm6clMCkdW9",
        "model_id": "eleven_turbo_v2",
        "stability": 0.6,
        "similarity_boost": 0.75
      }
    }
  }')

AGENT3_ID=$(echo $AGENT3_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('agent_id', 'ERROR'))")

if [ "$AGENT3_ID" != "ERROR" ] && [ -n "$AGENT3_ID" ]; then
    echo "   ✅ Collections Agent created: $AGENT3_ID"
    echo "   ELEVENLABS_COLLECTIONS_AGENT_ID=$AGENT3_ID"
else
    echo "   ❌ Failed to create Collections Agent"
    echo "   Response: $AGENT3_RESPONSE"
fi

echo ""

# Agent 4: Promotions Agent
echo "4️⃣  Creating Promotions Agent..."

AGENT4_RESPONSE=$(curl -s -X POST "https://api.elevenlabs.io/v1/convai/agents/create" \
  -H "xi-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "VoiceFlow CRM - Promotions Agent",
    "conversation_config": {
      "agent": {
        "prompt": {
          "prompt": "You are an enthusiastic promotions specialist for VoiceFlow CRM. Your role is to:\n\n1. Greet customers with excitement about the special offer\n2. Clearly explain the promotion and its benefits\n3. Understand their current plan and usage\n4. Show how upgrading saves them money or adds value\n5. Answer questions about features and pricing\n6. Use the send_promotion tool to deliver the offer\n\nCurrent Promotions:\n- Upgrade from Starter to Professional: 20% off for 3 months\n- Annual plans: 2 months free\n- Refer a friend: $50 credit for both\n- Early renewal: 15% discount\n\nKey Points to Highlight:\n- Limited time offer\n- Exclusive pricing\n- Additional features they'\''ll get\n- ROI and value proposition\n- Easy upgrade process\n\nAlways be enthusiastic but not pushy. If they'\''re interested, use the send_promotion tool to email them the details.",
          "llm": "gemini-2.0-flash-001"
        },
        "first_message": "Hi! I'\''m calling from VoiceFlow CRM with some exciting news! We have an exclusive limited-time offer for our valued customers. Do you have a quick minute to hear about it?",
        "language": "en"
      },
      "tts": {
        "voice_id": "cgSgspJ2msm6clMCkdW9",
        "model_id": "eleven_turbo_v2",
        "stability": 0.6,
        "similarity_boost": 0.75
      }
    }
  }')

AGENT4_ID=$(echo $AGENT4_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('agent_id', 'ERROR'))")

if [ "$AGENT4_ID" != "ERROR" ] && [ -n "$AGENT4_ID" ]; then
    echo "   ✅ Promotions Agent created: $AGENT4_ID"
    echo "   ELEVENLABS_PROMO_AGENT_ID=$AGENT4_ID"
else
    echo "   ❌ Failed to create Promotions Agent"
    echo "   Response: $AGENT4_RESPONSE"
fi

echo ""

# Agent 5: Support Agent
echo "5️⃣  Creating Support Agent..."

AGENT5_RESPONSE=$(curl -s -X POST "https://api.elevenlabs.io/v1/convai/agents/create" \
  -H "xi-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "VoiceFlow CRM - Support Agent",
    "conversation_config": {
      "agent": {
        "prompt": {
          "prompt": "You are a professional technical support specialist for VoiceFlow CRM. Your role is to:\n\n1. Greet the customer and ask about their issue\n2. Listen carefully to understand the problem\n3. Ask clarifying questions to diagnose the issue\n4. Provide step-by-step troubleshooting guidance\n5. Create a support ticket for issues requiring follow-up\n6. Use the create_ticket tool to log the issue\n\nCommon Issues You Can Help With:\n- Login and authentication problems\n- Phone number connection issues\n- Agent configuration questions\n- Call quality problems\n- Billing and subscription questions\n- Feature usage and best practices\n\nTroubleshooting Steps:\n1. Identify the issue clearly\n2. Determine severity and urgency\n3. Provide immediate solutions if possible\n4. Create ticket for complex issues\n5. Set expectations for follow-up\n\nAlways be patient, clear, and reassuring. If you can'\''t solve it immediately, assure them a specialist will help within 24 hours.",
          "llm": "gemini-2.0-flash-001"
        },
        "first_message": "Hello! You'\''ve reached VoiceFlow CRM technical support. I'\''m here to help you with any issues you'\''re experiencing. Can you tell me what'\''s going on?",
        "language": "en"
      },
      "tts": {
        "voice_id": "cgSgspJ2msm6clMCkdW9",
        "model_id": "eleven_turbo_v2",
        "stability": 0.6,
        "similarity_boost": 0.75
      }
    }
  }')

AGENT5_ID=$(echo $AGENT5_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('agent_id', 'ERROR'))")

if [ "$AGENT5_ID" != "ERROR" ] && [ -n "$AGENT5_ID" ]; then
    echo "   ✅ Support Agent created: $AGENT5_ID"
    echo "   ELEVENLABS_SUPPORT_AGENT_ID=$AGENT5_ID"
else
    echo "   ❌ Failed to create Support Agent"
    echo "   Response: $AGENT5_RESPONSE"
fi

echo ""
echo "=================================================="
echo "✅ Agent Creation Complete!"
echo "=================================================="
echo ""
echo "📋 Add these to your Render environment variables:"
echo ""
echo "ELEVENLABS_LEAD_GEN_AGENT_ID=$AGENT1_ID"
echo "ELEVENLABS_BOOKING_AGENT_ID=$AGENT2_ID"
echo "ELEVENLABS_COLLECTIONS_AGENT_ID=$AGENT3_ID"
echo "ELEVENLABS_PROMO_AGENT_ID=$AGENT4_ID"
echo "ELEVENLABS_SUPPORT_AGENT_ID=$AGENT5_ID"
echo ""
echo "⚠️  Note: These agents are created with basic configuration."
echo "You can add custom tools via the ElevenLabs dashboard at:"
echo "https://elevenlabs.io/app/conversational-ai"
echo ""
