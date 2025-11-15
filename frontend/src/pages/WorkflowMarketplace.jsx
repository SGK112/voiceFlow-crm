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
      const response = await api.get('/marketplace/categories');
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 12,
        sortBy
      });

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await api.get(`/marketplace/workflows?${params}`);
      setWorkflows(response.data.workflows || []);
      setUserTier(response.data.userTier || 'starter');
      setPagination({
        page: response.data.page,
        totalPages: response.data.totalPages
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
      const response = await api.post(`/marketplace/workflows/${workflowId}/import`, {
        name: `My ${workflowName}`
      });

      if (response.data.success) {
        alert(`✅ ${workflowName} imported successfully!\n\n${response.data.nextSteps.join('\n')}`);
        navigate('/app/workflows');
      }
    } catch (error) {
      console.error('Error importing workflow:', error);

      if (error.response?.data?.upgradeRequired) {
        const upgrade = confirm(
          `${error.response.data.message}\n\nWould you like to upgrade your plan?`
        );
        if (upgrade) {
          navigate('/app/settings?tab=billing');
        }
      } else {
        alert(`Failed to import workflow: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setImporting(prev => ({ ...prev, [workflowId]: false }));
    }
  };

  const getTierBadgeColor = (tier) => {
    switch (tier) {
      case 'starter': return 'bg-gray-100 text-gray-700 dark:text-gray-300';
      case 'pro': return 'bg-blue-100 text-blue-700';
      case 'enterprise': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700 dark:text-gray-300';
    }
  };

  const canAccessWorkflow = (workflowTier) => {
    const tierHierarchy = { starter: 0, pro: 1, enterprise: 2 };
    const userLevel = tierHierarchy[userTier] || 0;
    const workflowLevel = tierHierarchy[workflowTier] || 0;
    return userLevel >= workflowLevel;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Workflow Marketplace</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Browse and import 3,000+ community workflows. Your tier: <span className="font-semibold capitalize">{userTier}</span>
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white dark:bg-gray-800 min-w-[200px]"
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
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
            selectedCategory === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      ) : workflows.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No workflows found</h3>
          <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map(workflow => {
            const hasAccess = canAccessWorkflow(workflow.tier);
            const isImporting = importing[workflow.id];

            return (
              <div
                key={workflow.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex-1">
                      {workflow.name}
                    </h3>
                    {!hasAccess && (
                      <Lock className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {workflow.description}
                  </p>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTierBadgeColor(workflow.tier)}`}>
                      {workflow.tier.charAt(0).toUpperCase() + workflow.tier.slice(1)}
                    </span>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:text-gray-300">
                      {workflow.nodes} nodes
                    </span>
                  </div>

                  {/* Integrations */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Integrations:</p>
                    <div className="flex flex-wrap gap-1">
                      {workflow.integrations.slice(0, 3).map((integration, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                          {integration}
                        </span>
                      ))}
                      {workflow.integrations.length > 3 && (
                        <span className="text-xs px-2 py-1 bg-gray-50 dark:bg-gray-700 text-gray-600 rounded">
                          +{workflow.integrations.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
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
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {isImporting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Importing...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Import Workflow
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
                <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 rounded-b-lg">
                  <button
                    onClick={() => navigate(`/app/marketplace/${workflow.id}`)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
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
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-700"
          >
            Previous
          </button>
          <span className="text-gray-600 dark:text-gray-400">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.totalPages}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-700"
          >
            Next
          </button>
        </div>
      )}

      {/* Upgrade Banner */}
      {userTier === 'starter' && (
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-4">
            <TrendingUp className="w-12 h-12" />
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1">Unlock 3,000+ Premium Workflows</h3>
              <p className="text-blue-100">
                Upgrade to Pro or Enterprise to access advanced workflows with AI, integrations, and more.
              </p>
            </div>
            <button
              onClick={() => navigate('/app/settings?tab=billing')}
              className="px-6 py-3 bg-white dark:bg-gray-800 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors whitespace-nowrap"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
