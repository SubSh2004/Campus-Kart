import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// PRODUCTION DATABASE - Use environment variable
const client = new pg.Client({
  connectionString: process.env.POSTGRES_URI,
  ssl: {
    rejectUnauthorized: false
  }
});

try {
  await client.connect();
  console.log('✅ Connected to PRODUCTION PostgreSQL (Render)');
  
  // First, check how many items exist
  const countRes = await client.query('SELECT COUNT(*) FROM items');
  const itemCount = parseInt(countRes.rows[0].count);
  
  console.log(`\n📦 Found ${itemCount} items in PRODUCTION database`);
  
  if (itemCount === 0) {
    console.log('✅ Production database is already empty!');
    await client.end();
    process.exit(0);
  }
  
  // Show items before deletion
  const itemsRes = await client.query('SELECT id, title, "imageUrl" FROM items ORDER BY "createdAt" DESC');
  console.log('\n🗑️  Items to be deleted from PRODUCTION:');
  itemsRes.rows.forEach((item, index) => {
    console.log(`   ${index + 1}. ${item.title} (ID: ${item.id})`);
    console.log(`      Image: ${item.imageUrl || 'No image'}`);
  });
  
  // Delete all items
  console.log('\n⚠️  Deleting all items from PRODUCTION...');
  const deleteRes = await client.query('DELETE FROM items');
  
  console.log(`✅ Successfully deleted ${deleteRes.rowCount} items from PRODUCTION!`);
  console.log('\n💡 Now add IMGBB_API_KEY to Render, then create new items with working cloud images.');
  
  await client.end();
} catch (error) {
  console.error('❌ Error:', error.message);
  await client.end();
  process.exit(1);
}
