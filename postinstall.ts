import fs from "node:fs";

// fixing @choc-ui/chakra-autocomplete, cuz it breaks the server build
// https://github.com/anubra266/choc-autocomplete/issues/241
const cwd = process.cwd();
const moduleFixes = [
	`${cwd}/node_modules/@choc-ui/chakra-autocomplete/package.json`,
];

try {
	for (const path of moduleFixes) {
		const packageString = fs.readFileSync(path, { encoding: "utf8" });
		const packageObject = JSON.parse(packageString);
		fs.writeFileSync(
			path,
			JSON.stringify({
				...packageObject,
				type: "module",
			}, null, 2),
		);
		console.log(`Patched ${path}`);
	}
} catch (err) {
	console.log(err);
	process.exit(1);
}
