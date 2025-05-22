import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe"
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { customerId, priceId } = await req.json();

    if(!customerId || !priceId) {
        return new NextResponse("Customer ID or price ID is missing.", {
            status: 400,
        })
    }

    console.log(customerId);

    const subscriptionExists = await db.agency.findFirst({
        where: {
            customerId,
        },
        include: {
            Subscription: true,
        }
    })

    console.log(subscriptionExists);
    console.log(subscriptionExists);

    try {
        if(!subscriptionExists?.Subscription?.subscritiptionId) {
            throw new Error("Could not find the subscription ID to update the subscription.")
        }

        if(subscriptionExists.Subscription.active) {
            console.log("Updating the subscription")

            const currentSubscriptionDetails = await stripe.subscriptions.retrieve(subscriptionExists.Subscription.subscritiptionId);

            const subscription = await stripe.subscriptions.update(subscriptionExists.Subscription.subscritiptionId, {
                items: [
                    {
                        id: currentSubscriptionDetails.items.data[0].id,
                        deleted: true,
                    },
                    { price: priceId }
                ],
                expand: ["latest_invoice.payment_intent"]
            })

            return NextResponse.json({
                subscriptionId: subscription.id,
                // @ts-ignore;
                clientSecret: subscription.latest_invoice.payment_intent.client_secret,
            })
        } else {
            console.log("Creating a sub");

            const subscription = await stripe.subscriptions.create({
                customer: customerId,
                items: [
                    {
                        price: priceId,
                    }
                ],
                payment_behavior: "default_incomplete",
                payment_settings: {
                    save_default_payment_method: "on_subscription"
                },
                expand: ["latest_invoice.payment_intent"]
            });

            return NextResponse.json({
                subscriptionId: subscription.id,
                // @ts-ignore;
                clientSecret: subscription.latest_invoice.payment_intent.client_secret,
            })
        }
    } catch (error) {
        console.log(`Error creating subscription: ${error}`);

        return new NextResponse("Internal Server Error", {
            status: 500
        })
    }
}