import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { subAccountConnectAccId, prices, subaccountId }: {
        subAccountConnectAccId: string;
        prices: { 
            recurring: boolean; productId: string;
        }[];
        subaccountId: string
    } = await req.json();

    const origin = req.headers.get("origin");

    if(!subAccountConnectAccId || !prices.length) {
        return new NextResponse("Stripe Account ID or price ID is missing.", {
            status: 400,
        })
    }

    if(!process.env.NEXT_PUBLIC_PLATFORM_SUBSCRIPTION_PERCENT || !process.env.NEXT_PUBLIC_PLATFORM_ONETIME_FEE || !process.env.NEXT_PUBLIC_PLATFORM_AGENCY_PERCENT) return NextResponse.json({error: "Fees doesn't exist."});

    const agencyIdConnectedAccountId = await db.subAccount.findUnique({
        where: {
            id: subaccountId,
        },
        include: {
            Agency: true,
        }
    });

    const subscriptionPriceExists = prices.find((price) => price.recurring);

    if(!agencyIdConnectedAccountId?.Agency.connectAccountId) return NextResponse.json({error: "Agency account is not connected."});

    try {
        const session = await stripe.checkout.sessions.create({
            line_items: prices.map((price) => ({
                price: price.productId,
                quantity: 1,
            })),

            ...(subscriptionPriceExists && {
                subscription_data: {
                    metadata: {
                        connectedAccountSubscriptions: "true",
                    },
                    application_fee_percent: +process.env.NEXT_PUBLIC_PLATFORM_SUBSCRIPTION_PERCENT
                }
            }),

            ...(!subscriptionPriceExists && {
                payment_intent_data: {
                    metadata: {
                        connectedAccountSubscriptions: "true",
                    },
                    application_fee_amount: +process.env.NEXT_PUBLIC_PLATFORM_SUBSCRIPTION_PERCENT * 100
                }
            }),

            mode: subscriptionPriceExists ? "subscription" : "payment",
            ui_mode: "embedded",
            redirect_on_completion: "never"
        }, { 
            stripeAccount: subAccountConnectAccId
        });

        return NextResponse.json({
            clientSecret: session.client_secret
        }, {
            headers: {
                "Access-Control-Allow-Origin": origin || "*",
                "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            }
        })
    } catch (error: any) {
        console.log(`Error: ${error}`);

        return NextResponse.json({
            error: error.message,
        })
    }
}

export async function OPTIONS(req: Request) {
    const allowedOrigin = req.headers.get("origin");
    const response = new NextResponse(null, {
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": allowedOrigin || "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version",
                "Access-Control-Max-Age": "86400"
        }
    })

    return response;
}