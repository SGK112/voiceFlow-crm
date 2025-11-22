import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  Star,
  TrendingUp,
  Lock,
  CheckCircle,
  ExternalLink,
  Zap,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import api from '../services/api';

export default function WorkflowMarketplace() {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [userTier, setUserTier] = useState('starter');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  useEffect(() => {
    fetchCategories();
    fetchWorkflows();
  }, [selectedCategory, searchQuery, sortBy, pagination.page]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/workflow-marketplace');
      setCategories(response.data.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 12
      });

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await api.get(`/workflow-marketplace?${params}`);
      const workflows = response.data.data.workflows || [];

      // Transform workflows to match expected format
      const transformedWorkflows = workflows.map(w => ({
        id: w.id,
        name: w.name,
        description: w.description,
        tier: w.isPremium ? 'pro' : 'starter',
        nodes: w.nodes || 3,
        integrations: (w.tags || []).map(tag => typeof tag === 'string' ? tag : tag.name || tag.id || 'Unknown'),
        downloads: Math.floor(Math.random() * 10000) + 1000, // Mock data
        rating: (4 + Math.random()).toFixed(1),
        active: w.active
      }));

      setWorkflows(transformedWorkflows);
      setUserTier('enterprise'); // All users get access
      setPagination({
        page: response.data.data.page,
        totalPages: response.data.data.totalPages
      });
    } catch (error) {
      console.error('Error fetching workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImportWorkflow = async (workflowId, workflowName) => {
    setImporting(prev => ({ ...prev, [workflowId]: true }));

    try {
      // Check if already active
      const workflow = workflows.find(w => w.id === workflowId);
      if (workflow?.active) {
        // Uninstall
        await api.post(`/workflow-marketplace/${workflowId}/uninstall`);
        alert(`✅ ${workflowName} deactivated successfully!`);

        // Update local state
        setWorkflows(workflows.map(w =>
          w.id === workflowId ? { ...w, active: false } : w
        ));
      } else {
        // Install
        const response = await api.post(`/workflow-marketplace/${workflowId}/install`);

        if (response.data.success) {
          alert(`✅ ${workflowName} activated successfully!`);

          // Update local state
          setWorkflows(workflows.map(w =>
            w.id === workflowId ? { ...w, active: true } : w
          ));
        }
      }
    } catch (error) {
      console.error('Error managing workflow:', error);

      if (error.response?.status === 403) {
        const upgrade = confirm(
          `${error.response.data.message}\n\nWould you like to upgrade your plan?`
        );
        if (upgrade) {
          navigate('/app/settings?tab=billing');
        }
      } else {
        alert(`Failed: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setImporting(prev => ({ ...prev, [workflowId]: false }));
    }
  };

  const getTierBadgeColor = (tier) => {
    switch (tier) {
      case 'starter': return 'bg-secondary text-gray-900 text-foreground';
      case 'pro': return 'bg-blue-100 text-blue-700';
      case 'enterprise': return 'bg-purple-100 text-purple-700';
      default: return 'bg-secondary text-gray-900 text-foreground';
    }
  };

  const canAccessWorkflow = (workflowTier) => {
    const tierHierarchy = { starter: 0, pro: 1, enterprise: 2 };
    const userLevel = tierHierarchy[userTier] || 0;
    const workflowLevel = tierHierarchy[workflowTier] || 0;
    return userLevel >= workflowLevel;
  };

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Filters */}
      <div className="bg-transparent border border-border rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-2 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none min-w-[200px]"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="recent">Recently Added</option>
          </select>
        </div>
      </div>

      {/* Category Chips */}
      <div className="flex gap-2 mb-6 overflow-x-scroll pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors border ${
            selectedCategory === 'all'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-transparent border-border text-foreground hover:bg-secondary'
          }`}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors border ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-transparent border-border text-foreground hover:bg-secondary'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Workflows Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-transparent border border-border rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-secondary rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-secondary rounded w-full mb-2"></div>
              <div className="h-4 bg-secondary rounded w-5/6"></div>
            </div>
          ))}
        </div>
      ) : workflows.length === 0 ? (
        <div className="text-center py-12 bg-transparent border border-border rounded-lg">
          <Zap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No workflows found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map(workflow => {
            const hasAccess = canAccessWorkflow(workflow.tier);
            const isImporting = importing[workflow.id];

            return (
              <div
                key={workflow.id}
                className="bg-transparent border border-border rounded-lg hover:border-purple-500/50 transition-all"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-foreground flex-1">
                      {workflow.name}
                    </h3>
                    {!hasAccess && (
                      <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0 ml-2" />
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {workflow.description}
                  </p>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTierBadgeColor(workflow.tier)}`}>
                      {workflow.tier.charAt(0).toUpperCase() + workflow.tier.slice(1)}
                    </span>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                      {workflow.nodes} nodes
                    </span>
                  </div>

                  {/* Integrations */}
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-1">Integrations:</p>
                    <div className="flex flex-wrap gap-1">
                      {workflow.integrations.slice(0, 3).map((integration, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 rounded">
                          {integration}
                        </span>
                      ))}
                      {workflow.integrations.length > 3 && (
                        <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded">
                          +{workflow.integrations.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      <span>{workflow.downloads.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>{workflow.rating}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  {hasAccess ? (
                    <button
                      onClick={() => handleImportWorkflow(workflow.id, workflow.name)}
                      disabled={isImporting}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed ${
                        workflow.active
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {isImporting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          {workflow.active ? 'Deactivating...' : 'Activating...'}
                        </>
                      ) : workflow.active ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Deactivate Workflow
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Activate Workflow
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/app/settings?tab=billing')}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Lock className="w-4 h-4" />
                      Upgrade to {workflow.tier.charAt(0).toUpperCase() + workflow.tier.slice(1)}
                    </button>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 bg-secondary/50 border-t border-border rounded-b-lg">
                  <button
                    onClick={() => navigate(`/app/marketplace/${workflow.id}`)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1"
                  >
                    View Details
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            className="px-4 py-2 bg-transparent border border-border rounded-lg text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary"
          >
            Previous
          </button>
          <span className="text-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.totalPages}
            className="px-4 py-2 bg-transparent border border-border rounded-lg text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary"
          >
            Next
          </button>
        </div>
      )}

        {/* Info Banner */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-4">
            <Zap className="w-12 h-12" />
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1">100+ AI Automation Workflows</h3>
              <p className="text-blue-100">
                These workflows run on your n8n instance at n8n.srv1138307.hstgr.cloud - activate them with one click!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
