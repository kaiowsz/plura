"use client";
import { useModal } from "@/providers/ModalProvider";
import { Agency, AgencySidebarOption, SubAccount, User } from "@prisma/client"
import React from "react"
import { Button } from "../ui/button";
import { twMerge } from "tailwind-merge";
import CustomModal from "./CustomModal";
import SubAccountDetails from "../forms/SubaccountDetails";
import { PlusCircleIcon } from "lucide-react";

type Props = {
    user: User & {
        Agency: 
        (Agency | (null & {
            SubAccount: SubAccount[];
            SidebarOption: AgencySidebarOption[]
        })
    ) | null;
    };
    id: string;
    className: string;
}

const CreateSubaccountButton = ({ className, id, user }: Props) => {
    
    const { setOpen } = useModal();

    const agencyDetails = user.Agency;
    
    if(!agencyDetails) return;

    return (
    <Button className={twMerge("w-full flex gap-4", className)} onClick={() => {
        setOpen(
        <CustomModal title="Create a Subaccount" subHeading="You can switch between">
            <SubAccountDetails agencyDetails={agencyDetails} userId={user.id} userName={user.name} /> 
        </CustomModal>)
    }}>
        <PlusCircleIcon size={15} />
        Create Sub Account
    </Button>
    )
}

export default CreateSubaccountButton