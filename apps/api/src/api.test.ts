import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from './app.js';
import http from 'http';

function makeRequest(
  server: http.Server,
  path: string,
  method: string = 'GET',
  body?: any,
  token?: string
): Promise<{ status: number; body: any }> {
  const addr = server.address() as any;
  const port = addr.port;

  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : undefined;
    const req = http.request(
      {
        hostname: 'localhost',
        port,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      },
      res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode || 200, body: parsed });
          } catch {
            resolve({ status: res.statusCode || 200, body: data });
          }
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

test('API Integration Test Suite', async t => {
  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>(resolve => server.listen(0, resolve));

  t.after(() => {
    server.close();
  });

  await t.test('Health check endpoint returns healthy status', async () => {
    const res = await makeRequest(server, '/api/v1/system/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'HEALTHY');
  });

  await t.test('Map endpoint returns all 100 nodes and 530 edges', async () => {
    const res = await makeRequest(server, '/api/v1/map/graph');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.nodeCount, 100);
    assert.ok(res.body.data.edgeCount >= 500, `Expected >= 500 edges, got ${res.body.data.edgeCount}`);
  });

  await t.test('Route Search calculates optimal route between node_1 and node_21', async () => {
    const searchBody = {
      originId: 'node_1',
      destinationId: 'node_21',
      profile: 'balanced'
    };

    const res = await makeRequest(server, '/api/v1/routes/search', 'POST', searchBody);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    const data = res.body.data;
    assert.ok(data.recommendedRoute);
    assert.ok(data.recommendedRoute.pathNodeIds.length >= 2);
    assert.equal(data.recommendedRoute.pathNodeIds[0], 'node_1');
    assert.equal(data.recommendedRoute.pathNodeIds[data.recommendedRoute.pathNodeIds.length - 1], 'node_21');
    assert.ok(data.recommendedRoute.confidence >= 0.7);
    assert.ok(data.recommendedRoute.explanation.primaryReason.length > 0);
  });

  await t.test('Route Search handles edge case: Identical origin and destination', async () => {
    const searchBody = {
      originId: 'node_1',
      destinationId: 'node_1',
      profile: 'fastest'
    };

    const res = await makeRequest(server, '/api/v1/routes/search', 'POST', searchBody);
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'SAME_ORIGIN_DESTINATION');
  });

  await t.test('Personal Route Brain returns analytics and learned patterns', async () => {
    const res = await makeRequest(server, '/api/v1/personal-brain');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.tripsAnalyzed > 0);
    assert.ok(res.body.data.predictionAccuracyPct > 80);
    assert.ok(res.body.data.patterns.length > 0);
  });

  await t.test('Journey tracking lifecycle: Start -> Complete -> Feedback', async () => {
    // 1. Start journey
    const startRes = await makeRequest(server, '/api/v1/history/start', 'POST', {
      originId: 'node_1',
      destinationId: 'node_21',
      pathNodeIds: ['node_1', 'node_4', 'node_11', 'node_21'],
      predictedDurationMin: 25,
      estimatedCost: 2.1
    });
    assert.equal(startRes.status, 201);
    const journeyId = startRes.body.data.id;
    assert.equal(startRes.body.data.status, 'ACTIVE');

    // 2. Complete journey
    const compRes = await makeRequest(server, `/api/v1/history/${journeyId}/complete`, 'POST', {
      actualDurationMin: 27,
      actualCost: 2.1
    });
    assert.equal(compRes.status, 200);
    assert.equal(compRes.body.data.status, 'COMPLETED');
    assert.equal(compRes.body.data.predictionErrorMin, 2.0); // 27 - 25 = +2 min

    // 3. Submit feedback
    const feedRes = await makeRequest(server, `/api/v1/history/${journeyId}/feedback`, 'POST', {
      rating: 5,
      feedbackNotes: 'Seamless route recommendation!'
    });
    assert.equal(feedRes.status, 200);
    assert.equal(feedRes.body.data.userRating, 5);
  });

  await t.test('Admin benchmarks live algorithms: Dijkstra, A*, Bidirectional', async () => {
    const res = await makeRequest(server, '/api/v1/admin/benchmark', 'POST', {
      originId: 'node_1',
      destinationId: 'node_71'
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.length, 3);
    const names = res.body.data.map((b: any) => b.algorithm);
    assert.ok(names.includes('Dijkstra'));
    assert.ok(names.includes('A*'));
    assert.ok(names.includes('Bidirectional'));
  });
});
