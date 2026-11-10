export interface QueueEvent {
  tenantId: string;
  eventId: string;
  payload: string;
}

export interface Job extends QueueEvent {
  id: number;
}

export class Queue {
  jobs: Job[] = [];

  enqueue(event: QueueEvent): Job {
    for (const field of ["tenantId", "eventId", "payload"] as const) {
      if (typeof event[field] !== "string" || event[field].trim() === "") {
        throw new Error(`Invalid ${field}`);
      }
    }
    const existing = this.jobs.find(
      (job) => job.tenantId === event.tenantId && job.eventId === event.eventId,
    );
    if (existing) return existing;

    const job = { ...event, id: this.jobs.length + 1 };
    this.jobs.push(job);
    return job;
  }
}
