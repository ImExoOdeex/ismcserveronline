import { createRequestHandler } from "@remix-run/express";
import { broadcastDevReady } from "@remix-run/node";
import compression from "compression";
import express from "express";
import morgan from "morgan";
import path from "path";

const BUILD_DIR = path.join(process.cwd(), "build");
console.log("BUILD_DIR", BUILD_DIR);
const build = require(BUILD_DIR);

const app = express();

app.disable("x-powered-by");
app.use(compression());
app.use("/build", express.static("public/build", { immutable: true, maxAge: "1y" }));
app.use(express.static("public", { maxAge: "1y" }));
app.use(morgan(":req[x-forwarded-for] :method :url :status | :response-time ms"));

app.all(
	"*",
	createRequestHandler({
		build,
		mode: process.env.NODE_ENV
	})
);
const port = process.env.PORT || process.env.NODE_ENV === "development" ? 3000 : 3003;

app.listen(port, () => {
	console.log(`Express server listening on port ${port}`);
	if (process.env.NODE_ENV === "development") {
		broadcastDevReady(require(BUILD_DIR));
	}
});
