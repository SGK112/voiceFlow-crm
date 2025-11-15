import { useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
  Handle,
  useReactFlow,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  X,
  Save,
  Play,
  Settings,
  Mic,
  MessageSquare,
  Brain,
  Zap,
  Filter,
  Clock,
  Phone,
  Mail,
  FileText,
  Database,
  Code,
  ChevronRight,
  Menu,
  ChevronLeft,
  Plus
} from 'lucide-react';

// Custom Node Component for Agent Configuration
function AgentConfigNode({ data, id, selected }) {
  const deleteNode = () => {
    if (data.onDelete) {
      data.onDelete(id);
    }
  };

  return (
    <div
      className={`relative px-4 py-3 shadow-lg rounded-lg border-2 bg-white dark:bg-gray-800 group ${
        selected ? 'ring-2 ring-purple-400 ring-offset-2' : ''
      }`}
      style={{ borderColor: data.color, minWidth: '180px', maxWidth: '220px' }}
    >
      {/* Delete Button */}
      <button
        onClick={deleteNode}
        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
        title="Delete node"
      >
        <X className="w-3 h-3" />
      </button>

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-purple-500 !border-2 !border-white hover:!w-4 hover:!h-4 transition-all"
        style={{ left: -6 }}
      />

      <div className="flex items-start gap-2">
        <span className="text-2xl">{data.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold truncate text-gray-900 dark:text-gray-100">{data.label}</div>
          <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{data.description}</div>
          {data.status && (
            <div className={`mt-1 text-[9px] px-2 py-0.5 rounded-full inline-block ${
              data.status === 'active' ? 'bg-green-100 text-green-700' :
              data.status === 'configured' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {data.status}
            </div>
          )}
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-purple-500 !border-2 !border-white hover:!w-4 hover:!h-4 transition-all"
        style={{ right: -6 }}
      />
    </div>
  );
}

const nodeTypes = {
  agentConfig: AgentConfigNode
};

// Agent Configuration Node Templates
const agentNodeTemplates = [
  // Core Agent Settings
  { type: 'voice_config', label: 'Voice Configuration', icon: '🎤', color: '#8b5cf6', description: 'ElevenLabs voice settings', category: 'Core' },
  { type: 'personality', label: 'Personality', icon: '🧠', color: '#8b5cf6', description: 'Agent personality & tone', category: 'Core' },
  { type: 'instructions', label: 'Instructions', icon: '📋', color: '#8b5cf6', description: 'Behavioral instructions', category: 'Core' },
  { type: 'knowledge_base', label: 'Knowledge Base', icon: '📚', color: '#8b5cf6', description: 'Domain knowledge', category: 'Core' },

  // Triggers
  { type: 'inbound_call', label: 'Inbound Call', icon: '📞', color: '#10b981', description: 'Incoming phone call', category: 'Triggers' },
  { type: 'outbound_call', label: 'Outbound Call', icon: '📱', color: '#10b981', description: 'Initiate outbound call', category: 'Triggers' },
  { type: 'schedule_trigger', label: 'Schedule', icon: '⏰', color: '#10b981', description: 'Time-based trigger', category: 'Triggers' },
  { type: 'webhook_trigger', label: 'Webhook', icon: '🔗', color: '#10b981', description: 'External trigger', category: 'Triggers' },

  // Conversation Flow
  { type: 'greeting', label: 'Greeting', icon: '👋', color: '#3b82f6', description: 'Initial greeting', category: 'Conversation' },
  { type: 'question', label: 'Ask Question', icon: '❓', color: '#3b82f6', description: 'Collect information', category: 'Conversation' },
  { type: 'response', label: 'Response', icon: '💬', color: '#3b82f6', description: 'Agent response', category: 'Conversation' },
  { type: 'transfer', label: 'Transfer Call', icon: '↗️', color: '#3b82f6', description: 'Transfer to human', category: 'Conversation' },
  { type: 'voicemail', label: 'Voicemail', icon: '📧', color: '#3b82f6', description: 'Leave voicemail', category: 'Conversation' },

  // Logic & Control
  { type: 'condition', label: 'Condition', icon: '🔀', color: '#f59e0b', description: 'If/then logic', category: 'Logic' },
  { type: 'sentiment_check', label: 'Sentiment Check', icon: '😊', color: '#f59e0b', description: 'Analyze sentiment', category: 'Logic' },
  { type: 'intent_detection', label: 'Intent Detection', icon: '🎯', color: '#f59e0b', description: 'Detect user intent', category: 'Logic' },
  { type: 'loop', label: 'Repeat', icon: '🔁', color: '#f59e0b', description: 'Repeat actions', category: 'Logic' },

  // Actions
  { type: 'save_data', label: 'Save to CRM', icon: '💾', color: '#ec4899', description: 'Save conversation data', category: 'Actions' },
  { type: 'send_sms', label: 'Send SMS', icon: '💬', color: '#ec4899', description: 'Send text message', category: 'Actions' },
  { type: 'send_email', label: 'Send Email', icon: '📧', color: '#ec4899', description: 'Send email', category: 'Actions' },
  { type: 'create_task', label: 'Create Task', icon: '✅', color: '#ec4899', description: 'Create follow-up task', category: 'Actions' },
  { type: 'book_appointment', label: 'Book Appointment', icon: '📅', color: '#ec4899', description: 'Schedule meeting', category: 'Actions' },

  // Integrations
  { type: 'crm_lookup', label: 'CRM Lookup', icon: '🔍', color: '#14b8a6', description: 'Lookup contact info', category: 'Integrations' },
  { type: 'api_call', label: 'API Call', icon: '🌐', color: '#14b8a6', description: 'External API request', category: 'Integrations' },
  { type: 'database_query', label: 'Database Query', icon: '🗄️', color: '#14b8a6', description: 'Query database', category: 'Integrations' },
  { type: 'run_workflow', label: 'Run Workflow', icon: '⚡', color: '#14b8a6', description: 'Execute n8n workflow', category: 'Integrations' },

  // Advanced
  { type: 'custom_code', label: 'Custom Code', icon: '💻', color: '#6366f1', description: 'JavaScript code', category: 'Advanced' },
  { type: 'ai_decision', label: 'AI Decision', icon: '🤖', color: '#6366f1', description: 'AI-powered decision', category: 'Advanced' },
  { type: 'speech_settings', label: 'Speech Settings', icon: '🎚️', color: '#6366f1', description: 'Adjust speech params', category: 'Advanced' },
];

const nodeCategories = ['All', 'Core', 'Triggers', 'Conversation', 'Logic', 'Actions', 'Integrations', 'Advanced'];

function AgentStudioContent({ agentId, agentData, onSave, onClose }) {
  const { screenToFlowPosition } = useReactFlow();

  // UI State
  const [showNodePalette, setShowNodePalette] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Node & Edge State
  const [nodes, setNodes, onNodesChange] = useNodesState(agentData?.configNodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(agentData?.configEdges || []);
  const [selectedNode, setSelectedNode] = useState(null);

  // Configuration State
  const [nodeConfig, setNodeConfig] = useState({});

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
      style: { strokeWidth: 2.5, stroke: '#8b5cf6' }
    }, eds));
  }, [setEdges]);

  const deleteNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  }, [setNodes, setEdges, selectedNode]);

  const onDragStart = (event, nodeTemplate) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeTemplate));
  };

  const onDrop = (event) => {
    event.preventDefault();
    const templateData = JSON.parse(event.dataTransfer.getData('application/reactflow'));

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY
    });

    const newNode = {
      id: `${templateData.type}_${Date.now()}`,
      type: 'agentConfig',
      position,
      data: {
        ...templateData,
        nodeType: templateData.type,
        config: {},
        status: 'pending',
        onDelete: deleteNode
      }
    };

    setNodes((nds) => nds.concat(newNode));
  };

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleSave = () => {
    const agentConfiguration = {
      configNodes: nodes,
      configEdges: edges,
      nodeConfigurations: nodeConfig
    };
    onSave(agentConfiguration);
  };

  const updateNodeConfig = (nodeId, config) => {
    setNodeConfig(prev => ({
      ...prev,
      [nodeId]: config
    }));

    // Update node status
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              status: 'configured'
            }
          };
        }
        return node;
      })
    );
  };

  const filteredTemplates = agentNodeTemplates.filter(template => {
    if (selectedCategory === 'All') return true;
    return template.category === selectedCategory;
  });

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Agent Configuration Studio
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Build complex agent behaviors with visual nodes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
          >
            <Save className="w-4 h-4" />
            Save Configuration
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Node Palette */}
        <div className={`${showNodePalette ? 'w-64' : 'w-12'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 overflow-hidden flex flex-col`}>
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowNodePalette(!showNodePalette)}
              className="w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center justify-center"
            >
              {showNodePalette ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {showNodePalette && (
            <>
              {/* Category Filter */}
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  {nodeCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Node Templates */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.type}
                    draggable
                    onDragStart={(e) => onDragStart(e, template)}
                    className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg cursor-move hover:shadow-md hover:scale-105 transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl group-hover:scale-110 transition-transform">{template.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{template.label}</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{template.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* React Flow Canvas */}
        <div className="flex-1 relative" onDrop={onDrop} onDragOver={onDragOver}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedNode(node)}
            nodeTypes={nodeTypes}
            snapToGrid={true}
            snapGrid={[15, 15]}
            deleteKeyCode="Delete"
            multiSelectionKeyCode="Shift"
            edgesReconnectable={true}
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: true,
              markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6', width: 20, height: 20 },
              style: { strokeWidth: 2.5, stroke: '#8b5cf6' }
            }}
            fitView
          >
            <Background color="#e5e7eb" gap={15} />
            <Controls style={{ bottom: 20, left: 20 }} />
            <MiniMap
              nodeColor={(node) => node.data.color}
              nodeStrokeColor={(node) => node.data.color}
              nodeStrokeWidth={3}
              nodeBorderRadius={8}
              maskColor="rgb(139, 92, 246, 0.15)"
              className="!bg-white dark:!bg-gray-800 !border-2 !border-purple-500 dark:!border-purple-400 !shadow-2xl !rounded-xl"
              style={{ bottom: 20, right: 20 }}
              zoomable
              pannable
            />
          </ReactFlow>

          {/* Help Text */}
          <div className="hidden md:block absolute top-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 shadow-lg text-xs text-gray-600 dark:text-gray-400 pointer-events-none">
            💡 Drag nodes from the left • Connect nodes to build agent flow • Click nodes to configure
          </div>
        </div>

        {/* Configuration Panel */}
        {selectedNode && (
          <div className="w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 overflow-y-auto flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <span className="text-xl">{selectedNode.data.icon}</span>
                  {selectedNode.data.label}
                </h3>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{selectedNode.data.description}</p>
            </div>

            <div className="flex-1 p-4 space-y-4">
              {/* Voice Configuration Node */}
              {selectedNode.data.nodeType === 'voice_config' && (
                <VoiceConfigPanel
                  config={nodeConfig[selectedNode.id] || {}}
                  onChange={(config) => updateNodeConfig(selectedNode.id, config)}
                />
              )}

              {/* Personality Node */}
              {selectedNode.data.nodeType === 'personality' && (
                <PersonalityConfigPanel
                  config={nodeConfig[selectedNode.id] || {}}
                  onChange={(config) => updateNodeConfig(selectedNode.id, config)}
                />
              )}

              {/* Instructions Node */}
              {selectedNode.data.nodeType === 'instructions' && (
                <InstructionsConfigPanel
                  config={nodeConfig[selectedNode.id] || {}}
                  onChange={(config) => updateNodeConfig(selectedNode.id, config)}
                />
              )}

              {/* Knowledge Base Node */}
              {selectedNode.data.nodeType === 'knowledge_base' && (
                <KnowledgeBaseConfigPanel
                  config={nodeConfig[selectedNode.id] || {}}
                  onChange={(config) => updateNodeConfig(selectedNode.id, config)}
                />
              )}

              {/* Question Node */}
              {selectedNode.data.nodeType === 'question' && (
                <QuestionConfigPanel
                  config={nodeConfig[selectedNode.id] || {}}
                  onChange={(config) => updateNodeConfig(selectedNode.id, config)}
                />
              )}

              {/* Condition Node */}
              {selectedNode.data.nodeType === 'condition' && (
                <ConditionConfigPanel
                  config={nodeConfig[selectedNode.id] || {}}
                  onChange={(config) => updateNodeConfig(selectedNode.id, config)}
                />
              )}

              {/* Generic Configuration */}
              {!['voice_config', 'personality', 'instructions', 'knowledge_base', 'question', 'condition'].includes(selectedNode.data.nodeType) && (
                <GenericConfigPanel
                  nodeType={selectedNode.data.nodeType}
                  config={nodeConfig[selectedNode.id] || {}}
                  onChange={(config) => updateNodeConfig(selectedNode.id, config)}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Configuration Panels
function VoiceConfigPanel({ config, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Voice Model
        </label>
        <select
          value={config.model || 'eleven_turbo_v2_5'}
          onChange={(e) => onChange({ ...config, model: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
        >
          <option value="eleven_turbo_v2_5">Turbo v2.5 (Fastest)</option>
          <option value="eleven_turbo_v2">Turbo v2</option>
          <option value="eleven_multilingual_v2">Multilingual v2</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Stability: {config.stability || 50}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={config.stability || 50}
          onChange={(e) => onChange({ ...config, stability: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Similarity: {config.similarity || 75}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={config.similarity || 75}
          onChange={(e) => onChange({ ...config, similarity: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Style: {config.style || 0}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={config.style || 0}
          onChange={(e) => onChange({ ...config, style: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>
    </div>
  );
}

function PersonalityConfigPanel({ config, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tone
        </label>
        <select
          value={config.tone || 'professional'}
          onChange={(e) => onChange({ ...config, tone: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
        >
          <option value="professional">Professional</option>
          <option value="friendly">Friendly</option>
          <option value="casual">Casual</option>
          <option value="formal">Formal</option>
          <option value="enthusiastic">Enthusiastic</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Empathy Level: {config.empathy || 50}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={config.empathy || 50}
          onChange={(e) => onChange({ ...config, empathy: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Personality Traits
        </label>
        <textarea
          value={config.traits || ''}
          onChange={(e) => onChange({ ...config, traits: e.target.value })}
          placeholder="e.g., patient, helpful, detail-oriented..."
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 resize-none"
        />
      </div>
    </div>
  );
}

function InstructionsConfigPanel({ config, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          System Instructions
        </label>
        <textarea
          value={config.instructions || ''}
          onChange={(e) => onChange({ ...config, instructions: e.target.value })}
          placeholder="Describe how the agent should behave..."
          rows={6}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Objection Handling
        </label>
        <textarea
          value={config.objectionHandling || ''}
          onChange={(e) => onChange({ ...config, objectionHandling: e.target.value })}
          placeholder="How should the agent handle objections..."
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 resize-none"
        />
      </div>
    </div>
  );
}

function KnowledgeBaseConfigPanel({ config, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Knowledge Content
        </label>
        <textarea
          value={config.knowledge || ''}
          onChange={(e) => onChange({ ...config, knowledge: e.target.value })}
          placeholder="Add FAQs, product info, policies..."
          rows={8}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 resize-none"
        />
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.enableRAG || false}
            onChange={(e) => onChange({ ...config, enableRAG: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Enable RAG (Retrieval)</span>
        </label>
      </div>
    </div>
  );
}

function QuestionConfigPanel({ config, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Question Text
        </label>
        <textarea
          value={config.question || ''}
          onChange={(e) => onChange({ ...config, question: e.target.value })}
          placeholder="What question should the agent ask?"
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Expected Answer Type
        </label>
        <select
          value={config.answerType || 'text'}
          onChange={(e) => onChange({ ...config, answerType: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
        >
          <option value="text">Text</option>
          <option value="number">Number</option>
          <option value="date">Date</option>
          <option value="yes_no">Yes/No</option>
          <option value="email">Email</option>
          <option value="phone">Phone Number</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Variable Name (to store answer)
        </label>
        <input
          type="text"
          value={config.variableName || ''}
          onChange={(e) => onChange({ ...config, variableName: e.target.value })}
          placeholder="e.g., customer_name"
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
        />
      </div>
    </div>
  );
}

function ConditionConfigPanel({ config, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Condition Type
        </label>
        <select
          value={config.conditionType || 'equals'}
          onChange={(e) => onChange({ ...config, conditionType: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
        >
          <option value="equals">Equals</option>
          <option value="contains">Contains</option>
          <option value="greater_than">Greater Than</option>
          <option value="less_than">Less Than</option>
          <option value="sentiment">Sentiment Is</option>
          <option value="intent">Intent Is</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Variable to Check
        </label>
        <input
          type="text"
          value={config.variable || ''}
          onChange={(e) => onChange({ ...config, variable: e.target.value })}
          placeholder="e.g., sentiment, intent, customer_name"
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Value to Compare
        </label>
        <input
          type="text"
          value={config.value || ''}
          onChange={(e) => onChange({ ...config, value: e.target.value })}
          placeholder="e.g., positive, booking_intent, john"
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
        />
      </div>
    </div>
  );
}

function GenericConfigPanel({ nodeType, config, onChange }) {
  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          Configure this {nodeType.replace(/_/g, ' ')} node. Add parameters as needed.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Configuration (JSON)
        </label>
        <textarea
          value={JSON.stringify(config, null, 2)}
          onChange={(e) => {
            try {
              onChange(JSON.parse(e.target.value));
            } catch (err) {
              // Invalid JSON, don't update
            }
          }}
          rows={8}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 font-mono resize-none"
        />
      </div>
    </div>
  );
}

// Wrapper component
export default function AgentStudio(props) {
  return (
    <ReactFlowProvider>
      <AgentStudioContent {...props} />
    </ReactFlowProvider>
  );
}
