import Unauthorized from "@/components/global/Unauthorized";
import { getAuthUserDetails, verifyAndAcceptInvitation } from "@/lib/queries";
import { redirect } from "next/navigation";
import React from "react"

type Props = {
    searchParams: {
        state: string;
        code: string;
    };
}

const SubaccountMainPage = async ({ searchParams }: Props) => {

    const agencyId = await verifyAndAcceptInvitation();

    if(!agencyId) {
        return <Unauthorized />
    }

    const user = await getAuthUserDetails();
    if(!user) return;

    const getFirstSubaccountWithAccess = user.Permissions.find((perm) => perm.access === true);

    if(searchParams.state) {
        const statePath = searchParams.state.split("___")[0];
        const stateSubaccountId = searchParams.state.split("___")[1];

        if(!stateSubaccountId) return <Unauthorized />

        return redirect(`/subaccount/${stateSubaccountId}/${statePath}?code=${searchParams.code}`)
    }

    if(getFirstSubaccountWithAccess) {
        return redirect(`/subaccount/${getFirstSubaccountWithAccess.subAccountId}`);
    }

    return (
    <Unauthorized />
    )
}

export default SubaccountMainPage