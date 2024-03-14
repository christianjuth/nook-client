import { FarcasterCastResponse } from "./api";
import { FarcasterUser } from "./farcaster";

export type BaseNotification = {
  fid: string;
  service: NotificationService;
  sourceFid: string;
  sourceId: string;
  timestamp: Date;
};

export enum NotificationService {
  FARCASTER = "FARCASTER",
}

export enum NotificationType {
  MENTION = "MENTION",
  REPLY = "REPLY",
  LIKE = "LIKE",
  RECAST = "RECAST",
  QUOTE = "QUOTE",
  FOLLOW = "FOLLOW",
}

type FarcasterMentionData = {
  type: NotificationType.MENTION;
  data: {
    hash: string;
  };
};

type FarcasterReplyData = {
  type: NotificationType.REPLY;
  data: {
    hash: string;
    parentHash: string;
  };
};

type FarcasterLikeData = {
  type: NotificationType.LIKE;
  data: {
    targetHash: string;
  };
};

type FarcasterRecastData = {
  type: NotificationType.RECAST;
  data: {
    targetHash: string;
  };
};

type FarcasterQuoteData = {
  type: NotificationType.QUOTE;
  data: {
    hash: string;
    embedHash: string;
  };
};

type FarcasterFollowData = {
  type: NotificationType.FOLLOW;
  data: undefined;
};

export type FarcasterMentionNotification = BaseNotification &
  FarcasterMentionData;
export type FarcasterReplyNotification = BaseNotification & FarcasterReplyData;
export type FarcasterLikeNotification = BaseNotification & FarcasterLikeData;
export type FarcasterRecastNotification = BaseNotification &
  FarcasterRecastData;
export type FarcasterQuoteNotification = BaseNotification & FarcasterQuoteData;
export type FarcasterFollowNotification = BaseNotification &
  FarcasterFollowData;

export type Notification =
  | FarcasterMentionNotification
  | FarcasterReplyNotification
  | FarcasterLikeNotification
  | FarcasterRecastNotification
  | FarcasterQuoteNotification
  | FarcasterFollowNotification;

export type NotificationResponse = {
  type: NotificationType;
  cast?: FarcasterCastResponse;
  timestamp: number;
  users?: FarcasterUser[];
};
