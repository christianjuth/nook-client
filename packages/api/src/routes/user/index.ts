import { FastifyInstance } from "fastify";
import {
  SignInWithFarcasterRequest,
  SignInWithPasswordRequest,
} from "../../../types";
import { UserService } from "../../services/user";
import { UserMetadata } from "@nook/common/types";
import { PrivyClient } from "@privy-io/server-auth";
import { FarcasterAPIClient, SignerAPIClient } from "@nook/common/clients";
import { createPublicClient, http, parseAbiItem } from "viem";
import { optimism } from "viem/chains";
import { CONTRACTS } from "@nook/common/utils";

const viemClient = createPublicClient({
  chain: optimism,
  transport: http(
    "https://opt-mainnet.g.alchemy.com/v2/jrjomnn0ub8MFFQOXz3X9s9oVk_Oj5Q2",
  ),
});

export const userRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const client = new SignerAPIClient();
    const farcaster = new FarcasterAPIClient();

    const userService = new UserService(fastify);
    const privy = new PrivyClient(
      process.env.PRIVY_APP_ID as string,
      process.env.PRIVY_APP_SECRET as string,
    );

    fastify.get("/user", async (request, reply) => {
      const { fid } = (await request.jwtDecode()) as { fid: string };
      try {
        const data = await userService.getUser(fid);
        if (!data) {
          return reply.code(404).send({ message: "User not found" });
        }
        return reply.send(data);
      } catch (e) {
        console.error(e);
        return reply.code(500).send({ message: (e as Error).message });
      }
    });

    fastify.patch<{ Body: { theme: string } }>(
      "/user",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        try {
          const data = await userService.updateUser(fid, request.body);
          if (!data) {
            return reply.code(404).send({ message: "User not found" });
          }
          return reply.send(data);
        } catch (e) {
          console.error(e);
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.get("/user/token", async (request, reply) => {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return reply
          .code(401)
          .send({ message: "Unauthorized: No token provided" });
      }

      try {
        const data = await userService.getToken(
          authHeader.substring(7, authHeader.length),
        );
        return reply.send(data);
      } catch (e) {
        console.error(e);
        return reply.code(500).send({ message: (e as Error).message });
      }
    });

    fastify.post<{ Body: SignInWithFarcasterRequest }>(
      "/user/login",
      async (request, reply) => {
        try {
          const data = await userService.signInWithFarcaster(request.body);
          return reply.send(data);
        } catch (e) {
          console.error(e);
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.get("/user/login/privy", async (request, reply) => {
      try {
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return reply
            .code(401)
            .send({ message: "Unauthorized: No token provided" });
        }

        let did: string;
        try {
          const verifiedClaims = await privy.verifyAuthToken(
            authHeader.substring(7),
          );
          did = verifiedClaims.userId;
        } catch (error) {
          console.error(error);
          return reply.code(401).send({ message: "Unauthorized" });
        }

        const privyUser = await privy.getUser(did);

        let fid = privyUser?.farcaster?.fid.toString();
        const address = privyUser?.wallet?.address;
        if (!fid) {
          // check custody address
          if (address) {
            const result = await viemClient.readContract({
              address: CONTRACTS.ID_REGISTRY_ADDRESS,
              abi: [
                parseAbiItem(
                  "function idOf(address) external view returns (uint256)",
                ),
              ],
              functionName: "idOf",
              args: [address as `0x${string}`],
            });

            if (result > 0) {
              fid = result.toString();
            }
          }
          if (!fid) {
            return reply.code(401).send({ message: "Unauthorized" });
          }
        }

        const data = await userService.signInWithPrivy(fid);
        return reply.send(data);
      } catch (e) {
        console.error(e);
        return reply.code(500).send({ message: (e as Error).message });
      }
    });

    fastify.post<{
      Body: {
        fid: string;
        token: string;
        refreshToken: string;
        expiresAt: number;
        theme?: string;
      };
    }>("/user/refresh", async (request, reply) => {
      try {
        const data = await userService.refreshUser(request.body);
        return reply.send(data);
      } catch (e) {
        console.error(e);
        return reply.code(500).send({ message: (e as Error).message });
      }
    });

    fastify.post<{ Body: SignInWithPasswordRequest }>(
      "/user/login/dev",
      async (request, reply) => {
        if (
          request.body.username.toLowerCase() !==
            process.env.DEV_USERNAME?.toLowerCase() ||
          request.body.password !== process.env.DEV_PASSWORD
        ) {
          return reply.code(401).send({ message: "Unauthorized" });
        }
        try {
          const data = await userService.signInWithDev();
          if (!data) {
            return reply.code(401).send({ message: "Unauthorized" });
          }
          return reply.send(data);
        } catch (e) {
          console.error(e);
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.patch<{ Body: UserMetadata }>(
      "/user/metadata",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        try {
          await userService.updateMetadata(fid, request.body);
          return reply.send({});
        } catch (e) {
          console.error(e);
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );
  });
};
