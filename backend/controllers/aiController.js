import AIService from '../services/aiService.js';
import VoiceAgent from '../models/VoiceAgent.js';
import CallLog from '../models/CallLog.js';
import User from '../models/User.js';

const aiService = new AIService();

/**
 * Check if AI service is available
 */
export const checkAIAvailability = async (req, res) => {
  try {
    res.json({
      available: aiService.isAvailable(),
      provider: aiService.activeProvider
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Improve an agent script with AI
 */
export const improveScript = async (req, res) => {
  try {
    if (!aiService.isAvailable()) {
      return res.status(503).json({
        message: 'AI service not available. Please configure an AI provider API key.'
      });
    }

    const { script, agentType, context } = req.body;

    if (!script) {
      return res.status(400).json({ message: 'Script is required' });
    }

    // Get user context
    const user = await User.findById(req.user._id);
    const fullContext = {
      companyName: user.companyName || context?.companyName,
      industry: context?.industry,
      goal: context?.goal
    };

    const improvedScript = await aiService.improveScript(script, agentType, fullContext);

    res.json({
      original: script,
      improved: improvedScript,
      provider: aiService.activeProvider
    });
  } catch (error) {
    console.error('Error improving script:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Generate script suggestions
 */
export const getScriptSuggestions = async (req, res) => {
  try {
    if (!aiService.isAvailable()) {
      return res.status(503).json({
        message: 'AI service not available'
      });
    }

    const { script, agentType } = req.body;

    if (!script) {
      return res.status(400).json({ message: 'Script is required' });
    }

    const suggestions = await aiService.generateScriptSuggestions(script, agentType);

    res.json({
      suggestions,
      provider: aiService.activeProvider
    });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Generate a complete script from description
 */
export const generateScript = async (req, res) => {
  try {
    if (!aiService.isAvailable()) {
      return res.status(503).json({
        message: 'AI service not available'
      });
    }

    const { description, agentType, context } = req.body;

    if (!description) {
      return res.status(400).json({ message: 'Description is required' });
    }

    // Get user context
    const user = await User.findById(req.user._id);
    const fullContext = {
      companyName: user.companyName || context?.companyName,
      industry: context?.industry
    };

    const script = await aiService.generateScript(description, agentType, fullContext);

    res.json({
      script,
      provider: aiService.activeProvider
    });
  } catch (error) {
    console.error('Error generating script:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Analyze agent performance with AI insights
 */
export const analyzeAgentPerformance = async (req, res) => {
  try {
    if (!aiService.isAvailable()) {
      return res.status(503).json({
        message: 'AI service not available'
      });
    }

    const { agentId } = req.params;

    // Get agent
    const agent = await VoiceAgent.findOne({ _id: agentId, userId: req.user._id });
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Get recent calls (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const calls = await CallLog.find({
      agentId: agentId,
      createdAt: { $gte: thirtyDaysAgo }
    }).limit(50);

    if (calls.length === 0) {
      return res.json({
        message: 'Not enough call data for analysis',
        summary: 'No calls found in the last 30 days',
        insights: [],
        recommendations: []
      });
    }

    const agentInfo = {
      name: agent.name,
      type: agent.type
    };

    const analysis = await aiService.analyzeCallData(calls, agentInfo);

    res.json({
      ...analysis,
      totalCalls: calls.length,
      provider: aiService.activeProvider
    });
  } catch (error) {
    console.error('Error analyzing agent performance:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get call insights for dashboard
 */
export const getCallInsights = async (req, res) => {
  try {
    if (!aiService.isAvailable()) {
      return res.status(503).json({
        message: 'AI service not available'
      });
    }

    // Get all user's agents
    const agents = await VoiceAgent.find({ userId: req.user._id });

    if (agents.length === 0) {
      return res.json({
        message: 'No agents found',
        insights: []
      });
    }

    // Get recent calls across all agents
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const calls = await CallLog.find({
      agentId: { $in: agents.map(a => a._id) },
      createdAt: { $gte: thirtyDaysAgo }
    }).limit(100);

    if (calls.length === 0) {
      return res.json({
        message: 'Not enough call data',
        insights: []
      });
    }

    // Basic aggregation
    const totalCalls = calls.length;
    const successfulCalls = calls.filter(c => c.status === 'completed').length;
    const avgDuration = calls.reduce((sum, c) => sum + (c.duration || 0), 0) / calls.length;

    const insights = [
      {
        title: 'Call Volume',
        value: totalCalls,
        description: `${totalCalls} calls in the last 30 days`,
        trend: 'neutral'
      },
      {
        title: 'Success Rate',
        value: `${((successfulCalls / totalCalls) * 100).toFixed(1)}%`,
        description: `${successfulCalls} successful calls out of ${totalCalls}`,
        trend: successfulCalls / totalCalls > 0.7 ? 'up' : 'down'
      },
      {
        title: 'Avg Duration',
        value: `${Math.round(avgDuration)}s`,
        description: 'Average call duration',
        trend: 'neutral'
      }
    ];

    res.json({
      insights,
      totalCalls,
      successfulCalls,
      avgDuration: Math.round(avgDuration),
      provider: aiService.activeProvider
    });
  } catch (error) {
    console.error('Error getting call insights:', error);
    res.status(500).json({ message: error.message });
  }
};
