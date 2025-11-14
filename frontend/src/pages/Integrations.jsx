import { useState, useEffect } from 'react';
import {
  Plus,
  CheckCircle,
  XCircle,
  Settings,
  Trash2,
  ExternalLink,
  Key,
  Zap,
  Mail,
  MessageSquare,
  Phone,
  Bot,
  Calendar,
  FileText,
  DollarSign,
  Building
} from 'lucide-react';
import api from '../services/api';

// Integration service configurations
const INTEGRATION_SERVICES = [
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'Send SMS messages and make phone calls',
    icon: Phone,
    color: 'bg-red-500',
    category: 'Communication',
    fields: [
      { name: 'accountSid', label: 'Account SID', type: 'text', placeholder: 'AC...' },
      { name: 'authToken', label: 'Auth Token', type: 'password', placeholder: 'Your auth token' },
      { name: 'from', label: 'From Phone Number', type: 'tel', placeholder: '+1234567890' }
    ]
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'AI-powered workflows with GPT-4 and ChatGPT',
    icon: Bot,
    color: 'bg-green-500',
    category: 'AI',
    fields: [
      { name: 'apiKey', label: 'API Key', type: 'password', placeholder: 'sk-proj-...' },
      { name: 'organization', label: 'Organization ID (Optional)', type: 'text', placeholder: 'org-...' }
    ]
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send notifications to Slack channels',
    icon: MessageSquare,
    color: 'bg-purple-500',
    category: 'Communication',
    fields: [
      { name: 'webhookUrl', label: 'Webhook URL', type: 'url', placeholder: 'https://hooks.slack.com/services/...' },
      { name: 'channelId', label: 'Channel ID (Optional)', type: 'text', placeholder: '#general' }
    ]
  },
  {
    id: 'smtp',
    name: 'Email (SMTP)',
    description: 'Send emails from your own email account',
    icon: Mail,
    color: 'bg-blue-500',
    category: 'Communication',
    fields: [
      { name: 'host', label: 'SMTP Host', type: 'text', placeholder: 'smtp.gmail.com' },
      { name: 'port', label: 'Port', type: 'number', placeholder: '587' },
      { name: 'user', label: 'Username/Email', type: 'email', placeholder: 'you@example.com' },
      { name: 'password', label: 'Password', type: 'password', placeholder: 'Your email password' }
    ]
  }
];

export default function IntegrationsNew() {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const response = await api.get('/user-integrations');
      setIntegrations(response.data.integrations || []);
    } catch (error) {
      console.error('Error fetching integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = (service) => {
    setSelectedService(service);
    setFormData({});
    setShowSetupModal(true);
  };

  const handleConnect = async () => {
    if (!selectedService) return;

    // Validate required fields
    const missingFields = selectedService.fields
      .filter(field => !field.name.includes('ptional') && !formData[field.name])
      .map(field => field.label);

    if (missingFields.length > 0) {
      alert(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    setSubmitting(true);

    try {
      await api.post(`/user-integrations/${selectedService.id}`, {
        ...formData,
        displayName: formData.displayName || `My ${selectedService.name} Account`
      });

      alert(`✅ ${selectedService.name} connected successfully!`);
      setShowSetupModal(false);
      setFormData({});
      fetchIntegrations();
    } catch (error) {
      console.error('Error connecting integration:', error);
      alert(`Failed to connect ${selectedService.name}: ${error.response?.data?.message || error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisconnect = async (service) => {
    if (!confirm(`Are you sure you want to disconnect ${service}?`)) return;

    try {
      await api.delete(`/user-integrations/${service}`);
      alert('Integration disconnected successfully');
      fetchIntegrations();
    } catch (error) {
      console.error('Error disconnecting integration:', error);
      alert('Failed to disconnect integration');
    }
  };

  const handleTest = async (service) => {
    try {
      await api.post(`/user-integrations/${service}/test`);
      alert(`✅ ${service} test successful!`);
    } catch (error) {
      console.error('Error testing integration:', error);
      alert(`Test failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const isConnected = (serviceId) => {
    return integrations.some(int => int.service === serviceId && int.status === 'connected');
  };

  const getIntegrationByService = (serviceId) => {
    return integrations.find(int => int.service === serviceId);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Communication': 'bg-blue-100 text-blue-700',
      'AI': 'bg-purple-100 text-purple-700',
      'Finance': 'bg-green-100 text-green-700',
      'Productivity': 'bg-yellow-100 text-yellow-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
          <Zap className="w-8 h-8 text-blue-600" />
          Integrations
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Connect your favorite tools and services to power your workflows
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Connected</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {integrations.filter(i => i.status === 'connected').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Available</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {INTEGRATION_SERVICES.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Usage</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {integrations.reduce((sum, i) => sum + (i.usageCount || 0), 0)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {INTEGRATION_SERVICES.map(service => {
          const Icon = service.icon;
          const connected = isConnected(service.id);
          const integration = getIntegrationByService(service.id);

          return (
            <div
              key={service.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 ${service.color} rounded-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 dark:text-gray-100">{service.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(service.category)}`}>
                        {service.category}
                      </span>
                    </div>
                  </div>

                  {connected ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-gray-300" />
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4">{service.description}</p>

                {/* Connection Info */}
                {connected && integration && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-sm">
                      <p className="text-green-700 font-medium mb-1">
                        ✓ {integration.displayName || `Connected ${service.name}`}
                      </p>
                      {integration.credentialInfo && (
                        <div className="text-xs text-green-600 space-y-1">
                          {Object.entries(integration.credentialInfo).map(([key, value]) => (
                            <div key={key}>
                              {key}: {value}
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-green-600 mt-2">
                        Used {integration.usageCount || 0} times
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {connected ? (
                    <>
                      <button
                        onClick={() => handleTest(service.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                      >
                        <Zap className="w-4 h-4" />
                        Test
                      </button>
                      <button
                        onClick={() => handleDisconnect(service.id)}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
                        title="Disconnect"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleSetup(service)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Connect
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Setup Modal */}
      {showSetupModal && selectedService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 ${selectedService.color} rounded-lg`}>
                  {selectedService.icon && <selectedService.icon className="w-6 h-6 text-white" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Connect {selectedService.name}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedService.description}</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Display Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder={`My ${selectedService.name} Account`}
                    value={formData.displayName || ''}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {selectedService.fields.map(field => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required={!field.label.includes('Optional')}
                    />
                  </div>
                ))}
              </div>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <Key className="w-4 h-4 inline mr-1" />
                  Your credentials are encrypted and stored securely. They're only used to power your workflows.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowSetupModal(false);
                    setFormData({});
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-700"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConnect}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Connecting...' : 'Connect'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-white dark:bg-gray-800/20 rounded-lg">
            <Zap className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">
              Why connect your accounts?
            </h3>
            <p className="text-blue-100 text-sm mb-3">
              By connecting your own accounts, you maintain full control over your data, pay for usage directly through your existing subscriptions, and avoid platform fees.
            </p>
            <ul className="text-sm text-blue-100 space-y-1">
              <li>✓ Your workflows use your API keys and credentials</li>
              <li>✓ You pay your service providers directly (no markup)</li>
              <li>✓ Full control over rate limits and quotas</li>
              <li>✓ Enterprise-grade security and encryption</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
