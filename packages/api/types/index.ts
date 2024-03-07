import { FarcasterCastResponse, FarcasterUser, Nook } from "@nook/common/types";

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

export type GetUserResponse = {
  fid: string;
  signerEnabled: boolean;
  farcaster: FarcasterUser;
  nooks: Nook[];
};

export type FarcasterFeedRequest = {
  feedId: string;
  cursor?: number;
};

export type FarcasterFeedResponse = {
  data: FarcasterCastResponse[];
  nextCursor?: number;
};
