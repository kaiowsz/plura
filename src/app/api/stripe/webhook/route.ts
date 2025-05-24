import Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { subscriptionCreated } from "@/lib/stripe/actions"

const stripeWebhookEvents = new Set([
    "product.created",
    "product.updated",
    "price.created",
    "price.updated",
    "checkout.session.completed",
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
])

export async function POST(req: NextRequest) {
    let stripeEvent: Stripe.Event;

    const body = await req.text();
    const signature = headers().get("Stripe-Signature");

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_LIVE ?? process.env.STRIPE_WEBHOOK_SECRET;

    try {
        if(!signature || !webhookSecret) {
            console.log("Error: Stripe Webhook or the Signature does not exist.");
            return;
        }

        stripeEvent = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error: any) {
        console.log(`Error: ${error.message}`);

        return new NextResponse(`Webhook Error: ${error.message}`, {
            status: 400
        })
    }

    try {
        if(stripeWebhookEvents.has(stripeEvent.type)) {
            const subscription = stripeEvent.data.object as Stripe.Subscription;

            if(!subscription.metadata.connectedAccountPayments && !subscription.metadata.connectAccountSubscriptions) {
                switch(stripeEvent.type) {
                    case "customer.subscription.created":
                    case "customer.subscription.updated": {
                        if(subscription.status === "active") {
                            await subscriptionCreated(subscription, subscription.customer as string);
                            
                            console.log(`CREATED FROM WEBHOOK ${subscription}`)
                        } else {
                            console.log(`SKIPPED AT CREATED FROM WEBHOOK BECAUSE SUBSCRIPTION STATUS IS NOT ACTIVATED. ${subscription}`)
                            break;
                        }
                    }

                    default: 
                        console.log(`Unhandled relevant event: ${stripeEvent.type}`)
                }
            } else {
                console.log(`SKIPPED FORM WEBHOOK BECAUSE SUBSCRIPTION WAS FROM A CONNECTED ACCOUNT, NOT FOR THE APPLICATION: ${subscription}`);
            }
        }
    } catch (error) {
        console.log(error);

        return new NextResponse(`Webhook Error`, {
            status: 400,
        })
    }

    return NextResponse.json({ webhookActionReceived: true }, { status: 200 })
}