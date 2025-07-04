import Image from "next/image";
import { pricingCards } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { clsx } from "clsx";
import { Check } from "lucide-react";
import Link from "next/link";
import { stripe } from "@/lib/stripe";

export default async function Home() {

  const prices = await stripe.prices.list({
    product: process.env.NEXT_PUBLIC_PLURA_PRODUCT_ID,
    active: true,
  });

  return (
    <main className="">
      <section className="h-full w-full pt-36 relative flex items-center justify-center flex-col ">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#161616_1px,transparent_1px),linear-gradient(to_bottom,#161616_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] -z-10" />
        <p className="text-center">Run your agency in one place</p>
        <div className="bg-gradient-to-r from-primary to-secondary-foreground text-transparent bg-clip-text relative">
          <h1 className="text-9xl font-bold text-center md:text-[300px]">
            Plura
          </h1>
        </div>

        <div
          className={"flex justify-center items-center relative md:mt-[-20px]"}
        >
          <Image
            src={"/assets/preview.png"}
            alt={"banner image"}
            height={1200}
            width={1200}
            className={"rounded-tl-2xl rounded-tr-2xl border-2 border-muted"}
          />
          <div
            className={
              "bottom-0 top-[50%] bg-gradient-to-t dark:from-background left-0 right-0 absolute z-10"
            }
          ></div>
        </div>
      </section>

      <section
        className={"flex justify-center items-center flex-col gap-4 md:mt-20"}
      >
        <h2 className={"text-4xl text-center"}>Choose what fits you right</h2>
        <p className={"text-muted-foreground text-center"}>
          Our Straight forward pricing plans are tailored to meet your needs. If{" "}
          {" you're"} not <br /> ready to commit you can get started for free.
        </p>
        <div className="flex justify-center gap-4 flex-wrap mt-6">

          <Card className={"w-[300px] flex flex-col justify-between"}>
            <CardHeader>
              <CardTitle
                className={clsx("", {
                  "text-muted-foreground": true,
                })}
              >
                {pricingCards[0].title}
              </CardTitle>
              <CardDescription>{pricingCards[0].description}</CardDescription>
            </CardHeader>
            <CardContent>
              <span className={"text-4xl font-bold"}>
                {pricingCards[0].duration || 0}
              </span>
              <span className={"text-muted-foreground"}>/month</span>
            </CardContent>
            <CardFooter className={"flex flex-col items-start gap-4"}>
              <div>
                {pricingCards[0]?.features.map((feature) => (
                  <div key={feature} className={"flex gap-2 items-center"}>
                    <Check className={"text-muted-foreground"} />
                    <p>{feature}</p>
                  </div>
                ))}
              </div>
              <Link
                href={`/agency?plan=${pricingCards[0].priceId}`}
                className={clsx(
                  "w-full text-center bg-primary" + " p-2 rounded-md",
                  {
                    "!bg-muted-foreground": true,
                  }
                )}
              >
                Get Started
              </Link>
            </CardFooter>
          </Card>

          {prices.data.map((pricingCard) => (
            <Card
              key={pricingCard.nickname}
              className={clsx("w-[300px] flex flex-col justify-between", {
                "border-2 border-primary":
                  pricingCard.nickname === "Unlimited SaaS",
              })}
            >
              <CardHeader>
                <CardTitle
                  className={clsx("", {
                    "text-muted-foreground":
                      pricingCard.nickname !== "Unlimited SaaS",
                  })}
                >
                  {pricingCard.nickname}
                </CardTitle>
                <CardDescription>
                  {
                    pricingCards.find((c) => c.title === pricingCard.nickname)
                      ?.description
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <span className={"text-4xl font-bold"}>
                  {pricingCard.unit_amount && pricingCard.unit_amount / 100}
                </span>
                <span className={"text-muted-foreground"}>
                  /{pricingCard.recurring?.interval}
                </span>
              </CardContent>
              <CardFooter className={"flex flex-col items-start gap-4"}>
                <div>
                  {pricingCards
                    .find((c) => c.title === pricingCard.nickname)
                    ?.features.map((feature) => (
                      <div key={feature} className={"flex gap-2 items-center"}>
                        <Check className={"text-muted-foreground"} />
                        <p>{feature}</p>
                      </div>
                    ))}
                </div>
                <Link
                  href={`/agency?plan=${pricingCard.id}`}
                  className={clsx(
                    "w-full text-center bg-primary" + " p-2 rounded-md",
                    {
                      "!bg-muted-foreground":
                        pricingCard.nickname !== "Unlimited SaaS",
                    }
                  )}
                >
                  Get Started
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}