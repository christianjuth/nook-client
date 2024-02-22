import { Message, getSSLHubRpcClient } from "@farcaster/hub-nodejs";
import { MessageType } from "@farcaster/hub-nodejs";
import { handleCastAdd, handleCastRemove } from "./casts";
import {
  handleVerificationAdd,
  handleVerificationRemove,
} from "./verifications";
import { handleReactionAdd, handleReactionRemove } from "./reactions";
import { handleLinkAdd, handleLinkRemove } from "./links";
import { handleUserDataAdd } from "./users";
import { Job } from "bullmq";
import { handleUsernameProofAdd } from "./usernames";
import { EntityEventData, EventType, RawEvent } from "@nook/common/types";
import {
  transformToCastEvent,
  transformToCastReactionEvent,
  transformToLinkEvent,
  transformToUrlReactionEvent,
  transformToUserDataEvent,
  transformToUsernameProofEvent,
  transformToVerificationEvent,
} from "@nook/common/farcaster";
import { publishRawEvents } from "@nook/common/queues";

export const getFarcasterHandler = () => {
  const hubRpcEndpoint = process.env.HUB_RPC_ENDPOINT;
  if (!hubRpcEndpoint) {
    throw new Error("Missing HUB_RPC_ENDPOINT");
  }

  const client = getSSLHubRpcClient(hubRpcEndpoint);

  return async (job: Job<Message>) => {
    const message = job.data;

    const events: RawEvent<EntityEventData>[] = [];

    switch (message.data?.type) {
      case MessageType.CAST_ADD: {
        const record = await handleCastAdd(message, client);
        if (record) {
          events.push(transformToCastEvent(EventType.CAST_ADD, record));
        }
        break;
      }
      case MessageType.CAST_REMOVE: {
        const record = await handleCastRemove(message);
        if (record) {
          events.push(transformToCastEvent(EventType.CAST_REMOVE, record));
        }
        break;
      }
      case MessageType.VERIFICATION_ADD_ETH_ADDRESS: {
        const record = await handleVerificationAdd(message);
        if (record) {
          events.push(
            transformToVerificationEvent(EventType.VERIFICATION_ADD, record),
          );
        }
        break;
      }
      case MessageType.VERIFICATION_REMOVE: {
        const record = await handleVerificationRemove(message);
        if (record) {
          events.push(
            transformToVerificationEvent(EventType.VERIFICATION_REMOVE, record),
          );
        }
        break;
      }
      case MessageType.REACTION_ADD: {
        const record = await handleReactionAdd(message);
        if (record) {
          if ("targetUrl" in record) {
            events.push(
              transformToUrlReactionEvent(EventType.URL_REACTION_ADD, record),
            );
          } else if ("targetHash" in record) {
            events.push(
              transformToCastReactionEvent(EventType.CAST_REACTION_ADD, record),
            );
          }
        }
        break;
      }
      case MessageType.REACTION_REMOVE: {
        const record = await handleReactionRemove(message);
        if (record) {
          if ("targetUrl" in record) {
            events.push(
              transformToUrlReactionEvent(EventType.URL_REACTION_ADD, record),
            );
          } else if ("targetHash" in record) {
            events.push(
              transformToCastReactionEvent(EventType.CAST_REACTION_ADD, record),
            );
          }
        }
        break;
      }
      case MessageType.LINK_ADD: {
        const record = await handleLinkAdd(message);
        if (record) {
          events.push(transformToLinkEvent(EventType.LINK_ADD, record));
        }
        break;
      }
      case MessageType.LINK_REMOVE: {
        const record = await handleLinkRemove(message);
        if (record) {
          events.push(transformToLinkEvent(EventType.LINK_REMOVE, record));
        }
        break;
      }
      case MessageType.USER_DATA_ADD: {
        const record = await handleUserDataAdd(message);
        if (record) {
          events.push(transformToUserDataEvent(record));
        }
        break;
      }
      case MessageType.USERNAME_PROOF: {
        const record = await handleUsernameProofAdd(message);
        if (record) {
          events.push(transformToUsernameProofEvent(record));
        }
        break;
      }
      default:
        break;
    }

    await publishRawEvents(events);
  };
};
