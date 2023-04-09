import express, { type NextFunction, type Request, type Response } from "express";
import compression from "compression";
import morgan from "morgan";
import { createRequestHandler } from "@remix-run/express";
import path from "path";

const BUILD_DIR = path.join(process.cwd(), "build");

const app = express();
app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");
app.use("/build", express.static("public/build", { immutable: true, maxAge: "1y" }));

app.use(express.static("public", { maxAge: "1y" }));

app.use(morgan(":req[x-forwarded-for] :method :url :status | :response-time ms"));

app.all(
	"*",
	process.env.NODE_ENV === "development"
		? (req: Request, res: Response, next: NextFunction) => {
				purgeRequireCache();

				return createRequestHandler({
					build: require(BUILD_DIR),
					mode: process.env.NODE_ENV
				})(req, res, next);
		  }
		: createRequestHandler({
				build: require(BUILD_DIR),
				mode: process.env.NODE_ENV
		  })
);
const port = process.env.PORT || process.env.NODE_ENV === "development" ? 3000 : 3003;

app.listen(port, () => {
	console.log(`Express server listening on port ${port}`);
});

function purgeRequireCache() {
	for (const key in require.cache) {
		if (key.startsWith(BUILD_DIR)) {
			delete require.cache[key];
		}
	}
}
