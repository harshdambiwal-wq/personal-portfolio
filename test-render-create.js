async function testCreate() {
  const renderUrl = 'https://personal-portfolio-yy5h.onrender.com';
  const password = 'admin123';

  console.log('Logging in...');
  const loginRes = await fetch(`${renderUrl}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  
  if (!loginRes.ok) {
    throw new Error(`Login failed: ${await loginRes.text()}`);
  }
  
  const { token } = await loginRes.json();
  console.log('Token acquired:', token.substring(0, 15) + '...');

  console.log('Sending POST /api/projects...');
  const payload = {
    title: 'Render Test Project',
    description: 'Testing if Render backend can publish successfully with JSON.',
    imageUrl: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80',
    projectUrl: 'https://github.com/harshdambiwal-wq',
    techStack: 'Test, Render, JSON',
    featured: true
  };

  const createRes = await fetch(`${renderUrl}/api/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  console.log('Status code:', createRes.status);
  console.log('Content-Type:', createRes.headers.get('content-type'));
  
  const responseText = await createRes.text();
  console.log('Response body:');
  console.log(responseText);
}

testCreate().catch(console.error);
