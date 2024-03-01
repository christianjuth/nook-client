import Redis from "ioredis";

// biome-ignore lint/suspicious/noExplicitAny: generic reviver
const reviver = (k: string, v: any): any => {
  if (typeof v === "string") {
    // Check for date string and convert to Date object
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(v)) {
      return new Date(v);
    }
  } else if (v !== null && typeof v === "object") {
    // If it's an object (but not null), iterate over its properties
    for (const innerKey of Object.keys(v)) {
      v[innerKey] = reviver(innerKey, v[innerKey]);
    }
  } else if (Array.isArray(v)) {
    // If it's an array, iterate over its elements
    return v.map((item, index) => reviver(String(index), item));
  }
  return v;
};

// biome-ignore lint/suspicious/noExplicitAny: generic replacer
const replacer = (key: string, value: any) => {
  if (typeof value === "bigint") {
    // Check if the value is a BigInt
    return value.toString(); // Convert BigInt to string
  }
  return value; // Return the value unchanged if not a BigInt
};

export class RedisClient {
  redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.APP_CACHE_HOST,
      port: Number(process.env.APP_CACHE_PORT),
      username: process.env.APP_CACHE_USER,
      password: process.env.APP_CACHE_PASSWORD,
      maxRetriesPerRequest: null,
    });
  }

  async connect(): Promise<void> {
    if (this.redis.status === "ready") {
      return;
    }
    await new Promise((resolve, reject) => {
      this.redis.once("connect", resolve);
      this.redis.once("error", (error) => {
        console.error(`Failed to connect to Redis: ${error}`);
        process.exit(1);
      });
    });
  }

  async close() {
    await this.redis.quit();
  }

  async getNumber(key: string) {
    const value = await this.redis.get(key);
    if (value) {
      const num = Number(value);
      if (Number.isNaN(num)) {
        throw new Error(`Value for ${key} is not a number`);
      }
      return num;
    }
  }

  async setNumber(key: string, value: number) {
    await this.redis.set(key, value, "EX", 60 * 60 * 3);
  }

  async exists(key: string) {
    return await this.redis.exists(key);
  }

  async increment(key: string) {
    await this.redis.incr(key);
  }

  async decrement(key: string) {
    await this.redis.decr(key);
  }

  async getJson(key: string) {
    try {
      const json = await this.redis.get(key);
      if (!json) return;
      return JSON.parse(json, reviver);
    } catch (error) {
      throw new Error(`Failed to parse JSON for ${key}: ${error}`);
    }
  }

  // biome-ignore lint/suspicious/noExplicitAny: generic setter
  async setJson(key: string, value: any) {
    await this.redis.set(key, JSON.stringify(value, replacer));
  }

  async addToSet(key: string, value: string, timestamp: number) {
    const pipeline = this.redis.pipeline();
    pipeline.zadd(key, timestamp, value);
    pipeline.zremrangebyrank(key, 0, -1000);
    await pipeline.exec();
  }

  async batchAddToSet(
    key: string,
    values: { value: string; timestamp: number }[],
  ) {
    const pipeline = this.redis.pipeline();
    for (const value of values) {
      pipeline.zadd(key, value.timestamp, value.value);
      pipeline.zremrangebyrank(key, 0, -1000);
    }
    await pipeline.exec();
  }

  async addToSets(keys: string[], value: string, timestamp: number) {
    const pipeline = this.redis.pipeline();
    for (const key of keys) {
      pipeline.zadd(key, timestamp, value);
      pipeline.zremrangebyrank(key, 0, -1000);
    }
    await pipeline.exec();
  }

  async removeFromSet(key: string, value: string) {
    await this.redis.zrem(key, value);
  }

  async removeFromSets(keys: string[], value: string) {
    const pipeline = this.redis.pipeline();
    for (const key of keys) {
      pipeline.zrem(key, value);
    }
    await pipeline.exec();
  }

  async getSet(key: string, cursor?: number) {
    return await this.redis.zrevrangebyscore(
      key,
      cursor ? cursor - 1 : "+inf",
      "-inf",
      "LIMIT",
      0,
      25,
    );
  }
}
