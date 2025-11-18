export default function StepEmailTemplate({ agentData, updateAgentData }) {
  return (
    <div className="p-4 pb-20">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Email Template</h2>
          <p className="text-muted-foreground">Compose your email</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Subject Line</label>
            <input
              type="text"
              value={agentData.emailSubject || ''}
              onChange={(e) => updateAgentData({ emailSubject: e.target.value })}
              placeholder="Thanks for your interest!"
              className="w-full px-4 py-3 bg-muted border border-border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email Body</label>
            <textarea
              value={agentData.emailBody || ''}
              onChange={(e) => updateAgentData({ emailBody: e.target.value })}
              placeholder="Hi there..."
              rows={8}
              className="w-full px-4 py-3 bg-muted border border-border rounded-lg resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
