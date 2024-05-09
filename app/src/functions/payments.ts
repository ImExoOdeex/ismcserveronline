// 30 days costs 2$
export function calculatePriceFromDays(days: number) {
    return Math.ceil(days / 30) * 1.99;
}

export function toStripeAmount(amount: number) {
    return Math.floor(amount * 100);
}
