import test from "node:test";
import assert from "node:assert/strict";
import { Queue } from "./queue.ts";

test("accepts a new event", () => {
  const queue = new Queue();
  const job = queue.enqueue({ tenantId: "alpha", eventId: "evt-1", payload: "work" });
  assert.equal(job.id, 1);
  assert.equal(queue.jobs.length, 1);
});

test("rejects empty payload", () => {
  const queue = new Queue();
  assert.throws(() => queue.enqueue({ tenantId: "alpha", eventId: "evt-1", payload: "" }));
  assert.equal(queue.jobs.length, 0);
});
