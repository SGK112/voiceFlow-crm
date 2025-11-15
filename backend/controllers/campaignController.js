import Campaign from '../models/Campaign.js';
import VoiceAgent from '../models/VoiceAgent.js';
import CallLog from '../models/CallLog.js';
import User from '../models/User.js';
import PhoneNumber from '../models/PhoneNumber.js';
import ElevenLabsService from '../services/elevenLabsService.js';
import TwilioService from '../services/twilioService.js';
import csv from 'csv-parser';
import { Readable } from 'stream';

// Lazy initialization to ensure env vars are loaded
let elevenLabsServiceInstance = null;
const getElevenLabsService = () => {
  if (!elevenLabsServiceInstance) {
    elevenLabsServiceInstance = new ElevenLabsService(process.env.ELEVENLABS_API_KEY);
  }
  return elevenLabsServiceInstance;
};
const twilioService = new TwilioService();

// Get all campaigns for user
export const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ userId: req.user._id })
      .populate('agentId', 'name type')
      .sort({ createdAt: -1 });

    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single campaign
export const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('agentId', 'name type voiceId script');

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new campaign
export const createCampaign = async (req, res) => {
  try {
    const { name, description, agentId, type, schedule, settings, script } = req.body;

    // Verify agent exists and belongs to user
    const agent = await VoiceAgent.findOne({
      _id: agentId,
      userId: req.user._id
    });

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    const campaign = await Campaign.create({
      userId: req.user._id,
      agentId,
      name,
      description,
      type: type || 'outbound',
      schedule: schedule || {},
      settings: settings || {},
      script: script || { template: agent.script, variables: [] },
      contacts: [],
      stats: {
        totalContacts: 0,
        completed: 0,
        failed: 0,
        noAnswer: 0,
        busy: 0,
        totalDuration: 0,
        totalCost: 0,
        leadsGenerated: 0,
        appointmentsBooked: 0
      }
    });

    res.status(201).json(campaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update campaign
export const updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const { name, description, schedule, settings, script, status } = req.body;

    if (name) campaign.name = name;
    if (description !== undefined) campaign.description = description;
    if (schedule) campaign.schedule = { ...campaign.schedule, ...schedule };
    if (settings) campaign.settings = { ...campaign.settings, ...settings };
    if (script) campaign.script = { ...campaign.script, ...script };
    if (status) campaign.status = status;

    await campaign.save();
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete campaign
export const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Don't allow deleting running campaigns
    if (campaign.status === 'running') {
      return res.status(400).json({
        message: 'Cannot delete a running campaign. Please pause it first.'
      });
    }

    await campaign.deleteOne();
    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload contacts via CSV
export const uploadContacts = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.status === 'running') {
      return res.status(400).json({
        message: 'Cannot upload contacts to a running campaign'
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No CSV file uploaded' });
    }

    const contacts = [];
    const csvString = req.file.buffer.toString();

    // Parse CSV
    const stream = Readable.from(csvString);

    stream
      .pipe(csv())
      .on('data', (row) => {
        // Expected columns: name, phone, email, company, and any custom fields
        if (row.phone) {
          const contact = {
            name: row.name || '',
            phone: row.phone,
            email: row.email || '',
            company: row.company || '',
            customFields: {},
            status: 'pending',
            callAttempts: 0
          };

          // Add any additional fields as custom fields
          Object.keys(row).forEach(key => {
            if (!['name', 'phone', 'email', 'company'].includes(key)) {
              contact.customFields[key] = row[key];
            }
          });

          contacts.push(contact);
        }
      })
      .on('end', async () => {
        campaign.contacts = campaign.contacts.concat(contacts);
        campaign.stats.totalContacts = campaign.contacts.length;
        await campaign.save();

        res.json({
          message: `Successfully uploaded ${contacts.length} contacts`,
          totalContacts: campaign.contacts.length
        });
      })
      .on('error', (error) => {
        res.status(500).json({ message: 'Error parsing CSV: ' + error.message });
      });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add single contact
export const addContact = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const { name, phone, email, company, customFields } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    campaign.contacts.push({
      name,
      phone,
      email,
      company,
      customFields: customFields || {},
      status: 'pending',
      callAttempts: 0
    });

    campaign.stats.totalContacts = campaign.contacts.length;
    await campaign.save();

    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Start campaign
export const startCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('agentId');

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.contacts.length === 0) {
      return res.status(400).json({
        message: 'Cannot start campaign with no contacts'
      });
    }

    if (!campaign.agentId.elevenLabsAgentId) {
      return res.status(400).json({
        message: 'Agent is not properly configured with ElevenLabs'
      });
    }

    campaign.status = 'running';
    await campaign.save();

    // Start the calling process (this will be handled by a background worker)
    // For now, we'll just return success
    res.json({
      message: 'Campaign started successfully',
      campaign
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Pause campaign
export const pauseCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    campaign.status = 'paused';
    await campaign.save();

    res.json({
      message: 'Campaign paused successfully',
      campaign
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Resume campaign
export const resumeCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    campaign.status = 'running';
    await campaign.save();

    res.json({
      message: 'Campaign resumed successfully',
      campaign
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get campaign statistics
export const getCampaignStats = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Get detailed call logs for this campaign
    const calls = await CallLog.find({
      agentId: campaign.agentId,
      createdAt: { $gte: campaign.createdAt }
    }).sort({ createdAt: -1 });

    const stats = {
      ...campaign.stats.toObject(),
      successRate: campaign.stats.totalContacts > 0
        ? ((campaign.stats.completed / campaign.stats.totalContacts) * 100).toFixed(2)
        : 0,
      avgDuration: campaign.stats.completed > 0
        ? (campaign.stats.totalDuration / campaign.stats.completed).toFixed(2)
        : 0,
      conversionRate: campaign.stats.completed > 0
        ? ((campaign.stats.leadsGenerated / campaign.stats.completed) * 100).toFixed(2)
        : 0,
      recentCalls: calls.slice(0, 10)
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Process next call in campaign (called by background worker)
export const processNextCall = async (campaignId) => {
  try {
    const campaign = await Campaign.findById(campaignId).populate('agentId userId');

    if (!campaign || campaign.status !== 'running') {
      return null;
    }

    // Check if we should be calling now
    if (!campaign.shouldCallNow()) {
      return null;
    }

    // Get next contact to call
    const contact = campaign.getNextContact();
    if (!contact) {
      // No more contacts to call
      campaign.status = 'completed';
      await campaign.save();
      return null;
    }

    // Replace variables in script
    let personalizedScript = campaign.script.template;
    if (campaign.script.variables && campaign.script.variables.length > 0) {
      campaign.script.variables.forEach(variable => {
        const value = contact[variable] || contact.customFields?.[variable] || '';
        personalizedScript = personalizedScript.replace(
          new RegExp(`{{${variable}}}`, 'g'),
          value
        );
      });
    }

    // Update contact status
    const contactIndex = campaign.contacts.findIndex(c => c._id.equals(contact._id));
    campaign.contacts[contactIndex].status = 'calling';
    campaign.contacts[contactIndex].callAttempts++;
    campaign.contacts[contactIndex].lastCallDate = new Date();
    await campaign.save();

    // Get available phone number from pool
    const phoneNumber = await PhoneNumber.getAvailableNumber('outbound');
    if (!phoneNumber) {
      throw new Error('No available phone numbers in pool');
    }

    // Initiate call via Twilio + ElevenLabs
    try {
      const callResult = await twilioService.makeCallWithElevenLabs(
        phoneNumber.phoneNumber,
        contact.phone,
        campaign.agentId.elevenLabsAgentId
      );

      // Create call log
      const callLog = await CallLog.create({
        userId: campaign.userId._id,
        agentId: campaign.agentId._id,
        callerName: contact.name,
        callerPhone: contact.phone,
        direction: 'outbound',
        status: 'completed',
        elevenLabsCallId: callResult.sid, // Twilio call SID
        metadata: {
          campaignId: campaign._id.toString(),
          contactId: contact._id.toString(),
          twilioCallSid: callResult.sid,
          fromNumber: phoneNumber.phoneNumber
        }
      });

      // Update contact with call log reference
      campaign.contacts[contactIndex].callLogId = callLog._id;
      await campaign.save();

      return { success: true, callLog, contact };
    } catch (error) {
      console.error('Failed to initiate call:', error);

      // Mark contact as failed
      campaign.contacts[contactIndex].status = 'failed';
      await campaign.save();

      return { success: false, error: error.message };
    }

  } catch (error) {
    console.error('Error processing campaign call:', error);
    return null;
  }
};

export default {
  getCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  uploadContacts,
  addContact,
  startCampaign,
  pauseCampaign,
  resumeCampaign,
  getCampaignStats,
  processNextCall
};
