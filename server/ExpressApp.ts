import type { GetLoadContextFunction } from "@remix-run/express";
import { createRequestHandler } from "@remix-run/express";
import compression from "compression";
import type { Application } from "express";
import express from "express";
import morgan from "morgan";
import type { Server } from "node:http";
import { Logger } from "../app/src/.server/modules/Logger";
// @ts-expect-error
import * as build from "virtual:remix/server-build";
import pack from "../package.json";

declare module "@remix-run/server-runtime" {
  interface AppLoadContext {
    start: string;
    repoVersion: string;
    version: string;
  }
}

export class ExpressApp {
  private app: Application;
  private server: Server | null = null;

  constructor() {
    this.app = express();
  }

  private async initialize() {
    const getLoadContext: GetLoadContextFunction = () => {
      return {
        start: Date.now().toString(),
        repoVersion: "",
        version: pack.version,
      };
    };

    const viteDevServer =
      process.env.NODE_ENV === "production"
        ? undefined
        : await import("vite").then((vite) =>
            vite.createServer({
              server: { middlewareMode: true },
            })
          );

    const remixHandler = createRequestHandler({
      build: viteDevServer
        ? async () => viteDevServer.ssrLoadModule("virtual:remix/server-build")
        : (build as any),
      mode: build.mode,
      getLoadContext,
    });

    this.app.use(compression());
    this.app.disable("x-powered-by");
    if (viteDevServer) {
      this.app.use(viteDevServer.middlewares);
    } else {
      this.app.use(
        "/assets",
        express.static("build/client/assets", { immutable: true, maxAge: "1y" })
      );
      this.app.use(express.static("public", { maxAge: "1h" }));
    }
    this.app.use(morgan("tiny"));

    this.app.all("*", remixHandler);
  }

  public async run() {
    await this.initialize();

    const port = Number(process.env.PORT) || 3000;

    this.server = this.app.listen(port, async () => {
      Logger(
        `Blazingly fast server started on http://localhost:${port}`,
        "green",
        "black"
      );
    });
  }

  public async close() {
    this.server?.close();
  }

  public async reload() {
    await this.close();
    await this.run();
  }

  public getApp() {
    return this.app;
  }

  public getServer() {
    return this.server;
  }
}

new ExpressApp().run();
