import fastify from "fastify";
import { contentPlugin, redisPlugin } from "./plugins";
import { contentRoutes } from "./routes/content";
import { feedRoutes } from "./routes/feed";

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

  app.register(contentPlugin);
  app.register(redisPlugin);

  app.register(contentRoutes);
  app.register(feedRoutes);

  return app;
};

const start = async () => {
  const app = buildApp();
  try {
    const port = Number(process.env.PORT || "3002");
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
