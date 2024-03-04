import fastify from "fastify";
import {
  contentPlugin,
  entityPlugin,
  farcasterPlugin,
  feedPlugin,
  nookPlugin,
} from "./plugins";
import { nookRoutes } from "./routes/nook";
import { userRoutes } from "./routes/user";
import fastifyJwt from "@fastify/jwt";
import { farcasterRoutes } from "./routes/farcaster";

const buildApp = () => {
  const app = fastify({
    logger: true,
    ajv: {
      customOptions: {
        allowUnionTypes: true,
      },
    },
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: Automatically convert BigInts to strings when serializing to JSON
  BigInt.prototype.toJSON = function () {
    return this.toString();
  };

  app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET as string,
  });

  app.register(entityPlugin);
  app.register(farcasterPlugin);
  app.register(feedPlugin);
  app.register(nookPlugin);
  app.register(contentPlugin);

  app.register(nookRoutes);
  app.register(userRoutes);
  app.register(farcasterRoutes);

  return app;
};

const start = async () => {
  const app = buildApp();
  try {
    const port = Number(process.env.PORT || "3000");
    await app.listen({ port, host: "0.0.0.0" });
    console.log(`Listening on :${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
