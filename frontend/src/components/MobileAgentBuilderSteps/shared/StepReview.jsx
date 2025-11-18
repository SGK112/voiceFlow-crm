import { Check } from 'lucide-react';

export default function StepReview({ agentData }) {
  return (
    <div className="p-4 pb-20">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Review & Create</h2>
          <p className="text-muted-foreground">Check your agent configuration</p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-card border border-border rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Agent Type</div>
            <div className="font-medium capitalize">{agentData.agentType}</div>
          </div>

          {agentData.direction && (
            <div className="p-4 bg-card border border-border rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Direction</div>
              <div className="font-medium capitalize">{agentData.direction}</div>
            </div>
          )}

          {agentData.voiceName && (
            <div className="p-4 bg-card border border-border rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Voice</div>
              <div className="font-medium">{agentData.voiceName}</div>
            </div>
          )}

          {agentData.greeting && (
            <div className="p-4 bg-card border border-border rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Greeting</div>
              <div className="text-sm">{agentData.greeting}</div>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <Check className="h-5 w-5" />
            <span className="font-medium">Ready to create your agent!</span>
          </div>
        </div>
      </div>
    </div>
  );
}
