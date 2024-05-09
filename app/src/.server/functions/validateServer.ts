const notAllowedEndings = [
    ".php",
    ".html",
    ".htm",
    ".js",
    ".css",
    ".json",
    ".xml",
    ".txt",
    ".md",
    ".log",
    ".map"
];

const validDomainWithPortOptional = /^(?:(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})?(:[0-9]{1,5})?$/;
const validAddressWithPortOptional =
    /^(?:(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))(:[0-9]{1,5})?$/;

function isValidServerAddress(server: string) {
    return validDomainWithPortOptional.test(server) || validAddressWithPortOptional.test(server);
}

export const addressesConfig = {
    maxLength: 35,
    minLength: 3,
    invalidEndings: notAllowedEndings,
    isValidServerAddress,
    domainRegex: validDomainWithPortOptional,
    addressRegex: validAddressWithPortOptional
};
