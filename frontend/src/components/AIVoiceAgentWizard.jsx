import { useState } from 'react';
import { X, Wand2, Mic, Phone, Bot, ChevronRight, Sparkles, Check, Search, Filter, Play, Sliders } from 'lucide-react';
import api from '../services/api';

const AGENT_TEMPLATES = [
  {
    id: 'sales-outbound',
    name: 'Sales Outbound',
    icon: '📞',
    description: 'Cold calling, lead qualification, appointment setting',
    prompt: 'You are a friendly and professional sales representative making outbound calls to qualify leads and schedule appointments.',
  },
  {
    id: 'customer-support',
    name: 'Customer Support',
    icon: '🎧',
    description: 'Handle customer inquiries, resolve issues, provide assistance',
    prompt: 'You are a helpful customer support agent assisting customers with their questions and concerns.',
  },
  {
    id: 'appointment-reminder',
    name: 'Appointment Reminder',
    icon: '📅',
    description: 'Automated appointment confirmations and reminders',
    prompt: 'You are calling to confirm an upcoming appointment and ensure the customer has all necessary information.',
  },
  {
    id: 'collections',
    name: 'Collections',
    icon: '💰',
    description: 'Payment reminders and collection calls',
    prompt: 'You are a professional collections agent making courteous payment reminder calls.',
  },
  {
    id: 'survey',
    name: 'Survey & Feedback',
    icon: '📊',
    description: 'Conduct surveys and gather customer feedback',
    prompt: 'You are conducting a brief survey to gather valuable customer feedback.',
  },
  {
    id: 'hvac-scheduling',
    name: 'HVAC Scheduling',
    icon: '🔧',
    description: 'Schedule HVAC service appointments',
    prompt: 'You are an HVAC scheduling assistant helping customers book service appointments.',
  },
  {
    id: 'real-estate',
    name: 'Real Estate',
    icon: '🏠',
    description: 'Property inquiries, showing scheduling, lead qualification',
    prompt: 'You are a real estate assistant helping potential buyers and sellers with property inquiries.',
  },
  {
    id: 'custom',
    name: 'Custom Agent',
    icon: '⚡',
    description: 'Build a custom agent from scratch',
    prompt: '',
  },
];

// Comprehensive ElevenLabs voice library
const ELEVENLABS_VOICES = [
  // Professional Voices
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', gender: 'Female', accent: 'American', age: 'Young Adult', tone: 'Warm & Professional', category: 'Professional', description: 'Perfect for business and customer service' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', gender: 'Male', accent: 'American', age: 'Adult', tone: 'Confident & Friendly', category: 'Professional', description: 'Great for sales and presentations' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', gender: 'Male', accent: 'American', age: 'Adult', tone: 'Deep & Authoritative', category: 'Professional', description: 'Ideal for serious business communications' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', gender: 'Male', accent: 'American', age: 'Middle Aged', tone: 'Crisp & Professional', category: 'Professional', description: 'Corporate and professional tone' },
  { id: 'pqHfZKP75CvOlQylNhV4', name: 'Bill', gender: 'Male', accent: 'American', age: 'Senior', tone: 'Trustworthy & Mature', category: 'Professional', description: 'Experienced and reliable' },
  { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian', gender: 'Male', accent: 'American', age: 'Adult', tone: 'Steady & Professional', category: 'Professional', description: 'Balanced professional voice' },

  // Friendly & Warm Voices
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', gender: 'Female', accent: 'American', age: 'Young Adult', tone: 'Soft & Gentle', category: 'Friendly', description: 'Caring and approachable' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', gender: 'Female', accent: 'American', age: 'Young Adult', tone: 'Upbeat & Cheerful', category: 'Friendly', description: 'Energetic and positive' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', gender: 'Male', accent: 'American', age: 'Young Adult', tone: 'Young & Energetic', category: 'Friendly', description: 'Youthful and engaging' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', gender: 'Female', accent: 'American', age: 'Young Adult', tone: 'Bright & Enthusiastic', category: 'Friendly', description: 'Vibrant and welcoming' },
  { id: 'ThT5KcBeYPX3keUQqHPh', name: 'Dorothy', gender: 'Female', accent: 'British', age: 'Senior', tone: 'Warm & Grandmotherly', category: 'Friendly', description: 'Comforting and kind' },
  { id: 'ODq5zmih8GrVes37Dizd', name: 'Patrick', gender: 'Male', accent: 'American', age: 'Middle Aged', tone: 'Friendly & Casual', category: 'Friendly', description: 'Relaxed and personable' },

  // Authoritative & Commanding
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', gender: 'Male', accent: 'British', age: 'Adult', tone: 'Authoritative & Deep', category: 'Authoritative', description: 'Commanding presence' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', gender: 'Male', accent: 'Australian', age: 'Adult', tone: 'Strong & Confident', category: 'Authoritative', description: 'Bold and assertive' },
  { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', gender: 'Female', accent: 'British', age: 'Adult', tone: 'Professional & Poised', category: 'Authoritative', description: 'Sophisticated and confident' },
  { id: 'SOYHLrjzK2X1ezoPC6cr', name: 'Harry', gender: 'Male', accent: 'American', age: 'Adult', tone: 'Commanding & Direct', category: 'Authoritative', description: 'Strong leadership voice' },

  // Conversational & Natural
  { id: 'LcfcDJNUP1GQjkzn1xUU', name: 'Emily', gender: 'Female', accent: 'American', age: 'Young Adult', tone: 'Natural & Conversational', category: 'Conversational', description: 'Everyday friendly conversation' },
  { id: 'CYw3kZ02Hs0563khs1Fj', name: 'Dave', gender: 'Male', accent: 'British', age: 'Young Adult', tone: 'Casual & Relatable', category: 'Conversational', description: 'Down-to-earth and genuine' },
  { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', gender: 'Male', accent: 'American', age: 'Young Adult', tone: 'Easy-going & Natural', category: 'Conversational', description: 'Approachable conversationalist' },
  { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', gender: 'Female', accent: 'American', age: 'Adult', tone: 'Warm & Natural', category: 'Conversational', description: 'Authentic and relatable' },

  // Expressive & Dynamic
  { id: 'GBv7mTt0atIp3Br8iCZE', name: 'Thomas', gender: 'Male', accent: 'American', age: 'Young Adult', tone: 'Expressive & Versatile', category: 'Expressive', description: 'Wide emotional range' },
  { id: 'jsCqWAovK2LkecY7zXl4', name: 'Freya', gender: 'Female', accent: 'American', age: 'Young Adult', tone: 'Dynamic & Engaging', category: 'Expressive', description: 'Animated and lively' },
  { id: 'z9fAnlkpzviPz146aGWa', name: 'Glinda', gender: 'Female', accent: 'American', age: 'Adult', tone: 'Dramatic & Expressive', category: 'Expressive', description: 'Theatrical and captivating' },
  { id: 'bVMeCyTHy58xNoL34h3p', name: 'Jeremy', gender: 'Male', accent: 'Irish', age: 'Young Adult', tone: 'Charismatic & Lively', category: 'Expressive', description: 'Energetic storyteller' },

  // International Accents
  { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', gender: 'Male', accent: 'American', age: 'Adult', tone: 'Versatile & Clear', category: 'International', description: 'Neutral and adaptable' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', gender: 'Female', accent: 'American', age: 'Adult', tone: 'Upbeat & International', category: 'International', description: 'Global appeal' },
  { id: 'jBpfuIE2acCO8z3wKNLl', name: 'Gigi', gender: 'Female', accent: 'American', age: 'Young Adult', tone: 'Youthful & Modern', category: 'International', description: 'Contemporary and fresh' },
  { id: 'XB0fDUnXU5powFXDhCwa', name: 'Serena', gender: 'Female', accent: 'American', age: 'Adult', tone: 'Smooth & Sophisticated', category: 'International', description: 'Elegant multilingual' },

  // Specialized
  { id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica', gender: 'Female', accent: 'American', age: 'Young Adult', tone: 'Professional & Friendly', category: 'Specialized', description: 'Customer service expert' },
  { id: 'flq6f7yk4E4fJM5XTYuZ', name: 'Michael', gender: 'Male', accent: 'American', age: 'Adult', tone: 'Authoritative & Calm', category: 'Specialized', description: 'Financial and legal' },
  { id: 'Zlb1dXrM653N07WRdFW3', name: 'Joseph', gender: 'Male', accent: 'British', age: 'Middle Aged', tone: 'Refined & Articulate', category: 'Specialized', description: 'Educational content' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', gender: 'Male', accent: 'American', age: 'Adult', tone: 'Trustworthy & Steady', category: 'Specialized', description: 'Healthcare and wellness' },
  { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', gender: 'Female', accent: 'British', age: 'Young Adult', tone: 'Bright & Clear', category: 'Specialized', description: 'Tech and tutorials' },
  { id: 'D38z5RcWu1voky8WS1ja', name: 'Ethan', gender: 'Male', accent: 'American', age: 'Adult', tone: 'Motivational & Inspiring', category: 'Specialized', description: 'Coaching and training' },
  { id: 'cjVigY5qzO86Huf0OWal', name: 'Sarah', gender: 'Female', accent: 'American', age: 'Adult', tone: 'Empathetic & Caring', category: 'Specialized', description: 'Support and counseling' },
  { id: 'iP95p4xoKVk53GoZ742B', name: 'Chris', gender: 'Male', accent: 'American', age: 'Adult', tone: 'Enthusiastic & Motivating', category: 'Specialized', description: 'Sales and marketing' },

  // Mature & Distinguished
  { id: 'o7lPjDgzlF8ZloHzVPeK', name: 'James', gender: 'Male', accent: 'Australian', age: 'Senior', tone: 'Distinguished & Wise', category: 'Mature', description: 'Executive and advisory' },
  { id: 'zrHiDhphv9ZnVXBqCLjz', name: 'Clyde', gender: 'Male', accent: 'American', age: 'Senior', tone: 'Grandfatherly & Warm', category: 'Mature', description: 'Experienced mentor' },
  { id: 'piTKgcLEGmPE4e6mEKli', name: 'Nicole', gender: 'Female', accent: 'American', age: 'Middle Aged', tone: 'Mature & Professional', category: 'Mature', description: 'Executive leadership' },
  { id: 'SAz9YHcvj6GT2YYXdXww', name: 'George', gender: 'Male', accent: 'British', age: 'Senior', tone: 'Wise & Authoritative', category: 'Mature', description: 'Expert advisor' },
];

const VOICE_CATEGORIES = ['All', 'Professional', 'Friendly', 'Authoritative', 'Conversational', 'Expressive', 'International', 'Specialized', 'Mature'];

const VOICE_MODELS = [
  { id: 'eleven_turbo_v2_5', name: 'Turbo v2.5 (Fastest)', description: 'Ultra-low latency, great for real-time conversations' },
  { id: 'eleven_turbo_v2', name: 'Turbo v2 (Fast)', description: 'Low latency, balanced quality and speed' },
  { id: 'eleven_multilingual_v2', name: 'Multilingual v2', description: 'Best for multiple languages' },
  { id: 'eleven_monolingual_v1', name: 'Monolingual v1', description: 'High quality English only' },
];

export default function AIVoiceAgentWizard({ onClose, onCreate }) {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(ELEVENLABS_VOICES[0]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  // Voice filtering and search
  const [voiceSearch, setVoiceSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedGender, setSelectedGender] = useState('All');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Advanced voice settings
  const [voiceSettings, setVoiceSettings] = useState({
    stability: 50,
    similarityBoost: 75,
    style: 0,
    useSpeakerBoost: true,
    model: 'eleven_turbo_v2_5'
  });

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setAgentName(template.name);
    setAgentDescription(template.description);
    setCustomPrompt(template.prompt);
  };

  const filteredVoices = ELEVENLABS_VOICES.filter(voice => {
    const matchesSearch = voice.name.toLowerCase().includes(voiceSearch.toLowerCase()) ||
                         voice.tone.toLowerCase().includes(voiceSearch.toLowerCase()) ||
                         voice.accent.toLowerCase().includes(voiceSearch.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || voice.category === selectedCategory;
    const matchesGender = selectedGender === 'All' || voice.gender === selectedGender;
    return matchesSearch && matchesCategory && matchesGender;
  });

  const handleCreate = async () => {
    setLoading(true);
    try {
      const agentData = {
        name: agentName,
        description: agentDescription,
        prompt: customPrompt,
        voiceId: selectedVoice.id,
        voiceName: selectedVoice.name,
        voiceSettings: voiceSettings,
        enabled: false,
        type: 'voice',
      };

      const response = await api.post('/agents', agentData);

      if (onCreate) {
        onCreate(response.data);
      }
      onClose();
    } catch (error) {
      console.error('Error creating agent:', error);
      alert('Failed to create agent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewVoice = (voice) => {
    // TODO: Implement voice preview using ElevenLabs API
    alert(`Preview for ${voice.name} - Coming soon!`);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Wand2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">AI Voice Agent Wizard</h2>
                <p className="text-blue-100 text-sm mt-1">Create a voice agent with advanced ElevenLabs customization</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step >= s ? 'bg-white text-blue-600' : 'bg-white/20 text-white'
                } font-bold text-sm`}>
                  {step > s ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-1 mx-2 rounded ${
                    step > s ? 'bg-white' : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Choose Template */}
          {step === 1 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Choose Agent Type</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Select a pre-built template or start from scratch
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {AGENT_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedTemplate?.id === template.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-400'
                    }`}
                  >
                    <div className="text-3xl mb-2">{template.icon}</div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">
                      {template.name}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      {template.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Configure Voice */}
          {step === 2 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Configure Voice</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Choose from 40+ ElevenLabs voices and customize settings
              </p>

              {/* Voice Search and Filters */}
              <div className="mb-4 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search voices by name, tone, or accent..."
                    value={voiceSearch}
                    onChange={(e) => setVoiceSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2">
                  {VOICE_CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                        selectedCategory === category
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedGender('All')}
                    className={`px-4 py-1.5 rounded-lg text-xs ${
                      selectedGender === 'All' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    All Genders
                  </button>
                  <button
                    onClick={() => setSelectedGender('Male')}
                    className={`px-4 py-1.5 rounded-lg text-xs ${
                      selectedGender === 'Male' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Male
                  </button>
                  <button
                    onClick={() => setSelectedGender('Female')}
                    className={`px-4 py-1.5 rounded-lg text-xs ${
                      selectedGender === 'Female' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>

              {/* Voice Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 max-h-96 overflow-y-auto pr-2">
                {filteredVoices.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      selectedVoice?.id === voice.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">{voice.name[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{voice.name}</h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreviewVoice(voice);
                            }}
                            className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                          >
                            <Play className="w-3 h-3 text-blue-600" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          {voice.gender} • {voice.accent} • {voice.age}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-1">{voice.tone}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Advanced Voice Settings */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <button
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100 mb-3"
                >
                  <Sliders className="w-4 h-4" />
                  Advanced Voice Settings
                  <ChevronRight className={`w-4 h-4 transition-transform ${showAdvancedSettings ? 'rotate-90' : ''}`} />
                </button>

                {showAdvancedSettings && (
                  <div className="space-y-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    {/* Model Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Voice Model
                      </label>
                      <select
                        value={voiceSettings.model}
                        onChange={(e) => setVoiceSettings({ ...voiceSettings, model: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                      >
                        {VOICE_MODELS.map((model) => (
                          <option key={model.id} value={model.id}>
                            {model.name} - {model.description}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Stability */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Stability
                        </label>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{voiceSettings.stability}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={voiceSettings.stability}
                        onChange={(e) => setVoiceSettings({ ...voiceSettings, stability: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Higher = more consistent, Lower = more expressive
                      </p>
                    </div>

                    {/* Similarity Boost */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Clarity + Similarity
                        </label>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{voiceSettings.similarityBoost}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={voiceSettings.similarityBoost}
                        onChange={(e) => setVoiceSettings({ ...voiceSettings, similarityBoost: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Higher = more similar to original voice
                      </p>
                    </div>

                    {/* Style */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Style Exaggeration
                        </label>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{voiceSettings.style}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={voiceSettings.style}
                        onChange={(e) => setVoiceSettings({ ...voiceSettings, style: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Higher = more exaggerated emotion and style
                      </p>
                    </div>

                    {/* Speaker Boost */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Speaker Boost
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Enhance voice similarity and reduce background noise
                        </p>
                      </div>
                      <button
                        onClick={() => setVoiceSettings({ ...voiceSettings, useSpeakerBoost: !voiceSettings.useSpeakerBoost })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          voiceSettings.useSpeakerBoost ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            voiceSettings.useSpeakerBoost ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Agent Name & Description */}
              <div className="space-y-4 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Agent Name
                  </label>
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="My Sales Agent"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={agentDescription}
                    onChange={(e) => setAgentDescription(e.target.value)}
                    placeholder="Brief description of what this agent does"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Customize Script */}
          {step === 3 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Customize Agent Script</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Define what your agent should say and how it should behave
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Agent Instructions
                  </label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    rows={8}
                    placeholder="Describe how the agent should behave, what it should say, and how it should handle different scenarios..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    💡 Tip: Be specific about tone, goals, and how to handle objections
                  </p>
                </div>

                {/* Summary */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Agent Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">Name:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{agentName || 'Unnamed Agent'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mic className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">Voice:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {selectedVoice.name} ({selectedVoice.gender}, {selectedVoice.accent})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">Type:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{selectedTemplate?.name || 'Custom'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">Model:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {VOICE_MODELS.find(m => m.id === voiceSettings.model)?.name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            {step > 1 ? 'Back' : 'Cancel'}
          </button>

          <div className="flex gap-3">
            {step < 3 && (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && !selectedTemplate}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {step === 3 && (
              <button
                onClick={handleCreate}
                disabled={loading || !agentName || !customPrompt}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Create Agent
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
