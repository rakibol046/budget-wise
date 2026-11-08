import assert from 'node:assert/strict';
import test from 'node:test';
import { validateApiResponse } from '../src/services/apiResponse.js';

const response = (data, url = '/categories', method = 'get') => ({
  status: 200,
  data,
  config: { url, method },
});

test('rejects the HTML response returned by a misrouted production API', () => {
  assert.throws(() => validateApiResponse(response('<!doctype html><div id="root"></div>')));
});

for (const [url, field] of [
  ['/categories', 'categories'],
  ['/accounts', 'accounts'],
  ['/currencies', 'currencies'],
  ['/expenses?month=2026-11', 'expenses'],
  ['/expenses/yearly/2026', 'expenses'],
]) {
  test(`${url} accepts empty and populated lists without changing the response`, () => {
    for (const list of [[], [{ _id: 'record-1' }]]) {
      const res = response({ success: true, [field]: list }, url);
      assert.equal(validateApiResponse(res), res);
    }
  });

  test(`${url} rejects missing or non-array lists before updating stores`, () => {
    for (const list of [undefined, null, {}, 'invalid']) {
      assert.throws(() => validateApiResponse(response({ success: true, [field]: list }, url)));
    }
  });
}

test('accepts non-list endpoints and mutations', () => {
  for (const res of [
    response({ success: true, insights: {}, budget: null }, '/budget/insights/2026-11'),
    response({ success: true, token: 'token', user: {} }, '/auth/login', 'post'),
    response({ success: true, category: {} }, '/categories', 'post'),
    response({ success: true }, '/expenses/id', 'delete'),
  ]) {
    assert.equal(validateApiResponse(res), res);
  }
});

test('rejects empty, malformed, and unsuccessful response bodies', () => {
  for (const data of [undefined, null, '', [], {}, { success: false }]) {
    assert.throws(() => validateApiResponse(response(data, '/budget/2026-11')));
  }
});
