import BlurPage from "@/components/global/BlurPage";
import MediaComponent from "@/components/media/MediaComponent";
import { getMedia } from "@/lib/queries";
import React from "react"

type Props = {
    params: {
        subaccountId: string;
    }
}

const MediaPage = async ({ params }: Props) => {
    
    const data = await getMedia(params.subaccountId);

    return (
    <BlurPage>
        <MediaComponent subaccountId={params.subaccountId} data={data} />
    </BlurPage>
    )
}

export default MediaPage