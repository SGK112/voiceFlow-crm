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
  Zap,
  FileSpreadsheet
} from 'lucide-react';
import api from '../services/api';
import ExcelUpload from '../components/ExcelUpload';

const PIPELINE_STAGES = [
  { id: 'new', name: 'New', color: 'bg-secondary bg-secondary border-gray-300 border-border' },
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
  const [showExcelUpload, setShowExcelUpload] = useState(false);
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
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              Leads & Pipeline
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your leads manually or assign AI agents at any stage
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-transparent border border-border rounded-lg">
              <button
                onClick={() => setViewMode('pipeline')}
                className={`px-3 py-2 text-sm font-medium transition-colors rounded-l-lg ${
                  viewMode === 'pipeline'
                    ? 'bg-blue-600 text-white'
                    : 'text-foreground hover:bg-secondary'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 text-sm font-medium transition-colors rounded-r-lg ${
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white'
                    : 'text-foreground hover:bg-secondary'
                }`}
              >
                <LayoutList className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setShowExcelUpload(true)}
              className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Import Excel
            </button>

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
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-border shadow-md">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Leads</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-border shadow-md">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">New</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.new}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-border shadow-md">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">In Progress</p>
            <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-border shadow-md">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Won</p>
            <p className="text-2xl font-bold text-green-600">{stats.won}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-border shadow-md">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">AI Assigned</p>
            <p className="text-2xl font-bold text-purple-600">{stats.aiAssigned}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-border shadow-md">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Value</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">${stats.totalValue.toLocaleString()}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search leads by name, email, phone, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    <h3 className="font-semibold text-foreground">{stage.name}</h3>
                    <span className="text-sm font-semibold text-foreground bg-card px-2 py-1 rounded">
                      {stageLeads.length}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 min-h-[500px]">
                  {stageLeads.map(lead => (
                    <div
                      key={lead._id}
                      className="bg-transparent rounded-lg border border-border p-4 hover:border-blue-500/50 transition-all"
                    >
                      {/* AI Assigned Badge */}
                      {(lead.aiAssigned || lead.assignedAgent) && (
                        <div className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full mb-2 w-fit">
                          <Bot className="w-3 h-3" />
                          AI Assigned
                        </div>
                      )}

                      {/* Lead Info */}
                      <h4 className="font-semibold text-foreground mb-2">{lead.name}</h4>

                      <div className="space-y-1 text-sm text-muted-foreground mb-3">
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
                      <div className="flex items-center gap-2 pt-3 border-t border-border">
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
                          className="flex-1 px-2 py-1.5 border border-border bg-background text-foreground rounded text-xs focus:ring-2 focus:ring-blue-500"
                        >
                          {PIPELINE_STAGES.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>

                        <button
                          onClick={() => deleteLead(lead._id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {stageLeads.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
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
        <div className="bg-transparent rounded-lg border border-border overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Stage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">AI Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-transparent divide-y divide-border">
              {filteredLeads.map(lead => (
                <tr key={lead._id} className="hover:bg-secondary/30">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{lead.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    <div>{lead.email}</div>
                    <div>{lead.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{lead.company || '-'}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-foreground">
                    {lead.value ? `$${parseFloat(lead.value).toLocaleString()}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold text-gray-900 text-foreground ${
                      PIPELINE_STAGES.find(s => s.id === lead.stage)?.color || 'bg-secondary bg-secondary'
                    }`}>
                      {PIPELINE_STAGES.find(s => s.id === lead.stage)?.name || 'New'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {lead.aiAssigned || lead.assignedAgent ? (
                      <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                        <Bot className="w-4 h-4" />
                        AI Assigned
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Manual</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedLead(lead);
                          setShowAssignAgentModal(true);
                        }}
                        className="p-1 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 rounded transition-colors"
                        title="Assign AI Agent"
                      >
                        <Bot className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteLead(lead._id)}
                        className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors"
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
            <div className="text-center py-12 text-muted-foreground">
              No leads found
            </div>
          )}
        </div>
      )}
      </div>

      {/* Excel Upload Modal */}
      {showExcelUpload && (
        <ExcelUpload
          onSuccess={() => {
            fetchData();
          }}
          onClose={() => setShowExcelUpload(false)}
        />
      )}
    </div>
  );


}
