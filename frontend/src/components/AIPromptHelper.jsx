import { useState } from 'react';
import { Sparkles, Lightbulb, Wand2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import api from '../lib/api';

export default function AIPromptHelper({ script, agentType, onScriptUpdate }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);
  const [aiAvailable, setAiAvailable] = useState(true);

  // Check AI availability on mount
  useState(() => {
    const checkAvailability = async () => {
      try {
        const response = await api.get('/ai/availability');
        setAiAvailable(response.data.available);
      } catch (err) {
        console.error('Failed to check AI availability:', err);
        setAiAvailable(false);
      }
    };
    checkAvailability();
  }, []);

  const improveScript = async () => {
    if (!script || !script.trim()) {
      setError('Please enter a script first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/ai/improve-script', {
        script,
        agentType,
        context: {
          industry: 'General'
        }
      });

      onScriptUpdate(response.data.improved);
      setIsExpanded(false);
    } catch (err) {
      console.error('Failed to improve script:', err);
      setError(err.response?.data?.message || 'Failed to improve script');
    } finally {
      setIsLoading(false);
    }
  };

  const getSuggestions = async () => {
    if (!script || !script.trim()) {
      setError('Please enter a script first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      const response = await api.post('/ai/suggestions', {
        script,
        agentType
      });

      setSuggestions(response.data.suggestions);
      setIsExpanded(true);
    } catch (err) {
      console.error('Failed to get suggestions:', err);
      setError(err.response?.data?.message || 'Failed to get suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  const generateFromDescription = async () => {
    const description = prompt('Describe what you want your agent to do:');
    if (!description) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/ai/generate-script', {
        description,
        agentType,
        context: {
          industry: 'General'
        }
      });

      onScriptUpdate(response.data.script);
      setIsExpanded(false);
    } catch (err) {
      console.error('Failed to generate script:', err);
      setError(err.response?.data?.message || 'Failed to generate script');
    } finally {
      setIsLoading(false);
    }
  };

  if (!aiAvailable) {
    return (
      <Alert className="bg-muted/50">
        <Lightbulb className="h-4 w-4" />
        <AlertDescription className="text-sm">
          AI features are not configured. Add an AI provider API key to enable smart suggestions.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h3 className="font-semibold text-sm">AI Assistant</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-6 w-6 p-0"
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-1 mb-3">
        Get AI-powered suggestions to improve your agent script
      </p>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={improveScript}
          disabled={isLoading || !script}
          className="text-xs"
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <Wand2 className="h-3 w-3 mr-1" />
          )}
          Improve Script
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={getSuggestions}
          disabled={isLoading || !script}
          className="text-xs"
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <Lightbulb className="h-3 w-3 mr-1" />
          )}
          Get Suggestions
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={generateFromDescription}
          disabled={isLoading}
          className="text-xs"
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <Sparkles className="h-3 w-3 mr-1" />
          )}
          Generate
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-3">
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      {isExpanded && suggestions.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="font-semibold text-xs">Suggestions:</h4>
          {suggestions.map((suggestion, index) => (
            <div key={index} className="bg-white dark:bg-gray-900 rounded p-3 text-xs">
              <div className="font-semibold text-purple-600 dark:text-purple-400 mb-1">
                {suggestion.title}
              </div>
              <div className="text-muted-foreground">{suggestion.description}</div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
