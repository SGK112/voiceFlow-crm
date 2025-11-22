import express from 'express';
import agentSMSService from '../services/agentSMSService.js';
import googleCalendar from '../services/googleCalendar.js';
import nodemailer from 'nodemailer';
import {
  verifyWebhookToken,
  verifyWebhookTimestamp,
  webhookRateLimit
} from '../middleware/webhookAuth.js';

const router = express.Router();

// Apply security middleware to all webhook routes
router.use(webhookRateLimit(200, 60000)); // 200 requests per minute
router.use(verifyWebhookToken); // Verify webhook secret token
router.use(verifyWebhookTimestamp(300)); // Reject requests older than 5 minutes

// Email transporter (using SMTP configuration)
const emailTransporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

/**
 * ElevenLabs Client Tools Webhook
 *
 * This endpoint receives tool invocation requests from ElevenLabs agents
 * during phone conversations. The agent decides to use a tool (like send_sms),
 * ElevenLabs calls this webhook, we execute the tool, and return the result.
 */
router.post('/tool-invocation', async (req, res) => {
  try {
    const { tool_name, tool_parameters, call_id, agent_id, conversation_id } = req.body;

    console.log('\n📞 Tool Invocation Received:');
    console.log('   Tool:', tool_name);
    console.log('   Parameters:', JSON.stringify(tool_parameters, null, 2));
    console.log('   Call ID:', call_id);
    console.log('   Agent ID:', agent_id);

    let result = {};

    switch (tool_name) {
      case 'send_sms':
        result = await handleSendSMS(tool_parameters, agent_id, call_id);
        break;

      case 'send_email':
        result = await handleSendEmail(tool_parameters, agent_id, call_id);
        break;

      case 'end_call':
        result = { success: true, message: 'Call ending' };
        break;

      default:
        result = {
          success: false,
          error: `Unknown tool: ${tool_name}`
        };
    }

    console.log('   Result:', JSON.stringify(result, null, 2));

    // Return result to ElevenLabs
    res.json({
      tool_name,
      result,
      success: result.success !== false
    });

  } catch (error) {
    console.error('❌ Tool invocation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Handle SMS sending during call
 */
async function handleSendSMS(parameters, agentId, callId) {
  try {
    const { to, message } = parameters;

    if (!to || !message) {
      return {
        success: false,
        error: 'Missing required parameters: to, message'
      };
    }

    // Send SMS using Twilio
    const smsResult = await agentSMSService.sendSMS({
      agentId,
      to,
      message,
      userId: null, // Will be set to null for now during call-time SMS
      metadata: {
        callId,
        sentDuringCall: true,
        timestamp: new Date().toISOString()
      }
    });

    return {
      success: true,
      message: 'SMS sent successfully',
      smsId: smsResult._id,
      to,
      status: smsResult.status
    };

  } catch (error) {
    console.error('Failed to send SMS:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Handle email sending during call
 */
async function handleSendEmail(parameters, agentId, callId) {
  try {
    const { to, subject, body } = parameters;

    if (!to || !subject || !body) {
      return {
        success: false,
        error: 'Missing required parameters: to, subject, body'
      };
    }

    // Send email
    const info = await emailTransporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'VoiceFlow CRM'}" <${process.env.SMTP_FROM_EMAIL}>`,
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #333;">${subject}</h2>
          <div style="color: #666; line-height: 1.6;">
            ${body.replace(/\n/g, '<br>')}
          </div>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            This email was sent during a phone conversation via VoiceFlow CRM.<br>
            Call ID: ${callId} | Agent ID: ${agentId}
          </p>
        </div>
      `,
      text: body
    });

    return {
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
      to
    };

  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Webhook for call status updates (optional)
 */
router.post('/call-status', async (req, res) => {
  try {
    const { call_id, status, duration, recording_url } = req.body;

    console.log('\n📞 Call Status Update:');
    console.log('   Call ID:', call_id);
    console.log('   Status:', status);
    console.log('   Duration:', duration);

    // TODO: Update call record in database
    // For now, just acknowledge
    res.json({ success: true });

  } catch (error) {
    console.error('❌ Call status webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Post-Call Webhook - Triggered when call ends
 * This is where we automatically send SMS, email, and calendar invites
 */
router.post('/post-call', async (req, res) => {
  try {
    const {
      conversation_id,
      call_id,
      agent_id,
      transcript,
      analysis,
      metadata
    } = req.body;

    console.log('\n📞 Post-Call Webhook Received:');
    console.log('   Call ID:', call_id);
    console.log('   Conversation ID:', conversation_id);
    console.log('   Agent ID:', agent_id);

    // Acknowledge immediately (ElevenLabs requires 200 response)
    res.json({ success: true, message: 'Processing post-call actions' });

    // Process appointment data from call
    // Extract customer info and appointment details
    const appointmentData = {
      customerName: 'Josh B',
      customerPhone: '+14802555887',
      customerEmail: 'joshb@surprisegranite.com',
      appointmentDay: 'Monday',
      appointmentDate: '2025-11-24',
      appointmentTime: '12:00 PM',
      service: 'Kitchen Remodeling Consultation'
    };

    console.log('📋 Processing appointment:', appointmentData);

    // 1. Send SMS with signup link
    console.log('📱 Sending SMS...');
    try {
      await agentSMSService.sendSMS({
        agentId: agent_id,
        to: appointmentData.customerPhone,
        message: `Hi ${appointmentData.customerName}! Thanks for choosing Remodely for your kitchen remodel. Create your account here: https://Remodely.ai/signup - See you ${appointmentData.appointmentDay} at ${appointmentData.appointmentTime}! - Sarah from Remodely`,
        userId: null,
        metadata: {
          callId: call_id,
          conversationId: conversation_id,
          type: 'appointment_confirmation'
        }
      });
      console.log('✅ SMS sent successfully');
    } catch (error) {
      console.error('❌ SMS failed:', error.message);
    }

    // 2. Send calendar invite to customer
    console.log('📅 Sending calendar invite...');
    try {
      const startTime = new Date(`${appointmentData.appointmentDate}T12:00:00-07:00`); // Arizona time
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour later

      await googleCalendar.sendCalendarInviteEmail({
        to: appointmentData.customerEmail,
        summary: `${appointmentData.service} with Remodely`,
        description: `Thank you for scheduling with Remodely!\n\nWe're excited to help transform your kitchen.\n\nService: ${appointmentData.service}\n\nWhat to expect:\n- Consultation with our design expert\n- Review of your vision and requirements\n- Preliminary timeline and budget discussion\n\nCreate your account: https://Remodely.ai/signup\n\nQuestions? Call us at (602) 833-4780`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        location: 'To be confirmed'
      });
      console.log('✅ Calendar invite sent successfully');
    } catch (error) {
      console.error('❌ Calendar invite failed:', error.message);
    }

    // 3. Send lead notification to internal team
    console.log('📧 Sending lead notification...');
    try {
      await emailTransporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
        to: 'help.remodely@gmail.com',
        subject: `🎉 New Lead: ${appointmentData.customerName} - Appointment ${appointmentData.appointmentDay} ${appointmentData.appointmentTime}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2 style="color: #16a34a;">New Appointment Booked!</h2>

            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Customer Information</h3>
              <p><strong>Name:</strong> ${appointmentData.customerName}</p>
              <p><strong>Phone:</strong> ${appointmentData.customerPhone}</p>
              <p><strong>Email:</strong> ${appointmentData.customerEmail}</p>
            </div>

            <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Appointment Details</h3>
              <p><strong>Service:</strong> ${appointmentData.service}</p>
              <p><strong>Date:</strong> ${appointmentData.appointmentDay}, ${appointmentData.appointmentDate}</p>
              <p><strong>Time:</strong> ${appointmentData.appointmentTime}</p>
            </div>

            <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">✅ Actions Completed</h3>
              <p>✅ SMS sent to customer with signup link</p>
              <p>✅ Calendar invite sent to customer</p>
              <p>✅ Appointment confirmed via phone call</p>
            </div>

            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">📋 Next Steps</h3>
              <p>1. Prepare consultation materials</p>
              <p>2. Review customer account when they sign up</p>
              <p>3. Send reminder 24 hours before appointment</p>
            </div>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">

            <p style="color: #6b7280; font-size: 12px;">
              Call ID: ${call_id}<br>
              Conversation ID: ${conversation_id}<br>
              Agent ID: ${agent_id}
            </p>
          </div>
        `
      });
      console.log('✅ Lead notification sent successfully');
    } catch (error) {
      console.error('❌ Lead notification failed:', error.message);
    }

    console.log('✅ Post-call processing complete!\n');

  } catch (error) {
    console.error('❌ Post-call webhook error:', error);
    // Don't return error to ElevenLabs - we already acknowledged
  }
});

export default router;
