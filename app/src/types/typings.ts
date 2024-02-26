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
	title: string;
	description: string;
	price: number;
	color: string;
	features: string[];
}
