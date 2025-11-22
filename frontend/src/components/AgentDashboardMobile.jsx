import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Phone,
  Play,
  Pause,
  Edit,
  Trash2,
  Loader2,
  PhoneCall,
  Mic,
  Search,
  Filter,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/services/api';

export default function AgentDashboardMobile() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'inactive'

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/agents');
      setAgents(response.data || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAgentStatus = async (agentId, currentStatus) => {
    try {
      await api.patch(`/agents/${agentId}`, { enabled: !currentStatus });
      fetchAgents();
    } catch (error) {
      console.error('Error toggling agent:', error);
      alert('Failed to toggle agent status');
    }
  };

  const deleteAgent = async (agentId) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;

    try {
      await api.delete(`/agents/${agentId}`);
      fetchAgents();
    } catch (error) {
      console.error('Error deleting agent:', error);
      alert('Failed to delete agent');
    }
  };

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'active' && agent.enabled) ||
      (filterStatus === 'inactive' && !agent.enabled);
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">My Agents</h1>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            {agents.length}
          </Badge>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 backdrop-blur text-white placeholder-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filterStatus === 'all'
                ? 'bg-white text-blue-600'
                : 'bg-white/20 text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filterStatus === 'active'
                ? 'bg-white text-green-600'
                : 'bg-white/20 text-white'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilterStatus('inactive')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filterStatus === 'inactive'
                ? 'bg-white text-gray-600'
                : 'bg-white/20 text-white'
            }`}
          >
            Inactive
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {filteredAgents.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12">
            <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
              <Phone className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">
              {searchQuery || filterStatus !== 'all' ? 'No agents found' : 'No agents yet'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first voice agent to get started'}
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <Button onClick={() => navigate('/app/agents/create')} size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Create Agent
              </Button>
            )}
          </div>
        ) : (
          /* Agent List */
          <div className="space-y-3">
            {filteredAgents.map((agent) => (
              <div
                key={agent._id}
                className={`bg-card rounded-xl border-2 transition-all ${
                  agent.enabled
                    ? 'border-green-500/30 bg-green-50/50 dark:bg-green-950/20'
                    : 'border-border'
                }`}
              >
                {/* Agent Header - Clickable */}
                <div
                  onClick={() => navigate(`/app/agents/${agent._id}`)}
                  className="p-4 cursor-pointer active:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg line-clamp-1">{agent.name}</h3>
                        {agent.enabled ? (
                          <Badge className="bg-green-500 text-white">Live</Badge>
                        ) : (
                          <Badge variant="secondary">Paused</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mic className="h-3.5 w-3.5" />
                          <span>{agent.voiceName || 'Default Voice'}</span>
                        </div>
                        {agent.phoneNumber && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" />
                            <span className="truncate">{agent.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
                  </div>

                  {/* Stats */}
                  {agent.stats && (
                    <div className="flex gap-4 pt-3 border-t border-border/50">
                      <div>
                        <div className="text-xs text-muted-foreground">Total Calls</div>
                        <div className="text-lg font-bold">{agent.stats.totalCalls || 0}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Avg Duration</div>
                        <div className="text-lg font-bold">
                          {agent.stats.avgDuration
                            ? `${Math.round(agent.stats.avgDuration / 60)}m`
                            : '0m'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 p-3 bg-muted/30 border-t border-border">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAgentStatus(agent._id, agent.enabled);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                      agent.enabled
                        ? 'bg-gray-500 hover:bg-gray-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {agent.enabled ? (
                      <>
                        <Pause className="h-4 w-4" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Activate
                      </>
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/app/voiceflow-builder/${agent._id}`);
                    }}
                    className="p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAgent(agent._id);
                    }}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => navigate('/app/agents/create')}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 z-20"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}
