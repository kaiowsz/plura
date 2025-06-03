"use client";
import { useModal } from "@/providers/ModalProvider";
import React from "react"
import { Button } from "../ui/button";
import CustomModal from "./CustomModal";
import ContactUserForm from "../forms/ContactUserForm";

type Props = {
    subaccountId: string;
}

const CreateContactButton = ({ subaccountId }: Props) => {
    
    const { setOpen } = useModal();

    const handleCreateContact = async () => {
        setOpen(
            <CustomModal title="Create or Update contact information" subHeading="Contacts are like customers.">
                <ContactUserForm subaccountId={subaccountId} />
            </CustomModal>
        )
    }
    
    return (
    <Button onClick={handleCreateContact}>
        Create Contact
    </Button>
    )
}

export default CreateContactButton