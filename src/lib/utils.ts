import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const currencyNumberRegex = /^\d+(\.\d{1,2})?$/

// export const getStripeOAuthLink = (
//   accountType: "agency" | "subaccount",
//   state: string
// ) => {
//   return `https://connect.stripe.com/oauth/v2/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID_TEST}&scope=read_write&redirect_uri=${process.env.NEXT_PUBLIC_URL}${accountType}&state=${state}`;
// };

export function getStripeOAuthLink(
  accountType: "agency" | "subaccount",
  state: string
) {
  // Reference URL from the Stripe Connect OAuth Docs

  // https://connect.stripe.com/oauth/authorize?response_type=code&client_id={{CLIENT_ID}}&scope=read_write&redirect_uri=https://sub2.example.com

  return `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID_TEST}&scope=read_write&redirect_uri=${process.env.NEXT_PUBLIC_URL}${accountType}&state=${state}`;
}