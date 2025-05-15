import PipelineSettings from "@/components/global/pipeline/PipelineSettings";
import PipelineView from "@/components/global/pipeline/PipelineView";
import PipelineInfobar from "@/components/global/PipelineInfobar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/db";
import { getLanesWithTicketAndTicket, getPipelineDetails, updateLanesOrder, updateTicketsOrder } from "@/lib/queries";
import { LaneDetail } from "@/lib/types";
import { redirect } from "next/navigation";
import React from "react"

type Props = {
    params: {
        subaccountId: string,
        pipelineId: string;
    }
}

const PipelineIdPage = async ({ params }: Props) => {
    
    const pipelineDetails = await getPipelineDetails(params.pipelineId);

    if(!pipelineDetails) return redirect(`/subaccount/${params.subaccountId}/pipelines`)

    const pipelines = await db.pipeline.findMany({
        where: {
            subAccountId: params.subaccountId,
        }
    });

    const lanes = (await getLanesWithTicketAndTicket(params.pipelineId)) as LaneDetail[];

    return (
    <Tabs defaultValue="view" className="w-full">
        <TabsList className="bg-transparent border-b-2 h-16 w-full justify-between mb-4">
            <PipelineInfobar pipelineId={params?.pipelineId} pipelines={pipelines} subaccountId={params?.subaccountId} />
            <div>
                <TabsTrigger value="view" className="!bg-transparent w-40">
                    Pipeline View
                </TabsTrigger>
                <TabsTrigger value="settings" className="!bg-transparent w-40">
                    Settings
                </TabsTrigger>
            </div>
        </TabsList>
        <TabsContent value="view">
            <PipelineView lanes={lanes} pipelineDetails={pipelineDetails} pipelineId={params.pipelineId} subaccountId={params.subaccountId} updateLanesOrder={updateLanesOrder} updateTicketsOrder={updateTicketsOrder} />
        </TabsContent>
        <TabsContent value="settings">
            <PipelineSettings pipelineId={params.pipelineId} pipelines={pipelines} subaccountId={params.subaccountId} />
        </TabsContent>
    </Tabs>
    )
}

export default PipelineIdPage