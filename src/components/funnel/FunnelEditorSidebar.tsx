"use client";
import { useEditor } from "@/providers/editor/EditorProvider";
import React from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../ui/sheet";
import { Tabs, TabsContent } from "../ui/tabs";
import clsx from "clsx";
import TabList from "./TabList";
import SettingsTab from "./SettingsTab";
import MediaBucketTab from "./tabs/MediaBucketTab";
import ComponentsTab from "./tabs/ComponentsTab";

type Props = {
    subaccountId: string;
}

const FunnelEditorSidebar = ({ subaccountId }: Props) => {
    
    const { state, dispatch } = useEditor(); 
    
    return (
    <Sheet open={true} modal={false}>
        <Tabs className="w-full" defaultValue="Settings">
            <SheetContent showX={false} side="right" className={clsx("mt-[97px] w-16 z-[80] shadow-none p-0 focus:border-none transition-all overflow-hidden", {
                hidden: state.editor.previewMode
            })}>
                <TabList />
            </SheetContent>
            <SheetContent showX={false} side="right" className={clsx("mt-[97px] w-80 z-[40] shadow-none p-0 mr-16 bg-background h-full transition-all overflow-hidden", { hidden: state.editor.previewMode })}>
                <div className="grid gap-4 h-full pb-36 overflow-scroll">
                    <TabsContent value="Settings">
                        <SheetHeader className="text-left p-6">
                            <SheetTitle>Styles</SheetTitle>
                            <SheetDescription>Show your creativity. You can customize every component as you like.</SheetDescription>
                        </SheetHeader>
                        <SettingsTab />
                    </TabsContent>

                    <TabsContent value="Media">
                        <MediaBucketTab subaccountId={subaccountId} />
                    </TabsContent>

                    <TabsContent value="Components">
                        <SheetHeader className="text-left p-6">
                            <SheetTitle>Components</SheetTitle>
                            <SheetDescription>You can drag and drop components on the canvas</SheetDescription>
                        </SheetHeader>
                        <ComponentsTab />
                    </TabsContent>
                </div>
            </SheetContent>
        </Tabs>
    </Sheet>
    )
}

export default FunnelEditorSidebar