import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { communityAgentApi } from '@/services/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Store,
  Star,
  Download,
  DollarSign,
  Search,
  Filter,
  Users,
  TrendingUp,
  Award,
  CheckCircle2
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export default function CommunityMarketplace() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['community-marketplace', { category: selectedCategory === 'all' ? undefined : selectedCategory, search: searchTerm, sortBy }],
    queryFn: async () => {
      const params = {
        sortBy,
        page: 1,
        limit: 50
      };
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (searchTerm) params.search = searchTerm;

      const res = await communityAgentApi.getMarketplace(params);
      return res.data;
    }
  });

  const templates = data?.templates || [];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'trade-specialist', label: 'Trade Specialists' },
    { value: 'project-management', label: 'Project Management' },
    { value: 'research', label: 'Research & Data' },
    { value: 'social-media', label: 'Social Media' },
    { value: 'customer-service', label: 'Customer Service' },
    { value: 'sales', label: 'Sales' },
    { value: 'other', label: 'Other' }
  ];

  const handleInstall = async (templateId) => {
    try {
      await communityAgentApi.installTemplate(templateId, {});
      toast.success('Agent installed! Configure it in My Agents.');
      refetch();
    } catch (error) {
      console.error('Install error:', error);
      toast.error(error.response?.data?.message || 'Failed to install agent');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading community agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
          <Store className="h-8 w-8 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Community Marketplace</h2>
          <p className="text-muted-foreground">
            Discover and install agents created by contractors like you. Earn 70% revenue when others use your creations.
          </p>
        </div>
        <Button
          variant="default"
          onClick={() => window.location.href = '/app/create-agent'}
          className="hidden md:flex"
        >
          Create & Sell Agent
        </Button>
      </div>

      {/* Mobile Create Button */}
      <Button
        variant="default"
        onClick={() => window.location.href = '/app/create-agent'}
        className="w-full md:hidden"
      >
        Create & Sell Agent
      </Button>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Find the Perfect Agent</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">
                <Search className="h-4 w-4 inline mr-2" />
                Search
              </Label>
              <Input
                id="search"
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-base"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">
                <Filter className="h-4 w-4 inline mr-2" />
                Category
              </Label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-11 rounded-md border border-input bg-background px-3 text-base"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <Label htmlFor="sortBy">
                <TrendingUp className="h-4 w-4 inline mr-2" />
                Sort By
              </Label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full h-11 rounded-md border border-input bg-background px-3 text-base"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {templates.length} {templates.length === 1 ? 'agent' : 'agents'} found
        </p>
      </div>

      {/* Agent Grid */}
      {templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template._id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${template.color}20` }}
                    >
                      {template.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{template.name}</CardTitle>
                      <p className="text-xs text-muted-foreground truncate">
                        by {template.creatorName}
                      </p>
                    </div>
                  </div>
                  {template.isFeatured && (
                    <Badge variant="default" className="shrink-0">
                      <Award className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                <CardDescription className="line-clamp-2 mt-2">
                  {template.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                {/* Stats Row */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">{template.stats.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({template.stats.reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Download className="h-4 w-4" />
                    <span>{template.stats.installs}</span>
                  </div>
                </div>

                {/* Category Badge */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{template.category}</Badge>
                  {template.tags && template.tags.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Features Preview */}
                {template.features && template.features.length > 0 && (
                  <div className="space-y-1">
                    {template.features.slice(0, 3).map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                        <span className="text-muted-foreground line-clamp-1">{feature}</span>
                      </div>
                    ))}
                    {template.features.length > 3 && (
                      <p className="text-xs text-muted-foreground pl-6">
                        +{template.features.length - 3} more features
                      </p>
                    )}
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex items-center justify-between border-t pt-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1 text-lg font-bold">
                    {template.pricing.billingCycle === 'free' ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      <>
                        <DollarSign className="h-4 w-4" />
                        <span>{template.pricing.basePrice}</span>
                        <span className="text-sm text-muted-foreground font-normal">
                          /{template.pricing.billingCycle === 'monthly' ? 'mo' : 'yr'}
                        </span>
                      </>
                    )}
                  </div>
                  {template.pricing.billingCycle !== 'free' && (
                    <span className="text-xs text-muted-foreground">14-day free trial</span>
                  )}
                </div>

                {template.isInstalled ? (
                  <Button variant="outline" disabled className="gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Installed
                  </Button>
                ) : (
                  <Button onClick={() => handleInstall(template._id)} className="gap-2">
                    <Download className="h-4 w-4" />
                    Install
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Store className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No agents found</p>
            <p className="text-muted-foreground text-center mb-4">
              Try adjusting your filters or be the first to create an agent in this category!
            </p>
            <Button variant="outline" onClick={() => window.location.href = '/app/create-agent'}>
              Create Your First Agent
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
