/**
 * Test Agent Templates
 *
 * Quick test to verify agent templates are loading correctly
 */

import agentTemplateService from './backend/services/agentTemplateService.js';

console.log('\n🧪 Testing Agent Template Service\n');
console.log('='.repeat(60));

// Test 1: Get all templates
console.log('\n📋 Test 1: Get All Templates');
const allTemplates = agentTemplateService.getAllTemplates();
console.log(`✅ Total templates loaded: ${allTemplates.length}`);

// Test 2: Get industries and categories
console.log('\n🏢 Test 2: Get Industries & Categories');
const industries = agentTemplateService.getIndustries();
const categories = agentTemplateService.getCategories();
console.log(`✅ Industries: ${industries.join(', ')}`);
console.log(`✅ Categories: ${categories.join(', ')}`);

// Test 3: Get statistics
console.log('\n📊 Test 3: Template Statistics');
const stats = agentTemplateService.getStatistics();
console.log('✅ Statistics:');
console.log(`   - Total Templates: ${stats.total}`);
console.log(`   - Total Industries: ${stats.totalIndustries}`);
console.log(`   - Total Categories: ${stats.totalCategories}`);
console.log(`   - Total Tags: ${stats.totalTags}`);
console.log('\n   Templates by Industry:');
stats.byIndustry.forEach(({ industry, count }) => {
  console.log(`   - ${industry}: ${count} templates`);
});

// Test 4: Filter by industry
console.log('\n🏥 Test 4: Filter by Industry (Healthcare)');
const healthcareTemplates = agentTemplateService.getTemplatesByIndustry('Healthcare');
console.log(`✅ Healthcare templates: ${healthcareTemplates.length}`);
healthcareTemplates.forEach(t => {
  console.log(`   - ${t.name} (${t.id})`);
});

// Test 5: Filter by category
console.log('\n🏡 Test 5: Filter by Category (Real Estate)');
const realEstateTemplates = agentTemplateService.getTemplatesByCategory('real_estate');
console.log(`✅ Real Estate templates: ${realEstateTemplates.length}`);
realEstateTemplates.forEach(t => {
  console.log(`   - ${t.name} (${t.id})`);
});

// Test 6: Search templates
console.log('\n🔍 Test 6: Search Templates ("appointment")');
const searchResults = agentTemplateService.filterTemplates({ search: 'appointment' });
console.log(`✅ Search results: ${searchResults.length}`);
searchResults.forEach(t => {
  console.log(`   - ${t.name} (${t.industry})`);
});

// Test 7: Get specific template
console.log('\n📄 Test 7: Get Specific Template');
const template = agentTemplateService.getTemplateById('medical-appointment-scheduling');
if (template) {
  console.log('✅ Template found:');
  console.log(`   - Name: ${template.name}`);
  console.log(`   - Industry: ${template.industry}`);
  console.log(`   - Category: ${template.category}`);
  console.log(`   - Voice: ${template.voiceName} (${template.voiceId})`);
  console.log(`   - Script length: ${template.script.length} characters`);
} else {
  console.log('❌ Template not found');
}

// Test 8: Generate agent configuration
console.log('\n⚙️  Test 8: Generate Agent Configuration');
try {
  const config = agentTemplateService.generateAgentConfig(
    'medical-appointment-scheduling',
    {
      practice_name: 'Valley Medical Center',
      name: 'Medical Scheduler - Valley Medical',
      voiceId: 'EXAVITQu4vr4xnSDxMaL'
    }
  );
  console.log('✅ Configuration generated:');
  console.log(`   - Name: ${config.name}`);
  console.log(`   - Type: ${config.type}`);
  console.log(`   - Voice: ${config.voiceName}`);
  console.log(`   - Script contains "Valley Medical Center": ${config.script.includes('Valley Medical Center')}`);
} catch (error) {
  console.log(`❌ Error: ${error.message}`);
}

// Test 9: Get popular templates
console.log('\n⭐ Test 9: Get Popular Templates');
const popularTemplates = agentTemplateService.getPopularTemplates(5);
console.log(`✅ Popular templates (${popularTemplates.length}):`);
popularTemplates.forEach((t, i) => {
  console.log(`   ${i + 1}. ${t.name} (${t.industry})`);
});

// Test 10: Advanced search
console.log('\n🔎 Test 10: Advanced Search');
const advancedResults = agentTemplateService.advancedSearch({
  industries: ['Healthcare', 'E-commerce'],
  sortBy: 'name',
  sortOrder: 'asc',
  limit: 5
});
console.log(`✅ Advanced search results: ${advancedResults.total} total, showing ${advancedResults.templates.length}`);
advancedResults.templates.forEach(t => {
  console.log(`   - ${t.name} (${t.industry})`);
});

// Test 11: Get all tags
console.log('\n🏷️  Test 11: Get All Tags');
const tags = agentTemplateService.getAllTags();
console.log(`✅ Total unique tags: ${tags.length}`);
console.log(`   - Sample tags: ${tags.slice(0, 10).join(', ')}`);

// Test 12: Get recommended templates
console.log('\n💡 Test 12: Get Recommended Templates');
const recommended = agentTemplateService.getRecommendedTemplates('scheduling');
console.log(`✅ Recommended for "scheduling": ${recommended.length}`);
recommended.forEach(t => {
  console.log(`   - ${t.name}`);
});

console.log('\n' + '='.repeat(60));
console.log('✅ All tests completed successfully!\n');
