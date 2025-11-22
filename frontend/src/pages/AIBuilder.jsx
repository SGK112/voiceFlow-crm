import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../services/api';
import {
  Bot,
  Send,
  Loader2,
  Sparkles,
  Upload,
  Link as LinkIcon,
  FileText,
  Image as ImageIcon,
  Music,
  CheckCircle,
  X,
  Plus,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import VoiceCopilot from '@/components/VoiceCopilot';

export default function AIBuilder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your AI Agent Builder assistant. I'll help you create a custom voice agent for your business. Let's start by telling me about your business and what you'd like your agent to do."
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [knowledgeBases, setKnowledgeBases] = useState([]);
  const [selectedKBs, setSelectedKBs] = useState([]);
  const [showKBUpload, setShowKBUpload] = useState(false);
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadText, setUploadText] = useState('');
  const [businessContext, setBusinessContext] = useState({
    name: '',
    industry: '',
    purpose: '',
    tone: 'professional'
  });

  const messagesEndRef = useRef(null);

  // Fetch knowledge bases
  const { data: kbData } = useQuery({
    queryKey: ['knowledge-bases'],
    queryFn: async () => {
      const res = await api.get('/knowledge-base');
      return res.data;
    }
  });

  useEffect(() => {
    if (kbData?.data?.knowledgeBases) {
      setKnowledgeBases(kbData.data.knowledgeBases);
    }
  }, [kbData]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: async (userMessage) => {
      const res = await api.post('/ai-builder/chat', {
        messages: [...messages, { role: 'user', content: userMessage }],
        sessionContext: {
          knowledgeBaseIds: selectedKBs,
          businessContext
        }
      });
      return res.data;
    },
    onSuccess: (data) => {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.data.message }
      ]);
    }
  });

  // URL extraction mutation
  const extractUrlMutation = useMutation({
    mutationFn: async (url) => {
      const res = await api.post('/ai-builder/extract-from-url', { url });
      return res.data;
    },
    onSuccess: (data) => {
      const newKB = {
        name: data.data.title || 'Extracted Content',
        description: data.data.description,
        content: data.data.content,
        type: 'website',
        status: 'ready'
      };
      setKnowledgeBases(prev => [...prev, newKB]);
      setUploadUrl('');
      alert(` Extracted ${data.data.wordCount} words from ${data.data.title}`);
    }
  });

  // Generate agent mutation
  const generateAgentMutation = useMutation({
    mutationFn: async (config) => {
      const res = await api.post('/ai-builder/generate-agent', config);
      return res.data;
    },
    onSuccess: (data) => {
      alert(` Agent "${data.data.agent.name}" created successfully!`);
      navigate('/app/agents');
    }
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInputMessage('');
    chatMutation.mutate(userMessage);
  };

  const handleExtractUrl = () => {
    if (!uploadUrl.trim()) return;
    extractUrlMutation.mutate(uploadUrl);
  };

  const handleGenerateAgent = () => {
    generateAgentMutation.mutate({
      businessName: businessContext.name,
      industry: businessContext.industry,
      purpose: businessContext.purpose,
      tone: businessContext.tone,
      knowledgeBaseIds: selectedKBs,
      voiceId: 'EXAVITQu4vr4xnSDxMaL'
    });
  };

  const toggleKB = (kbId) => {
    setSelectedKBs(prev =>
      prev.includes(kbId)
        ? prev.filter(id => id !== kbId)
        : [...prev, kbId]
    );
  };

  const handleVoiceCopilotAction = (action) => {
    switch (action.type) {
      case 'send_message':
        if (action.message) {
          setInputMessage(action.message);
          setMessages(prev => [...prev, { role: 'user', content: action.message }]);
          chatMutation.mutate(action.message);
        }
        break;
      case 'update_context':
        if (action.data) {
          setBusinessContext(prev => ({ ...prev, ...action.data }));
        }
        break;
      case 'select_knowledge_base':
        if (action.kbId) {
          toggleKB(action.kbId);
        }
        break;
      case 'generate_agent':
        handleGenerateAgent();
        break;
      default:
        console.log('Unknown voice copilot action:', action);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-background dark:bg-gray-950">
      {/* Left Sidebar - Knowledge Base & Context */}
      <div className="w-80 border-r border-border dark:border-gray-800 bg-card flex flex-col">
        <div className="p-4 border-b border-border dark:border-gray-800">
          <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
            <Sparkles className="w-5 h-5 text-blue-600" />
            AI Agent Builder
          </h2>
          <p className="text-xs text-gray-800 text-foreground mt-1">
            Build custom voice agents with AI
          </p>
        </div>

        {/* Business Context */}
        <div className="p-4 border-b border-border dark:border-gray-800 space-y-3">
          <h3 className="font-semibold text-sm text-foreground">Business Context</h3>
          <Input
            placeholder="Business name"
            value={businessContext.name}
            onChange={(e) => setBusinessContext(prev => ({ ...prev, name: e.target.value }))}
            className="dark:bg-secondary border-border"
          />
          <Input
            placeholder="Industry"
            value={businessContext.industry}
            onChange={(e) => setBusinessContext(prev => ({ ...prev, industry: e.target.value }))}
            className="dark:bg-secondary border-border"
          />
          <Textarea
            placeholder="What should the agent do?"
            value={businessContext.purpose}
            onChange={(e) => setBusinessContext(prev => ({ ...prev, purpose: e.target.value }))}
            className="dark:bg-secondary border-border"
            rows={3}
          />
        </div>

        {/* Knowledge Base */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-foreground">Knowledge Base</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowKBUpload(!showKBUpload)}
              className="dark:bg-secondary border-border"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>

          {showKBUpload && (
            <Card className="mb-4">
              <CardHeader className="p-3">
                <CardTitle className="text-sm">Add Knowledge</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter website URL"
                    value={uploadUrl}
                    onChange={(e) => setUploadUrl(e.target.value)}
                    className="text-sm dark:bg-secondary border-border"
                  />
                  <Button
                    size="sm"
                    onClick={handleExtractUrl}
                    disabled={extractUrlMutation.isPending}
                  >
                    {extractUrlMutation.isPending ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <LinkIcon className="w-3 h-3" />
                    )}
                  </Button>
                </div>
                <Textarea
                  placeholder="Or paste text content"
                  value={uploadText}
                  onChange={(e) => setUploadText(e.target.value)}
                  rows={3}
                  className="text-sm dark:bg-secondary border-border"
                />
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            {knowledgeBases.map((kb, idx) => (
              <div
                key={kb._id || idx}
                onClick={() => kb._id && toggleKB(kb._id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedKBs.includes(kb._id)
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-600 dark:border-blue-500'
                    : 'border-border border-border hover:bg-accent hover:bg-secondary/80'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-800 text-foreground" />
                      <span className="text-sm font-medium text-foreground">{kb.name}</span>
                    </div>
                    {kb.description && (
                      <p className="text-xs text-gray-800 text-foreground mt-1">
                        {kb.description}
                      </p>
                    )}
                    <Badge variant="secondary" className="text-xs mt-2 bg-secondary">
                      {kb.type}
                    </Badge>
                  </div>
                  {selectedKBs.includes(kb._id) && (
                    <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="border-b border-border dark:border-gray-800 bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">AI Agent Builder</h2>
                <p className="text-xs text-gray-800 text-foreground">
                  {selectedKBs.length} knowledge base(s) selected
                </p>
              </div>
            </div>
            <Button
              onClick={handleGenerateAgent}
              disabled={!businessContext.name || !businessContext.purpose || generateAgentMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {generateAgentMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Agent
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 dark:bg-gray-950">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-4 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-card dark:bg-secondary border border-border border-border'
                }`}
              >
                <p className={`text-sm whitespace-pre-wrap ${
                  msg.role === 'assistant' ? 'dark:text-white' : ''
                }`}>
                  {msg.content}
                </p>
              </div>
            </div>
          ))}
          {chatMutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-card dark:bg-secondary border border-border border-border rounded-lg p-4">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border dark:border-gray-800 bg-card p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ask me anything about your agent..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              className="dark:bg-secondary border-border"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || chatMutation.isPending}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-800 text-foreground mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* Voice Copilot */}
      <VoiceCopilot
        onAction={handleVoiceCopilotAction}
        context={{
          page: 'ai-builder',
          businessContext,
          selectedKBs,
          knowledgeBases
        }}
      />
    </div>
  );
}
