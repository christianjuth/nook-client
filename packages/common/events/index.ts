import { QueueName, getQueue } from "../queues";
import { EventSource, RawEventData } from "../types";

export const publishRawEvent = async (
  source: EventSource,
  timestamp: number,
  data: RawEventData,
) => {
  const eventId = `${source.service}-${source.id}`;
  const queue = getQueue(QueueName.Events);
  await queue.add(eventId, {
    timestamp: new Date(timestamp),
    source,
    data,
  });
};
