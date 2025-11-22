import { useState } from 'react';
import { Play, Phone, Mail, MessageSquare, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import api from '@/services/api';

export default function AgentQuickTest({ agentId, agentName }) {
  const [testType, setTestType] = useState('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleQuickTest = async () => {
    setTesting(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.post(`/agents/${agentId}/quick-test`, {
        testType,
        phoneNumber: testType === 'phone' ? phoneNumber : null,
        email: testType === 'email' ? email : null,
        customMessage: customMessage || null,
      });

      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Test failed. Please try again.');
    } finally {
      setTesting(false);
    }
  };

  const isValid = () => {
    if (testType === 'phone' && !phoneNumber) return false;
    if (testType === 'email' && !email) return false;
    return true;
  };

  return (
    <Card className="dark:bg-black">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Quick Test Agent
        </CardTitle>
        <CardDescription>
          Test {agentName} instantly with a phone number or email
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test Type Selector */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Test Method
          </label>
          <div className="flex gap-2">
            <Button
              variant={testType === 'phone' ? 'default' : 'outline'}
              onClick={() => setTestType('phone')}
              className="flex-1"
            >
              <Phone className="w-4 h-4 mr-2" />
              Phone
            </Button>
            <Button
              variant={testType === 'email' ? 'default' : 'outline'}
              onClick={() => setTestType('email')}
              className="flex-1"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            <Button
              variant={testType === 'custom' ? 'default' : 'outline'}
              onClick={() => setTestType('custom')}
              className="flex-1"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Custom
            </Button>
          </div>
        </div>

        {/* Input Fields */}
        {testType === 'phone' && (
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Phone Number
            </label>
            <Input
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="dark:bg-black"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Agent will simulate a call to this number
            </p>
          </div>
        )}

        {testType === 'email' && (
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="customer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="dark:bg-black"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Agent will simulate an email conversation
            </p>
          </div>
        )}

        {/* Custom Message (Optional for all types) */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Custom Message (Optional)
          </label>
          <Textarea
            placeholder="Enter a custom message for the agent to respond to..."
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            rows={3}
            className="dark:bg-black"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Leave blank for default test message
          </p>
        </div>

        {/* Test Button */}
        <Button
          onClick={handleQuickTest}
          disabled={!isValid() || testing}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          size="lg"
        >
          {testing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Testing Agent...
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Run Test
            </>
          )}
        </Button>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900 dark:text-red-200">
                  Test Failed
                </p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="space-y-3">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900 dark:text-green-200">
                    Test Successful
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {result.testType.toUpperCase()}
                    </Badge>
                    {result.phoneNumber && (
                      <Badge variant="outline" className="text-xs">
                        {result.phoneNumber}
                      </Badge>
                    )}
                    {result.email && (
                      <Badge variant="outline" className="text-xs">
                        {result.email}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Test Input:
                </label>
                <div className="mt-1 p-3 bg-secondary border border-border rounded text-sm text-foreground">
                  {result.input}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Agent Response:
                </label>
                <div className="mt-1 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm text-foreground">
                  {result.output}
                </div>
              </div>

              {result.usage && (
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>Tokens: {result.usage.totalTokens || 'N/A'}</span>
                  <span>•</span>
                  <span>Time: {new Date(result.timestamp).toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs text-blue-900 dark:text-blue-200">
            💡 <strong>Tip:</strong> This test uses your current business profile information
            (company name, pricing, team members, etc.) automatically. Update your profile in
            Settings to change what the agent knows.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
