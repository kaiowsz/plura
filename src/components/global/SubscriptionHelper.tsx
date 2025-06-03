"use client";
import { PricesList } from "@/lib/types"
import { useModal } from "@/providers/ModalProvider";
import { useSearchParams } from "next/navigation";
import React, { useEffect } from "react"
import CustomModal from "./CustomModal";
import SubscriptionFormWrapper from "../forms/SubscriptionFormWrapper";

type Props = {
    prices: PricesList["data"];
    customerId: string;
    planExists: boolean;
}

const SubscriptionHelper = ({ customerId, planExists, prices }: Props) => {

  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");
  const { setOpen } = useModal();

  useEffect(() => {
      if(plan) setOpen(
        <CustomModal title="Upgrade Plan!" subHeading="Get started today to get access to premium features.">
          <SubscriptionFormWrapper planExists={planExists} customerId={customerId} />
        </CustomModal>,
        async () => ({
          plans: {
            defaultPriceid: plan ? plan : "",
            plans: prices
          }
        })
      )
  }, [plan])

  return (
    <div>

    </div>
  )
}

export default SubscriptionHelper