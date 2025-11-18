import { MessageSquare } from 'lucide-react';

/**
 * Step 4 (Voice): Greeting/Opening Message
 */

const GREETING_TEMPLATES = {
  inbound: [
    "Hello! Thanks for calling. How can I help you today?",
    "Hi there! I'm here to assist you. What brings you in today?",
    "Good day! Thank you for reaching out. What can I do for you?",
    "Hello! I'm ready to help. What would you like to know?"
  ],
  outbound: [
    "Hi! This is [Company Name] calling. Do you have a quick moment?",
    "Hello! I'm calling from [Company Name]. Is now a good time to chat?",
    "Hi there! This is [Agent Name] from [Company Name]. How are you today?",
    "Good day! I'm reaching out from [Company Name]. Can we talk for a moment?"
  ]
};

export default function StepGreeting({ agentData, updateAgentData }) {
  const templates = GREETING_TEMPLATES[agentData.direction] || GREETING_TEMPLATES.inbound;
  const charCount = agentData.greeting?.length || 0;
  const recommended = charCount >= 20 && charCount <= 150;

  return (
    <div className="p-4 pb-20">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Opening Message
          </h2>
          <p className="text-muted-foreground">
            What should your agent say first?
          </p>
        </div>

        {/* Text Area */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-foreground">
            Greeting
          </label>
          <textarea
            value={agentData.greeting || ''}
            onChange={(e) => updateAgentData({ greeting: e.target.value })}
            placeholder="Hello! Thanks for calling..."
            rows={4}
            className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <span className={`text-xs ${recommended ? 'text-green-600' : 'text-muted-foreground'}`}>
              {charCount} characters {recommended && '✓'}
            </span>
            <span className="text-xs text-muted-foreground">
              Recommended: 20-150 chars
            </span>
          </div>
        </div>

        {/* Templates */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3 text-foreground">
            Quick Templates
          </label>
          <div className="space-y-2">
            {templates.map((template, idx) => (
              <button
                key={idx}
                onClick={() => updateAgentData({ greeting: template })}
                className="w-full p-3 text-left bg-card border border-border hover:border-blue-500 rounded-lg transition-all touch-manipulation"
              >
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{template}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">💡 Tips for Great Greetings</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Be warm and friendly</li>
            <li>• Keep it brief (under 10 seconds)</li>
            <li>• State your purpose clearly</li>
            <li>• Ask an open-ended question</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
