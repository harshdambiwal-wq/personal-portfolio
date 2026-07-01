async function inspect() {
  const vercelUrl = 'https://personal-portfolio-jade-two-11.vercel.app';
  console.log('Fetching Vercel frontend HTML...');
  const res = await fetch(vercelUrl);
  const html = await res.text();
  
  // Find javascript asset files (e.g. index-*.js)
  const regex = /\/assets\/index-[a-zA-Z0-9_-]+\.js/g;
  const matches = html.match(regex);
  if (!matches) {
    console.log('No javascript bundle matches found in HTML.');
    console.log(html);
    return;
  }
  
  const jsUrl = `${vercelUrl}${matches[0]}`;
  console.log(`Fetching Javascript bundle: ${jsUrl}...`);
  
  const jsRes = await fetch(jsUrl);
  const jsCode = await jsRes.text();
  
  console.log('\nSearching for API Base / localhost / Render URL references inside JavaScript bundle:');
  
  // Find where it connects to backend
  // Look for any string containing localhost:5000 or onrender.com
  const renderRegex = /https:\/\/[a-zA-Z0-9_-]+\.onrender\.com/g;
  const renderMatches = jsCode.match(renderRegex);
  
  const localhostRegex = /localhost:5000/g;
  const localhostMatches = jsCode.match(localhostRegex);

  console.log('onrender.com matches:', renderMatches);
  console.log('localhost:5000 matches:', localhostMatches);
  
  // Let's print out the config definition snippet
  const configSnippetIndex = jsCode.indexOf('VITE_API_BASE_URL');
  if (configSnippetIndex !== -1) {
    console.log('VITE_API_BASE_URL code snippet:', jsCode.substring(configSnippetIndex - 50, configSnippetIndex + 150));
  } else {
    console.log('VITE_API_BASE_URL string not found literally (might be minimized/replaced by Vite).');
  }

  // Look for '/api/projects' or '/api/login' requests in JS
  const requestSnippetIndex = jsCode.indexOf('/api/login');
  if (requestSnippetIndex !== -1) {
    console.log('Request snippet around /api/login:', jsCode.substring(requestSnippetIndex - 100, requestSnippetIndex + 200));
  }
}

inspect().catch(console.error);
