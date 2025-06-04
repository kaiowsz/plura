"use client";
import { useModal } from "@/providers/ModalProvider";
import React from "react"
import { Button } from "../ui/button";
import CustomModal from "../global/CustomModal";
import UploadMediaForm from "../forms/UploadMediaForm";

type Props = {
    subaccountId: string;
}

const MediaUploadButton = ({subaccountId}: Props) => {
    
    const { isOpen, setOpen, setClose } = useModal();

    return (
    <Button onClick={() => {
        setOpen(<CustomModal title="Upload Media" subHeading="Upload a file to your media bucket">
            <UploadMediaForm subaccountId={subaccountId}>

            </UploadMediaForm>
        </CustomModal>)
    }}>
        Upload
    </Button>
    )
}

export default MediaUploadButton