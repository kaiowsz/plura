import Infobar from "@/components/global/Infobar";
import Sidebar from "@/components/global/Sidebar";
import Unauthorized from "@/components/global/Unauthorized";
import { getAuthUserDetails, getNotificationAndUser, verifyAndAcceptInvitation } from "@/lib/queries";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react"

type Props = {
    children: React.ReactNode;
    params: {
        subaccountId: string;
    }
}

const SubaccountIDLayout = async ({ children, params }: Props) => {
    
    const agencyId = await verifyAndAcceptInvitation();
    if(!agencyId) return <Unauthorized />;

    const user = await currentUser();

    if(!user) {
        return redirect("/")
    }

    let notifications: any = [];

    if(!user.privateMetadata.role) {
        return <Unauthorized />
    } else {
        const allPermissions = await getAuthUserDetails();

        const hasPermission = allPermissions?.Permissions.find((perm) => perm.access && perm.subAccountId === params.subaccountId);

        if(!hasPermission) return <Unauthorized />
    }

    const allNotifications = await getNotificationAndUser(agencyId);

    if(user.privateMetadata.role === "AGENCY_ADMIN" || user.privateMetadata.role === "AGENCY_OWNER") {
        notifications = allNotifications;
    } else {
        const filteredNotifications = allNotifications?.filter((notif) => notif.subAccountId === params.subaccountId); 

        if(filteredNotifications) notifications = filteredNotifications;
    } 
    
    return (
    <div>
        <Sidebar id={params.subaccountId} type="subaccount" />

        <div className="md:pl-[300px]">
            <Infobar notifications={notifications} role={user.privateMetadata.role as string} subAccountId={params.subaccountId as string} />

            <div className="relative">
                {children}
            </div>
        </div>
    </div>
    )
}

export default SubaccountIDLayout