import "@shopify/shopify-api/adapters/node";
import "dotenv/config";
import Express from "express";
import Knex from "knex";
import cors from "cors"; 
import knexConfig from "../knexfile.cjs"
import { Model } from "objection"
import fs from "fs";
import path, { resolve } from "path";
import { createServer as createViteServer } from "vite";
import sessionHandler from "../utils/sessionHandler.js";
import setupCheck from "../utils/setupCheck.js";
import shopify from "../utils/shopify.js";
import {
  customerDataRequest,
  customerRedact,
  shopRedact,
} from "./controllers/gdpr.js";
import csp from "./middleware/csp.js";
import isInitialLoad from "./middleware/isInitialLoad.js";
import verifyHmac from "./middleware/verifyHmac.js";
import verifyProxy from "./middleware/verifyProxy.js";
import verifyRequest from "./middleware/verifyRequest.js";
import proxyRouter from "./routes/app_proxy/index.js";
import userRoutes from "./routes/index.js";

setupCheck(); // Run a check to ensure everything is setup properly

const PORT = parseInt(process.env.PORT, 10) || 8081;
const isDev = process.env.NODE_ENV === "dev";

const knex = Knex(knexConfig);
Model.knex(knex);


const createServer = async (root = process.cwd()) => {
  const app = Express();
  app.disable("x-powered-by");

  app.use(cors({
    origin: ['https://your-ngrok-url.ngrok.io', 'https://your-shop.myshopify.com'], // Use your actual Shopify store domain and ngrok URL
    credentials: true
  }));
  
  app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    next();
  });
  

  // Incoming webhook requests
  app.post(
    "/api/webhooks/:topic",
    Express.text({ type: "*/*" }),
    async (req, res) => {
      const { topic } = req.params || "";
      const shop = req.headers["x-shopify-shop-domain"] || "";

      try {
        await shopify.webhooks.process({
          rawBody: req.body,
          rawRequest: req,
          rawResponse: res,
        });
        console.log(`--> Processed ${topic} webhook for ${shop}`);
      } catch (e) {
        console.error(
          `---> Error while registering ${topic} webhook for ${shop}`,
          e
        );
        if (!res.headersSent) {
          res.status(500).send(error.message);
        }
      }
    }
  );

  app.use(Express.json());

  app.post("/api/graphql", verifyRequest, async (req, res) => {
    try {
      const sessionId = await shopify.session.getCurrentId({
        isOnline: true,
        rawRequest: req,
        rawResponse: res,
      });
      const session = await sessionHandler.loadSession(sessionId);
      const response = await shopify.clients.graphqlProxy({
        session,
        rawBody: req.body,
      });
      res.status(200).send(response.body);
    } catch (e) {
      console.error(`---> An error occured at GraphQL Proxy`, e);
      res.status(403).send(e);
    }
  });

  app.use(csp);
  app.use(isInitialLoad);
  // If you're making changes to any of the routes, please make sure to add them in `./client/vite.config.js` or it'll not work.
  app.use("/api/apps", verifyRequest, userRoutes); //Verify user route requests
  app.use("/api/proxy_route", verifyProxy, proxyRouter); //MARK:- App Proxy routes

  app.post("/api/gdpr/:topic", verifyHmac, async (req, res) => {
    const { body } = req;
    const { topic } = req.params;
    const shop = req.body.shop_domain;

    console.warn(`--> GDPR request for ${shop} / ${topic} recieved.`);

    let response;
    switch (topic) {
      case "customers_data_request":
        response = await customerDataRequest(topic, shop, body);
        break;
      case "customers_redact":
        response = await customerRedact(topic, shop, body);
        break;
      case "shop_redact":
        response = await shopRedact(topic, shop, body);
        break;
      default:
        console.error(
          "--> Congratulations on breaking the GDPR route! Here's the topic that broke it: ",
          topic
        );
        response = "broken";
        break;
    }

    if (response.success) {
      res.status(200).send();
    } else {
      res.status(403).send("An error occured");
    }
  });

  if (isDev) {
    const vite = await createViteServer({
      root: path.resolve(process.cwd(), "client"),
      server: {
        middlewareMode: true,
        hmr: {
          server: app.listen(PORT, () => {
            console.log(`Dev server running on localhost:${PORT}`);
          }),
        },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
    app.use("*", async (req, res) => {
      const url = req.originalUrl;
      let template = fs.readFileSync(
        path.resolve(process.cwd(), "client", "index.html"),
        "utf-8"
      );
      template = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    });
  } else {
    const compression = await import("compression").then(
      ({ default: fn }) => fn
    );
    const serveStatic = await import("serve-static").then(
      ({ default: fn }) => fn
    );

    app.use(compression());
    app.use(serveStatic(resolve("dist/client")));
    app.use("/*", (req, res, next) => {
      res
        .status(200)
        .set("Content-Type", "text/html")
        .send(fs.readFileSync(`${root}/dist/client/index.html`));
    });
  }

  return { app };
};

if (isDev) {
  createServer();
} else {
  createServer().then(({ app }) => {
    app.listen(PORT, () => {
      console.log(`--> Running on ${PORT}`);
    });
  });
}
