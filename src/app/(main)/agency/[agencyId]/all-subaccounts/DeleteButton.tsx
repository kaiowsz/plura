"use client";
import { deleteSubaccount, getSubaccountDetails, saveActivityLogsNotification } from "@/lib/queries";
import { useRouter } from "next/navigation";

const DeleteButton = ({subaccountId}: {subaccountId: string}) => {

    const router = useRouter();

    return <div onClick={async () => {
        const response = await getSubaccountDetails(subaccountId);

        await saveActivityLogsNotification({
            agencyId: undefined,
            description: `Deleted a subaccount | ${response?.name}`,
            subAccountId: subaccountId,
        });

        await deleteSubaccount(subaccountId);

        router.refresh();

    }}>
        Delete SubAccount
    </div>
}

export default DeleteButton;