import fetch from 'node-fetch';

// MongoDB Atlas API credentials
const PUBLIC_KEY = process.env.MONGODB_ATLAS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY';
const PRIVATE_KEY = process.env.MONGODB_ATLAS_PRIVATE_KEY || 'YOUR_PRIVATE_KEY';
const PROJECT_ID = process.env.MONGODB_ATLAS_PROJECT_ID || 'YOUR_PROJECT_ID';

async function getClusterInfo() {
  try {
    console.log('🔍 Fetching MongoDB Atlas cluster information...\n');

    // Get clusters in the project
    const clustersUrl = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${PROJECT_ID}/clusters`;

    const response = await fetch(clustersUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${PUBLIC_KEY}:${PRIVATE_KEY}`).toString('base64')
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      console.log('❌ No clusters found in this project.');
      console.log('\n💡 Make sure your API keys have the correct permissions and Project ID is correct.');
      return;
    }

    console.log('✅ Found clusters:\n');

    data.results.forEach((cluster, index) => {
      console.log(`${index + 1}. Cluster: ${cluster.name}`);
      console.log(`   State: ${cluster.stateName}`);
      console.log(`   Version: ${cluster.mongoDBVersion}`);
      console.log(`   Region: ${cluster.providerSettings.regionName}`);

      // Build connection string
      const srvHost = cluster.srvAddress || cluster.connectionStrings?.standardSrv;

      console.log('\n   📝 Connection String Format:');
      console.log(`   mongodb+srv://<username>:<password>@${srvHost}/voiceflow-crm?retryWrites=true&w=majority`);
      console.log('\n   Replace <username> and <password> with your database user credentials.');
      console.log('   (NOT your API keys - your database user from Atlas → Database Access)\n');
      console.log('   ---\n');
    });

    console.log('💡 To create a database user:');
    console.log('   1. Go to Atlas Dashboard → Database Access');
    console.log('   2. Click "Add New Database User"');
    console.log('   3. Username: voiceflow-admin');
    console.log('   4. Password: (generate strong password)');
    console.log('   5. Database User Privileges: "Read and write to any database"');
    console.log('   6. Add User\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   - Check your API keys are correct');
    console.log('   - Verify Project ID is correct (find it in Atlas URL)');
    console.log('   - Ensure API keys have "Project Read Only" or higher permissions');
  }
}

getClusterInfo();
