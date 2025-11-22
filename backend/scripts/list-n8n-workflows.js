import N8nService from '../services/n8nService.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function listWorkflows() {
  console.log('🔍 Fetching n8n workflows...\n');

  const n8nService = new N8nService();

  try {
    const workflows = await n8nService.listWorkflows();

    if (!workflows || workflows.length === 0) {
      console.log('📭 No workflows found in your n8n instance.');
      return;
    }

    console.log(`✅ Found ${workflows.data?.length || workflows.length || 0} workflows:\n`);
    console.log('═══════════════════════════════════════════════════════════════════\n');

    const workflowList = workflows.data || workflows;

    workflowList.forEach((workflow, index) => {
      console.log(`${index + 1}. ${workflow.name}`);
      console.log(`   ID: ${workflow.id}`);
      console.log(`   Active: ${workflow.active ? '✅ Yes' : '❌ No'}`);
      console.log(`   Created: ${workflow.createdAt ? new Date(workflow.createdAt).toLocaleString() : 'Unknown'}`);
      console.log(`   Updated: ${workflow.updatedAt ? new Date(workflow.updatedAt).toLocaleString() : 'Unknown'}`);
      if (workflow.tags && workflow.tags.length > 0) {
        console.log(`   Tags: ${workflow.tags.map(t => t.name || t).join(', ')}`);
      }
      console.log('');
    });

    console.log('═══════════════════════════════════════════════════════════════════');
    console.log(`\n📊 Summary:`);
    console.log(`   Total workflows: ${workflowList.length}`);
    console.log(`   Active: ${workflowList.filter(w => w.active).length}`);
    console.log(`   Inactive: ${workflowList.filter(w => !w.active).length}`);

  } catch (error) {
    console.error('❌ Error fetching workflows:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

listWorkflows();
