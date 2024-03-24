export interface PaymentIntentMetadata {
	email: string;
	days: number;
	type: "sampleServer" | "premium";
	sampleServerId?: string;
}

export interface SampleServerHomepage {
	bedrock: boolean;
	server: string;
	favicon: string;
}

export interface IPlan {
	type: "server" | "user";
	title: string;
	description: string;
	price: number;
	ad_credits: number;
	color: string;
	features: string[];
}
