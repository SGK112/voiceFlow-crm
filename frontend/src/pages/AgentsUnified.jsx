import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Phone,
  MessageSquare,
  Plus,
  Play,
  Pause,
  Settings,
  Trash2,
  Library,
  Zap,
  Search,
  Filter,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react';
import api from '../services/api';
import SimpleTooltip from '../components/ui/SimpleTooltip';

export default function AgentsUnified() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('deployed'); // 'library' or 'deployed'
  const [deployedAgents, setDeployedAgents] = useState([]);
  const [libraryAgents, setLibraryAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'voice', 'chat'

  useEffect(() => {
    fetchAgents();
  }, [activeTab]);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      if (activeTab === 'deployed') {
        // Fetch user's deployed agents (voice + chat)
        const [voiceResponse, chatResponse] = await Promise.all([
          api.get('/agents'),
          api.get('/ai-agents')
        ]);

        const voiceAgents = (voiceResponse.data || []).map(a => ({ ...a, type: 'voice' }));
        const chatAgents = (chatResponse.data || []).map(a => ({ ...a, type: 'chat' }));

        setDeployedAgents([...voiceAgents, ...chatAgents]);
      } else {
        // Fetch agent library templates
        const response = await api.get('/agent-library/templates');
        console.log('Library agents loaded:', response.data);
        setLibraryAgents(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAgent = async (agentId, type, currentState) => {
    try {
      const endpoint = type === 'voice' ? '/agents' : '/ai-agents';
      await api.patch(`${endpoint}/${agentId}`, { enabled: !currentState });
      fetchAgents();
    } catch (error) {
      console.error('Error toggling agent:', error);
    }
  };

  const deleteAgent = async (agentId, type) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;

    try {
      const endpoint = type === 'voice' ? '/agents' : '/ai-agents';
      await api.delete(`${endpoint}/${agentId}`);
      fetchAgents();
    } catch (error) {
      console.error('Error deleting agent:', error);
    }
  };

  const deployFromLibrary = (templateId) => {
    console.log('Deploying agent with template ID:', templateId);
    if (!templateId) {
      alert('Error: No template ID found. Please refresh the page and try again.');
      return;
    }
    navigate(`/app/agent-library/setup/${templateId}`);
  };

  const filteredAgents = (activeTab === 'deployed' ? deployedAgents : libraryAgents).filter(agent => {
    const matchesSearch = agent.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || agent.type === filterType;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: deployedAgents.length,
    active: deployedAgents.filter(a => a.enabled || a.active).length,
    voice: deployedAgents.filter(a => a.type === 'voice').length,
    chat: deployedAgents.filter(a => a.type === 'chat').length
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <Bot className="w-8 h-8 text-blue-600" />
              AI Agents
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Deploy AI agents to automate calls, follow-ups, collections, and more
            </p>
          </div>

          <SimpleTooltip
            content="Browse the agent library and deploy AI agents to automate calls, follow-ups, and more"
            position="bottom"
          >
            <button
              onClick={() => setActiveTab('library')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Deploy New Agent
            </button>
          </SimpleTooltip>
        </div>

        {/* Stats Cards */}
        {activeTab === 'deployed' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Agents</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
                </div>
                <Bot className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <Zap className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Voice Agents</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.voice}</p>
                </div>
                <Phone className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Chat Agents</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.chat}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('deployed')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'deployed'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                My Deployed Agents ({stats.total})
              </div>
            </button>

            <button
              onClick={() => setActiveTab('library')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'library'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <Library className="w-4 h-4" />
                Agent Library
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="voice">Voice Only</option>
            <option value="chat">Chat Only</option>
          </select>
        </div>
      </div>

      {/* Agents Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {activeTab === 'deployed' ? 'No agents deployed yet' : 'No agents found'}
          </h3>
          <p className="text-gray-600 mb-6">
            {activeTab === 'deployed'
              ? 'Deploy your first AI agent to automate your workflows'
              : 'Try adjusting your search or filters'
            }
          </p>
          {activeTab === 'deployed' && (
            <button
              onClick={() => setActiveTab('library')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Library className="w-4 h-4" />
              Browse Agent Library
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map(agent => (
            <div
              key={agent._id || agent.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">
                      {agent.icon || (agent.type === 'voice' ? '📞' : '💬')}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{agent.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {agent.category || agent.type || 'AI'} Agent
                      </p>
                    </div>
                  </div>

                  {activeTab === 'deployed' && (
                    <button
                      onClick={() => toggleAgent(agent._id, agent.type, agent.enabled || agent.active)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        (agent.enabled || agent.active) ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          (agent.enabled || agent.active) ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {agent.description || agent.prompt || 'No description available'}
                </p>

                {/* Stats (for deployed agents) */}
                {activeTab === 'deployed' && (
                  <div className="grid grid-cols-2 gap-3 mb-4 py-3 border-y border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Calls Made</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 dark:text-gray-100">
                        {agent.callsMade || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Success Rate</p>
                      <p className="text-lg font-semibold text-green-600">
                        {agent.successRate || 0}%
                      </p>
                    </div>
                  </div>
                )}

                {/* Features (for library) */}
                {activeTab === 'library' && agent.features && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Key Features:</p>
                    <ul className="space-y-1">
                      {agent.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                          <span className="text-green-600 mt-0.5">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {activeTab === 'deployed' ? (
                    <>
                      <button
                        onClick={() => navigate(`/app/agents/${agent._id}`)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        <Settings className="w-4 h-4" />
                        Manage
                      </button>
                      <button
                        onClick={() => deleteAgent(agent._id, agent.type)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => deployFromLibrary(agent.id || agent._id)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      <Zap className="w-4 h-4" />
                      Deploy Agent
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
