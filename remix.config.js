/** @type {import('@remix-run/dev').AppConfig} */
export default {
	ignoredRouteFiles: ["**/.*"],
	future: {
		v2_dev: true,
		v2_normalizeFormMethod: true,
		v2_routeConvention: true
	},
	extends: "@remix-run/eslint-config"
};
