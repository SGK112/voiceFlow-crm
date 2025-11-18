export default function StepSMSTemplate({ agentData, updateAgentData }) {
  return (
    <div className="p-4 pb-20">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">SMS Message</h2>
          <p className="text-muted-foreground">What should your SMS say?</p>
        </div>
        <textarea
          value={agentData.smsTemplate || ''}
          onChange={(e) => updateAgentData({ smsTemplate: e.target.value })}
          placeholder="Hi! This is a reminder..."
          rows={6}
          className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground resize-none"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Use variables for personalization
        </p>
      </div>
    </div>
  );
}
