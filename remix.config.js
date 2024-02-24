/** @type {import('@remix-run/dev').AppConfig} */
export default {
	ignoredRouteFiles: ["**/.*"],
	extends: "@remix-run/eslint-config",
	serverDependenciesToBundle: [
		/^react-icons.*/,
		/^remix-utils.*/,
		"intl-parse-accept-language",
		"is-ip",
		"dayjs",
		"dayjs/plugin/relativeTime"
	],
	serverMinify: true
};
