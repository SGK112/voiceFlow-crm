# Custom Voice Agents - User Guide

## Overview

Your CRM now allows users to **create fully custom voice agents** without touching the ElevenLabs dashboard. Everything is done directly in the CRM with a simple, powerful interface.

## What Users Can Customize

### 1. Agent Name & Type
- **Name**: "Sarah - Customer Success", "Mike - Follow-Up Specialist", etc.
- **Type**: Lead Gen, Booking, Collections, Promo, Support, or **Custom**
- **Custom Type**: User-defined categories like "Feedback Survey", "Event Reminder", "Win-Back", etc.

### 2. Voice Selection
- Browse **all ElevenLabs voices** directly in the CRM
- Preview voice samples
- Choose from 100+ professional voices
- Filter by gender, accent, age, style

### 3. Agent Script/Prompt
- Full control over conversation flow
- Use dynamic variables (`{{lead_name}}`, `{{company_name}}`, etc.)
- Define personality, tone, objectives
- Add qualification criteria

### 4. First Message
- Customize the opening greeting
- Personalize with variables
- Set the tone for the conversation

### 5. Advanced Settings
- Language (English, Spanish, etc.)
- Temperature (creativity level)
- Max call duration
- Available hours/timezone

## How It Works Behind the Scenes

```
User fills form in CRM
         ↓
CRM validates input
         ↓
Creates agent in ElevenLabs via API
   (using platform credentials)
         ↓
Saves agent to CRM database
         ↓
Agent ready to use immediately!
```

**Key Benefit**: Users never need an ElevenLabs account. You (platform owner) provide the infrastructure, they just customize and use!

## API Endpoints

### GET /api/agents/helpers/templates
Get pre-built agent templates

**Response**:
```json
[
  {
    "id": "lead_qualification",
    "name": "Lead Qualification Agent",
    "type": "lead_gen",
    "description": "Qualify inbound leads by asking discovery questions",
    "icon": "🎯",
    "script": "You are a friendly lead qualification specialist...",
    "firstMessage": "Hi {{lead_name}}! Thanks for your interest...",
    "voiceId": "EXAVITQu4vr4xnSDxMaL",
    "voiceName": "Sarah"
  },
  // ... more templates
]
```

### GET /api/agents/helpers/voices
Get all available ElevenLabs voices

**Response**:
```json
{
  "voices": [
    {
      "voice_id": "EXAVITQu4vr4xnSDxMaL",
      "name": "Sarah",
      "category": "premade",
      "labels": {
        "accent": "american",
        "age": "young",
        "gender": "female",
        "use_case": "conversational"
      },
      "samples": [
        {
          "sample_id": "...",
          "file_name": "sample.mp3"
        }
      ]
    },
    // ... 100+ more voices
  ]
}
```

### POST /api/agents/create
Create a new custom agent

**Request Body**:
```json
{
  "name": "Customer Feedback Agent",
  "type": "custom",
  "customType": "feedback",
  "voiceId": "EXAVITQu4vr4xnSDxMaL",
  "voiceName": "Sarah",
  "script": "You are conducting a customer satisfaction survey...",
  "firstMessage": "Hi {{lead_name}}! Do you have 2 minutes for a quick survey?",
  "language": "en",
  "temperature": 0.8
}
```

**Response**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f191e810c19729de860ea",
  "name": "Customer Feedback Agent",
  "type": "custom",
  "customType": "feedback",
  "elevenLabsAgentId": "agent_abc123xyz",
  "voiceId": "EXAVITQu4vr4xnSDxMaL",
  "voiceName": "Sarah",
  "script": "...",
  "firstMessage": "...",
  "enabled": true,
  "created At": "2025-01-15T10:30:00.000Z"
}
```

## 6 Pre-Built Templates

### 1. 🎯 Lead Qualification Agent
**Purpose**: Qualify inbound leads
**Voice**: Sarah (warm, professional female)
**Questions**:
- Specific needs
- Timeline (urgent, 3 months, exploring)
- Budget range
- Decision maker status

### 2. 📅 Appointment Booking Agent
**Purpose**: Schedule consultations
**Voice**: Mike (friendly male)
**Flow**:
- Confirm interest
- Ask availability
- Offer time slots
- Confirm contact info

### 3. ⭐ Customer Feedback Survey
**Purpose**: Collect satisfaction data
**Voice**: Lisa (enthusiastic female)
**Questions**:
- Overall rating (1-10)
- What they liked
- What to improve
- Would recommend?

### 4. 💰 Payment Reminder Agent
**Purpose**: Professional collections
**Voice**: James (firm but respectful male)
**Approach**:
- Professional greeting
- Mention outstanding balance
- Understand issues
- Offer payment options

### 5. 🎉 Event Reminder Agent
**Purpose**: Appointment/event reminders
**Voice**: Sarah (enthusiastic)
**Flow**:
- Greet warmly
- Remind about event
- Confirm attendance
- Answer questions

### 6. 🎁 Win-Back Campaign Agent
**Purpose**: Re-engage inactive customers
**Voice**: Lisa (excited, appreciative)
**Strategy**:
- Acknowledge past relationship
- Ask why they left
- Present exclusive offer
- Create urgency

## Example: Creating a Custom Agent

### User Story
"I want to create a Spanish-speaking agent that reminds customers about their car service appointments"

###Step 1: Choose Template or Start from Scratch
User selects "Event Reminder" template or clicks "Create Custom Agent"

### Step 2: Customize Details
```
Name: "Carlos - Service Reminder"
Type: Custom
Custom Type: "Auto Service Reminder"
Language: Spanish
```

### Step 3: Select Voice
Browse Spanish voices, select "Diego" (warm Spanish male)

### Step 4: Write Script
```
You are Carlos, calling from {{company_name}} to remind customers about their auto service appointment.

CUSTOMER: {{lead_name}}
APPOINTMENT: (extract from lead custom fields)

CONVERSATION FLOW:
1. Greet in Spanish: "Hola {{lead_name}}! Habla Carlos de {{company_name}}."
2. Remind about service appointment
3. Confirm they're still coming
4. Ask if they need to reschedule
5. Mention what services are included

TONE: Friendly, helpful, professional
Keep it brief - 2-3 minutes max
```

### Step 5: Set First Message
```
Hola {{lead_name}}! Habla Carlos de {{company_name}}.
Le llamo para recordarle su cita de servicio. ¿Tiene un momento?
```

### Step 6: Save & Deploy
- Click "Create Agent"
- Agent is created in ElevenLabs
- Saved to CRM database
- Ready to use immediately!

## Best Practices for Custom Agents

### 1. Name Your Agents Clearly
✅ "Sarah - Lead Qualification"
✅ "Mike - Appointment Booking"
❌ "Agent 1"
❌ "Test"

### 2. Use Templates as Starting Points
Templates provide proven structures. Customize them rather than starting from scratch.

### 3. Test Your Prompts
- Call yourself first
- Listen to how the agent sounds
- Refine based on results
- Iterate until perfect

### 4. Use Dynamic Variables Liberally
```
✅ "Hi {{lead_name}}! I'm calling from {{company_name}} about {{service_type}}."
❌ "Hi! I'm calling about our services."
```

### 5. Define Clear Objectives
Every agent should know exactly what success looks like:
- Lead Gen: Qualify and book appointment
- Booking: Set specific time/date
- Feedback: Complete 5-question survey
- Collections: Get payment commitment

### 6. Set Appropriate Tone
- Lead Gen: Warm, curious
- Booking: Efficient, helpful
- Collections: Professional, firm
- Feedback: Appreciative, genuine
- Win-Back: Excited, understanding

## Subscription Limits

| Plan | Max Custom Agents |
|------|-------------------|
| Trial | 1 |
| Starter | 1 |
| Professional | 5 |
| Enterprise | Unlimited |

## Technical Architecture

### Database Schema
```javascript
{
  userId: ObjectId,
  name: String,
  type: 'lead_gen' | 'booking' | 'collections' | 'promo' | 'support' | 'custom',
  customType: String,  // User-defined category
  elevenLabsAgentId: String,  // Created via API
  voiceId: String,
  voiceName: String,
  script: String,
  firstMessage: String,
  enabled: Boolean,
  configuration: {
    temperature: Number,
    maxDuration: Number,
    language: String
  },
  performance: {
    totalCalls: Number,
    successfulCalls: Number,
    leadsGenerated: Number
  }
}
```

### ElevenLabs Integration
1. User submits form
2. Backend calls `elevenLabsService.createAgent()`
3. Service creates agent using **platform credentials**
4. Returns `agent_id`
5. CRM saves agent with `elevenLabsAgentId`
6. Future calls use this `agent_id`

**Benefit**: One ElevenLabs account (yours) serves all users. Huge cost savings and simpler management.

## Customization vs Prebuilt

| Feature | Prebuilt Agents | Custom Agents |
|---------|-----------------|---------------|
| Setup Time | Instant | 5-10 minutes |
| Customization | Limited | Full control |
| Voice Options | 5 defaults | 100+ choices |
| Script Control | Fixed | Completely custom |
| Language | English only | Any language |
| Best For | Quick start | Specific needs |

## Roadmap: Future Customization Features

### Phase 2 (Next Quarter)
- **Voice cloning**: Upload audio, clone any voice
- **A/B testing**: Test different scripts automatically
- **Conversation branching**: "If X, then Y" logic
- **Custom variables**: Define your own beyond standard set

### Phase 3 (6 Months)
- **Visual prompt builder**: Drag-and-drop conversation flow
- **Multi-language agents**: Switch language based on caller
- **Sentiment triggers**: Change approach based on caller mood
- **Integration actions**: "If qualified, add to Salesforce"

## Support & Training

### For Platform Owner
- ElevenLabs API documentation
- Agent creation best practices
- Cost optimization strategies
- Scaling considerations

### For End Users
- Template library (6 proven templates)
- Video tutorials (coming soon)
- Best practices guide (this document)
- Live chat support

## Cost Implications

### For You (Platform Owner)
- ElevenLabs charges per minute of calling
- Agent creation/storage: **FREE**
- Voice selection: **FREE**
- Only pay for actual call time

### For Your Users
- Agent creation: **FREE** (included in subscription)
- Customization: **FREE**
- Only limited by subscription tier (# of agents)
- Call minutes deducted from monthly allowance

## Success Metrics

Track these to measure custom agent effectiveness:

1. **Agent Utilization Rate**: Calls per agent per week
2. **Script Iteration Frequency**: How often users refine prompts
3. **Template Usage**: Which templates are most popular
4. **Custom vs Prebuilt**: Ratio of custom to prebuilt agents
5. **Voice Diversity**: How many different voices are used
6. **Language Distribution**: % non-English agents

---

**Bottom Line**: Give users the power to create exactly the agent they need, without requiring technical knowledge or separate accounts. This is a massive competitive advantage!
