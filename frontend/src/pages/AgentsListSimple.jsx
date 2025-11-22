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
  Mic,
  Search,
  TestTube2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/services/api';

export default function AgentsListSimple() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deletingId, setDeletingId] = useState(null);

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
      setAgents(agents.map(a =>
        a._id === agentId ? { ...a, enabled: !currentStatus } : a
      ));
    } catch (error) {
      console.error('Error toggling agent:', error);
      alert('Failed to toggle agent status');
    }
  };

  const deleteAgent = async (agentId) => {
    if (!confirm('Are you sure you want to permanently delete this agent? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(agentId);
      await api.delete(`/agents/${agentId}`);
      setAgents(agents.filter(a => a._id !== agentId));
    } catch (error) {
      console.error('Error deleting agent:', error);
      alert('Failed to delete agent: ' + (error.response?.data?.message || error.message));
    } finally {
      setDeletingId(null);
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

  const hasElevenLabsId = (agent) => {
    return agent.elevenLabsAgentId &&
           agent.elevenLabsAgentId !== 'NONE' &&
           !agent.elevenLabsAgentId.startsWith('local_');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary/50 bg-secondary flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Voice Agents</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your AI voice agents - {agents.length} total
              </p>
            </div>
            <Button
              onClick={() => navigate('/app/agents/create')}
              size="lg"
              className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Plus className="h-5 w-5" />
              Create New Agent
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search agents by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg bg-background placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border hover:bg-accent'
                }`}
              >
                All ({agents.length})
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  filterStatus === 'active'
                    ? 'bg-green-600 text-white'
                    : 'bg-card border border-border hover:bg-accent'
                }`}
              >
                Active ({agents.filter(a => a.enabled).length})
              </button>
              <button
                onClick={() => setFilterStatus('inactive')}
                className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  filterStatus === 'inactive'
                    ? 'bg-gray-600 text-white'
                    : 'bg-card border border-border hover:bg-accent'
                }`}
              >
                Inactive ({agents.filter(a => !a.enabled).length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredAgents.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="inline-flex p-4 bg-muted rounded-full mb-4">
              <Phone className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery || filterStatus !== 'all' ? 'No agents found' : 'No agents yet'}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first AI voice agent to automate calls and conversations'}
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <Button onClick={() => navigate('/app/agents/create')} size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Create Your First Agent
              </Button>
            )}
          </div>
        ) : (
          /* Agent Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <Card
                key={agent._id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/app/agents/${agent._id}`)}
              >
                <CardContent className="p-4">
                  {/* Status Badges */}
                  <div className="flex items-center gap-2 mb-2">
                    {agent.enabled ? (
                      <Badge className="bg-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Live
                      </Badge>
                    ) : (
                      <Badge className="bg-green-600 text-white">
                        <Pause className="w-3 h-3 mr-1" />
                        Paused
                      </Badge>
                    )}
                    {!hasElevenLabsId(agent) && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Not Configured
                      </Badge>
                    )}
                  </div>

                  {/* Agent Name */}
                  <h4 className="font-semibold mb-2 line-clamp-1">{agent.name}</h4>

                  {/* Agent Info */}
                  <div className="space-y-1 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-2">
                      <Mic className="w-4 h-4" />
                      {agent.voiceName || 'Default Voice'}
                    </div>
                    {agent.phoneNumber && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {agent.phoneNumber}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-3 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAgentStatus(agent._id, agent.enabled);
                      }}
                    >
                      {agent.enabled ? (
                        <>
                          <Pause className="w-3 h-3 mr-1" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/app/agents/${agent._id}/test`);
                      }}
                      disabled={!hasElevenLabsId(agent)}
                    >
                      <TestTube2 className="w-3 h-3 mr-1" />
                      Test
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/app/voiceflow-builder/${agent._id}`);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAgent(agent._id);
                      }}
                      disabled={deletingId === agent._id}
                      className="text-destructive"
                    >
                      {deletingId === agent._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
