import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';
import {
  ArrowLeft,
  Phone,
  Mic,
  Play,
  Pause,
  Edit,
  Loader2,
  CheckCircle,
  AlertCircle,
  PhoneCall,
  TestTube2,
  UserPlus
} from 'lucide-react';

export default function AgentDetailMobile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activating, setActivating] = useState(false);
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [leadData, setLeadData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    projectType: '',
    notes: ''
  });
  const [savingLead, setSavingLead] = useState(false);

  // Fetch agent data
  const { data: agent, isLoading, error } = useQuery({
    queryKey: ['agent', id],
    queryFn: () => agentApi.getAgentById(id).then(res => res.data),
  });

  // Activation mutation
  const activateMutation = useMutation({
    mutationFn: (enabled) => agentApi.updateAgent(id, { enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries(['agent', id]);
    },
  });

  const handleActivationToggle = async () => {
    setActivating(true);
    try {
      await activateMutation.mutateAsync(!agent.enabled);
    } catch (error) {
      alert(`Failed to ${agent.enabled ? 'deactivate' : 'activate'} agent: ${error.message}`);
    } finally {
      setActivating(false);
    }
  };

  const handleSaveLead = async () => {
    if (!leadData.name || !leadData.phone) {
      alert('Please enter at least name and phone number');
      return;
    }

    setSavingLead(true);
    try {
      await api.post('/leads', {
        ...leadData,
        source: 'manual',
        status: 'new',
        agentId: id,
        metadata: {
          addedFrom: 'agent_detail_page',
          agentName: agent.name
        }
      });

      alert('Lead added successfully!');
      setAddLeadOpen(false);
      setLeadData({
        name: '',
        email: '',
        phone: '',
        company: '',
        projectType: '',
        notes: ''
      });
    } catch (error) {
      alert('Failed to add lead: ' + (error.response?.data?.message || error.message));
    } finally {
      setSavingLead(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Failed to load agent</h2>
          <p className="text-muted-foreground mb-4">{error.message}</p>
          <Button onClick={() => navigate('/app/agents')}>Back to Agents</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/app/agents')}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white flex-1 mx-3 truncate">
            {agent.name}
          </h1>
          <button
            onClick={() => navigate(`/app/voiceflow-builder/${id}`)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <Edit className="h-6 w-6 text-white" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 pb-24">
        {/* Status Card */}
        <div className={`rounded-lg p-4 ${
          agent.enabled
            ? 'bg-green-50 dark:bg-green-950/30 border-2 border-green-500'
            : 'bg-secondary/50 bg-secondary border-2 border-gray-300 border-border'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {agent.enabled ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <Pause className="h-6 w-6 text-gray-500" />
              )}
              <h2 className="font-semibold text-lg">
                {agent.enabled ? 'Active' : 'Inactive'}
              </h2>
            </div>
            <Badge className="bg-green-600 text-white">
              {agent.enabled ? 'Live' : 'Paused'}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            {agent.enabled
              ? 'Your agent is live and handling calls'
              : 'Agent is paused and not answering calls'}
          </p>

          {/* Activation Button */}
          <Button
            onClick={handleActivationToggle}
            disabled={activating}
            variant={agent.enabled ? "outline" : "default"}
            className={`w-full gap-2 ${
              !agent.enabled && 'bg-green-600 hover:bg-green-700'
            }`}
            size="default"
          >
            {activating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {agent.enabled ? 'Deactivating...' : 'Activating...'}
              </>
            ) : (
              <>
                {agent.enabled ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Deactivate Agent
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Activate Agent
                  </>
                )}
              </>
            )}
          </Button>
        </div>

        {/* Agent Info */}
        <div className="bg-card rounded-lg p-4 border border-border">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Mic className="h-5 w-5 text-primary" />
            Voice Configuration
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Voice:</span>
              <span className="font-medium">{agent.voiceName || agent.voiceId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Language:</span>
              <span className="font-medium">{agent.language || 'English'}</span>
            </div>
            {agent.phoneNumber && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Phone Number:</span>
                <span className="font-medium flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {agent.phoneNumber}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Agent Instructions */}
        <div className="bg-card rounded-lg p-4 border border-border">
          <h3 className="font-semibold mb-3">Agent Instructions</h3>
          <div className="bg-muted/50 rounded p-3 text-sm whitespace-pre-wrap max-h-60 overflow-y-auto">
            {agent.script || 'No instructions set'}
          </div>
        </div>

        {/* First Message */}
        <div className="bg-card rounded-lg p-4 border border-border">
          <h3 className="font-semibold mb-3">First Message</h3>
          <div className="bg-muted/50 rounded p-3 text-sm">
            {agent.firstMessage || 'Hello! How can I help you today?'}
          </div>
        </div>

        {/* Performance Stats (if available) */}
        {agent.stats && (
          <div className="bg-card rounded-lg p-4 border border-border">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <PhoneCall className="h-5 w-5 text-primary" />
              Performance
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Total Calls</div>
                <div className="text-2xl font-bold">{agent.stats.totalCalls || 0}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Avg Duration</div>
                <div className="text-2xl font-bold">
                  {agent.stats.avgDuration ? `${Math.round(agent.stats.avgDuration / 60)}m` : '0m'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-card rounded-lg p-4 border border-border">
          <h3 className="font-semibold mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Button
              onClick={() => setAddLeadOpen(true)}
              size="sm"
              className="w-full justify-start gap-2 bg-green-600 hover:bg-green-700"
            >
              <UserPlus className="h-4 w-4" />
              Add Lead for This Agent
            </Button>
            <Button
              onClick={() => navigate(`/app/agents/${id}/test`)}
              size="sm"
              className="w-full justify-start gap-2"
            >
              <TestTube2 className="h-4 w-4" />
              Test Agent (Inbound/Outbound)
            </Button>
            <Button
              onClick={() => navigate(`/app/voiceflow-builder/${id}`)}
              size="sm"
              variant="outline"
              className="w-full justify-start gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Agent Configuration
            </Button>
            {agent.phoneNumber && (
              <Button
                onClick={() => window.location.href = `tel:${agent.phoneNumber}`}
                size="sm"
                variant="outline"
                className="w-full justify-start gap-2"
              >
                <Phone className="h-4 w-4" />
                Quick Call ({agent.phoneNumber})
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Info Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 text-center text-sm text-muted-foreground">
        Agent ID: {id}
      </div>

      {/* Add Lead Dialog */}
      <Dialog open={addLeadOpen} onOpenChange={setAddLeadOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
            <DialogDescription>
              Add a lead for {agent.name} to call. The agent will use these details in the conversation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={leadData.name}
                onChange={(e) => setLeadData({...leadData, name: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={leadData.phone}
                onChange={(e) => setLeadData({...leadData, phone: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={leadData.email}
                onChange={(e) => setLeadData({...leadData, email: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                placeholder="Acme Inc."
                value={leadData.company}
                onChange={(e) => setLeadData({...leadData, company: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectType">Project Type</Label>
              <Input
                id="projectType"
                placeholder="Kitchen Remodel, New Website, etc."
                value={leadData.projectType}
                onChange={(e) => setLeadData({...leadData, projectType: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="Additional details..."
                value={leadData.notes}
                onChange={(e) => setLeadData({...leadData, notes: e.target.value})}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setAddLeadOpen(false)}
              disabled={savingLead}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSaveLead}
              disabled={savingLead}
            >
              {savingLead ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Lead
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
