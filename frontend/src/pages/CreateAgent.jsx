import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { agentApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Mic,
  MessageSquare,
  Loader2,
  CheckCircle,
  ChevronRight,
  Sparkles,
  Play,
  Phone,
  PhoneForwarded,
  User
} from 'lucide-react';

export default function CreateAgent() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [agentData, setAgentData] = useState({
    name: '',
    voiceId: '',
    voiceName: '',
    script: '',
    firstMessage: 'Hi {{customer_name}}, how are you doing today?',
    type: 'custom',
    language: 'en',
    knowledge: '',  // NEW: Additional context/knowledge for AI generation
    tools: [],      // NEW: Available tools/capabilities
    profile: {
      companyName: '',
      industry: '',
      targetAudience: '',
      keywords: []
    },
    organization: {
      company: '',
      department: '',
      role: '',
      team: '',
      tags: []
    },
    callTransfer: {
      enabled: false,
      transferNumber: '',
      transferType: 'conference',
      transferConditions: [],
      transferMessage: 'Let me connect you with someone who can help you with that. One moment please.'
    }
  });

  const [newCondition, setNewCondition] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [generatingScript, setGeneratingScript] = useState(false);
  const [generatingFirstMessage, setGeneratingFirstMessage] = useState(false);

  // Fetch voices
  const { data: voices, isLoading: loadingVoices } = useQuery({
    queryKey: ['voices'],
    queryFn: () => api.get('/agents/helpers/voices').then(res => res.data),
  });

  // Create agent mutation
  const createMutation = useMutation({
    mutationFn: (data) => agentApi.createAgent(data),
    onSuccess: (response) => {
      const agentId = response.data._id || response.data.id;
      navigate(`/app/agents/${agentId}`);
    },
    onError: (error) => {
      alert(`Failed to create agent: ${error.response?.data?.message || error.message}`);
    }
  });

  const handleNext = () => {
    // Validation for each step
    if (step === 1 && !agentData.name.trim()) {
      alert('Please enter an agent name');
      return;
    }
    // Step 2 is profile (optional)
    if (step === 3 && !agentData.voiceId) {
      alert('Please select a voice');
      return;
    }
    if (step === 4 && agentData.script.trim().length < 10) {
      alert('Please enter agent instructions (at least 10 characters)');
      return;
    }
    if (step === 5 && agentData.callTransfer.enabled && !agentData.callTransfer.transferNumber) {
      alert('Please enter a transfer phone number');
      return;
    }

    if (step < 6) {
      setStep(step + 1);
    }
  };

  const handleCreate = () => {
    createMutation.mutate(agentData);
  };

  // AI-powered script generation
  const generateScript = async () => {
    setGeneratingScript(true);
    try {
      const response = await api.post('/ai/generate-agent-script', {
        agentName: agentData.name,
        companyName: agentData.profile.companyName,
        industry: agentData.profile.industry,
        targetAudience: agentData.profile.targetAudience,
        keywords: agentData.profile.keywords,
        voiceName: agentData.voiceName,
        agentType: agentData.type,              // Send agent type
        knowledge: agentData.knowledge || '',    // Send knowledge/context
        tools: agentData.tools || [],            // Send tools/capabilities
        firstMessage: agentData.firstMessage || '' // Send first message for style matching
      });

      setAgentData({
        ...agentData,
        script: response.data.script
      });
    } catch (error) {
      console.error('Error generating script:', error);
      alert('Failed to generate script. Please try again.');
    } finally {
      setGeneratingScript(false);
    }
  };

  // AI-powered first message generation
  const generateFirstMessage = async () => {
    setGeneratingFirstMessage(true);
    try {
      const response = await api.post('/ai/generate-first-message', {
        agentName: agentData.name,
        companyName: agentData.profile.companyName,
        industry: agentData.profile.industry,
        targetAudience: agentData.profile.targetAudience
      });

      setAgentData({
        ...agentData,
        firstMessage: response.data.firstMessage
      });
    } catch (error) {
      console.error('Error generating first message:', error);
      alert('Failed to generate first message. Please try again.');
    } finally {
      setGeneratingFirstMessage(false);
    }
  };

  // Auto-generate script when moving to step 4 (Instructions)
  useEffect(() => {
    if (step === 4 && !agentData.script && agentData.name) {
      // Auto-generate script based on profile info
      generateScript();
    }
  }, [step]);

  const popularVoices = voices?.voices?.slice(0, 6) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur border-b border-border">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => step === 1 ? navigate('/app/agents') : setStep(step - 1)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-bold">Create New Agent</h1>
            <div className="w-9" /> {/* Spacer */}
          </div>

          {/* Progress */}
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  s <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-2xl mx-auto px-4 py-8">
        {/* Step 1: Name */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="text-center mb-8">
              <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Name Your Agent</h2>
              <p className="text-muted-foreground">
                Give your AI agent a memorable name
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <label className="block text-sm font-medium mb-2">
                Agent Name *
              </label>
              <input
                type="text"
                value={agentData.name}
                onChange={(e) => setAgentData({ ...agentData, name: e.target.value })}
                placeholder="e.g., Sarah - Sales Assistant"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                Choose a name that describes what your agent does
              </p>
            </div>

            <Button
              onClick={handleNext}
              disabled={!agentData.name.trim()}
              size="lg"
              className="w-full gap-2"
            >
              Next: Set Profile
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Step 2: Profile & Keywords */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
                <User className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Agent Profile (Optional)</h2>
              <p className="text-muted-foreground">
                Add context to help your agent better serve your customers
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
                <label className="block text-sm font-medium mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={agentData.profile.companyName}
                  onChange={(e) => setAgentData({
                    ...agentData,
                    profile: { ...agentData.profile, companyName: e.target.value }
                  })}
                  placeholder="e.g., Acme Construction"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
                <label className="block text-sm font-medium mb-2">
                  Industry
                </label>
                <input
                  type="text"
                  value={agentData.profile.industry}
                  onChange={(e) => setAgentData({
                    ...agentData,
                    profile: { ...agentData.profile, industry: e.target.value }
                  })}
                  placeholder="e.g., Construction, Real Estate, Healthcare"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
                <label className="block text-sm font-medium mb-2">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={agentData.profile.targetAudience}
                  onChange={(e) => setAgentData({
                    ...agentData,
                    profile: { ...agentData.profile, targetAudience: e.target.value }
                  })}
                  placeholder="e.g., Homeowners, Small businesses"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
                <label className="block text-sm font-medium mb-2">
                  Keywords & Topics
                </label>
                <p className="text-sm text-muted-foreground mb-3">
                  Add important topics your agent should know about
                </p>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newKeyword.trim()) {
                        setAgentData({
                          ...agentData,
                          profile: {
                            ...agentData.profile,
                            keywords: [...agentData.profile.keywords, newKeyword.trim()]
                          }
                        });
                        setNewKeyword('');
                      }
                    }}
                    placeholder="e.g., pricing, scheduling, services"
                    className="flex-1 px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button
                    onClick={() => {
                      if (newKeyword.trim()) {
                        setAgentData({
                          ...agentData,
                          profile: {
                            ...agentData.profile,
                            keywords: [...agentData.profile.keywords, newKeyword.trim()]
                          }
                        });
                        setNewKeyword('');
                      }
                    }}
                    variant="outline"
                  >
                    Add
                  </Button>
                </div>
                {agentData.profile.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {agentData.profile.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1 bg-gray-700 dark:bg-gray-300 text-white dark:text-gray-900">
                        {keyword}
                        <button
                          onClick={() => {
                            setAgentData({
                              ...agentData,
                              profile: {
                                ...agentData.profile,
                                keywords: agentData.profile.keywords.filter((_, i) => i !== index)
                              }
                            });
                          }}
                          className="ml-2 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Organization Section */}
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Organization (Optional)
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Organize agents by department, role, or team for better management
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      value={agentData.organization.department}
                      onChange={(e) => setAgentData({
                        ...agentData,
                        organization: { ...agentData.organization, department: e.target.value }
                      })}
                      placeholder="e.g., Sales, Support, Billing"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      value={agentData.organization.role}
                      onChange={(e) => setAgentData({
                        ...agentData,
                        organization: { ...agentData.organization, role: e.target.value }
                      })}
                      placeholder="e.g., Lead Qualifier, Scheduler"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Team
                    </label>
                    <input
                      type="text"
                      value={agentData.organization.team}
                      onChange={(e) => setAgentData({
                        ...agentData,
                        organization: { ...agentData.organization, team: e.target.value }
                      })}
                      placeholder="e.g., West Coast, Night Shift"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={handleNext}
              size="lg"
              className="w-full gap-2"
            >
              Next: Choose Voice
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Step 3: Voice */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
                <Mic className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Choose a Voice</h2>
              <p className="text-muted-foreground">
                Select the voice your agent will use
              </p>
            </div>

            {loadingVoices ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid gap-3">
                {popularVoices.map((voice) => (
                  <button
                    key={voice.voice_id}
                    onClick={() => setAgentData({
                      ...agentData,
                      voiceId: voice.voice_id,
                      voiceName: voice.name
                    })}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      agentData.voiceId === voice.voice_id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 bg-card'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{voice.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {voice.labels?.gender} • {voice.labels?.age}
                        </div>
                      </div>
                      {agentData.voiceId === voice.voice_id && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <Button
              onClick={handleNext}
              disabled={!agentData.voiceId}
              size="lg"
              className="w-full gap-2"
            >
              Next: Agent Instructions
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Step 4: Instructions */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Agent Instructions</h2>
              <p className="text-muted-foreground">
                Tell your agent how to behave and what to say
              </p>
            </div>

            {generatingScript && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                <p className="text-sm font-medium">AI is crafting your agent script...</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Using your profile information to create the perfect instructions
                </p>
              </div>
            )}

            <div className="bg-card rounded-xl p-6 border border-border shadow-sm space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">
                    Instructions *
                  </label>
                  <Button
                    type="button"
                    onClick={generateScript}
                    disabled={generatingScript}
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-primary hover:text-primary"
                  >
                    <Sparkles className="h-4 w-4" />
                    {generatingScript ? 'Generating...' : 'Regenerate with AI'}
                  </Button>
                </div>
                <textarea
                  value={agentData.script}
                  onChange={(e) => setAgentData({ ...agentData, script: e.target.value })}
                  placeholder={`You are a friendly sales assistant. Help customers learn about our products and book appointments.

IMPORTANT: Always use the customer's name when available: "Hi {{customer_name}}, how are you today?"

Be warm, professional, and helpful. If they ask to speak to someone, offer to transfer them.`}
                  rows={10}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  disabled={generatingScript}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  💡 Use {`{{customer_name}}, {{company_name}}, {{lead_email}}`} for personalization
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">
                    First Message
                  </label>
                  <Button
                    type="button"
                    onClick={generateFirstMessage}
                    disabled={generatingFirstMessage}
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-primary hover:text-primary"
                  >
                    <Sparkles className="h-4 w-4" />
                    {generatingFirstMessage ? 'Generating...' : 'Generate with AI'}
                  </Button>
                </div>
                <input
                  type="text"
                  value={agentData.firstMessage}
                  onChange={(e) => setAgentData({ ...agentData, firstMessage: e.target.value })}
                  placeholder="Hi {{customer_name}}, this is {{agent_name}} calling from {{company_name}}. How are you today?"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={generatingFirstMessage}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  💡 Use variables like {`{{customer_name}}`} to personalize the greeting
                </p>
              </div>
            </div>

            <Button
              onClick={handleNext}
              disabled={agentData.script.trim().length < 10}
              size="lg"
              className="w-full gap-2"
            >
              Next: Call Transfer Settings
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Step 5: Call Transfer Settings */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
                <PhoneForwarded className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Call Transfer Settings</h2>
              <p className="text-muted-foreground">
                Configure when and how to transfer calls (optional)
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border shadow-sm space-y-6">
              {/* Enable Transfer Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Enable Call Transfers</label>
                  <p className="text-sm text-muted-foreground">
                    Allow your agent to transfer calls to a human
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAgentData({
                    ...agentData,
                    callTransfer: {
                      ...agentData.callTransfer,
                      enabled: !agentData.callTransfer.enabled
                    }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    agentData.callTransfer.enabled ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      agentData.callTransfer.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {agentData.callTransfer.enabled && (
                <>
                  {/* Transfer Number */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Transfer Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={agentData.callTransfer.transferNumber}
                      onChange={(e) => setAgentData({
                        ...agentData,
                        callTransfer: {
                          ...agentData.callTransfer,
                          transferNumber: e.target.value
                        }
                      })}
                      placeholder="+1 480 555 1234"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Transfer Type */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Transfer Type
                    </label>
                    <select
                      value={agentData.callTransfer.transferType}
                      onChange={(e) => setAgentData({
                        ...agentData,
                        callTransfer: {
                          ...agentData.callTransfer,
                          transferType: e.target.value
                        }
                      })}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="conference">Conference (all parties on call)</option>
                      <option value="warm">Warm Transfer (agent introduces)</option>
                      <option value="cold">Cold Transfer (direct)</option>
                    </select>
                  </div>

                  {/* Transfer Conditions */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      When to Transfer
                    </label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Add conditions that should trigger a transfer
                    </p>

                    <div className="space-y-2 mb-3">
                      {agentData.callTransfer.transferConditions.map((condition, index) => (
                        <div key={index} className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-lg">
                          <span className="text-sm flex-1">{condition}</span>
                          <button
                            onClick={() => {
                              const newConditions = agentData.callTransfer.transferConditions.filter((_, i) => i !== index);
                              setAgentData({
                                ...agentData,
                                callTransfer: {
                                  ...agentData.callTransfer,
                                  transferConditions: newConditions
                                }
                              });
                            }}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCondition}
                        onChange={(e) => setNewCondition(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && newCondition.trim()) {
                            setAgentData({
                              ...agentData,
                              callTransfer: {
                                ...agentData.callTransfer,
                                transferConditions: [...agentData.callTransfer.transferConditions, newCondition.trim()]
                              }
                            });
                            setNewCondition('');
                          }
                        }}
                        placeholder="e.g., Customer asks for a manager"
                        className="flex-1 px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          if (newCondition.trim()) {
                            setAgentData({
                              ...agentData,
                              callTransfer: {
                                ...agentData.callTransfer,
                                transferConditions: [...agentData.callTransfer.transferConditions, newCondition.trim()]
                              }
                            });
                            setNewCondition('');
                          }
                        }}
                        variant="outline"
                      >
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Transfer Message */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Transfer Message
                    </label>
                    <input
                      type="text"
                      value={agentData.callTransfer.transferMessage}
                      onChange={(e) => setAgentData({
                        ...agentData,
                        callTransfer: {
                          ...agentData.callTransfer,
                          transferMessage: e.target.value
                        }
                      })}
                      placeholder="What the agent says before transferring"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </>
              )}
            </div>

            <Button
              onClick={handleNext}
              disabled={agentData.callTransfer.enabled && !agentData.callTransfer.transferNumber}
              size="lg"
              className="w-full gap-2"
            >
              Review & Create
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Step 6: Review */}
        {step === 6 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Review Your Agent</h2>
              <p className="text-muted-foreground">
                Make sure everything looks good
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="text-sm text-muted-foreground mb-1">Name</div>
                <div className="font-semibold">{agentData.name}</div>
              </div>

              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="text-sm text-muted-foreground mb-1">Voice</div>
                <div className="font-semibold">{agentData.voiceName}</div>
              </div>

              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="text-sm text-muted-foreground mb-1">Instructions</div>
                <div className="text-sm whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {agentData.script}
                </div>
              </div>

              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="text-sm text-muted-foreground mb-1">First Message</div>
                <div className="text-sm">{agentData.firstMessage}</div>
              </div>

              {agentData.callTransfer.enabled && (
                <div className="bg-card rounded-xl p-4 border border-border">
                  <div className="text-sm text-muted-foreground mb-1">Call Transfer</div>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Transfer to:</span> {agentData.callTransfer.transferNumber}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Type:</span> {agentData.callTransfer.transferType}
                    </div>
                    {agentData.callTransfer.transferConditions.length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium">Conditions:</span>
                        <ul className="list-disc list-inside mt-1 text-muted-foreground">
                          {agentData.callTransfer.transferConditions.map((cond, i) => (
                            <li key={i}>{cond}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              size="lg"
              className="w-full gap-2"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating Agent...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  Create Agent
                </>
              )}
            </Button>

            <button
              onClick={() => setStep(4)}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to edit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
