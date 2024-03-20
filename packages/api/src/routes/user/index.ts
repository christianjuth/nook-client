import { FastifyInstance } from "fastify";
import {
  SignInWithFarcasterRequest,
  SignInWithPasswordRequest,
} from "../../../types";
import { UserService } from "../../services/user";

export const userRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const userService = new UserService(fastify);

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
          const data = await userService.signInWithFarcaster(
            JSON.parse(process.env.DEV_SIWF as string),
          );
          return reply.send(data);
        } catch (e) {
          console.error(e);
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );
  });
};
