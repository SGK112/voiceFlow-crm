import { FileText, Lightbulb } from 'lucide-react';

const PROMPT_TEMPLATES = {
  'customer-service': `You are a helpful customer service agent. Answer questions, help with orders, and provide support with a friendly, professional tone.`,
  'sales': `You are a sales assistant. Qualify leads, understand their needs, present solutions, and guide them toward making a purchase.`,
  'appointment': `You are an appointment scheduling assistant. Help customers book, reschedule, or cancel appointments efficiently.`,
  'faq': `You are an FAQ assistant. Answer common questions accurately and direct customers to additional resources when needed.`
};

export default function StepPrompt({ agentData, updateAgentData }) {
  const charCount = agentData.prompt?.length || 0;

  return (
    <div className="p-4 pb-20">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Agent Instructions</h2>
          <p className="text-muted-foreground">What is your agent's purpose?</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-foreground">Prompt</label>
          <textarea
            value={agentData.prompt || ''}
            onChange={(e) => updateAgentData({ prompt: e.target.value })}
            placeholder="You are a helpful assistant that..."
            rows={8}
            className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">{charCount} characters</span>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-3 text-foreground">Quick Templates</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(PROMPT_TEMPLATES).map(([key, template]) => (
              <button
                key={key}
                onClick={() => updateAgentData({ prompt: template })}
                className="p-3 text-left bg-card border border-border hover:border-blue-500 rounded-lg transition-all touch-manipulation"
              >
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium capitalize">{key.replace('-', ' ')}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex gap-2">
            <Lightbulb className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Tip:</strong> Be specific about your agent's role, tone, and how it should handle different scenarios.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
