import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { Queue } from "../execution/queue.ts";

const event = { tenantId: "alpha", eventId: "evt-restart", payload: "first" };

test("control: identical redelivery in one instance creates only one job", (t) => {
  const queue = new Queue();
  const first = queue.enqueue(event);
  const repeated = queue.enqueue(event);
  t.diagnostic(JSON.stringify({ condition: "same-instance", deliveries: 2,
    createdCount: queue.jobs.length, sameObject: first === repeated,
    payload: first.payload }));
  assert.equal(queue.jobs.length, 1);
  assert.strictEqual(repeated, first);
  assert.equal(first.payload, event.payload);
});

test("new requirement: identical redelivery after process restart creates no second job", (t) => {
  const worker = fileURLToPath(new URL("./restart-worker.ts", import.meta.url));
  function startService() {
    const result = spawnSync(process.execPath, [worker], {
      encoding: "utf8", timeout: 5000, maxBuffer: 1024 * 1024,
    });
    assert.ifError(result.error);
    assert.equal(result.status, 0, `worker exit; stderr=${result.stderr}`);
    assert.equal(result.signal, null);
    const observation = JSON.parse(result.stdout);
    assert.deepEqual(observation.event, event);
    assert.equal(observation.nodeVersion, process.version);
    return { ...observation, stderr: result.stderr };
  }
  // spawnSync returns only after the first process has exited; the second call
  // starts a new process and imports the same, unmodified queue implementation.
  const beforeRestart = startService();
  const afterRestart = startService();
  const createdCount = beforeRestart.createdCount + afterRestart.createdCount;
  t.diagnostic(JSON.stringify({ condition: "process-restart", deliveries: 2,
    beforeRestart, afterRestart, createdCount,
    duplicateCreationCount: Math.max(0, createdCount - 1) }));
  // The creation counter measures insertion into jobs. Matching numeric ids in
  // separate processes are not evidence that the same task was recovered.
  assert.equal(createdCount, 1,
    "The same tenant/event must create one task across both service lifetimes");
  assert.equal(afterRestart.createdCount, 0,
    "Redelivery after restart must not create a task");
});
