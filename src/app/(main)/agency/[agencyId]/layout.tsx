import BlurPage from "@/components/global/BlurPage";
import Infobar from "@/components/global/Infobar";
import Sidebar from "@/components/global/Sidebar";
import Unauthorized from "@/components/global/Unauthorized";
import { getNotificationAndUser, verifyAndAcceptInvitation } from "@/lib/queries";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react"

type Props = {
    children: React.ReactNode;
    params: {
        agencyId: string;
    }
}

const Layout = async ({children, params}: Props) => {
    
    const agencyId = await verifyAndAcceptInvitation();
    const user = await currentUser();

    if(!user) return redirect("/");

    if(!agencyId) return redirect("/agency");

    if(user.privateMetadata.role !== "AGENCY_OWNER" && user.privateMetadata.role !== "AGENCY_ADMIN") {
        return <Unauthorized />
    }

    let allNotifications: any = [];

    const notifications = await getNotificationAndUser(agencyId);

    if(notifications) {
        allNotifications = notifications;
    }

    return (
    <div className="h-screen overflow-hidden">
        <Sidebar id={params.agencyId} type="agency" />
        <div className="md:pl-[300px]">
            <Infobar notifications={allNotifications} />
            <div className="relative">
                <BlurPage>
                    {children}
                </BlurPage>
            </div>
        </div>
    </div>
    )
}

export default Layout