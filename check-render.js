async function checkRender() {
  const renderUrl = 'https://personal-portfolio-yy5h.onrender.com';
  
  console.log(`1. Testing GET ${renderUrl}/api/projects...`);
  try {
    const res = await fetch(`${renderUrl}/api/projects`);
    console.log('GET projects status:', res.status);
    console.log('GET projects Content-Type:', res.headers.get('content-type'));
    const text = await res.text();
    console.log('GET projects body response (first 300 chars):');
    console.log(text.substring(0, 300));
  } catch (err) {
    console.error('GET projects failed:', err.message);
  }

  console.log(`\n2. Testing POST ${renderUrl}/api/login...`);
  try {
    const res = await fetch(`${renderUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'admin123' })
    });
    console.log('POST login status:', res.status);
    console.log('POST login Content-Type:', res.headers.get('content-type'));
    const text = await res.text();
    console.log('POST login body response:');
    console.log(text);
  } catch (err) {
    console.error('POST login failed:', err.message);
  }
}

checkRender().catch(console.error);
