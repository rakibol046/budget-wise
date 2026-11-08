import assert from 'node:assert/strict';
import { once } from 'node:events';
import { after, before, mock, test } from 'node:test';
import app from '../src/app.js';
import Currency from '../src/models/Currency.js';

let server;
let baseURL;

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  baseURL = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server.closeAllConnections();
  await new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
});

for (const prefix of ['/api', '/_/backend/api']) {
  test(`${prefix}/health returns JSON`, async () => {
    const res = await fetch(`${baseURL}${prefix}/health`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /application\/json/);
    assert.equal((await res.json()).success, true);
  });

  test(`${prefix}/currencies reaches the public controller`, async () => {
    const currencies = [{ code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' }];
    const find = mock.method(Currency, 'find', () => ({ sort: async () => currencies }));
    try {
      const res = await fetch(`${baseURL}${prefix}/currencies`);
      assert.equal(res.status, 200);
      assert.deepEqual(await res.json(), { success: true, currencies });
    } finally {
      find.mock.restore();
    }
  });

  test(`${prefix} protects user data routes`, async () => {
    for (const path of ['/categories', '/accounts', '/expenses?month=2026-11', '/expenses/yearly/2026', '/budget/insights/2026-11']) {
      const res = await fetch(`${baseURL}${prefix}${path}`);
      assert.equal(res.status, 401, path);
      assert.equal((await res.json()).success, false);
    }
  });

  test(`${prefix} returns a JSON 404 for unknown API endpoints`, async () => {
    const res = await fetch(`${baseURL}${prefix}/missing`);
    assert.equal(res.status, 404);
    assert.deepEqual(await res.json(), { success: false, message: 'Route not found' });
  });
}
