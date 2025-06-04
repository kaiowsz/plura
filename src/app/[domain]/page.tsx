import FunnelEditor from '@/components/funnel/FunnelEditor';
import { db } from '@/lib/db';
import { getDomainContent } from '@/lib/queries';
import EditorProvider from '@/providers/editor/EditorProvider';
import { notFound } from 'next/navigation';
import React from 'react'

const page = async ({params}: {params: { domain: string }}) => {
  
  const domainData = await getDomainContent(params.domain.slice(0 , -1));

  if(!domainData) return notFound();
  
  const pageData = domainData.FunnelPages.find((page) => !page.pathName);

  if(!pageData) return notFound();

  await db.funnelPage.update({
    where: {
      id: pageData.id,
    },
    data: {
      visits: {
        increment: 1,
      }
    }
  })

  return (
    <EditorProvider subaccountId={domainData.subAccountId} pageDetails={pageData} funnelId={domainData.id}>
      <FunnelEditor funnelPageId={pageData.id} liveMode={true}>
          
      </FunnelEditor>
    </EditorProvider>
  )
}

export default page