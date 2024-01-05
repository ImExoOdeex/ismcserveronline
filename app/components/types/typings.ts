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
