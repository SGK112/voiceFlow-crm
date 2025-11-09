import express from 'express';
import Deal from '../models/Deal.js';
import { protect } from '../middleware/auth.js';
import N8nWorkflow from '../models/N8nWorkflow.js';
import axios from 'axios';

const router = express.Router();

// Get all deals for user
router.get('/', protect, async (req, res) => {
  try {
    const { stage, assignedTo, priority, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const filter = { user: req.user._id };

    if (stage) filter.stage = stage;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const deals = await Deal.find(filter)
      .populate('contact', 'name email phone company')
      .populate('assignedTo', 'name email')
      .sort(sort);

    res.json(deals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pipeline summary
router.get('/pipeline/summary', protect, async (req, res) => {
  try {
    const pipeline = await Deal.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 },
          totalValue: { $sum: '$value' },
          avgValue: { $avg: '$value' },
          weightedValue: { $sum: { $multiply: ['$value', { $divide: ['$probability', 100] }] } }
        }
      }
    ]);

    const summary = {
      stages: pipeline.reduce((acc, stage) => {
        acc[stage._id] = {
          count: stage.count,
          totalValue: stage.totalValue,
          avgValue: stage.avgValue,
          weightedValue: stage.weightedValue
        };
        return acc;
      }, {}),
      overall: {
        totalDeals: pipeline.reduce((sum, s) => sum + s.count, 0),
        totalValue: pipeline.reduce((sum, s) => sum + s.totalValue, 0),
        weightedValue: pipeline.reduce((sum, s) => sum + s.weightedValue, 0)
      }
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single deal
router.get('/:id', protect, async (req, res) => {
  try {
    const deal = await Deal.findOne({ _id: req.params.id, user: req.user._id })
      .populate('contact')
      .populate('assignedTo', 'name email')
      .populate('relatedCalls')
      .populate('relatedCampaigns');

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    res.json(deal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new deal
router.post('/', protect, async (req, res) => {
  try {
    const deal = new Deal({
      ...req.body,
      user: req.user._id
    });

    await deal.save();
    await deal.populate('contact', 'name email phone company');

    // Trigger n8n workflows for "deal_created" event
    await triggerN8nWorkflows(req.user._id, 'deal_created', deal);

    res.status(201).json(deal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update deal
router.patch('/:id', protect, async (req, res) => {
  try {
    const oldDeal = await Deal.findOne({ _id: req.params.id, user: req.user._id });
    if (!oldDeal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    const oldStage = oldDeal.stage;

    Object.assign(oldDeal, req.body);
    await oldDeal.save();
    await oldDeal.populate('contact', 'name email phone company');
    await oldDeal.populate('assignedTo', 'name email');

    // Trigger workflows on stage change
    if (oldStage !== oldDeal.stage) {
      await triggerN8nWorkflows(req.user._id, 'deal_stage_changed', {
        ...oldDeal.toObject(),
        oldStage,
        newStage: oldDeal.stage
      });

      // Specific events for won/lost
      if (oldDeal.stage === 'won') {
        await triggerN8nWorkflows(req.user._id, 'deal_won', oldDeal);
      } else if (oldDeal.stage === 'lost') {
        await triggerN8nWorkflows(req.user._id, 'deal_lost', oldDeal);
      }
    }

    res.json(oldDeal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete deal
router.delete('/:id', protect, async (req, res) => {
  try {
    const deal = await Deal.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    res.json({ message: 'Deal deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Move deal to stage
router.patch('/:id/stage', protect, async (req, res) => {
  try {
    const { stage } = req.body;

    if (!['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost'].includes(stage)) {
      return res.status(400).json({ error: 'Invalid stage' });
    }

    const deal = await Deal.findOne({ _id: req.params.id, user: req.user._id });
    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    const oldStage = deal.stage;
    deal.stage = stage;
    await deal.save();

    await triggerN8nWorkflows(req.user._id, 'deal_stage_changed', {
      ...deal.toObject(),
      oldStage,
      newStage: stage
    });

    res.json(deal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Helper function to trigger n8n workflows
async function triggerN8nWorkflows(userId, event, dealData) {
  try {
    const workflows = await N8nWorkflow.find({
      user: userId,
      isActive: true,
      trigger: event
    });

    for (const workflow of workflows) {
      try {
        const webhookUrl = `${process.env.N8N_WEBHOOK_URL}${workflow.webhookId}`;
        const response = await axios.post(webhookUrl, {
          event,
          deal: dealData,
          timestamp: new Date()
        }, {
          headers: {
            'Content-Type': 'application/json',
            'X-N8N-API-KEY': process.env.N8N_API_KEY
          },
          timeout: 5000
        });

        // Log the workflow trigger
        if (dealData._id) {
          await Deal.updateOne(
            { _id: dealData._id },
            {
              $push: {
                triggeredWorkflows: {
                  workflowId: workflow._id,
                  triggeredAt: new Date(),
                  event,
                  response: response.data
                }
              }
            }
          );
        }
      } catch (error) {
        console.error(`Failed to trigger workflow ${workflow.name}:`, error.message);
      }
    }
  } catch (error) {
    console.error('Error triggering n8n workflows:', error.message);
  }
}

export default router;
