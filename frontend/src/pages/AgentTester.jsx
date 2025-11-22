import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, PhoneCall, Mic, Square, Play, Send, MessageSquare, Calendar, List } from 'lucide-react';
import api from '../services/api';

export default function AgentTester() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testMode, setTestMode] = useState('inbound'); // 'inbound' or 'outbound'

  // Inbound test state
  const [inboundNumber, setInboundNumber] = useState('');
  const [calling, setCalling] = useState(false);

  // Outbound test state
  const [outboundNumber, setOutboundNumber] = useState('');
  const [outboundCalling, setOutboundCalling] = useState(false);

  // Results
  const [testResult, setTestResult] = useState(null);
  const [recentTests, setRecentTests] = useState([]);

  useEffect(() => {
    loadAgent();
    loadRecentTests();
  }, [id]);

  const loadAgent = async () => {
    try {
      const response = await api.get(`/agents/${id}`);
      setAgent(response.data);
    } catch (error) {
      console.error('Failed to load agent:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentTests = async () => {
    try {
      const response = await api.get(`/agents/${id}/test-results`);
      setRecentTests(response.data || []);
    } catch (error) {
      console.error('Failed to load test results:', error);
    }
  };

  const handleInboundTest = async () => {
    if (!inboundNumber) {
      alert('Please enter a phone number');
      return;
    }

    setCalling(true);
    setTestResult(null);

    try {
      const response = await api.post('/agents/test-call', {
        agentId: id,
        phoneNumber: inboundNumber,
        type: 'inbound'
      });

      setTestResult({
        success: true,
        message: 'Inbound test call initiated! The agent will call you shortly.',
        data: response.data
      });

      // Save test result
      await api.post(`/agents/${id}/test-results`, {
        type: 'inbound',
        phoneNumber: inboundNumber,
        status: 'initiated',
        timestamp: new Date()
      });

      loadRecentTests();
    } catch (error) {
      setTestResult({
        success: false,
        message: error.response?.data?.message || 'Failed to initiate test call',
        error: error.message
      });
    } finally {
      setCalling(false);
    }
  };

  const handleOutboundTest = async () => {
    if (!outboundNumber) {
      alert('Please enter a phone number to call');
      return;
    }

    setOutboundCalling(true);
    setTestResult(null);

    try {
      const response = await api.post('/agents/test-call', {
        agentId: id,
        phoneNumber: outboundNumber,
        type: 'outbound'
      });

      setTestResult({
        success: true,
        message: 'Outbound test call initiated! Your agent is calling the number.',
        data: response.data
      });

      // Save test result
      await api.post(`/agents/${id}/test-results`, {
        type: 'outbound',
        phoneNumber: outboundNumber,
        status: 'initiated',
        timestamp: new Date()
      });

      loadRecentTests();
    } catch (error) {
      setTestResult({
        success: false,
        message: error.response?.data?.message || 'Failed to initiate outbound call',
        error: error.message
      });
    } finally {
      setOutboundCalling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading agent...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-secondary/50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Agent not found</p>
          <button
            onClick={() => navigate('/app/agents')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Back to Agents
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate('/app/agents')}
                className="text-sm text-gray-600 mb-1 flex items-center gap-1"
              >
                ← Back to Agents
              </button>
              <h1 className="text-xl font-bold text-gray-900">{agent.name}</h1>
              <p className="text-sm text-gray-500">Test your agent</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Mode Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex gap-3">
            <button
              onClick={() => setTestMode('inbound')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                testMode === 'inbound'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-secondary text-gray-700 hover:bg-secondary/80'
              }`}
            >
              <PhoneCall className="inline-block w-5 h-5 mr-2" />
              Inbound Test
            </button>
            <button
              onClick={() => setTestMode('outbound')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                testMode === 'outbound'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-secondary text-gray-700 hover:bg-secondary/80'
              }`}
            >
              <Phone className="inline-block w-5 h-5 mr-2" />
              Outbound Test
            </button>
          </div>
        </div>

        {/* Test Interface */}
        {testMode === 'inbound' ? (
          // INBOUND TEST
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-xl">
                <PhoneCall className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Inbound Call Test</h2>
                <p className="text-sm text-gray-500">Agent calls you to test interactions</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Phone Number
                </label>
                <input
                  type="tel"
                  value={inboundNumber}
                  onChange={(e) => setInboundNumber(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Enter the number where you want to receive the test call
                </p>
              </div>

              <button
                onClick={handleInboundTest}
                disabled={calling || !inboundNumber}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                  calling || !inboundNumber
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {calling ? (
                  <>
                    <div className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Initiating Call...
                  </>
                ) : (
                  <>
                    <Play className="inline-block w-4 h-4 mr-2" />
                    Start Inbound Test
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          // OUTBOUND TEST
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-100 rounded-xl">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Outbound Call Test</h2>
                <p className="text-sm text-gray-500">Agent calls a number for you</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number to Call
                </label>
                <input
                  type="tel"
                  value={outboundNumber}
                  onChange={(e) => setOutboundNumber(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Enter the number you want the agent to call
                </p>
              </div>

              <button
                onClick={handleOutboundTest}
                disabled={outboundCalling || !outboundNumber}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                  outboundCalling || !outboundNumber
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {outboundCalling ? (
                  <>
                    <div className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Initiating Call...
                  </>
                ) : (
                  <>
                    <Send className="inline-block w-4 h-4 mr-2" />
                    Start Outbound Test
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Test Result */}
        {testResult && (
          <div className={`rounded-xl shadow-sm border p-6 ${
            testResult.success
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${
                testResult.success ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {testResult.success ? (
                  <PhoneCall className="w-5 h-5 text-green-600" />
                ) : (
                  <Square className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold mb-1 ${
                  testResult.success ? 'text-green-900' : 'text-red-900'
                }`}>
                  {testResult.success ? 'Test Initiated!' : 'Test Failed'}
                </h3>
                <p className={`text-sm ${
                  testResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {testResult.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Tests */}
        {recentTests.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <List className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Recent Tests</h3>
            </div>
            <div className="space-y-2">
              {recentTests.slice(0, 5).map((test, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {test.type === 'inbound' ? (
                      <PhoneCall className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Phone className="w-4 h-4 text-green-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {test.type === 'inbound' ? 'Inbound' : 'Outbound'} Test
                      </p>
                      <p className="text-xs text-gray-500">{test.phoneNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      test.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {test.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(test.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">What to Test:</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 mt-0.5 text-blue-600" />
              <span>Try asking for vendor lists or booking appointments</span>
            </li>
            <li className="flex items-start gap-2">
              <Calendar className="w-4 h-4 mt-0.5 text-purple-600" />
              <span>Test calendar invite automation after booking</span>
            </li>
            <li className="flex items-start gap-2">
              <Phone className="w-4 h-4 mt-0.5 text-green-600" />
              <span>Verify SMS notifications are sent correctly</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
