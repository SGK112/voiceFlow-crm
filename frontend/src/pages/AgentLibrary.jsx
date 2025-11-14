import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import agentLibraryApi from '@/services/agentLibraryApi';
import CommunityMarketplace from '@/components/CommunityMarketplace';
import { toast } from 'sonner';
import {
  Phone,
  Calendar,
  DollarSign,
  Star,
  Users,
  ArrowRight,
  Check,
  Zap
} from 'lucide-react';

const AgentLibrary = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await agentLibraryApi.getTemplates();
      setTemplates(response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load agent templates');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      inbound: Phone,
      outbound: Zap,
      operations: Users
    };
    return icons[category] || Phone;
  };

  const getTemplateIcon = (iconEmoji) => {
    // Map emoji to lucide icon
    const iconMap = {
      '📞': Phone,
      '📅': Calendar,
      '💰': DollarSign,
      '⭐': Star,
      '👷': Users
    };
    return iconMap[iconEmoji] || Phone;
  };

  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  const groupedTemplates = {
    inbound: filteredTemplates.filter(t => t.category === 'inbound'),
    outbound: filteredTemplates.filter(t => t.category === 'outbound'),
    operations: filteredTemplates.filter(t => t.category === 'operations')
  };

  const handleAddAgent = (templateId) => {
    navigate(`/app/agent-library/setup/${templateId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading agent library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Choose Your Agent Team</h1>
        <p className="text-muted-foreground text-lg">
          Pre-configured AI agents built specifically for contractors. No coding required.
        </p>
      </div>

      {/* Category Filter */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-5">
          <TabsTrigger value="all">All Agents</TabsTrigger>
          <TabsTrigger value="inbound">Inbound</TabsTrigger>
          <TabsTrigger value="outbound">Outbound</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-8 space-y-8">
          {/* Community Marketplace */}
          {selectedCategory === 'community' && (
            <CommunityMarketplace />
          )}

          {/* Inbound Agents */}
          {(selectedCategory === 'all' || selectedCategory === 'inbound') && groupedTemplates.inbound.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-red-500" />
                <h2 className="text-2xl font-semibold">Inbound Agents</h2>
                <Badge variant="secondary">Answer Customer Calls</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedTemplates.inbound.map((template) => (
                  <AgentCard
                    key={template.id}
                    template={template}
                    onAddAgent={handleAddAgent}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Outbound Agents */}
          {(selectedCategory === 'all' || selectedCategory === 'outbound') && groupedTemplates.outbound.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                <h2 className="text-2xl font-semibold">Outbound Agents</h2>
                <Badge variant="secondary">Make Calls For You</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedTemplates.outbound.map((template) => (
                  <AgentCard
                    key={template.id}
                    template={template}
                    onAddAgent={handleAddAgent}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Operations Agents */}
          {(selectedCategory === 'all' || selectedCategory === 'operations') && groupedTemplates.operations.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-500" />
                <h2 className="text-2xl font-semibold">Operations Agents</h2>
                <Badge variant="secondary">Internal Efficiency</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedTemplates.operations.map((template) => (
                  <AgentCard
                    key={template.id}
                    template={template}
                    onAddAgent={handleAddAgent}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* View My Agents CTA */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <h3 className="text-lg font-semibold mb-1">Already have agents configured?</h3>
            <p className="text-sm text-muted-foreground">
              View, manage, and monitor your active agents
            </p>
          </div>
          <Button onClick={() => navigate('/app/my-agents')}>
            View My Agents
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// Agent Card Component
const AgentCard = ({ template, onAddAgent }) => {
  const Icon = template.icon === '📞' ? Phone :
               template.icon === '📅' ? Calendar :
               template.icon === '💰' ? DollarSign :
               template.icon === '⭐' ? Star :
               template.icon === '👷' ? Users : Phone;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div
            className="p-3 rounded-lg"
            style={{ backgroundColor: `${template.color}20` }}
          >
            <Icon className="h-6 w-6" style={{ color: template.color }} />
          </div>
          <Badge variant="outline" className="text-xs">
            ${template.pricing.basePrice}/mo
          </Badge>
        </div>
        <CardTitle className="text-xl">{template.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {template.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow space-y-4">
        {/* Features */}
        <div className="space-y-2">
          {template.features.slice(0, 4).map((feature, index) => (
            <div key={index} className="flex items-start gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{feature}</span>
            </div>
          ))}
          {template.features.length > 4 && (
            <p className="text-xs text-muted-foreground pl-6">
              +{template.features.length - 4} more features
            </p>
          )}
        </div>

        {/* Target User */}
        <div className="pt-3 border-t">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Perfect for:
          </p>
          <p className="text-sm">{template.targetUser}</p>
        </div>
      </CardContent>

      <CardFooter className="pt-4">
        <Button
          className="w-full"
          onClick={() => onAddAgent(template.id)}
        >
          Add to My Team
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AgentLibrary;
