import { ObjectId } from "mongodb";
import { Protocol } from "./actionTypes";

export type User = {
  firstLoggedInAt: Date;
  lastLoggedInAt: Date;
  signerEnabled: boolean;
  nookIds: string[];
};

export type FarcasterAccount = {
  fid: string;
  custodyAddress: string;
  username?: string;
  pfp?: string;
  displayName?: string;
  bio?: string;
  url?: string;
};

export type BlockchainAccount = {
  protocol: Protocol;
  address: string;
  isContract: boolean;
};

export type Entity = {
  /** DB id */
  _id: ObjectId;

  /** Farcaster account */
  farcaster: FarcasterAccount;

  /** Blockchain accounts */
  blockchain: BlockchainAccount[];

  /** Date record was created */
  createdAt: Date;

  /** Date record was updated at */
  updatedAt: Date;

  /** User Data */
  user?: User;
};
