import { User, Channel } from "@nook/common/prisma/nook";
import {
  EntityResponse,
  FarcasterCastResponse,
  NookResponse,
} from "@nook/common/types";

export type SignInWithFarcasterRequest = {
  message: string;
  signature: `0x${string}`;
  nonce: string;
};

export type TokenResponse = {
  refreshToken: string;
  token: string;
  expiresAt: number;
};

export type SignerPublicData = {
  publicKey: string;
  token: string;
  deeplinkUrl: string;
  state: string;
};

export type GetUserResponse = {
  user: User;
  entity: EntityResponse;
  nooks: NookResponse[];
};

export type FarcasterFeedRequest = {
  feedId: string;
};

export type FarcasterFeedResponse = {
  data: FarcasterCastResponse[];
};
