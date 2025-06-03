"use client";
import { useToast } from "@/hooks/use-toast";
import { getSubAccountTeamMembers, saveActivityLogsNotification, searchContacts, upsertTicket } from "@/lib/queries";
import { TicketWithTags } from "@/lib/types";
import { cn, currencyNumberRegex } from "@/lib/utils";
import { useModal } from "@/providers/ModalProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Contact, Tag, User } from "@prisma/client";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { CheckIcon, ChevronsUpDownIcon, User2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import Loading from "../global/Loading";
import TagCreator from "../global/TagCreator";

type Props = {
    laneId: string;
    subaccountId: string;
    getNewTicket: (ticket: TicketWithTags[0]) => void;
}

const TicketFormSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    value: z.string().refine((value) => currencyNumberRegex.test(value), {
        message: "Value must be a valid price."
    })
})

const TicketForm = ({ getNewTicket, laneId, subaccountId }: Props) => {
    
    const { data: defaultData, setClose } = useModal();
    
    const router = useRouter();
    const { toast } = useToast();
    
    const [contact, setContact] = useState("")
    const [search, setSearch] = useState("")
    const [tags, setTags] = useState<Tag[]>([]);
    const [contactList, setContactList] = useState<Contact[]>([]);
    const [allTeamMembers, setAllTeamMembers] = useState<User[]>([]);
    
    const [assignedTo, setAssignedTo] = useState(defaultData.ticket?.Assigned?.id || "")
    
    const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();
    
    const form = useForm<z.infer<typeof TicketFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(TicketFormSchema),
        defaultValues: {
            name: defaultData.ticket?.name || "",
            description: defaultData.ticket?.description || "",
            value: String(defaultData.ticket?.value || 0)
        }
    });

    const isLoading = form.formState.isLoading;
    
    useEffect(() => {
        if(subaccountId) {
            const fetchData = async () => {
                const response = await getSubAccountTeamMembers(subaccountId);
                if(response) {
                    setAllTeamMembers(response);
                }
            }

            fetchData();
        }
    }, [subaccountId]);

    useEffect(() => {
        if(defaultData.ticket) {
            form.reset({
                name: defaultData.ticket.name || "",
                description: defaultData.ticket?.description || "",
                value: String(defaultData?.ticket?.value || 0),
            });

            if(defaultData.ticket.customerId) {
                setContact(defaultData.ticket.customerId);
            }

            const fetchData = async () => {
                // @ts-ignore;
                const response = await searchContacts(defaultData.ticket?.Customer?.name);

                setContactList(response);
            }

            fetchData();
        }
    }, [defaultData]);

    const onSubmit = async (values: z.infer<typeof TicketFormSchema>) => {
        if(!laneId) return;

        try {
            const response = await upsertTicket({
                ...values,
                laneId,
                id: defaultData.ticket?.id,
                assignedUserId: assignedTo,
                ...(contact ? {customerId: contact} : {})
            }, tags);

            await saveActivityLogsNotification({
                agencyId: undefined,
                description: `Updated a ticket | ${response?.name}`,
                subAccountId: subaccountId,
            })

            toast({
                title: "Success",
                description: "Saved details."
            });

            if(response) getNewTicket(response);

            router.refresh();

        } catch (error) {
            console.log(`Error saving pipeline details: ${error}`)

            toast({
                variant: "destructive",
                title: "Oops!",
                description: "Could not save pipeline details. Please try again."
            })
        }
        setClose()
    }

    return (
    <Card className="w-full">
        <CardHeader>
            <CardTitle>Ticket Details</CardTitle>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">

                    <FormField
                    disabled={isLoading}
                    control={form.control}
                    name="name"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Ticket Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />

                    <FormField
                    disabled={isLoading}
                    control={form.control}
                    name="description"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Input placeholder="Description" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />

                    <FormField
                    disabled={isLoading}
                    control={form.control}
                    name="value"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Ticket Value</FormLabel>
                            <FormControl>
                                <Input placeholder="Value" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />

                    <h3>Add Tags</h3>

                    <TagCreator subAccountId={subaccountId} getSelectedTags={setTags} defaultTags={defaultData.ticket?.Tags || []} />

                    <FormLabel>Assigned to Team Member</FormLabel>

                    <Select onValueChange={setAssignedTo} defaultValue={assignedTo}>
                        <SelectTrigger>
                            <SelectValue placeholder={
                                <div className="flex items-center gap-2">
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage alt="Contact" />
                                        <AvatarFallback className="bg-primary text-sm text-white">
                                            <User2 size={14} />
                                        </AvatarFallback>
                                    </Avatar>

                                    <span className="text-sm text-muted-foreground">
                                        Not Assigned
                                    </span>
                                </div>
                            }/>
                        </SelectTrigger>
                        <SelectContent>
                            {allTeamMembers.map((teamMember) => (
                                <SelectItem key={teamMember.id} value={teamMember.id}>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="w-8 h-8">
                                            <AvatarImage alt="Contact" src={teamMember.avatarUrl} />
                                            <AvatarFallback className="bg-primary text-sm text-white">
                                                <User2 size={14} />
                                            </AvatarFallback>
                                        </Avatar>

                                        <span className="text-sm text-muted-foreground">{teamMember.name}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <FormLabel>Customer</FormLabel>

                    <Popover>
                        <PopoverTrigger className="flex">
                            <Button variant="outline" role="combobox" className="justify-between">
                                {contact ? contactList.find((c) => c.id === contact)?.name : "Select customer..."}
                                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0">
                            <Command>
                                <CommandInput placeholder="Search..." className="h-9" value={search} onChangeCapture={
                                    async (value) => {
                                        setSearch(
                                        // @ts-ignore;    
                                        value.target.value);
                                        if(saveTimerRef.current) {
                                            clearTimeout(saveTimerRef.current)
                                        }
                                        saveTimerRef.current = setTimeout(async () => {
                                            const response = await searchContacts(
                                                // @ts-ignore;
                                                value.target.value);
                                            setContactList(response);
                                            setSearch("")
                                        }, 1000);
                                    }
                                }/>

                                <CommandList>
                                    <CommandEmpty>No customer found.</CommandEmpty>
                                    <CommandGroup>
                                        {contactList.map((c) => (
                                            <CommandItem key={c.id} value={c.id} onSelect={(currentValue) => {
                                                setContact(currentValue === contact ? "" : currentValue)
                                            }}>
                                                {c.name}
                                                <CheckIcon className={cn("ml-auto h-4 w-4", contact === c.id ? "opacity-100" : "opacity-0")} />
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>

                    <Button type="submit" disabled={isLoading} className="w-20 m-4">
                        {form.formState.isSubmitting ? <Loading /> : "Save"}
                    </Button>
                </form>
            </Form>
        </CardContent>
    </Card>
    )
}

export default TicketForm