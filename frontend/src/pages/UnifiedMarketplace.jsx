import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Workflow, Store } from 'lucide-react';
import AgentMarketplace from './AgentMarketplace';
import WorkflowMarketplace from './WorkflowMarketplace';

export default function UnifiedMarketplace() {
  const [activeTab, setActiveTab] = useState('agents');

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Marketplace</h1>
              <p className="text-sm text-muted-foreground">
                Browse and install AI agents and automation workflows
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-secondary p-1 text-muted-foreground">
            <TabsTrigger
              value="agents"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-card data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm"
            >
              <Bot className="w-4 h-4 mr-2" />
              AI Agent Templates
            </TabsTrigger>
            <TabsTrigger
              value="workflows"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-card data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400 data-[state=active]:shadow-sm"
            >
              <Workflow className="w-4 h-4 mr-2" />
              Workflow Automations
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} className="h-full">
          <TabsContent value="agents" className="h-full m-0">
            <AgentMarketplace />
          </TabsContent>
          <TabsContent value="workflows" className="h-full m-0">
            <WorkflowMarketplace />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
