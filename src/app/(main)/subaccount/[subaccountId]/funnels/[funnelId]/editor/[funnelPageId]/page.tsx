import FunnelEditor from "@/components/funnel/FunnelEditor";
import FunnelEditorNavigation from "@/components/funnel/FunnelEditorNavigation";
import FunnelEditorSidebar from "@/components/funnel/FunnelEditorSidebar";
import { db } from "@/lib/db";
import EditorProvider from "@/providers/editor/EditorProvider";
import { redirect } from "next/navigation";
import React from "react"

type Props = {
    params: {
        subaccountId: string;
        funnelId: string;
        funnelPageId: string;
    }
}

const Page = async ({ params }: Props) => {
    
    const funnelPageDetails = await db.funnelPage.findFirst({
        where: {
            id: params.funnelPageId
        }
    });
    
    if(!funnelPageDetails) {
        return redirect(`/subaccount/${params.subaccountId}/funnels/${params.funnelId}`)
    }

    return (
    <div className="fixed top-0 bottom-0 left-0 right-0 z-20 bg-background overflow-hidden">
        <EditorProvider subaccountId={params.subaccountId} funnelId={params.funnelId} pageDetails={funnelPageDetails}>
            
            <FunnelEditorNavigation funnelId={params.funnelId} funnelPageDetails={funnelPageDetails} subaccountId={params.subaccountId} />

            <div className="h-full flex justify-center">
                <FunnelEditor funnelPageId={params.funnelPageId} />
            </div>

            <FunnelEditorSidebar subaccountId={params.subaccountId} />
        </EditorProvider>
    </div>
    )
}

export default Page