import axios from 'axios';

const WEBHOOK_URL = 'http://localhost:5001/api/webhooks/elevenlabs/call-completed';

// Simulate a call completion webhook from ElevenLabs
// This matches the format ElevenLabs actually sends
const simulatedCallData = {
  call_id: 'test_call_' + Date.now(),
  agent_id: 'agent_4401kacmh26fet9asap21g1516p5',
  caller_phone: '+14155551234',
  caller_name: 'John Smith',
  to_number: '+16028337194',
  duration: 180, // 3 minutes
  status: 'completed',
  timestamp: new Date().toISOString(),
  direction: 'inbound', // Added required field
  transcript: 'Agent: Hey! Thanks for calling Surprise Granite. We do direct onsite consultations for countertops and remodeling. What can I help you with today?\nCustomer: Hi, I need a consultation for a kitchen remodel.\nAgent: Great! I can help you schedule that. What\'s your name?\nCustomer: John Smith\nAgent: And what\'s the best email to reach you?\nCustomer: john.smith@email.com\nAgent: Let me confirm - that\'s j-o-h-n dot s-m-i-t-h at e-m-a-i-l dot com, correct?\nCustomer: Yes, that\'s right.\nAgent: Perfect. What\'s the address where we\'ll be doing the work?\nCustomer: 123 Main Street, Surprise, AZ 85374\nAgent: Got it - 123 Main Street, Surprise, Arizona 85374. What day works best for you?\nCustomer: How about this Friday?\nAgent: And what time works for you?\nCustomer: 2 PM would be great.\nAgent: Perfect! I\'ve got you scheduled for a consultation this Friday at 2 PM at 123 Main Street in Surprise. You\'ll receive a confirmation email with a calendar invite. Is there anything else I can help you with?\nCustomer: No, that\'s all. Thank you!\nAgent: You\'re welcome! We look forward to seeing you Friday. Have a great day!',
  email: 'john.smith@email.com',
  // Metadata will be stored in CallLog.metadata.raw_data
  consultation_booked: true,
  customer_email: 'john.smith@email.com',
  customer_name: 'John Smith',
  consultation_date: '2025-11-22', // This Friday
  consultation_time: '14:00',
  address: '123 Main Street, Surprise, AZ 85374'
};

console.log('🧪 Testing Webhook with Simulated Call Data\n');
console.log('📞 Simulated Call:');
console.log('   Caller:', simulatedCallData.caller_name);
console.log('   Phone:', simulatedCallData.caller_phone);
console.log('   Email:', simulatedCallData.email);
console.log('   Duration:', simulatedCallData.duration, 'seconds');
console.log('   Consultation Booked:', simulatedCallData.consultation_booked);
console.log('   Date/Time:', simulatedCallData.consultation_date, 'at', simulatedCallData.consultation_time);
console.log('');

try {
  console.log('📡 Sending webhook to:', WEBHOOK_URL);
  console.log('');

  const response = await axios.post(WEBHOOK_URL, simulatedCallData, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  console.log('✅ Webhook Response:', response.status, response.statusText);
  console.log('');
  console.log('📋 Response Data:');
  console.log(JSON.stringify(response.data, null, 2));
  console.log('');
  console.log('✅ TEST SUCCESSFUL!');
  console.log('');
  console.log('🔍 Check your logs for:');
  console.log('   - "📞 Received call completion webhook"');
  console.log('   - "✅ Call saved"');
  console.log('   - "📧 Sending consultation confirmation with calendar invite"');
  console.log('   - "✅ Calendar invite sent successfully"');
  console.log('');
  console.log('📧 Check email: john.smith@email.com');
  console.log('   Should receive consultation confirmation with calendar invite attachment');

} catch (error) {
  console.error('❌ Webhook Error:', error.response?.status, error.response?.statusText);
  console.error('');
  console.error('Error Details:');
  console.error(JSON.stringify(error.response?.data, null, 2));
  console.error('');
  console.error('Full Error:', error.message);
}
