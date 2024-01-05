export interface PaymentIntentMetadata {
	email: string;
	days: number;
	type: "sampleServer" | "premium";
	sampleServerId?: string;
}
