import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { agentApi, callApi, leadApi } from '@/services/api';
import { DynamicVariablePicker } from '@/components/DynamicVariablePicker';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDuration, formatDateTime } from '@/lib/utils';
import {
  ArrowLeft,
  Phone,
  Settings,
  Mic,
  Save,
  Play,
  Pause,
  Volume2,
  Edit,
  TrendingUp,
  Clock,
  CheckCircle,
  Users,
  PhoneCall,
  MessageSquare,
  Zap,
  ChevronDown,
  ChevronUp,
  Download,
  Info,
  AlertCircle,
  UserPlus,
  X,
  Sparkles,
  Loader2,
  BookOpen,
  Wrench,
  Plus,
  Trash2
} from 'lucide-react';

// Mock ElevenLabs voices data - in production, this would come from ElevenLabs API
const ELEVENLABS_VOICES = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', gender: 'Female', accent: 'American', age: 'Young Adult' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', gender: 'Female', accent: 'American', age: 'Young Adult' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', gender: 'Female', accent: 'American', age: 'Young Adult' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', gender: 'Male', accent: 'American', age: 'Young Adult' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', gender: 'Female', accent: 'American', age: 'Middle Aged' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', gender: 'Male', accent: 'American', age: 'Young Adult' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', gender: 'Male', accent: 'American', age: 'Middle Aged' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', gender: 'Male', accent: 'American', age: 'Middle Aged' },
  { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', gender: 'Male', accent: 'American', age: 'Young Adult' },
];

const DYNAMIC_VARIABLES = [
  { var: '{{lead_name}}', description: 'Lead\'s full name' },
  { var: '{{first_name}}', description: 'Lead\'s first name' },
  { var: '{{company}}', description: 'Company name' },
  { var: '{{email}}', description: 'Email address' },
  { var: '{{phone}}', description: 'Phone number' },
  { var: '{{current_date}}', description: 'Current date' },
  { var: '{{current_time}}', description: 'Current time' },
];

// Language options with flag country codes (ISO 3166-1 alpha-2)
const LANGUAGE_OPTIONS = [
  { code: 'en', name: 'English', flag: 'us' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: 'es' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: 'fr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: 'de' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: 'it' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: 'pt' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: 'pl' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: 'nl' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: 'cn' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: 'jp' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: 'kr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: 'in' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: 'sa' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: 'id' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: 'my' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: 'in' },
  { code: 'fil', name: 'Filipino', nativeName: 'Tagalog', flag: 'ph' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: 'ru' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: 'ua' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: 'cz' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', flag: 'sk' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: 'dk' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: 'se' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: 'no' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: 'fi' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: 'gr' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: 'tr' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: 'ro' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български', flag: 'bg' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', flag: 'hr' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски', flag: 'rs' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: 'il' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: 'vn' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: 'th' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: 'bd' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: 'hu' },
];

export default function AgentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(true); // Always in edit mode
  const [showVoiceLibrary, setShowVoiceLibrary] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [testLeadId, setTestLeadId] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [editedAgent, setEditedAgent] = useState(null);
  const [expandedCallId, setExpandedCallId] = useState(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    company: ''
  });
  const [generatingScript, setGeneratingScript] = useState(false);
  const [generatingFirstMessage, setGeneratingFirstMessage] = useState(false);
  const [newKnowledgeBase, setNewKnowledgeBase] = useState('');
  const [newTool, setNewTool] = useState('');
  const [showSaveReminder, setShowSaveReminder] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const reminderShownRef = useRef(false); // Track if reminder already shown for current changes

  const { data: agent, isLoading } = useQuery({
    queryKey: ['agent', id],
    queryFn: () => agentApi.getAgentById(id).then(res => res.data),
    enabled: !!id
  });

  const { data: leads } = useQuery({
    queryKey: ['leads'],
    queryFn: () => leadApi.getLeads().then(res => res.data.leads || []),
  });

  // Handle agent data when it loads
  useEffect(() => {
    if (agent) {
      const agentWithDefaults = {
        ...agent,
        configuration: {
          temperature: agent.configuration?.temperature ?? 0.8,
          maxDuration: agent.configuration?.maxDuration ?? 300,
          language: agent.configuration?.language ?? 'en'
        },
        enabled: agent.enabled ?? false
      };
      setEditedAgent(agentWithDefaults);
      const voice = ELEVENLABS_VOICES.find(v => v.id === agent.voiceId);
      setSelectedVoice(voice || ELEVENLABS_VOICES[0]);
    }
  }, [agent]);

  // Detect unsaved changes (no automatic popup)
  useEffect(() => {
    if (agent && editedAgent) {
      const hasChanges = JSON.stringify(agent) !== JSON.stringify(editedAgent);
      setHasUnsavedChanges(hasChanges);
    }
  }, [agent, editedAgent]);

  const { data: calls} = useQuery({
    queryKey: ['agent-calls', id],
    queryFn: () => agentApi.getAgentCalls(id).then(res => res.data),
  });

  const { data: performance } = useQuery({
    queryKey: ['agent-performance', id],
    queryFn: () => agentApi.getAgentPerformance(id).then(res => res.data),
  });

  const updateAgentMutation = useMutation({
    mutationFn: (data) => agentApi.updateAgent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['agent', id]);
      queryClient.invalidateQueries(['agents']);
      alert('Agent updated successfully!');
    },
    onError: (error) => {
      alert('Error: ' + (error.response?.data?.message || 'Failed to update agent'));
    },
  });

  const testCallMutation = useMutation({
    mutationFn: ({ phoneNumber, leadId }) => {
      const payload = { agentId: id, phoneNumber };
      if (leadId) payload.leadId = leadId;
      return callApi.initiateCall(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['agent-calls', id]);
      queryClient.invalidateQueries(['agent-performance', id]);
      alert('Test call initiated! Check your phone. The call uses personalized data from your CRM.');
      setTestPhoneNumber('');
      setTestLeadId('');
    },
    onError: (error) => {
      alert('Error: ' + (error.response?.data?.message || 'Failed to initiate test call'));
    },
  });

  const createLeadMutation = useMutation({
    mutationFn: (leadData) => leadApi.createLead(leadData),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['leads']);
      const createdLead = response.data.lead || response.data;
      setTestLeadId(createdLead._id);
      setTestPhoneNumber(createdLead.phone);
      setShowNewLeadModal(false);
      setNewLead({ name: '', email: '', phone: '', company: '' });
      alert('Lead created successfully!');
    },
    onError: (error) => {
      alert('Error: ' + (error.response?.data?.message || 'Failed to create lead'));
    },
  });

  const handleCreateLead = () => {
    if (!newLead.name || !newLead.phone) {
      alert('Please enter at least name and phone number');
      return;
    }
    createLeadMutation.mutate(newLead);
  };

  const generateScript = async () => {
    setGeneratingScript(true);
    try {
      const response = await api.post('/ai/generate-agent-script', {
        agentName: editedAgent.name,
        companyName: '',
        industry: '',
        targetAudience: '',
        keywords: [],
        voiceName: selectedVoice?.name || editedAgent.voiceName,
        agentType: editedAgent.type,
        knowledge: editedAgent.knowledge || '',
        tools: editedAgent.tools || [],
        firstMessage: editedAgent.firstMessage || ''
      });

      setEditedAgent({
        ...editedAgent,
        script: response.data.script
      });
    } catch (error) {
      console.error('Error generating script:', error);
      alert('Failed to generate script. Please try again.');
    } finally {
      setGeneratingScript(false);
    }
  };

  const generateFirstMessage = async () => {
    setGeneratingFirstMessage(true);
    try {
      const response = await api.post('/ai/generate-first-message', {
        agentName: editedAgent.name,
        companyName: '',
        industry: '',
        targetAudience: ''
      });

      setEditedAgent({
        ...editedAgent,
        firstMessage: response.data.firstMessage
      });
    } catch (error) {
      console.error('Error generating first message:', error);
      alert('Failed to generate first message. Please try again.');
    } finally {
      setGeneratingFirstMessage(false);
    }
  };

  const handleSave = () => {
    if (!editedAgent.name || !editedAgent.script) {
      alert('Please fill in all required fields (name and script)');
      return;
    }

    updateAgentMutation.mutate({
      name: editedAgent.name,
      type: editedAgent.type,
      script: editedAgent.script,
      firstMessage: editedAgent.firstMessage,
      phoneNumber: editedAgent.phoneNumber,
      enabled: editedAgent.enabled,
      voiceId: selectedVoice?.id,
      voiceName: selectedVoice?.name,
      configuration: editedAgent.configuration,
    });
  };

  const handleTestCall = () => {
    if (hasUnsavedChanges) {
      alert('Please save your changes before making a test call.');
      return;
    }
    if (!testPhoneNumber) {
      alert('Please enter a phone number');
      return;
    }
    testCallMutation.mutate({ phoneNumber: testPhoneNumber, leadId: testLeadId });
  };

  const handleVoicePreview = async () => {
    // If audio is currently playing, pause it
    if (isPlayingPreview && currentAudio) {
      currentAudio.pause();
      setIsPlayingPreview(false);
      setCurrentAudio(null);
      return;
    }

    try {
      setIsPlayingPreview(true);
      // Use ElevenLabs Text-to-Speech API to generate a preview
      const previewText = "Hello! This is a preview of my voice. I'm excited to help you with your calls.";
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice.id}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': import.meta.env.VITE_ELEVENLABS_API_KEY || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: previewText,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        setCurrentAudio(audio);
        audio.play();

        // Clean up when audio ends
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          setIsPlayingPreview(false);
          setCurrentAudio(null);
        };

        // Handle any errors during playback
        audio.onerror = () => {
          setIsPlayingPreview(false);
          setCurrentAudio(null);
        };
      } else {
        setIsPlayingPreview(false);
        alert(`Voice: ${selectedVoice.name}\n${selectedVoice.gender} • ${selectedVoice.accent} • ${selectedVoice.age}\n\nNote: Audio preview requires ElevenLabs API key`);
      }
    } catch (error) {
      console.error('Voice preview error:', error);
      setIsPlayingPreview(false);
      alert(`Voice: ${selectedVoice.name}\n${selectedVoice.gender} • ${selectedVoice.accent} • ${selectedVoice.age}`);
    }
  };

  const handleDownloadAudio = async (call) => {
    if (!call.recordingUrl) {
      alert('No recording available for this call');
      return;
    }

    try {
      const response = await fetch(call.recordingUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `call-${call._id}-${formatDateTime(call.createdAt).replace(/[/:]/g, '-')}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Failed to download recording');
      console.error('Download error:', error);
    }
  };

  const toggleCallExpansion = (callId) => {
    setExpandedCallId(expandedCallId === callId ? null : callId);
  };

  const parseTranscript = (transcript) => {
    if (!transcript) return [];

    // Try to parse JSON format first (ElevenLabs format)
    try {
      const parsed = JSON.parse(transcript);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      // Not JSON, try to parse text format
    }

    // Parse text format: "Speaker: message"
    const lines = transcript.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const match = line.match(/^(Agent|User|Customer):\s*(.+)$/i);
      if (match) {
        return { role: match[1].toLowerCase(), message: match[2] };
      }
      return { role: 'unknown', message: line };
    });
  };

  const insertVariable = (variable) => {
    const textarea = document.getElementById('script-textarea');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = editedAgent.script || '';
      const newText = text.substring(0, start) + variable + text.substring(end);
      setEditedAgent({ ...editedAgent, script: newText });

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  if (isLoading || !agent || !editedAgent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading agent details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/app/agents')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">{agent.name}</h1>
          <p className="text-muted-foreground capitalize">{agent.type.replace('_', ' ')} Agent</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-600 text-white text-sm px-3 py-1">
            {agent.enabled ? 'Active' : 'Inactive'}
          </Badge>
          <Button onClick={handleSave} disabled={updateAgentMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {updateAgentMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Dynamic Variables Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Smart Variable Injection:</strong> This system automatically injects customer data into your agent's script before each call.
          Variables like <code className="bg-muted px-1 py-0.5 rounded text-xs">{'{{lead_name}}'}</code> are replaced with real data from your CRM,
          ensuring every conversation is personalized without relying on ElevenLabs to handle variables.
        </AlertDescription>
      </Alert>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
              <PhoneCall className="h-4 w-4 text-blue-600" />
              Total Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{performance?.totalCalls || agent.performance?.totalCalls || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {performance?.successRate || agent.performance?.conversionRate || 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Successful outcomes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
              <Clock className="h-4 w-4 text-orange-600" />
              Avg Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatDuration(performance?.averageDuration || agent.performance?.averageDuration || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Per call</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
              <Users className="h-4 w-4 text-purple-600" />
              Leads Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{agent.performance?.leadsGenerated || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">From calls</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Agent Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Settings className="h-5 w-5" />
                Agent Settings
              </CardTitle>
              <CardDescription>Basic agent configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Agent Name</label>
                  <input
                    type="text"
                    value={editedAgent.name}
                    onChange={(e) => setEditedAgent({ ...editedAgent, name: e.target.value })}
                    disabled={!isEditing}
                    className="w-full border border-input dark:border-gray-600 bg-white dark:bg-gray-800 rounded px-3 py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-muted disabled:text-muted-foreground placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Agent Type</label>
                  <select
                    value={editedAgent.type}
                    onChange={(e) => setEditedAgent({ ...editedAgent, type: e.target.value })}
                    disabled={!isEditing}
                    className="w-full border border-input dark:border-gray-600 bg-white dark:bg-gray-800 rounded px-3 py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-muted disabled:text-muted-foreground"
                  >
                    <optgroup label="General">
                      <option value="lead_gen">Lead Generation</option>
                      <option value="booking">Booking</option>
                      <option value="collections">Collections</option>
                      <option value="promo">Promotional</option>
                      <option value="support">Support</option>
                      <option value="custom">Custom</option>
                    </optgroup>
                    <optgroup label="Construction Trades">
                      <option value="plumber">Plumber</option>
                      <option value="carpenter">Carpenter</option>
                      <option value="electrician">Electrician</option>
                      <option value="drywall_tech">Drywall Tech</option>
                      <option value="handyman">Handyman</option>
                      <option value="estimator">Estimator</option>
                      <option value="fabricator">Fabricator</option>
                      <option value="general_contractor">General Contractor</option>
                      <option value="hvac_tech">HVAC Tech</option>
                      <option value="roofer">Roofer</option>
                      <option value="painter">Painter</option>
                      <option value="flooring_specialist">Flooring Specialist</option>
                    </optgroup>
                    <optgroup label="Business Operations">
                      <option value="supplier_rep">Supplier Rep Caller</option>
                      <option value="order_placement">Order Placement</option>
                      <option value="inventory_check">Inventory Check</option>
                      <option value="quote_request">Quote Request</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-muted-foreground">First Message</label>
                  {isEditing && (
                    <Button
                      onClick={generateFirstMessage}
                      disabled={generatingFirstMessage}
                      size="sm"
                      className="gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white border-0 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all"
                    >
                      {generatingFirstMessage ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 animate-pulse" />
                          AI Copilot
                        </>
                      )}
                    </Button>
                  )}
                </div>
                <input
                  type="text"
                  value={editedAgent.firstMessage || ''}
                  onChange={(e) => setEditedAgent({ ...editedAgent, firstMessage: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Hi {{lead_name}}! This is calling from {{company_name}}. How are you?"
                  className="w-full border border-input dark:border-gray-600 bg-white dark:bg-gray-800 rounded px-3 py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-muted disabled:text-muted-foreground placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={editedAgent.enabled === true}
                      onChange={() => setEditedAgent({ ...editedAgent, enabled: true })}
                      disabled={!isEditing}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-foreground">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={editedAgent.enabled === false}
                      onChange={() => setEditedAgent({ ...editedAgent, enabled: false })}
                      disabled={!isEditing}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-foreground">Inactive</span>
                  </label>
                </div>
              </div>

              {/* Call Disconnect Settings */}
              <div className="pt-4 border-t border-border">
                <label className="block text-sm font-medium text-muted-foreground mb-3">Call Disconnect</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={editedAgent.configuration?.allowAgentDisconnect === true}
                      onChange={() => setEditedAgent({
                        ...editedAgent,
                        configuration: {
                          ...editedAgent.configuration,
                          allowAgentDisconnect: true
                        }
                      })}
                      disabled={!isEditing}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-foreground">Agent can disconnect</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={editedAgent.configuration?.allowAgentDisconnect === false}
                      onChange={() => setEditedAgent({
                        ...editedAgent,
                        configuration: {
                          ...editedAgent.configuration,
                          allowAgentDisconnect: false
                        }
                      })}
                      disabled={!isEditing}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-foreground">User disconnects only</span>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Control whether the agent can end the call or only the user can hang up
                </p>
              </div>

              {/* Voicemail Settings */}
              <div className="pt-4 border-t border-border">
                <label className="block text-sm font-medium text-muted-foreground mb-3">Voicemail Behavior</label>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editedAgent.configuration?.detectVoicemail ?? false}
                      onChange={(e) => setEditedAgent({
                        ...editedAgent,
                        configuration: {
                          ...editedAgent.configuration,
                          detectVoicemail: e.target.checked
                        }
                      })}
                      disabled={!isEditing}
                      className="text-blue-600 focus:ring-blue-500 rounded"
                    />
                    <span className="text-foreground">Detect voicemail</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editedAgent.configuration?.leaveVoicemail ?? false}
                      onChange={(e) => setEditedAgent({
                        ...editedAgent,
                        configuration: {
                          ...editedAgent.configuration,
                          leaveVoicemail: e.target.checked
                        }
                      })}
                      disabled={!isEditing}
                      className="text-blue-600 focus:ring-blue-500 rounded"
                    />
                    <span className="text-foreground">Leave voicemail if detected</span>
                  </label>
                </div>
                {editedAgent.configuration?.leaveVoicemail && (
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Voicemail Message</label>
                    <textarea
                      value={editedAgent.configuration?.voicemailMessage || ''}
                      onChange={(e) => setEditedAgent({
                        ...editedAgent,
                        configuration: {
                          ...editedAgent.configuration,
                          voicemailMessage: e.target.value
                        }
                      })}
                      disabled={!isEditing}
                      rows={3}
                      placeholder="Hi, this is {{agent_name}} calling from {{company_name}}. Please call us back at..."
                      className="w-full border border-input dark:border-gray-600 bg-white dark:bg-gray-800 rounded px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-muted"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Voice Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Mic className="h-5 w-5" />
                    Voice Selection
                  </CardTitle>
                  <CardDescription>Select voice from ElevenLabs</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVoiceLibrary(!showVoiceLibrary)}
                  disabled={!isEditing}
                >
                  {showVoiceLibrary ? 'Hide' : 'Browse'} Voice Library
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedVoice && (
                <div className="flex items-center gap-4 p-4 bg-accent/50 rounded-lg border border-border">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                      <Volume2 className="h-6 w-6 text-primary-foreground" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{selectedVoice.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedVoice.gender} • {selectedVoice.accent} • {selectedVoice.age}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleVoicePreview}
                    className={isPlayingPreview ? 'bg-green-50 border-green-500 text-green-700 hover:bg-green-100' : ''}
                  >
                    {isPlayingPreview ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Preview
                      </>
                    )}
                  </Button>
                </div>
              )}

              {showVoiceLibrary && (
                <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto p-2 border border-border rounded-lg bg-white dark:bg-gray-900">
                  {ELEVENLABS_VOICES.map((voice) => (
                    <div
                      key={voice.id}
                      onClick={() => isEditing && setSelectedVoice(voice)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedVoice?.id === voice.id
                          ? 'border-primary bg-accent'
                          : 'border-border hover:border-primary/50 hover:bg-accent/30'
                      } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">{voice?.name?.[0] || 'V'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-foreground text-sm">{voice?.name || 'Unknown Voice'}</h5>
                          <p className="text-xs text-muted-foreground truncate">
                            {voice?.gender || 'N/A'} • {voice?.accent || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prompt Engineering */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <MessageSquare className="h-5 w-5" />
                System Prompt & Script
              </CardTitle>
              <CardDescription>
                Agent instructions and conversation flow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-muted-foreground">
                    Agent Script / Instructions *
                  </label>
                  <div className="flex items-center gap-2">
                    {isEditing && (
                      <>
                        <DynamicVariablePicker onSelect={insertVariable} />
                        <Button
                          onClick={generateScript}
                          disabled={generatingScript}
                          size="sm"
                          className="gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white border-0 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all"
                        >
                          {generatingScript ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 animate-pulse" />
                              AI Wizard
                            </>
                          )}
                        </Button>
                      </>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {(editedAgent.script || '').length} characters
                    </span>
                  </div>
                </div>
                <textarea
                  id="script-textarea"
                  value={editedAgent.script || ''}
                  onChange={(e) => setEditedAgent({ ...editedAgent, script: e.target.value })}
                  disabled={!isEditing}
                  rows={12}
                  placeholder="You are a professional assistant for {{company_name}}.

CUSTOMER INFORMATION:
- Name: {{lead_name}}
- Phone: {{lead_phone}}
- Email: {{lead_email}}

YOUR GOAL: [Define the goal here]

CONVERSATION FLOW:
1. Greet them warmly
2. [Add your steps here]

Use {{variables}} for personalization - they're replaced automatically before each call!"
                  className="w-full border border-input dark:border-gray-600 bg-white dark:bg-gray-800 rounded px-3 py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-muted font-mono text-sm placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>How it works:</strong> Variables like <code className="bg-muted px-1 rounded">{'{{lead_name}}'}</code> are automatically
                  replaced with real data from your CRM before each call. You don't need to configure anything - just use the variables in your script!
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Actions & Settings */}
        <div className="space-y-6">
          {/* Test Call Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Phone className="h-5 w-5" />
                Test Call
              </CardTitle>
              <CardDescription>Test your agent with real call scenarios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Select Lead (Optional)
                </label>
                <select
                  value={testLeadId}
                  onChange={(e) => {
                    const leadId = e.target.value;
                    setTestLeadId(leadId);

                    // Auto-populate phone number when lead is selected
                    if (leadId) {
                      const selectedLead = leads?.find(lead => lead._id === leadId);
                      if (selectedLead?.phone) {
                        setTestPhoneNumber(selectedLead.phone);
                      }
                    } else {
                      // Clear phone number if "No lead" is selected
                      setTestPhoneNumber('');
                    }
                  }}
                  className="w-full border border-input dark:border-gray-600 bg-white dark:bg-gray-800 rounded px-3 py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">No lead (enter phone manually)</option>
                  {leads?.map((lead) => (
                    <option key={lead._id} value={lead._id}>
                      {lead.name} - {lead.phone}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowNewLeadModal(true)}
                  className="mt-2 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Create New Lead
                </button>
                <p className="text-xs text-muted-foreground mt-1">
                  Select a lead to auto-fill their phone number and use their data for personalization
                </p>
              </div>

              {testLeadId && leads?.find(lead => lead._id === testLeadId) && (
                <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                  <h5 className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-2">Lead Information:</h5>
                  <div className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
                    <p><strong>Name:</strong> {leads.find(lead => lead._id === testLeadId)?.name}</p>
                    <p><strong>Email:</strong> {leads.find(lead => lead._id === testLeadId)?.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {leads.find(lead => lead._id === testLeadId)?.phone}</p>
                    {leads.find(lead => lead._id === testLeadId)?.company && (
                      <p><strong>Company:</strong> {leads.find(lead => lead._id === testLeadId)?.company}</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={testPhoneNumber}
                  onChange={(e) => setTestPhoneNumber(e.target.value)}
                  placeholder="+1234567890"
                  className="w-full border border-input dark:border-gray-600 bg-white dark:bg-gray-800 rounded px-3 py-2 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {testLeadId ? 'Auto-filled from selected lead (you can edit if needed)' : 'Enter phone number manually'}
                </p>
              </div>
              <Button
                onClick={handleTestCall}
                disabled={testCallMutation.isPending || !testPhoneNumber}
                className="w-full"
              >
                <Phone className="h-4 w-4 mr-2" />
                {testCallMutation.isPending ? 'Initiating...' : 'Make Test Call'}
              </Button>
              <p className="text-xs text-muted-foreground">
                This will place a real call using your current agent configuration with personalized customer data from the selected lead (if any).
              </p>
            </CardContent>
          </Card>

          {/* Advanced Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Zap className="h-5 w-5" />
                Advanced Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Temperature (Creativity)
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={editedAgent.configuration?.temperature ?? 0.8}
                  onChange={(e) => setEditedAgent({
                    ...editedAgent,
                    configuration: {
                      ...editedAgent.configuration,
                      temperature: parseFloat(e.target.value)
                    }
                  })}
                  disabled={!isEditing}
                  className={`w-full ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Precise (0)</span>
                  <span className="font-medium text-foreground">
                    {editedAgent.configuration?.temperature ?? 0.8}
                  </span>
                  <span>Creative (2)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Max Duration (seconds)
                </label>
                <input
                  type="number"
                  value={editedAgent.configuration?.maxDuration ?? 300}
                  onChange={(e) => setEditedAgent({
                    ...editedAgent,
                    configuration: {
                      ...editedAgent.configuration,
                      maxDuration: parseInt(e.target.value) || 300
                    }
                  })}
                  disabled={!isEditing}
                  min="30"
                  max="600"
                  className="w-full border border-input dark:border-gray-600 bg-white dark:bg-gray-800 rounded px-3 py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-muted disabled:text-muted-foreground"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-muted-foreground">
                    Language
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowLanguagePicker(!showLanguagePicker)}
                    disabled={!isEditing}
                  >
                    {showLanguagePicker ? 'Hide' : 'Browse'} Languages
                  </Button>
                </div>

                {/* Selected Language Display */}
                {(() => {
                  const selectedLang = LANGUAGE_OPTIONS.find(lang => lang.code === (editedAgent.configuration?.language ?? 'en'));
                  return selectedLang && (
                    <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg border border-border mb-3">
                      <span className={`fi fi-${selectedLang.flag} text-3xl rounded`}></span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{selectedLang.name}</h4>
                        {selectedLang.nativeName && (
                          <p className="text-sm text-muted-foreground">{selectedLang.nativeName}</p>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Language Grid Picker */}
                {showLanguagePicker && (
                  <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto p-2 border border-border rounded-lg bg-white dark:bg-gray-900">
                    {LANGUAGE_OPTIONS.map((lang) => (
                      <div
                        key={lang.code}
                        onClick={() => isEditing && setEditedAgent({
                          ...editedAgent,
                          configuration: {
                            ...editedAgent.configuration,
                            language: lang.code
                          }
                        })}
                        className={`p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                          (editedAgent.configuration?.language ?? 'en') === lang.code
                            ? 'border-primary bg-accent'
                            : 'border-border hover:border-primary/50 hover:bg-accent/30'
                        } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`fi fi-${lang.flag} text-2xl rounded flex-shrink-0`}></span>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-foreground text-sm truncate">{lang.name}</h5>
                            {lang.nativeName && (
                              <p className="text-xs text-muted-foreground truncate">{lang.nativeName}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Knowledge Bases */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-foreground flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Knowledge Bases
                  </label>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Add knowledge bases that this agent can reference during conversations
                </p>

                <div className="space-y-2">
                  {(editedAgent.knowledgeBases || []).map((kb, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-accent/30 rounded-lg border border-border">
                      <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="flex-1 text-sm text-foreground">{kb}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const updated = [...(editedAgent.knowledgeBases || [])];
                          updated.splice(index, 1);
                          setEditedAgent({ ...editedAgent, knowledgeBases: updated });
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    value={newKnowledgeBase}
                    onChange={(e) => setNewKnowledgeBase(e.target.value)}
                    placeholder="Enter knowledge base name or URL"
                    className="flex-1 border border-input dark:border-gray-600 bg-white dark:bg-gray-800 rounded px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newKnowledgeBase.trim()) {
                        setEditedAgent({
                          ...editedAgent,
                          knowledgeBases: [...(editedAgent.knowledgeBases || []), newKnowledgeBase.trim()]
                        });
                        setNewKnowledgeBase('');
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      if (newKnowledgeBase.trim()) {
                        setEditedAgent({
                          ...editedAgent,
                          knowledgeBases: [...(editedAgent.knowledgeBases || []), newKnowledgeBase.trim()]
                        });
                        setNewKnowledgeBase('');
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Tools & Workflows */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-foreground flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    Tools & Workflows
                  </label>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Add tools and workflows that this agent can use (e.g., calendar booking, CRM integration)
                </p>

                <div className="space-y-2">
                  {(editedAgent.tools || []).map((tool, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-accent/30 rounded-lg border border-border">
                      <Wrench className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="flex-1 text-sm text-foreground">{tool}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const updated = [...(editedAgent.tools || [])];
                          updated.splice(index, 1);
                          setEditedAgent({ ...editedAgent, tools: updated });
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    value={newTool}
                    onChange={(e) => setNewTool(e.target.value)}
                    placeholder="Enter tool or workflow name"
                    className="flex-1 border border-input dark:border-gray-600 bg-white dark:bg-gray-800 rounded px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newTool.trim()) {
                        setEditedAgent({
                          ...editedAgent,
                          tools: [...(editedAgent.tools || []), newTool.trim()]
                        });
                        setNewTool('');
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      if (newTool.trim()) {
                        setEditedAgent({
                          ...editedAgent,
                          tools: [...(editedAgent.tools || []), newTool.trim()]
                        });
                        setNewTool('');
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Calls with Conversation View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <TrendingUp className="h-5 w-5" />
            Recent Calls & Conversations
          </CardTitle>
          <CardDescription>Call history and transcripts</CardDescription>
        </CardHeader>
        <CardContent>
          {calls && calls.length > 0 ? (
            <div className="space-y-3">
              {calls.slice(0, 10).map((call) => {
                const isExpanded = expandedCallId === call._id;
                const transcript = parseTranscript(call.transcript);
                const hasTranscript = transcript.length > 0;
                const hasRecording = !!call.recordingUrl;

                return (
                  <div key={call._id} className="border rounded-lg overflow-hidden">
                    {/* Call Header */}
                    <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Phone className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{call.callerName || call.phoneNumber || call.callerPhone || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDateTime(call.createdAt)} • {formatDuration(call.duration)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {hasRecording && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadAudio(call);
                              }}
                              className="flex items-center gap-1"
                            >
                              <Download className="h-4 w-4" />
                              <span className="hidden sm:inline">Audio</span>
                            </Button>
                          )}
                          <Badge variant={call.status === 'completed' ? 'success' : call.status === 'failed' ? 'destructive' : 'secondary'}>
                            {call.status}
                          </Badge>
                          {hasTranscript && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleCallExpansion(call._id)}
                              className="ml-2"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="h-4 w-4 mr-1" />
                                  Hide
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4 mr-1" />
                                  View Transcript
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Conversation View */}
                    {isExpanded && hasTranscript && (
                      <div className="border-t bg-muted/50 p-4">
                        <div className="bg-card rounded-lg p-4 max-h-96 overflow-y-auto border border-border">
                          <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                            <MessageSquare className="h-5 w-5 text-blue-600" />
                            <h4 className="font-semibold text-foreground">Call Transcript</h4>
                          </div>
                          <div className="space-y-3">
                            {transcript.map((item, idx) => {
                              const isAgent = item.role === 'agent' || item.role === 'assistant';
                              const isUser = item.role === 'user' || item.role === 'customer';

                              return (
                                <div key={idx} className={`flex ${isAgent ? 'justify-start' : 'justify-end'}`}>
                                  <div className={`max-w-[80%] ${isAgent ? '' : 'flex flex-col items-end'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-medium text-muted-foreground uppercase">
                                        {isAgent ? agent.name || 'Agent' : 'Customer'}
                                      </span>
                                    </div>
                                    <div className={`rounded-lg px-4 py-2 ${
                                      isAgent
                                        ? 'bg-primary/20 text-foreground'
                                        : 'bg-muted text-foreground'
                                    }`}>
                                      <p className="text-sm">{item.message || item.text || item.content}</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Call Metadata */}
                        {(call.sentiment || call.leadsCapured) && (
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            {call.sentiment && (
                              <div className="bg-card rounded-lg p-3 border border-border">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Sentiment</p>
                                <Badge variant={
                                  call.sentiment === 'positive' ? 'success' :
                                  call.sentiment === 'negative' ? 'destructive' :
                                  'secondary'
                                }>
                                  {call.sentiment}
                                </Badge>
                              </div>
                            )}
                            {call.leadsCapured?.qualified && (
                              <div className="bg-card rounded-lg p-3 border border-border">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Lead Status</p>
                                <Badge variant="success">Qualified</Badge>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* No Transcript Message */}
                    {isExpanded && !hasTranscript && (
                      <div className="border-t bg-muted/50 p-4 text-center">
                        <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No transcript available for this call</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <PhoneCall className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">No calls yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Make a test call to see it appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create New Lead Modal */}
      {showNewLeadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-border">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Create New Lead
              </h3>
              <button
                onClick={() => {
                  setShowNewLeadModal(false);
                  setNewLead({ name: '', email: '', phone: '', company: '' });
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-input dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                  placeholder="+1234567890"
                  className="w-full px-3 py-2 border border-input dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                  placeholder="john@example.com"
                  className="w-full px-3 py-2 border border-input dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Company
                </label>
                <input
                  type="text"
                  value={newLead.company}
                  onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                  placeholder="Acme Corp"
                  className="w-full px-3 py-2 border border-input dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-6 border-t border-border">
              <Button
                onClick={handleCreateLead}
                disabled={createLeadMutation.isPending || !newLead.name || !newLead.phone}
                className="flex-1"
              >
                {createLeadMutation.isPending ? 'Creating...' : 'Create Lead'}
              </Button>
              <Button
                onClick={() => {
                  setShowNewLeadModal(false);
                  setNewLead({ name: '', email: '', phone: '', company: '' });
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
