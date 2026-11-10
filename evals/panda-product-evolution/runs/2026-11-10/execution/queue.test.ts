import test from "node:test";
import assert from "node:assert/strict";
import { Queue } from "./queue.ts";
import type { QueueEvent } from "./queue.ts";

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

test("returns the first job on redelivery and preserves its payload", () => {
  const queue = new Queue();
  const first = queue.enqueue({ tenantId: "alpha", eventId: "evt-1", payload: "first" });
  const repeated = queue.enqueue({ tenantId: "alpha", eventId: "evt-1", payload: "first" });
  const changed = queue.enqueue({ tenantId: "alpha", eventId: "evt-1", payload: "replacement" });

  assert.equal(queue.jobs.length, 1);
  assert.strictEqual(repeated, first);
  assert.strictEqual(changed, first);
  assert.equal(first.payload, "first");
  assert.deepEqual(queue.jobs, [first]);
});

test("allows the same eventId in different tenants", () => {
  const queue = new Queue();
  const alpha = queue.enqueue({ tenantId: "alpha", eventId: "evt-1", payload: "alpha work" });
  const beta = queue.enqueue({ tenantId: "beta", eventId: "evt-1", payload: "beta work" });

  assert.notStrictEqual(alpha, beta);
  assert.deepEqual(queue.jobs, [alpha, beta]);
  assert.equal(alpha.payload, "alpha work");
  assert.equal(beta.payload, "beta work");
});

test("keeps different events in one tenant independent", () => {
  const queue = new Queue();
  const first = queue.enqueue({ tenantId: "alpha", eventId: "evt-1", payload: "first" });
  const second = queue.enqueue({ tenantId: "alpha", eventId: "evt-2", payload: "second" });

  assert.notStrictEqual(first, second);
  assert.deepEqual(queue.jobs, [first, second]);
  assert.equal(second.payload, "second");
});

test("does not conflate tenant and event pairs containing delimiters", () => {
  const queue = new Queue();
  const first = queue.enqueue({ tenantId: "alpha:beta", eventId: "gamma", payload: "first" });
  const second = queue.enqueue({ tenantId: "alpha", eventId: "beta:gamma", payload: "second" });

  assert.notStrictEqual(first, second);
  assert.deepEqual(queue.jobs, [first, second]);
});

test("keeps deduplication local to each queue instance", () => {
  const firstQueue = new Queue();
  const secondQueue = new Queue();
  const event = { tenantId: "alpha", eventId: "evt-1", payload: "work" };
  const first = firstQueue.enqueue(event);
  const second = secondQueue.enqueue(event);

  assert.notStrictEqual(first, second);
  assert.deepEqual(firstQueue.jobs, [first]);
  assert.deepEqual(secondQueue.jobs, [second]);
});

const invalidValues: Array<[string, unknown]> = [
  ["empty string", ""],
  ["whitespace", " \t\n"],
  ["undefined", undefined],
  ["null", null],
  ["number", 42],
  ["boolean", false],
  ["object", {}],
  ["array", []],
];

for (const field of ["tenantId", "eventId", "payload"] as const) {
  for (const [label, value] of invalidValues) {
    test(`rejects ${label} ${field} without changing the queue`, () => {
      const queue = new Queue();
      const event = { tenantId: "alpha", eventId: "evt-1", payload: "first" };
      const invalid = { ...event, [field]: value } as unknown as QueueEvent;

      assert.throws(() => queue.enqueue(invalid), new RegExp(`Invalid ${field}`));
      assert.equal(queue.jobs.length, 0);

      const first = queue.enqueue(event);
      // Invalid payloads must still throw when the identity is already queued.
      assert.throws(() => queue.enqueue(invalid), new RegExp(`Invalid ${field}`));
      assert.deepEqual(queue.jobs, [first]);
      assert.equal(first.payload, "first");
    });
  }
}
