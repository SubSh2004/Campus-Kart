import pg from 'pg';

const client = new pg.Client({
  connectionString: 'postgresql://postgres:campuskart321%23@db.vmfguxktshrbbwrdisla.supabase.co:5432/postgres'
});

try {
  await client.connect();
  console.log('✅ Connected to PostgreSQL');
  
  const res = await client.query('SELECT id, title, "imageUrl", "createdAt" FROM items ORDER BY "createdAt" DESC LIMIT 10');
  
  console.log('\n📦 Recent items in database:');
  console.log('Total items:', res.rows.length);
  console.log('\n');
  
  res.rows.forEach((item, index) => {
    console.log(`${index + 1}. ${item.title}`);
    console.log(`   Image URL: ${item.imageUrl || 'No image'}`);
    console.log(`   Created: ${item.createdAt}`);
    console.log('');
  });
  
  await client.end();
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
