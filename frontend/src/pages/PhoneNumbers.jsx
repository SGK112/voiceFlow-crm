import { useState, useEffect } from 'react';
import {
  Phone,
  Plus,
  Search,
  DollarSign,
  Check,
  X,
  Settings,
  Trash2,
  Upload,
  ShoppingCart,
  Bot,
  PhoneIncoming,
  PhoneOutgoing,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PhoneNumbers() {
  const { user } = useAuth();
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [availableNumbers, setAvailableNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchArea, setSearchArea] = useState('');
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showPortModal, setShowPortModal] = useState(false);
  const [portForm, setPortForm] = useState({
    phoneNumber: '',
    currentProvider: '',
    accountNumber: ''
  });

  // Check subscription tier
  const canAddNumbers = user?.subscription?.tier !== 'free';
  const numberLimit = {
    free: 0,
    starter: 1,
    pro: 5,
    enterprise: 999
  }[user?.subscription?.tier || 'free'];

  useEffect(() => {
    fetchPhoneNumbers();
  }, []);

  const fetchPhoneNumbers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/phone-numbers');
      setPhoneNumbers(response.data.phoneNumbers || []);
    } catch (error) {
      console.error('Error fetching phone numbers:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchAvailableNumbers = async () => {
    if (!searchArea) {
      alert('Please enter an area code or city');
      return;
    }

    try {
      const response = await api.get(`/phone-numbers/available?areaCode=${searchArea}`);
      setAvailableNumbers(response.data.phoneNumbers || []);
      setShowBuyModal(true);
    } catch (error) {
      console.error('Error searching numbers:', error);
      alert('Failed to search for available numbers');
    }
  };

  const purchaseNumber = async (phoneNumber) => {
    if (!canAddNumbers || phoneNumbers.length >= numberLimit) {
      alert(`Upgrade your plan to add more phone numbers. Current limit: ${numberLimit}`);
      return;
    }

    try {
      await api.post('/phone-numbers/purchase', { phoneNumber });
      alert('Phone number purchased successfully!');
      setShowBuyModal(false);
      fetchPhoneNumbers();
    } catch (error) {
      console.error('Error purchasing number:', error);
      alert(error.response?.data?.message || 'Failed to purchase number');
    }
  };

  const portNumber = async (e) => {
    e.preventDefault();

    if (!canAddNumbers || phoneNumbers.length >= numberLimit) {
      alert(`Upgrade your plan to add more phone numbers. Current limit: ${numberLimit}`);
      return;
    }

    try {
      await api.post('/phone-numbers/port', portForm);
      alert('Port request submitted! We\'ll process this within 1-2 business days and notify you.');
      setShowPortModal(false);
      setPortForm({ phoneNumber: '', currentProvider: '', accountNumber: '' });
      fetchPhoneNumbers();
    } catch (error) {
      console.error('Error porting number:', error);
      alert(error.response?.data?.message || 'Failed to submit port request');
    }
  };

  const assignAgent = async (numberId, agentId) => {
    try {
      await api.patch(`/phone-numbers/${numberId}`, { assignedAgent: agentId });
      fetchPhoneNumbers();
    } catch (error) {
      console.error('Error assigning agent:', error);
    }
  };

  const deleteNumber = async (numberId) => {
    if (!confirm('Are you sure you want to release this phone number?')) return;

    try {
      await api.delete(`/phone-numbers/${numberId}`);
      fetchPhoneNumbers();
    } catch (error) {
      console.error('Error deleting number:', error);
      alert('Failed to release number');
    }
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  const stats = {
    total: phoneNumbers.length,
    active: phoneNumbers.filter(n => n.status === 'active').length,
    assigned: phoneNumbers.filter(n => n.assignedAgent).length,
    available: numberLimit - phoneNumbers.length
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <Phone className="w-8 h-8 text-blue-600" />
              Phone Numbers
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your phone numbers for AI agents
            </p>
          </div>

          {canAddNumbers ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPortModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Port Existing Number
              </button>
              <button
                onClick={() => setShowBuyModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                Buy New Number
              </button>
            </div>
          ) : (
            <button
              onClick={() => window.location.href = '/app/settings'}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
            >
              Upgrade to Add Numbers
            </button>
          )}
        </div>

        {/* Paywall Notice */}
        {!canAddNumbers && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900">Upgrade Required</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Phone numbers are available on Starter plans and above. Upgrade now to start receiving calls with AI agents!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 mb-1">Total Numbers</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">of {numberLimit} allowed</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 mb-1">Active</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 mb-1">Assigned to Agents</p>
            <p className="text-2xl font-bold text-purple-600">{stats.assigned}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 mb-1">Available Slots</p>
            <p className="text-2xl font-bold text-blue-600">{stats.available}</p>
          </div>
        </div>
      </div>

      {/* Phone Numbers List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : phoneNumbers.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <Phone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No phone numbers yet</h3>
          <p className="text-gray-600 mb-6">
            {canAddNumbers
              ? 'Buy a new number or port your existing one to get started'
              : 'Upgrade your plan to add phone numbers for your AI agents'
            }
          </p>
          {canAddNumbers ? (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowBuyModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <ShoppingCart className="w-4 h-4" />
                Buy Number
              </button>
              <button
                onClick={() => setShowPortModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-700"
              >
                <Upload className="w-4 h-4" />
                Port Number
              </button>
            </div>
          ) : (
            <button
              onClick={() => window.location.href = '/app/settings'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Upgrade Plan
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {phoneNumbers.map((number) => (
            <div
              key={number._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 dark:text-gray-100">
                      {formatPhoneNumber(number.phoneNumber)}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {number.type === 'purchased' ? 'Purchased' : 'Ported'} • {number.status}
                  </p>
                </div>

                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  number.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {number.status}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4 py-3 border-y border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Calls Received</p>
                  <div className="flex items-center gap-1">
                    <PhoneIncoming className="w-4 h-4 text-green-600" />
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {number.callsReceived || 0}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Calls Made</p>
                  <div className="flex items-center gap-1">
                    <PhoneOutgoing className="w-4 h-4 text-blue-600" />
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {number.callsMade || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Assigned Agent */}
              {number.assignedAgent ? (
                <div className="bg-purple-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Bot className="w-4 h-4 text-purple-600" />
                    <span className="text-purple-900 font-medium">
                      Assigned to: {number.assignedAgentName || 'Agent'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">No agent assigned</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.location.href = `/app/agents`}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <Bot className="w-4 h-4" />
                  {number.assignedAgent ? 'Change Agent' : 'Assign Agent'}
                </button>
                <button
                  onClick={() => deleteNumber(number._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Cost */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Monthly Cost</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    ${number.monthlyCost || '1.00'}/mo
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Buy Number Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Buy Phone Number</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search by Area Code or City
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="e.g., 415 or San Francisco"
                  value={searchArea}
                  onChange={(e) => setSearchArea(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={searchAvailableNumbers}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            {availableNumbers.length > 0 && (
              <div className="space-y-2 mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Available Numbers</h3>
                {availableNumbers.map((num) => (
                  <div
                    key={num.phoneNumber}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-700"
                  >
                    <span className="font-mono">{formatPhoneNumber(num.phoneNumber)}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">$1.00/mo</span>
                      <button
                        onClick={() => purchaseNumber(num.phoneNumber)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBuyModal(false);
                  setAvailableNumbers([]);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Port Number Modal */}
      {showPortModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Port Existing Number</h2>
            <p className="text-sm text-gray-600 mb-6">
              Bring your existing phone number to our platform. Processing typically takes 1-2 business days.
            </p>

            <form onSubmit={portNumber} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 123-4567"
                  value={portForm.phoneNumber}
                  onChange={(e) => setPortForm({ ...portForm, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Provider *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Verizon, AT&T"
                  value={portForm.currentProvider}
                  onChange={(e) => setPortForm({ ...portForm, currentProvider: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your account number with current provider"
                  value={portForm.accountNumber}
                  onChange={(e) => setPortForm({ ...portForm, accountNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-900">
                  <strong>Note:</strong> There's a one-time $10 porting fee. Your number will remain active with your current provider until the port completes.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPortModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit Port Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
