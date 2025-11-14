import { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Bot,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  User,
  Search,
  Filter,
  LayoutGrid,
  LayoutList,
  Trash2,
  Edit,
  Zap
} from 'lucide-react';
import api from '../services/api';

const PIPELINE_STAGES = [
  { id: 'new', name: 'New', color: 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600' },
  { id: 'contacted', name: 'Contacted', color: 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700' },
  { id: 'qualified', name: 'Qualified', color: 'bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700' },
  { id: 'proposal', name: 'Proposal', color: 'bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700' },
  { id: 'won', name: 'Won', color: 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700' },
  { id: 'lost', name: 'Lost', color: 'bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700' }
];

export default function LeadsEnhanced() {
  const [viewMode, setViewMode] = useState('pipeline'); // 'pipeline' or 'table'
  const [leads, setLeads] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignAgentModal, setShowAssignAgentModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    value: '',
    stage: 'new',
    source: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leadsRes, agentsRes] = await Promise.all([
        api.get('/leads'),
        api.get('/agents')
      ]);

      setLeads(leadsRes.data?.leads || leadsRes.data || []);
      setAgents(agentsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leads', newLead);
      setShowAddModal(false);
      setNewLead({ name: '', email: '', phone: '', company: '', value: '', stage: 'new', source: '' });
      fetchData();
    } catch (error) {
      console.error('Error adding lead:', error);
      alert('Failed to add lead');
    }
  };

  const handleAssignAgent = async (agentId) => {
    try {
      await api.patch(`/leads/${selectedLead._id}`, {
        assignedAgent: agentId,
        aiAssigned: true
      });
      setShowAssignAgentModal(false);
      setSelectedLead(null);
      fetchData();
    } catch (error) {
      console.error('Error assigning agent:', error);
      alert('Failed to assign agent');
    }
  };

  const updateLeadStage = async (leadId, newStage) => {
    try {
      await api.patch(`/leads/${leadId}`, { stage: newStage });
      fetchData();
    } catch (error) {
      console.error('Error updating lead stage:', error);
    }
  };

  const deleteLead = async (leadId) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      await api.delete(`/leads/${leadId}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  const filteredLeads = leads.filter(lead =>
    lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLeadsByStage = (stageId) => {
    return filteredLeads.filter(lead => (lead.stage || 'new') === stageId);
  };

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.stage === 'new').length,
    inProgress: leads.filter(l => ['contacted', 'qualified', 'proposal'].includes(l.stage)).length,
    won: leads.filter(l => l.stage === 'won').length,
    aiAssigned: leads.filter(l => l.aiAssigned || l.assignedAgent).length,
    totalValue: leads.reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0)
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              Leads & Pipeline
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your leads manually or assign AI agents at any stage
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg">
              <button
                onClick={() => setViewMode('pipeline')}
                className={`px-3 py-2 text-sm font-medium transition-colors rounded-l-lg ${
                  viewMode === 'pipeline'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 text-sm font-medium transition-colors rounded-r-lg ${
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <LayoutList className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Lead
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Leads</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">New</p>
            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.new}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">In Progress</p>
            <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Won</p>
            <p className="text-2xl font-bold text-green-600">{stats.won}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">AI Assigned</p>
            <p className="text-2xl font-bold text-purple-600">{stats.aiAssigned}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Value</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">${stats.totalValue.toLocaleString()}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search leads by name, email, phone, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Pipeline View */}
      {viewMode === 'pipeline' ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map(stage => {
            const stageLeads = getLeadsByStage(stage.id);

            return (
              <div
                key={stage.id}
                className="flex-shrink-0 w-80"
              >
                <div className={`rounded-t-lg border-2 ${stage.color} p-3 mb-3`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{stage.name}</h3>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 px-2 py-1 rounded">
                      {stageLeads.length}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 min-h-[500px]">
                  {stageLeads.map(lead => (
                    <div
                      key={lead._id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                    >
                      {/* AI Assigned Badge */}
                      {(lead.aiAssigned || lead.assignedAgent) && (
                        <div className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full mb-2 w-fit">
                          <Bot className="w-3 h-3" />
                          AI Assigned
                        </div>
                      )}

                      {/* Lead Info */}
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{lead.name}</h4>

                      <div className="space-y-1 text-sm text-gray-700 dark:text-blue-300 mb-3">
                        {lead.company && (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {lead.company}
                          </div>
                        )}
                        {lead.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {lead.email}
                          </div>
                        )}
                        {lead.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {lead.phone}
                          </div>
                        )}
                        {lead.value && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            ${parseFloat(lead.value).toLocaleString()}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <button
                          onClick={() => {
                            setSelectedLead(lead);
                            setShowAssignAgentModal(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors"
                        >
                          <Bot className="w-3 h-3" />
                          {lead.aiAssigned ? 'Change Agent' : 'Assign AI'}
                        </button>

                        <select
                          value={lead.stage || 'new'}
                          onChange={(e) => updateLeadStage(lead._id, e.target.value)}
                          className="flex-1 px-2 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded text-xs focus:ring-2 focus:ring-blue-500"
                        >
                          {PIPELINE_STAGES.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>

                        <button
                          onClick={() => deleteLead(lead._id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {stageLeads.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      No leads in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Stage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">AI Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLeads.map(lead => (
                <tr key={lead._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{lead.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-blue-300">
                    <div>{lead.email}</div>
                    <div>{lead.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-blue-300">{lead.company || '-'}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {lead.value ? `$${parseFloat(lead.value).toLocaleString()}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold text-gray-900 dark:text-gray-100 ${
                      PIPELINE_STAGES.find(s => s.id === lead.stage)?.color || 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      {PIPELINE_STAGES.find(s => s.id === lead.stage)?.name || 'New'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {lead.aiAssigned || lead.assignedAgent ? (
                      <span className="flex items-center gap-1 text-green-700 dark:text-green-400 font-medium">
                        <Bot className="w-4 h-4" />
                        AI Assigned
                      </span>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">Manual</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedLead(lead);
                          setShowAssignAgentModal(true);
                        }}
                        className="p-1 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900 rounded transition-colors"
                        title="Assign AI Agent"
                      >
                        <Bot className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteLead(lead._id)}
                        className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
                        title="Delete Lead"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredLeads.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No leads found
            </div>
          )}
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Lead</h2>
            <form onSubmit={handleAddLead} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone *</label>
                <input
                  type="tel"
                  required
                  value={newLead.phone}
                  onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company</label>
                <input
                  type="text"
                  value={newLead.company}
                  onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deal Value ($)</label>
                <input
                  type="number"
                  value={newLead.value}
                  onChange={(e) => setNewLead({ ...newLead, value: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source</label>
                <input
                  type="text"
                  placeholder="e.g., Website, Referral, Form"
                  value={newLead.source}
                  onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Agent Modal */}
      {showAssignAgentModal && selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Assign AI Agent to {selectedLead.name}</h2>
            <p className="text-gray-600 mb-6">
              Select an AI agent to handle this lead. The agent will take over communications automatically.
            </p>

            <div className="space-y-3 mb-6">
              {agents.filter(a => a.enabled).map(agent => (
                <button
                  key={agent._id}
                  onClick={() => handleAssignAgent(agent._id)}
                  className="w-full flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
                >
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Bot className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{agent.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{agent.description || 'Voice agent'}</p>
                  </div>
                  <Zap className="w-5 h-5 text-purple-600 ml-auto" />
                </button>
              ))}

              {agents.filter(a => a.enabled).length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  No active agents available. Deploy an agent first.
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setShowAssignAgentModal(false);
                setSelectedLead(null);
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
