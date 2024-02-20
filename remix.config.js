/** @type {import('@remix-run/dev').AppConfig} */
export default {
	ignoredRouteFiles: ["**/.*"],
	extends: "@remix-run/eslint-config",
	serverDependenciesToBundle: [/^remix-utils.*/, "is-ip", /^react-icons.*/],
	serverMinify: true
};
