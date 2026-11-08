import assert from 'node:assert/strict';

const origin = process.argv[2];
if (!origin) {
  console.error('Usage: node scripts/check-deployment.mjs https://your-deployment.vercel.app');
  process.exit(1);
}

async function request(path) {
  const response = await fetch(new URL(path, origin), { signal: AbortSignal.timeout(15000) });
  assert.equal(response.status, 200, `${path} returned HTTP ${response.status}`);
  return response;
}

try {
  let html;
  for (const path of ['/', '/login', '/dashboard', '/expenses', '/budget', '/accounts', '/categories', '/settings']) {
    const response = await request(path);
    assert.match(response.headers.get('content-type') || '', /text\/html/, `${path} must return HTML`);
    html = await response.text();
    assert.match(html, /<div\s+id="root"/, `${path} must serve the React application`);
    console.log(`PASS ${path}`);
  }

  const script = html.match(/<script[^>]+src="([^\"]+)"/);
  assert.ok(script, 'The page must reference a JavaScript bundle');
  const asset = await request(script[1]);
  assert.match(asset.headers.get('content-type') || '', /javascript/, 'The bundle must return JavaScript');
  console.log(`PASS ${script[1]}`);

  for (const prefix of ['/api', '/_/backend/api']) {
    const response = await request(`${prefix}/health`);
    assert.match(response.headers.get('content-type') || '', /application\/json/);
    assert.equal((await response.json()).success, true);
    console.log(`PASS ${prefix}/health`);
  }

  const currencies = await request('/_/backend/api/currencies');
  const data = await currencies.json();
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.currencies), 'Currencies must be a JSON array');
  console.log('PASS /_/backend/api/currencies');
} catch (error) {
  console.error(`FAIL ${error.message}`);
  process.exitCode = 1;
}
