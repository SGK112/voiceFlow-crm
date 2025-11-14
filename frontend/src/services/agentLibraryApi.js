import api from './api';

/**
 * Agent Library API Service
 *
 * Handles all API calls for the agent library system
 */

const agentLibraryApi = {
  // Get all available agent templates
  getTemplates: async (category = null) => {
    const params = category ? { category } : {};
    return api.get('/agent-library/templates', { params });
  },

  // Get single template details
  getTemplate: async (templateId) => {
    return api.get(`/agent-library/templates/${templateId}`);
  },

  // Get user's configured agents
  getMyAgents: async (status = null) => {
    const params = status ? { status } : {};
    return api.get('/agent-library/my-agents', { params });
  },

  // Get single agent
  getAgent: async (agentId) => {
    return api.get(`/agent-library/my-agents/${agentId}`);
  },

  // Create agent from template
  createAgent: async (templateId, configuration, customName = null) => {
    return api.post('/agent-library/my-agents', {
      templateId,
      configuration,
      customName
    });
  },

  // Update agent configuration
  updateAgent: async (agentId, updates) => {
    return api.put(`/agent-library/my-agents/${agentId}`, updates);
  },

  // Activate agent
  activateAgent: async (agentId) => {
    return api.post(`/agent-library/my-agents/${agentId}/activate`);
  },

  // Pause agent
  pauseAgent: async (agentId) => {
    return api.post(`/agent-library/my-agents/${agentId}/pause`);
  },

  // Resume agent
  resumeAgent: async (agentId) => {
    return api.post(`/agent-library/my-agents/${agentId}/resume`);
  },

  // Archive agent
  archiveAgent: async (agentId) => {
    return api.delete(`/agent-library/my-agents/${agentId}`);
  },

  // Get agent statistics
  getAgentStats: async (agentId) => {
    return api.get(`/agent-library/my-agents/${agentId}/stats`);
  },

  // Get agent billing
  getAgentBilling: async (agentId) => {
    return api.get(`/agent-library/my-agents/${agentId}/billing`);
  },

  // Test agent
  testAgent: async (agentId, scenario = null) => {
    return api.post(`/agent-library/my-agents/${agentId}/test`, { scenario });
  },

  // Connect integration to agent
  connectIntegration: async (agentId, service) => {
    return api.post(`/agent-library/my-agents/${agentId}/integrations/${service}`);
  },

  // Disconnect integration from agent
  disconnectIntegration: async (agentId, service) => {
    return api.delete(`/agent-library/my-agents/${agentId}/integrations/${service}`);
  }
};

export default agentLibraryApi;
