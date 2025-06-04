import React from "react";
import { Plus } from "lucide-react";
import BlurPage from "@/components/global/BlurPage";
import { columns } from "./columns";
import { getFunnels } from "@/lib/queries";
import FunnelForm from "@/components/forms/FunnelForm";
import FunnelsDataTable from "./data-table";

const Funnels = async ({ params }: { params: { subaccountId: string } }) => {
  const funnels = await getFunnels(params.subaccountId);
  if (!funnels) return null;

  return (
    <BlurPage>
      <FunnelsDataTable
        actionButtonText={
          <>
            <Plus size={15} />
            Create Funnel
          </>
        }
        modalChildren={<FunnelForm subAccountId={params.subaccountId} />}
        filterValue="name"
        columns={columns}
        data={funnels}
      />
    </BlurPage>
  );
};

export default Funnels;