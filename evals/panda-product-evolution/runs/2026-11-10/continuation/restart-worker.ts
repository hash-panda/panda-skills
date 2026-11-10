import { Queue } from "../execution/queue.ts";

// A fresh operating-system process represents a service start. No queue state
// is passed in or restored, matching the unchanged implementation's API.
const queue = new Queue();
const event = { tenantId: "alpha", eventId: "evt-restart", payload: "first" };
const before = queue.jobs.length;
const job = queue.enqueue(event);
process.stdout.write(JSON.stringify({
  pid: process.pid,
  nodeVersion: process.version,
  event,
  before,
  after: queue.jobs.length,
  createdCount: queue.jobs.length - before,
  job,
}) + "\n");
