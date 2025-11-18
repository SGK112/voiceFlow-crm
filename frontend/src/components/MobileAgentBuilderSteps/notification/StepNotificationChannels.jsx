export default function StepNotificationChannels({ agentData, updateAgentData }) {
  const channels = ['SMS', 'Voice', 'Email'];
  const selected = agentData.notificationChannels || [];

  const toggleChannel = (channel) => {
    const newChannels = selected.includes(channel)
      ? selected.filter(c => c !== channel)
      : [...selected, channel];
    updateAgentData({ notificationChannels: newChannels });
  };

  return (
    <div className="p-4 pb-20">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Notification Channels</h2>
          <p className="text-muted-foreground">How should we notify customers?</p>
        </div>
        <div className="space-y-3">
          {channels.map(channel => (
            <button
              key={channel}
              onClick={() => toggleChannel(channel)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                selected.includes(channel)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                  : 'border-border bg-card'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{channel}</span>
                {selected.includes(channel) && <span className="text-green-500">✓</span>}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
