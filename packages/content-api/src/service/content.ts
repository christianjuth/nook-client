import { ContentCacheClient } from "@nook/common/clients";
import { Metadata } from "metascraper";
import { Prisma, PrismaClient } from "@nook/common/prisma/content";
import {
  ContentReference,
  ContentReferenceType,
  FarcasterCastResponse,
  FrameData,
  UrlContentResponse,
} from "@nook/common/types";
import { FastifyInstance } from "fastify";
import { getUrlContent } from "../utils";

export const MAX_PAGE_SIZE = 25;

export class ContentService {
  private client: PrismaClient;
  private cache: ContentCacheClient;

  constructor(fastify: FastifyInstance) {
    this.client = fastify.content.client;
    this.cache = fastify.cache.client;
  }

  async getContents(uris: string[]): Promise<UrlContentResponse[]> {
    const contents = await Promise.all(uris.map((uri) => this.getContent(uri)));
    return contents.filter(Boolean) as UrlContentResponse[];
  }

  async getContent(uri: string): Promise<UrlContentResponse | undefined> {
    if (uri.includes(" ")) return;

    const cached = await this.cache.getContent(uri);
    if (cached) return cached;

    const content = await this.client.urlContent.findUnique({
      where: {
        uri,
      },
    });
    if (content) {
      const response = {
        ...content,
        metadata: content.metadata as Metadata,
        frame: content.frame as FrameData,
      } as UrlContentResponse;
      await this.cache.setContent(uri, response);
      return response;
    }

    return await this.refreshContent(uri);
  }

  async refreshContents(uris: string[]): Promise<UrlContentResponse[]> {
    return Promise.all(uris.map((uri) => this.refreshContent(uri)));
  }

  async refreshContent(uri: string): Promise<UrlContentResponse> {
    const content = await getUrlContent(uri);
    await this.client.urlContent.upsert({
      where: {
        uri,
      },
      create: {
        ...content,
        metadata: (content.metadata || Prisma.DbNull) as Prisma.InputJsonValue,
        frame: (content.frame || Prisma.DbNull) as Prisma.InputJsonValue,
      },
      update: {
        ...content,
        metadata: (content.metadata || Prisma.DbNull) as Prisma.InputJsonValue,
        frame: (content.frame || Prisma.DbNull) as Prisma.InputJsonValue,
      },
    });

    const response = {
      ...content,
      metadata: content.metadata as Metadata,
      frame: content.frame as FrameData,
    } as UrlContentResponse;
    await this.cache.setContent(uri, response);
    return response;
  }

  async addReferencedContent(cast: FarcasterCastResponse) {
    const references = this.parseReferencedContent(cast);
    await Promise.all(
      references.map((reference) => this.upsertReferencedContent(reference)),
    );
  }

  async removeReferencedContent(cast: FarcasterCastResponse) {
    const references = this.parseReferencedContent(cast);
    await this.client.farcasterContentReference.deleteMany({
      where: {
        OR: references.map((reference) => ({
          fid: reference.fid,
          hash: reference.hash,
          type: reference.type,
          uri: reference.uri,
        })),
      },
    });
  }

  async upsertReferencedContent(reference: ContentReference) {
    await this.getContent(reference.uri);

    await this.client.farcasterContentReference.upsert({
      where: {
        uri_fid_hash_type: {
          fid: reference.fid,
          hash: reference.hash,
          type: reference.type,
          uri: reference.uri,
        },
      },
      create: reference,
      update: reference,
    });
  }

  parseReferencedContent(cast: FarcasterCastResponse) {
    const timestamp = new Date(cast.timestamp);
    const references: ContentReference[] = [];
    for (const url of cast.embeds) {
      references.push({
        fid: BigInt(cast.user.fid),
        hash: cast.hash,
        uri: url.uri,
        type: ContentReferenceType.Embed,
        timestamp,
      });
    }

    for (const castEmbed of cast.embedCasts) {
      for (const url of castEmbed.embeds) {
        references.push({
          fid: BigInt(cast.user.fid),
          hash: cast.hash,
          uri: url.uri,
          type: ContentReferenceType.Quote,
          timestamp,
        });
      }
    }

    if (cast.parent) {
      for (const url of cast.parent.embeds) {
        references.push({
          fid: BigInt(cast.user.fid),
          hash: cast.hash,
          uri: url.uri,
          type: ContentReferenceType.Quote,
          timestamp,
        });
      }
    }

    return references;
  }
}
