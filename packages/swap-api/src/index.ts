import fastify from "fastify";
import { redisPlugin } from "./plugins";
// import { listsRoutes } from "./routes";
import fastifyJwt from "@fastify/jwt";
import { swapRoutes } from "./routes";

const buildApp = () => {
  const app = fastify({
    logger: true,
    ajv: {
      customOptions: {
        allowUnionTypes: true,
      },
    },
  });

  // Add a hook to listen for incoming requests and log the X-Service-Name header if present
  app.addHook('onRequest', (request, reply, done) => {
    const serviceName = request.headers['x-service-name'];
    if (serviceName) {
      app.log.info({ serviceName: `Request from: ${serviceName}` });
    }
    done();
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: Automatically convert BigInts to strings when serializing to JSON
  BigInt.prototype.toJSON = function () {
    return this.toString();
  };

  app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET as string,
  });

  app.register(redisPlugin);
  app.register(swapRoutes);

  return app;
};

const start = async () => {
  const app = buildApp();
  try {
    const port = Number(process.env.PORT || "3007");
    await app.listen({ port, host: "::" });
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
