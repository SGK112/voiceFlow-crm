import express from 'express';
import emailService from '../services/emailService.js';

const router = express.Router();

/**
 * Webhook for agents to send signup links
 * Triggered when customer says "send me the link" or "sign me up"
 */
router.post('/send-signup-link', async (req, res) => {
  try {
    const { customer_name, customer_email, customer_phone, call_id } = req.body;

    console.log(`📧 Agent webhook: Send signup link`);
    console.log(`   Customer: ${customer_name || 'Unknown'}`);
    console.log(`   Email: ${customer_email}`);
    console.log(`   Phone: ${customer_phone}`);
    console.log(`   Call ID: ${call_id}`);

    if (!customer_email && !customer_phone) {
      return res.status(400).json({
        success: false,
        message: 'Either email or phone is required'
      });
    }

    const signupUrl = `${process.env.FRONTEND_URL || 'https://remodely.ai'}/signup`;

    // Send email if we have it
    if (customer_email) {
      await emailService.sendEmail({
        to: customer_email,
        subject: 'Welcome to Remodely.ai - Your Signup Link',
        html: `
          <h2>Hi ${customer_name || 'there'}!</h2>
          <p>Thanks for your interest in Remodely.ai VoiceFlow CRM!</p>
          <p>As we discussed on the call, here's your signup link to get started with your FREE 14-day trial:</p>
          <p style="margin: 30px 0;">
            <a href="${signupUrl}" style="background: #4F46E5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Start Your Free Trial →
            </a>
          </p>
          <p><strong>What's Included:</strong></p>
          <ul>
            <li>AI voice agents that handle calls 24/7</li>
            <li>Lead qualification and appointment booking</li>
            <li>Complete CRM with pipeline management</li>
            <li>14-day FREE trial - no credit card required</li>
          </ul>
          <p>If you have any questions, just reply to this email!</p>
          <p>Best,<br>The Remodely.ai Team</p>
        `
      });

      console.log(`   ✅ Email sent to ${customer_email}`);
    }

    // TODO: Send SMS if only phone is provided
    // if (!customer_email && customer_phone) {
    //   await twilioService.sendSMS(customer_phone, `Hi ${customer_name}! Start your free Remodely.ai trial: ${signupUrl}`);
    // }

    res.json({
      success: true,
      message: customer_email
        ? `Signup link sent to ${customer_email}`
        : `Signup link will be sent to ${customer_phone}`,
      signup_url: signupUrl
    });

  } catch (error) {
    console.error('❌ Error in send-signup-link webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send signup link',
      error: error.message
    });
  }
});

/**
 * Webhook for agents to book appointments
 * Triggered when customer wants to schedule a call or demo
 */
router.post('/book-appointment', async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      appointment_date,
      appointment_time,
      appointment_type,
      notes,
      call_id
    } = req.body;

    console.log(`📅 Agent webhook: Book appointment`);
    console.log(`   Customer: ${customer_name || 'Unknown'}`);
    console.log(`   Email: ${customer_email}`);
    console.log(`   Date: ${appointment_date}`);
    console.log(`   Time: ${appointment_time}`);
    console.log(`   Type: ${appointment_type || 'Demo'}`);

    if (!customer_email) {
      return res.status(400).json({
        success: false,
        message: 'Customer email is required for booking'
      });
    }

    if (!appointment_date || !appointment_time) {
      return res.status(400).json({
        success: false,
        message: 'Appointment date and time are required'
      });
    }

    // Send confirmation email
    await emailService.sendEmail({
      to: customer_email,
      subject: `Appointment Confirmed - ${appointment_date} at ${appointment_time}`,
      html: `
        <h2>Hi ${customer_name || 'there'}!</h2>
        <p>Your appointment has been confirmed!</p>
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>📅 Appointment Details</h3>
          <p><strong>Date:</strong> ${appointment_date}</p>
          <p><strong>Time:</strong> ${appointment_time}</p>
          <p><strong>Type:</strong> ${appointment_type || 'Demo Call'}</p>
          ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
        </div>
        <p>We'll call you at ${customer_phone || 'your number'} at the scheduled time.</p>
        <p>Looking forward to speaking with you!</p>
        <p>Best,<br>The Remodely.ai Team</p>
      `
    });

    // Send internal notification
    await emailService.sendEmail({
      to: process.env.SMTP_USER || 'help.remodely@gmail.com',
      subject: `New Appointment Booked - ${appointment_date}`,
      html: `
        <h2>New Appointment Scheduled</h2>
        <p><strong>Customer:</strong> ${customer_name}</p>
        <p><strong>Email:</strong> ${customer_email}</p>
        <p><strong>Phone:</strong> ${customer_phone}</p>
        <p><strong>Date:</strong> ${appointment_date}</p>
        <p><strong>Time:</strong> ${appointment_time}</p>
        <p><strong>Type:</strong> ${appointment_type || 'Demo'}</p>
        <p><strong>Call ID:</strong> ${call_id}</p>
        ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
      `
    });

    console.log(`   ✅ Appointment confirmation sent`);

    res.json({
      success: true,
      message: `Appointment confirmed for ${appointment_date} at ${appointment_time}`,
      appointment: {
        date: appointment_date,
        time: appointment_time,
        type: appointment_type,
        customer_name,
        customer_email
      }
    });

  } catch (error) {
    console.error('❌ Error in book-appointment webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book appointment',
      error: error.message
    });
  }
});

/**
 * Webhook for agents to collect and store lead information
 * Used when SMS agent collects customer info during the call
 */
router.post('/collect-lead-info', async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      business_type,
      interested_in,
      notes,
      call_id
    } = req.body;

    console.log(`📝 Agent webhook: Collect lead info`);
    console.log(`   Customer: ${customer_name}`);
    console.log(`   Email: ${customer_email}`);
    console.log(`   Phone: ${customer_phone}`);
    console.log(`   Business: ${business_type}`);

    // Send notification to sales team
    await emailService.sendEmail({
      to: process.env.SMTP_USER || 'help.remodely@gmail.com',
      subject: `New Lead: ${customer_name} - ${business_type || 'Unknown Business'}`,
      html: `
        <h2>New Lead Collected by AI Agent</h2>
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px;">
          <p><strong>Name:</strong> ${customer_name}</p>
          <p><strong>Email:</strong> ${customer_email || 'Not provided'}</p>
          <p><strong>Phone:</strong> ${customer_phone}</p>
          <p><strong>Business Type:</strong> ${business_type || 'Not specified'}</p>
          <p><strong>Interested In:</strong> ${interested_in || 'General inquiry'}</p>
          ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
          <p><strong>Call ID:</strong> ${call_id}</p>
        </div>
        <p>Follow up with this lead to close the sale!</p>
      `
    });

    // If we have customer email, send them info
    if (customer_email) {
      const signupUrl = `${process.env.FRONTEND_URL || 'https://remodely.ai'}/signup`;

      await emailService.sendEmail({
        to: customer_email,
        subject: 'Great talking to you - Remodely.ai Info',
        html: `
          <h2>Hi ${customer_name}!</h2>
          <p>Thanks for the great conversation! As promised, here's everything you need to get started with Remodely.ai.</p>
          <p style="margin: 30px 0;">
            <a href="${signupUrl}" style="background: #4F46E5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Start Your FREE 14-Day Trial →
            </a>
          </p>
          <p><strong>Perfect for ${business_type || 'your business'}:</strong></p>
          <ul>
            <li>Never miss another call - 24/7 AI coverage</li>
            <li>Book more jobs automatically</li>
            <li>Qualify leads while you work</li>
            <li>Set up in 2-3 hours</li>
          </ul>
          <p>Questions? Just reply to this email!</p>
          <p>Best,<br>The Remodely.ai Team</p>
        `
      });
    }

    console.log(`   ✅ Lead info collected and notifications sent`);

    res.json({
      success: true,
      message: 'Lead information collected successfully',
      lead: {
        customer_name,
        customer_email,
        customer_phone,
        business_type
      }
    });

  } catch (error) {
    console.error('❌ Error in collect-lead-info webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to collect lead info',
      error: error.message
    });
  }
});

export default router;
