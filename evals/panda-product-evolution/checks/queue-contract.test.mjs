import test from "node:test";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

if (!process.env.EVOLUTION_QUEUE_MODULE) throw new Error("Set EVOLUTION_QUEUE_MODULE to the candidate queue.ts");
const { Queue } = await import(pathToFileURL(resolve(process.env.EVOLUTION_QUEUE_MODULE)).href);

test("one task for repeated tenant/event identity", () => {
  const q = new Queue();
  const event = { tenantId: "a", eventId: "b", payload: "one" };
  const first = q.enqueue(event);
  assert.equal(q.enqueue(event).id, first.id);
  assert.equal(q.enqueue(event).id, first.id);
  assert.equal(q.jobs.length, 1);
});

test("identical event IDs in different tenants are independent", () => {
  const q = new Queue();
  q.enqueue({ tenantId: "a", eventId: "x", payload: "one" });
  q.enqueue({ tenantId: "b", eventId: "x", payload: "two" });
  assert.equal(q.jobs.length, 2);
});

test("different event IDs in one tenant are independent", () => {
  const q = new Queue();
  q.enqueue({ tenantId: "a", eventId: "x", payload: "one" });
  q.enqueue({ tenantId: "a", eventId: "y", payload: "two" });
  assert.equal(q.jobs.length, 2);
});

test("invalid payload does not reserve an identity", () => {
  const q = new Queue();
  assert.throws(() => q.enqueue({ tenantId: "a", eventId: "x", payload: " " }));
  assert.equal(q.jobs.length, 0);
  assert.equal(q.enqueue({ tenantId: "a", eventId: "x", payload: "valid" }).id, 1);
  assert.equal(q.jobs.length, 1);
});

test("identity does not collide on separator characters", () => {
  const q = new Queue();
  q.enqueue({ tenantId: "a:b", eventId: "c", payload: "one" });
  q.enqueue({ tenantId: "a", eventId: "b:c", payload: "two" });
  assert.equal(q.jobs.length, 2);
});

test("replay preserves the original accepted payload", () => {
  const q = new Queue();
  const first = q.enqueue({ tenantId: "a", eventId: "x", payload: "original" });
  const replay = q.enqueue({ tenantId: "a", eventId: "x", payload: "changed" });
  assert.equal(replay.id, first.id);
  assert.equal(replay.payload, "original");
  assert.equal(q.jobs.length, 1);
});
