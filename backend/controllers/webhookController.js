import CallLog from '../models/CallLog.js';
import Lead from '../models/Lead.js';
import User from '../models/User.js';
import VoiceAgent from '../models/VoiceAgent.js';
import N8nWorkflow from '../models/N8nWorkflow.js';
import Usage from '../models/Usage.js';
import Task from '../models/Task.js';
import N8nService from '../services/n8nService.js';

const n8nService = new N8nService();

/**
 * Built-in Smart Automations
 * These run automatically after every call - no configuration needed
 * Provides immediate value to users without setup complexity
 */
async function runBuiltInAutomations({ callLog, callData, agent, lead, userId }) {
  try {
    const extractedData = callData.extracted_data || {};
    const callStatus = callData.status;
    const isQualified = extractedData.qualified === true;
    const hasAppointment = extractedData.appointment_booked === true;
    const appointmentDate = extractedData.appointment_date;
    const phoneNumber = callData.caller_phone || callData.phone_number;

    // AUTOMATION 1: Qualified Lead → Create Follow-Up Task
    if (isQualified && lead) {
      const followUpDate = new Date();
      followUpDate.setHours(followUpDate.getHours() + 24); // Follow up in 24 hours

      await Task.create({
        user: userId,
        title: `Follow up with qualified lead: ${lead.name}`,
        description: `Lead qualified during ${agent.type} call. Contact: ${lead.phone}\n\nCall transcript: ${callData.transcript || 'Not available'}`,
        type: 'follow_up',
        status: 'pending',
        priority: 'high',
        dueDate: followUpDate,
        relatedContact: lead._id,
        relatedCall: callLog._id,
        autoCreatedBy: 'voice_agent',
        voiceAgentId: agent._id
      });

      // Update lead status
      if (lead.status === 'new') {
        lead.status = 'qualified';
        lead.lastContactedAt = new Date();
        await lead.save();
      }
    }

    // AUTOMATION 2: Appointment Booked → Create Reminder Task
    if (hasAppointment && appointmentDate && lead) {
      const reminderDate = new Date(appointmentDate);
      reminderDate.setHours(reminderDate.getHours() - 24); // Remind 24 hours before

      await Task.create({
        user: userId,
        title: `Appointment Reminder: ${lead.name}`,
        description: `Appointment scheduled for ${new Date(appointmentDate).toLocaleString()}\n\nContact: ${lead.phone}\nBooked via: ${agent.name}`,
        type: 'reminder',
        status: 'pending',
        priority: 'high',
        dueDate: reminderDate,
        relatedContact: lead._id,
        relatedCall: callLog._id,
        autoCreatedBy: 'voice_agent',
        voiceAgentId: agent._id
      });

      // Update lead status to contacted
      if (lead && (lead.status === 'new' || lead.status === 'contacted')) {
        lead.status = 'qualified';
        lead.lastContactedAt = new Date();
        await lead.save();
      }
    }

    // AUTOMATION 3: No Answer / Failed → Schedule Retry Call
    if ((callStatus === 'no-answer' || callStatus === 'failed' || callStatus === 'busy')) {
      const retryDate = new Date();
      retryDate.setHours(retryDate.getHours() + 2); // Retry in 2 hours

      await Task.create({
        user: userId,
        title: `Retry call to ${callData.caller_name || phoneNumber}`,
        description: `Previous call status: ${callStatus}\nAttempted via: ${agent.name}\n\nPhone: ${phoneNumber}`,
        type: 'call',
        status: 'pending',
        priority: 'medium',
        dueDate: retryDate,
        relatedContact: lead?._id,
        relatedCall: callLog._id,
        autoCreatedBy: 'voice_agent',
        voiceAgentId: agent._id
      });
    }

    // AUTOMATION 4: Interested but Not Qualified → Create Nurture Task
    if (extractedData.interest && !isQualified && lead) {
      const nurtureDate = new Date();
      nurtureDate.setDate(nurtureDate.getDate() + 3); // Nurture in 3 days

      await Task.create({
        user: userId,
        title: `Nurture interested lead: ${lead.name}`,
        description: `Lead showed interest in: ${extractedData.interest}\n\nQualification score: ${lead.qualificationScore || 0}\nContact: ${lead.phone}`,
        type: 'follow_up',
        status: 'pending',
        priority: 'medium',
        dueDate: nurtureDate,
        relatedContact: lead._id,
        relatedCall: callLog._id,
        autoCreatedBy: 'voice_agent',
        voiceAgentId: agent._id
      });

      // Update lead status
      if (lead.status === 'new') {
        lead.status = 'contacted';
        lead.lastContactedAt = new Date();
        await lead.save();
      }
    }

    // AUTOMATION 5: Payment Captured → Create Thank You Task
    if (extractedData.payment_captured && extractedData.payment_amount && lead) {
      const thankYouDate = new Date();
      thankYouDate.setHours(thankYouDate.getHours() + 1); // Send thank you in 1 hour

      await Task.create({
        user: userId,
        title: `Send thank you to ${lead.name} - Payment received`,
        description: `Payment amount: $${extractedData.payment_amount}\n\nConsider upsell or referral request.\nContact: ${lead.phone}`,
        type: 'email',
        status: 'pending',
        priority: 'high',
        dueDate: thankYouDate,
        relatedContact: lead._id,
        relatedCall: callLog._id,
        autoCreatedBy: 'voice_agent',
        voiceAgentId: agent._id
      });

      // Mark as converted
      if (lead) {
        lead.status = 'converted';
        lead.convertedAt = new Date();
        lead.value = extractedData.payment_amount;
        await lead.save();
      }
    }

    // AUTOMATION 6: Negative Sentiment → Escalate to Manager
    if (callData.sentiment === 'negative' && callStatus === 'completed') {
      const escalateDate = new Date();
      escalateDate.setMinutes(escalateDate.getMinutes() + 30); // Urgent - 30 minutes

      await Task.create({
        user: userId,
        title: `URGENT: Negative sentiment detected - ${callData.caller_name || phoneNumber}`,
        description: `Call completed with negative sentiment.\n\nAgent: ${agent.name}\nPhone: ${phoneNumber}\n\nReview transcript and follow up immediately.\n\nTranscript: ${callData.transcript || 'Not available'}`,
        type: 'follow_up',
        status: 'pending',
        priority: 'urgent',
        dueDate: escalateDate,
        relatedContact: lead?._id,
        relatedCall: callLog._id,
        autoCreatedBy: 'voice_agent',
        voiceAgentId: agent._id
      });
    }

    console.log(`✅ Built-in automations executed for call ${callLog._id}`);
  } catch (error) {
    console.error('❌ Built-in automation error:', error.message);
    // Don't throw - we don't want automations to break the webhook
  }
}

export const handleElevenLabsWebhook = async (req, res) => {
  try {
    const callData = req.body;

    const agent = await VoiceAgent.findOne({ elevenLabsAgentId: callData.agent_id });

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Calculate duration and costs
    const durationSeconds = callData.duration || 0;
    const durationMinutes = Math.ceil(durationSeconds / 60); // Round up for billing
    const costPerMinute = 0.10; // ElevenLabs cost
    const totalCost = durationMinutes * costPerMinute;

    const callLog = await CallLog.create({
      userId: agent.userId,
      agentId: agent._id,
      callerName: callData.caller_name || 'Unknown',
      callerPhone: callData.caller_phone || callData.phone_number,
      direction: callData.direction || 'outbound',
      duration: durationSeconds,
      durationMinutes: durationMinutes,
      cost: {
        costPerMinute: costPerMinute,
        totalCost: totalCost,
        userCharge: 0 // Will be calculated if overage
      },
      transcript: callData.transcript || '',
      recordingUrl: callData.recording_url,
      status: callData.status || 'completed',
      elevenLabsCallId: callData.call_id,
      sentiment: callData.sentiment || 'neutral',
      leadsCapured: {
        name: callData.extracted_data?.name,
        email: callData.extracted_data?.email,
        phone: callData.extracted_data?.phone || callData.caller_phone,
        interest: callData.extracted_data?.interest,
        qualified: callData.extracted_data?.qualified || false,
        appointmentBooked: callData.extracted_data?.appointment_booked || false,
        appointmentDate: callData.extracted_data?.appointment_date,
        paymentCaptured: callData.extracted_data?.payment_captured || false,
        paymentAmount: callData.extracted_data?.payment_amount
      }
    });

    agent.performance.totalCalls += 1;
    if (callData.status === 'completed') {
      agent.performance.successfulCalls += 1;
    }
    await agent.save();

    // Update usage with minute tracking
    const user = await User.findById(agent.userId);
    const usage = await Usage.getOrCreateForUser(agent.userId, user);

    // Track the call duration and costs
    await usage.addCall(durationMinutes, {
      costPerMinute: costPerMinute,
      totalCost: totalCost
    });

    // Create lead if data was extracted
    let createdLead = null;
    if (callData.extracted_data?.name && callData.extracted_data?.phone) {
      createdLead = await Lead.create({
        userId: agent.userId,
        name: callData.extracted_data.name,
        email: callData.extracted_data.email || `${callData.caller_phone}@temp.com`,
        phone: callData.extracted_data.phone || callData.caller_phone,
        source: agent.type,
        qualified: callData.extracted_data.qualified || false,
        qualificationScore: callData.extracted_data.qualification_score || 0,
        value: callData.extracted_data.estimated_value || 0,
        status: callData.extracted_data.qualified ? 'qualified' : 'new',
        callId: callLog._id
      });

      agent.performance.leadsGenerated += 1;
      await agent.save();

      if (usage) {
        usage.leadsGenerated += 1;
        await usage.save();
      }
    }

    // ===================================================================
    // BUILT-IN SMART AUTOMATIONS - Run after every call
    // ===================================================================
    await runBuiltInAutomations({
      callLog,
      callData,
      agent,
      lead: createdLead,
      userId: agent.userId
    });

    const workflows = await N8nWorkflow.find({
      userId: agent.userId,
      enabled: true
    });

    for (const workflow of workflows) {
      const conditions = workflow.triggerConditions;

      let shouldTrigger = true;

      if (conditions.agentTypes && conditions.agentTypes.length > 0) {
        shouldTrigger = shouldTrigger && conditions.agentTypes.includes(agent.type);
      }

      if (conditions.callStatus && conditions.callStatus.length > 0) {
        shouldTrigger = shouldTrigger && conditions.callStatus.includes(callData.status);
      }

      if (conditions.leadQualified !== undefined) {
        shouldTrigger = shouldTrigger && (callData.extracted_data?.qualified === conditions.leadQualified);
      }

      if (shouldTrigger && workflow.n8nWorkflowId) {
        try {
          await n8nService.triggerWorkflow(workflow.n8nWorkflowId, {
            call: callLog,
            agent: { id: agent._id, name: agent.name, type: agent.type },
            extractedData: callData.extracted_data
          });

          workflow.executionCount += 1;
          workflow.lastExecutedAt = new Date();
          workflow.successCount += 1;
          await workflow.save();
        } catch (error) {
          console.error('Failed to trigger workflow:', error);
          workflow.failureCount += 1;
          await workflow.save();
        }
      }
    }

    res.json({ received: true, callId: callLog._id });
  } catch (error) {
    console.error('ElevenLabs Webhook Error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const handleN8nWebhook = async (req, res) => {
  try {
    const data = req.body;
    console.log('N8N Webhook received:', data);

    res.json({ received: true });
  } catch (error) {
    console.error('N8N Webhook Error:', error);
    res.status(500).json({ message: error.message });
  }
};
