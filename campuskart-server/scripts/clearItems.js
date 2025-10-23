import pg from 'pg';

const client = new pg.Client({
  connectionString: 'postgresql://postgres:campuskart321%23@db.vmfguxktshrbbwrdisla.supabase.co:5432/postgres'
});

try {
  await client.connect();
  console.log('✅ Connected to PostgreSQL');
  
  // First, check how many items exist
  const countRes = await client.query('SELECT COUNT(*) FROM items');
  const itemCount = parseInt(countRes.rows[0].count);
  
  console.log(`\n📦 Found ${itemCount} items in database`);
  
  if (itemCount === 0) {
    console.log('✅ Database is already empty!');
    await client.end();
    process.exit(0);
  }
  
  // Show items before deletion
  const itemsRes = await client.query('SELECT id, title, "imageUrl" FROM items ORDER BY "createdAt" DESC');
  console.log('\n🗑️  Items to be deleted:');
  itemsRes.rows.forEach((item, index) => {
    console.log(`   ${index + 1}. ${item.title} (ID: ${item.id})`);
    console.log(`      Image: ${item.imageUrl || 'No image'}`);
  });
  
  // Delete all items
  console.log('\n⚠️  Deleting all items...');
  const deleteRes = await client.query('DELETE FROM items');
  
  console.log(`✅ Successfully deleted ${deleteRes.rowCount} items!`);
  console.log('\n💡 You can now create new items with working cloud-hosted images.');
  
  await client.end();
} catch (error) {
  console.error('❌ Error:', error.message);
  await client.end();
  process.exit(1);
}
