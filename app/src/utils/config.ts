const config = {
	discordBotInvite:
		"https://discord.com/api/oauth2/authorize?client_id=1043569248427061380&permissions=277025516544&scope=bot%20applications.commands",
	discordServerInvite: "https://discord.gg/e2c4DgRbWN",
	uploadUrl: "https://s3.ismcserver.online",
	dashUrl: "http://localhost:3000",
	ease: [0.4, 0, 0.3, 1],
	get easeAsString() {
		return `${this.ease[0]}, ${this.ease[1]}, ${this.ease[2]}, ${this.ease[3]}`;
	},
	get cubicEase() {
		return `cubic-bezier(${this.easeAsString})`;
	},
	primePrice: 3.49,
	viewsPerCredit: 20
};

export default config;
