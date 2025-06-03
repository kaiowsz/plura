"use client";
import { DeviceTypes, useEditor } from "@/providers/editor/EditorProvider";
import { FunnelPage } from "@prisma/client";
import { useRouter } from "next/navigation";
import React, { FocusEventHandler, useEffect } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import clsx from "clsx";
import Link from "next/link";
import { ArrowLeftCircle, EyeIcon, Laptop, Redo2, Smartphone, Tablet } from "lucide-react";
import { Input } from "../ui/input";
import { saveActivityLogsNotification, upsertFunnelPage } from "@/lib/queries";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";

type Props = {
    funnelId: string;
    funnelPageDetails: FunnelPage;
    subaccountId: string;
}

const FunnelEditorNavigation = ({ funnelId, funnelPageDetails, subaccountId }: Props) => {
    
    const router = useRouter();
    const { state, dispatch } = useEditor();
    const { toast } = useToast();

    useEffect(() => {
        dispatch({
            type: "SET_FUNNELPAGE_ID",
            payload: {
                funnelPageId: funnelPageDetails.id
            }
        })
    }, [funnelPageDetails]);


    const handleOnBlurTitleChange: FocusEventHandler<HTMLInputElement> = async (event) => {

        if(event.target.value === funnelPageDetails.name) return;

        if(event.target.value) {
            await upsertFunnelPage(
                subaccountId, {
                id: funnelPageDetails.id,
                name: event.target.value,
                order: funnelPageDetails.order,
            },
            funnelId
            );


            toast({
                title: "Success",
                description: "Funnel Page title saved."
            })

            router.refresh();
        } else {
            toast({
                title: "Oops!",
                description: "You need to have a title.",
                variant: "destructive"
            })
        }
    }

    const handlePreviewClick = () => {
        dispatch({ type: "TOGGLE_PREVIEW_MODE" })
        dispatch({ type: "TOGGLE_LIVE_MODE" })
    }

    const handleUndo = () => {
        dispatch({ type: "UNDO" })
    }

    const handleRedo = () => {
        dispatch({ type: "REDO" })
    }

    const handleOnSave = async () => {
        const content = JSON.stringify(state.editor.elements);

        console.log(content)

        try {
            const response = await upsertFunnelPage(
                subaccountId,
                {
                    ...funnelPageDetails,
                    content,
                },
                funnelId
            );

            await saveActivityLogsNotification({
                agencyId: undefined,
                description: `Updated a funnel page | ${response?.name}`,
                subAccountId: subaccountId
            })
        
            toast({
                title: "Saved content."
            })
        } catch (error) {
            console.log(`Error saving page contents: ${error}`)
            toast({
                title: "Error",
                description: "Could not save page contents."
            })
        }
    }

    return (
    <TooltipProvider>
        <nav className={clsx("border-b-[1px] flex items-center justify-between p-6 gap-2 transition-all", {
            "!h-0 !p-0 !overflow-hidden": state.editor.previewMode
        })}>
            <aside className="flex items-center gap-4 max-w-[270px] w-[300px]">
                <Link href={`/subaccount/${subaccountId}/funnels/${funnelId}`}>
                    <ArrowLeftCircle />
                </Link>
                <div className="flex flex-col w-full">
                    <Input defaultValue={funnelPageDetails.name} className="border-none h-5 m-0 p-0 text-lg" onBlur={handleOnBlurTitleChange} />

                    <span className="text-sm text-muted-foreground">
                        Path: /{funnelPageDetails.pathName}
                    </span>
                </div>
            </aside>
            <aside>
                <Tabs defaultValue="desktop" className="w-fit" value={state.editor.device} onValueChange={(value) => {
                    dispatch({
                        type: "CHANGE_DEVICE",
                        payload: { device: value as DeviceTypes }
                    })
                }}>
                    <TabsList className="grid w-full grid-cols-3 bg-transparent h-fit">
                        <Tooltip>
                            <TooltipTrigger>
                                <TabsTrigger value="Desktop" className="data-[state=active]:bg-muted w-10 h-10 p-0">
                                    <Laptop />
                                </TabsTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Desktop</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>

                            <TooltipTrigger>
                                <TabsTrigger value="Tablet" className="data-[state=active]:bg-muted w-10 h-10 p-0">
                                    <Tablet />
                                </TabsTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Tablet</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger>
                                <TabsTrigger value="Mobile" className="data-[state=active]:bg-muted w-10 h-10 p-0">
                                    <Smartphone />
                                </TabsTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Mobile</p>
                            </TooltipContent>
                        </Tooltip>
                    </TabsList>
                </Tabs>
            </aside>
            <aside className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="hover:bg-slate-800" onClick={handlePreviewClick}>
                    <EyeIcon />
                </Button>
                <Button disabled={
                    !(state.history.currentIndex < state.history.history.length - 1)
                }
                onClick={handleRedo}
                variant="ghost"
                size="icon"
                className="hover:bg-slate-800 mr-4"
                >
                    <Redo2 />
                </Button>
                <div className="flex flex-col items-center mr-4">
                    <div className="flex flex-row items-center gap-4">
                        Draft
                        <Switch disabled defaultChecked={true} />
                        Publish
                    </div>
                    <span className="text-muted-foreground text-sm">
                        Last Updated {funnelPageDetails.updatedAt.toLocaleDateString()}
                    </span>
                </div>

                <Button onClick={handleOnSave}>
                    Save
                </Button>
            </aside>
        </nav>
    </TooltipProvider>
    )
}

export default FunnelEditorNavigation