import FunnelSettings from "@/components/funnel/FunnelSettings";
import FunnelSteps from "@/components/funnel/FunnelSteps";
import BlurPage from "@/components/global/BlurPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFunnel } from "@/lib/queries";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react"

type Props = {
    params: {
        funnelId: string;
        subaccountId: string;
    }
}

const FunnelPage = async ({ params }: Props) => {
    
    const funnelPages = await getFunnel(params.funnelId)
    
    if(!funnelPages) return redirect(`/subaccount/${params.subaccountId}/funnels`);
    
    // WIP: Solve error draggable props is not working on funnels page;

    return (
    <BlurPage>
        <Link href={`/subaccount/${params.subaccountId}/funnels`} className="flex justify-between gap-4 mb-4 text-muted-foreground">
            Back
        </Link>
        <h1 className="text-3xl mb-8">{funnelPages.name}</h1>

        <Tabs defaultValue="steps" className="w-full">
            <TabsList className="grid grid-cols-2 w-[50%] bg-transparent">   
                <TabsTrigger value="steps">Steps</TabsTrigger> 
                <TabsTrigger value="settings">Settings</TabsTrigger> 
            </TabsList>
            <TabsContent value="steps">
                <FunnelSteps funnel={funnelPages} subaccountId={params.subaccountId} pages={funnelPages.FunnelPages} funnelId={params.funnelId} />
            </TabsContent>
            <TabsContent value="settings">
                <FunnelSettings subaccountId={params.subaccountId} defaultData={funnelPages} />
            </TabsContent>
        </Tabs>
    </BlurPage>
    )
}

export default FunnelPage