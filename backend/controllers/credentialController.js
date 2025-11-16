import N8nCredentialService from '../services/n8nCredentialService.js';

const credentialService = new N8nCredentialService();

/**
 * Get all user credentials
 */
export const getCredentials = async (req, res) => {
  try {
    const credentials = await credentialService.getUserCredentials();
    res.json(credentials);
  } catch (error) {
    console.error('Error fetching credentials:', error);
    res.status(500).json({ message: 'Failed to fetch credentials' });
  }
};

/**
 * Check if user has a specific credential
 */
export const checkCredential = async (req, res) => {
  try {
    const { type } = req.params;
    const hasCredential = await credentialService.hasCredential(type);
    res.json({ hasCredential, type });
  } catch (error) {
    console.error('Error checking credential:', error);
    res.status(500).json({ message: 'Failed to check credential' });
  }
};

/**
 * Get OAuth URL for a credential type
 */
export const getOAuthUrl = async (req, res) => {
  try {
    const { type } = req.params;
    const callbackUrl = req.query.callback || `${process.env.CLIENT_URL}/app/workflows`;

    const oauthUrl = credentialService.getOAuthUrl(type, callbackUrl);

    res.json({
      oauthUrl,
      type,
      provider: credentialService.getRequiredCredential(type)?.provider
    });
  } catch (error) {
    console.error('Error getting OAuth URL:', error);
    res.status(500).json({ message: 'Failed to get OAuth URL' });
  }
};

/**
 * Check credentials for a workflow
 */
export const checkWorkflowCredentials = async (req, res) => {
  try {
    const { nodes } = req.body;

    if (!nodes || !Array.isArray(nodes)) {
      return res.status(400).json({ message: 'Nodes array required' });
    }

    const credentialStatus = await credentialService.checkWorkflowCredentials(nodes);

    res.json({
      credentials: credentialStatus,
      missingCount: credentialStatus.filter(c => !c.isConfigured).length,
      totalRequired: credentialStatus.length
    });
  } catch (error) {
    console.error('Error checking workflow credentials:', error);
    res.status(500).json({ message: 'Failed to check workflow credentials' });
  }
};

/**
 * Get popular credentials
 */
export const getPopularCredentials = async (req, res) => {
  try {
    const popular = credentialService.getPopularCredentials();
    const categories = credentialService.getCredentialCategories();

    res.json({ popular, categories });
  } catch (error) {
    console.error('Error getting popular credentials:', error);
    res.status(500).json({ message: 'Failed to get popular credentials' });
  }
};

/**
 * Get required credential info for a node type
 */
export const getNodeCredentialInfo = async (req, res) => {
  try {
    const { nodeType } = req.params;
    const credInfo = credentialService.getRequiredCredential(nodeType);

    if (!credInfo) {
      return res.json({ required: false });
    }

    const hasCredential = await credentialService.hasCredential(credInfo.type);

    res.json({
      required: true,
      ...credInfo,
      isConfigured: hasCredential,
      oauthUrl: credentialService.getOAuthUrl(
        credInfo.type,
        `${process.env.CLIENT_URL}/app/workflows`
      )
    });
  } catch (error) {
    console.error('Error getting node credential info:', error);
    res.status(500).json({ message: 'Failed to get credential info' });
  }
};

/**
 * Delete a credential
 */
export const deleteCredential = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await credentialService.deleteCredential(id);

    if (success) {
      res.json({ message: 'Credential deleted successfully' });
    } else {
      res.status(500).json({ message: 'Failed to delete credential' });
    }
  } catch (error) {
    console.error('Error deleting credential:', error);
    res.status(500).json({ message: 'Failed to delete credential' });
  }
};
