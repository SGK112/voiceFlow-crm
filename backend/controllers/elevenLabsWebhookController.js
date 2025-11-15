import TwilioService from '../services/twilioService.js';
import emailService from '../services/emailService.js';

const twilioService = new TwilioService();

// Handle agent action: Send signup link via SMS during call
export const sendSignupLinkAction = async (req, res) => {
  try {
    const { phone_number, customer_name, conversation_id } = req.body;

    console.log(`📱 Agent requested SMS signup link for ${customer_name} at ${phone_number}`);
    console.log(`   Conversation ID: ${conversation_id}`);

    if (!phone_number) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    // Send signup link via SMS
    await twilioService.sendSignupLink(phone_number, customer_name);

    console.log(`✅ Signup link SMS sent to ${phone_number} during call`);

    // Return success to agent
    res.json({
      success: true,
      message: `SMS sent successfully to ${phone_number}`,
      action: 'sms_sent'
    });

  } catch (error) {
    console.error('Error sending signup link SMS:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send SMS'
    });
  }
};

// Handle post-call follow-up (SMS + Email)
export const handlePostCallFollowUp = async (req, res) => {
  try {
    const {
      conversation_id,
      call_id,
      agent_id,
      metadata,
      transcript,
      analysis
    } = req.body;

    console.log(`📞 Post-call follow-up triggered for conversation ${conversation_id}`);

    // Extract customer info from metadata
    const customerName = metadata?.customer_name || metadata?.lead_name || 'there';
    const customerPhone = metadata?.lead_phone;
    const customerEmail = metadata?.lead_email;

    // Send follow-up SMS if phone number available
    if (customerPhone) {
      try {
        const smsBody = `Hi ${customerName}! Thanks for chatting with our AI agent! 🤖\n\nReady to start your FREE VoiceFlow CRM trial?\n👉 www.remodely.ai/signup\n\nQuestions? Reply to this text!\n\n- Remodelee AI Team`;

        await twilioService.sendSMS(customerPhone, smsBody);
        console.log(`✅ Post-call SMS sent to ${customerPhone}`);
      } catch (smsError) {
        console.error('Failed to send post-call SMS:', smsError);
      }
    }

    // Send follow-up email if email available
    if (customerEmail) {
      try {
        // Also notify sales team (help.remodely@gmail.com)
        const recipients = [customerEmail, 'help.remodely@gmail.com'];

        await emailService.sendEmail({
          to: customerEmail,
          cc: 'help.remodely@gmail.com',
          subject: 'Thanks for Trying VoiceFlow CRM! 🤖',
          text: `Hi ${customerName}!\n\nThanks for taking the time to chat with our AI voice agent! We hope you saw how realistic and helpful VoiceFlow CRM can be.\n\n🎯 What's Next?\nStart your FREE 14-day trial of VoiceFlow CRM (no credit card needed):\nwww.remodely.ai/signup\n\n💡 What You'll Get with VoiceFlow CRM:\n✓ 24/7 AI agents that never miss calls\n✓ Automated lead qualification\n✓ Appointment booking\n✓ Custom workflows (no coding needed)\n✓ Full CRM included\n\n📞 Questions?\nReply to this email or call us anytime!\n\nBest regards,\nThe Remodelee AI Team`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 20px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Thanks for Trying VoiceFlow CRM! 🤖</h1>
                </div>

                <div style="padding: 40px 30px;">
                  <p style="font-size: 18px; color: #0f172a;">Hi ${customerName}! 👋</p>

                  <p style="font-size: 16px; color: #475569; line-height: 1.6;">
                    Thanks for taking the time to chat with our AI voice agent! We hope you saw how realistic and helpful <strong>VoiceFlow CRM</strong> can be.
                  </p>

                  <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 4px;">
                    <h3 style="margin: 0 0 10px 0; color: #1e40af;">🎯 What's Next?</h3>
                    <p style="margin: 0; font-size: 16px; color: #3b82f6;">
                      Start your <strong>FREE 14-day trial of VoiceFlow CRM</strong> (no credit card needed)
                    </p>
                  </div>

                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://www.remodely.ai/signup" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 18px;">
                      Start VoiceFlow CRM Trial →
                    </a>
                  </div>

                  <h3 style="font-size: 18px; color: #0f172a; margin: 30px 0 15px 0;">💡 What You'll Get with VoiceFlow CRM:</h3>
                  <ul style="color: #475569; font-size: 15px; line-height: 1.8;">
                    <li>✓ 24/7 AI agents that never miss calls</li>
                    <li>✓ Automated lead qualification</li>
                    <li>✓ Appointment booking</li>
                    <li>✓ Custom workflows (no coding needed)</li>
                    <li>✓ Full CRM included</li>
                  </ul>

                  <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 30px 0;">
                    <h4 style="margin: 0 0 10px 0; color: #0f172a;">📞 Questions?</h4>
                    <p style="margin: 0; color: #64748b;">
                      Reply to this email or call us anytime!
                    </p>
                  </div>

                  <p style="font-size: 15px; color: #64748b; margin: 30px 0 0 0;">
                    Best regards,<br>
                    <strong style="color: #0f172a;">The Remodelee AI Team</strong>
                  </p>
                </div>

                <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0; color: #64748b; font-size: 13px;">
                    <a href="https://www.remodely.ai" style="color: #3b82f6; text-decoration: none;">Visit VoiceFlow CRM</a> |
                    <a href="mailto:help.remodely@gmail.com" style="color: #3b82f6; text-decoration: none;">Contact Support</a>
                  </p>
                </div>
              </div>
            </body>
            </html>
          `
        });
        console.log(`✅ Post-call email sent to ${customerEmail}`);
      } catch (emailError) {
        console.error('Failed to send post-call email:', emailError);
      }
    }

    // Send success response
    res.json({
      success: true,
      message: 'Post-call follow-up sent',
      sms_sent: !!customerPhone,
      email_sent: !!customerEmail
    });

  } catch (error) {
    console.error('Error in post-call follow-up:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send follow-up'
    });
  }
};

// Handle ElevenLabs conversation events
export const handleConversationEvent = async (req, res) => {
  try {
    const event = req.body;

    console.log(`🔔 ElevenLabs webhook called!`);
    console.log(`   Full event:`, JSON.stringify(event, null, 2));
    console.log(`   Headers:`, JSON.stringify(req.headers, null, 2));

    // Handle different event types
    switch (event.type) {
      case 'conversation.started':
        console.log(`🎙️  Conversation started: ${event.conversation_id}`);
        break;

      case 'conversation.ended':
        console.log(`🏁 Conversation ended: ${event.conversation_id}`);
        // Trigger post-call follow-up
        await handlePostCallFollowUp(req, res);
        return;

      case 'agent.interrupted':
        console.log(`🔇 Agent interrupted in conversation ${event.conversation_id}`);
        break;

      case 'user.spoke':
        console.log(`🗣️  User spoke: "${event.transcript}"`);
        break;

      case 'agent.tool_called':
      case 'tool.called':
        // Handle tool execution request from agent
        console.log(`🔧 Tool called: ${event.tool_name || event.name}`);
        console.log(`   Parameters:`, event.parameters || event.tool_parameters);

        if ((event.tool_name || event.name) === 'send_signup_link') {
          const params = event.parameters || event.tool_parameters || {};
          const phoneNumber = params.phone_number;
          const customerName = params.customer_name;

          try {
            // Send SMS
            await twilioService.sendSignupLink(phoneNumber, customerName);
            console.log(`✅ SMS sent to ${phoneNumber} via tool call`);

            // Respond with success
            res.json({
              success: true,
              tool_result: {
                message: `SMS sent successfully to ${phoneNumber}`,
                status: 'sent'
              }
            });
            return;
          } catch (error) {
            console.error('Error executing tool:', error);
            res.json({
              success: false,
              tool_result: {
                error: 'Failed to send SMS',
                status: 'failed'
              }
            });
            return;
          }
        }
        break;

      default:
        console.log(`ℹ️  Unhandled event type: ${event.type}`);
        console.log(`   Full event:`, JSON.stringify(event, null, 2));
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Error handling conversation event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to handle event'
    });
  }
};

// Test endpoint to verify webhook setup
export const testWebhook = async (req, res) => {
  try {
    console.log('🧪 Webhook test endpoint called');
    console.log('Request body:', req.body);
    console.log('Request query:', req.query);

    res.json({
      success: true,
      message: 'Webhook endpoint is working!',
      timestamp: new Date().toISOString(),
      received: {
        body: req.body,
        query: req.query
      }
    });
  } catch (error) {
    console.error('Webhook test error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
