import { useState, useEffect } from 'react';
import {
  PhoneCall,
  MessageSquare,
  Phone,
  Clock,
  User,
  Bot,
  Calendar,
  Download,
  Play,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';

export default function Conversations() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // 'all', 'voice', 'chat'
  const [filterSource, setFilterSource] = useState('all'); // 'all', 'ai', 'human'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'completed', 'missed', 'ongoing'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      // Fetch both calls and chat conversations
      const response = await api.get('/calls');
      const calls = (response.data || []).map(call => ({
        ...call,
        type: 'voice',
        source: call.agentId ? 'ai' : 'human'
      }));

      // TODO: Add chat conversations when endpoint is ready
      // const chatResponse = await api.get('/conversations');
      // const chats = (chatResponse.data || []).map(chat => ({ ...chat, type: 'chat' }));

      setConversations(calls);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch =
      conv.leadName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.phoneNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.transcript?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'all' || conv.type === filterType;
    const matchesSource = filterSource === 'all' || conv.source === filterSource;
    const matchesStatus = filterStatus === 'all' || conv.status === filterStatus;

    return matchesSearch && matchesType && matchesSource && matchesStatus;
  });

  const stats = {
    total: conversations.length,
    voice: conversations.filter(c => c.type === 'voice').length,
    chat: conversations.filter(c => c.type === 'chat').length,
    ai: conversations.filter(c => c.source === 'ai').length,
    human: conversations.filter(c => c.source === 'human').length,
    completed: conversations.filter(c => c.status === 'completed').length,
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'missed':
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'ongoing':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <PhoneCall className="w-8 h-8 text-blue-600" />
              Conversations
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              All your calls and chats in one place - human and AI
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
              </div>
              <PhoneCall className="w-6 h-6 text-blue-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Voice Calls</p>
                <p className="text-xl font-bold text-purple-600">{stats.voice}</p>
              </div>
              <Phone className="w-6 h-6 text-purple-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Chat</p>
                <p className="text-xl font-bold text-orange-600">{stats.chat}</p>
              </div>
              <MessageSquare className="w-6 h-6 text-orange-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">AI Handled</p>
                <p className="text-xl font-bold text-green-600">{stats.ai}</p>
              </div>
              <Bot className="w-6 h-6 text-green-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Manual</p>
                <p className="text-xl font-bold text-blue-600">{stats.human}</p>
              </div>
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-400" />

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Types</option>
                <option value="voice">Voice Only</option>
                <option value="chat">Chat Only</option>
              </select>

              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Sources</option>
                <option value="ai">AI Only</option>
                <option value="human">Manual Only</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="missed">Missed</option>
                <option value="ongoing">Ongoing</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : filteredConversations.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <PhoneCall className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-2">No conversations found</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery || filterType !== 'all' || filterSource !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Your conversations will appear here'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredConversations.map((conv) => (
            <div
              key={conv._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  {/* Type & Source Icon */}
                  <div className={`p-3 rounded-lg ${
                    conv.type === 'voice' ? 'bg-purple-100' : 'bg-orange-100'
                  }`}>
                    {conv.type === 'voice' ? (
                      <Phone className="w-6 h-6 text-purple-600" />
                    ) : (
                      <MessageSquare className="w-6 h-6 text-orange-600" />
                    )}
                  </div>

                  {/* Conversation Details */}
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 dark:text-gray-100">
                        {conv.leadName || 'Unknown Contact'}
                      </h3>
                      {conv.source === 'ai' && (
                        <span className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                          <Bot className="w-3 h-3" />
                          AI Agent
                        </span>
                      )}
                      {getStatusIcon(conv.status)}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {conv.phoneNumber || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(conv.createdAt || conv.startedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDuration(conv.duration)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {conv.recordingUrl && (
                    <button
                      onClick={() => window.open(conv.recordingUrl, '_blank')}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Play recording"
                    >
                      <Play className="w-5 h-5" />
                    </button>
                  )}
                  {conv.transcript && (
                    <button
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-700 rounded-lg transition-colors"
                      title="Download transcript"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Transcript Preview */}
              {conv.transcript && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mt-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                    {conv.transcript}
                  </p>
                  <button className="text-sm text-blue-600 hover:text-blue-700 mt-2">
                    Read full transcript →
                  </button>
                </div>
              )}

              {/* Metadata */}
              <div className="mt-4 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                {conv.agentName && (
                  <span>Agent: {conv.agentName}</span>
                )}
                {conv.outcome && (
                  <span className="capitalize">Outcome: {conv.outcome}</span>
                )}
                {conv.sentiment && (
                  <span className="capitalize">Sentiment: {conv.sentiment}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
