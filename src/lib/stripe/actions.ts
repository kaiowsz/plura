"use server";

import Stripe from "stripe";
import { db } from "../db";
import { stripe } from "./index";
import { Plan } from "@prisma/client";

export const subscriptionCreated = async (subscription: Stripe.Subscription, customerId: string) => {
    try {
        const agency = await db.agency.findFirst({
            where: {
                customerId
            },
            include: {
                SubAccount: true,
            }
        })

        if(!agency) {
            throw new Error("Could not find an agency to upsert the subscription.")
        }

        console.log(subscription.current_period_end)
        console.log(subscription.current_period_end)
        console.log(subscription.current_period_end)
        console.log(subscription.current_period_end)
        console.log(subscription.current_period_end)
        console.log(subscription.current_period_end)
        console.log(subscription.current_period_end)
        console.log(subscription.current_period_end)
        console.log(subscription.current_period_end)
        console.log(subscription.current_period_end)

        // WIP: verify why currentPeriodEndDate does not exist on Database.

        const data = {
            active: subscription.status === "active",
            agencyId: agency.id,
            customerId,
            currentPeriodEndDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
            subscritiptionId: subscription.id,
            // @ts-ignore;
            priceId: subscription.plan.id,
            // @ts-ignore;
            plan: subscription.plan.id,
        }

        const response = await db.subscription.upsert({
            where: {
                agencyId: agency.id,
            },
            create: data,
            update: data,
        })

        console.log(`Created Subscription for ${subscription.id}`)

        return response;
    } catch (error) {
        console.log(`Error from Create action: ${error}`)
    }
}

export const getConnectAccountProducts = async (stripeAccount: string) => {
    const products = await stripe.products.list({
        limit: 50,
        expand: ["data.default_price"],
    }, {
        stripeAccount
    })

    return products.data;
}