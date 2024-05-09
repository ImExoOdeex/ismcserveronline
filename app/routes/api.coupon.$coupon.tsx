import { getUserId } from "@/.server/db/models/user";
import { csrf } from "@/.server/functions/security.server";
import stripe from "@/.server/modules/stripe";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { typedjson } from "remix-typedjson";

export async function loader({ request, params }: LoaderFunctionArgs) {
    csrf(request);

    const userId = await getUserId(request);
    if (!userId) {
        return typedjson({ error: "Not logged in", success: false }, { status: 401 });
    }

    const couponId = params.coupon as string;

    const coupons = await stripe.coupons.list();

    const couponByName = coupons.data.find((coupon) => coupon.name === couponId);
    if (!couponByName) {
        return typedjson({ error: "Coupon not found", success: false }, { status: 404 });
    }

    const coupon = await stripe.coupons.retrieve(couponByName.id).catch(() => null);

    return typedjson({
        coupon,
        success: true
    });
}
