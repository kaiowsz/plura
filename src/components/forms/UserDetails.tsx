"use client";
import { changeUserPermissions, getAuthUserDetails, getUserPermissions, saveActivityLogsNotification, updateUser } from "@/lib/queries";
import { AuthUserWithAgencySidebarOptionsSubAccounts, UserWithPermissionsAndSubAccounts } from "@/lib/types";
import { useModal } from "@/providers/ModalProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubAccount, User } from "@prisma/client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import FileUpload from "../global/FileUpload";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import Loading from "../global/Loading";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import { v4 } from "uuid";
import { useToast } from "@/hooks/use-toast";

type Props = {
    id: string | null;
    type: "agency" | "subaccount";
    userData?: Partial<User>;
    subAccounts?: SubAccount[];
}

const UserDetails = ({
    id, type, subAccounts, userData
}: Props) => {

    const { toast } = useToast();
    
    const [subAccountPermissions, setSubAccountPermissions] = useState<UserWithPermissionsAndSubAccounts | null>(null);
    const [roleState, setRoleState] = useState("");
    const [loadingPermissions, setLoadingPermissions] = useState(false);
    
    const { data, setClose } = useModal();
    const router = useRouter();

    const [authUserData, setAuthUserData] = useState<AuthUserWithAgencySidebarOptionsSubAccounts>(null);

    useEffect(() => {
        if(data.user) {
            const fetchDetails = async () => {
                const response = await getAuthUserDetails();

                if(response) {
                    setAuthUserData(response);
                }
            }

            fetchDetails();
        }
    }, [data]);

    const UserDataSchema = z.object({
        name: z.string().min(1),
        email: z.string().email(),
        avatarUrl: z.string(),
        role: z.enum([
            "AGENCY_OWNER",
            "AGENCY_ADMIN",
            "SUBACCOUNT_USER",
            "SUBACCOUNT_GUEST"
        ])
    });

    const form = useForm<z.infer<typeof UserDataSchema>>({
        resolver: zodResolver(UserDataSchema),
        defaultValues: {
            name: userData ? userData.name : data?.user?.name,
            email: userData ? userData.email : data?.user?.email,
            avatarUrl: userData ? userData.avatarUrl : data?.user?.avatarUrl,
            role: userData ? userData.role : data?.user?.role,
        }
    });

    useEffect(() => {
        if(!data.user) return;

        const getPermissions = async () => {
            if(!data.user) return;
            const permission = await getUserPermissions(data.user.id);
            setSubAccountPermissions(permission);
        }

        getPermissions();
    }, [data, form]);

    useEffect(() => {
        if(data.user) {
            form.reset(data.user);
        }

        if(userData) {
            form.reset(userData);
        }
    }, [userData, data]);

    const onSubmit = async (values: z.infer<typeof UserDataSchema>) => {
        if(!id) return;
        if(userData || data?.user) {
            const updatedUser = await updateUser(values);

            authUserData?.Agency?.SubAccount.filter((subaccount) => authUserData.Permissions.find((p) => p.subAccountId === subaccount.id && p.access)).forEach(async (subaccount) => {
                await saveActivityLogsNotification({
                    agencyId: undefined,
                    description: `Updated ${userData?.name} information.`,
                    subAccountId: subaccount.id, 
                });
            })

            if(updatedUser) {
                toast({
                    title: "User updated successfully."
                });
                setClose();
                router.refresh();
            } else {
                toast({
                    title: "Error",
                    description: "Couldn't update user information.",variant: "destructive"
                });
            }
        } else {
            console.log("Error: Could not submit.");
        }
    }

    const onChangePermission = async (subAccountId: string, value: boolean, permissionsId: string | undefined) => {
        if(!data.user?.email) return;

        setLoadingPermissions(true);
        const response = await changeUserPermissions(permissionsId ? permissionsId : v4(), data.user.email, subAccountId, value);

        if(type === "agency") {
            await saveActivityLogsNotification({
                agencyId: authUserData?.Agency?.id,
                description: `Gave ${userData?.name} access to | ${subAccountPermissions?.Permissions.find((perm) => perm.subAccountId === subAccountId)?.SubAccount.name}`,
                subAccountId: subAccountPermissions?.Permissions.find((perm) => perm.subAccountId === subAccountId)?.SubAccount.id
            })
        }

        if(response) {
            toast({
                title: "The request was successful."
            });

            if(subAccountPermissions) {
                subAccountPermissions.Permissions.find((perm) => {
                    if(perm.subAccountId === subAccountId) {
                        return { ...perm, access: !perm.access };
                    }

                    return perm;
                })
            }
        } else {
            toast({
                title: "Error",
                description: "Could not update permissions.",
                variant: "destructive"
            })
        }
        router.refresh();

        setLoadingPermissions(false);
    }

    return (
    <Card className="w-full"> 
        <CardHeader>
            <CardTitle>User Details</CardTitle>
            <CardDescription>Add or update your information</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                <FormField
                disabled={form.formState.isSubmitting}
                control={form.control}
                name="avatarUrl"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Profile picture</FormLabel>
                    <FormControl>
                        <FileUpload
                        apiEndpoint="avatar"
                        value={field.value}
                        onChange={field.onChange}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                disabled={form.formState.isSubmitting}
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem className="flex-1">
                    <FormLabel>User full name</FormLabel>
                    <FormControl>
                        <Input required placeholder="Full Name" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                disabled={form.formState.isSubmitting}
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem className="flex-1">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                        <Input
                        readOnly={
                            userData?.role === "AGENCY_OWNER" ||
                            form.formState.isSubmitting
                        }
                        placeholder="Email"
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                disabled={form.formState.isSubmitting}
                control={form.control}
                name="role"
                render={({ field }) => (
                    <FormItem className="flex-1">
                        <FormLabel> User Role</FormLabel>
                        <Select
                        disabled={field.value === "AGENCY_OWNER"}
                        onValueChange={(value) => {
                        if (value === "SUBACCOUNT_USER" || value === "SUBACCOUNT_GUEST") {
                            setRoleState("You need to have subaccounts to assign Subaccount access to team members.");
                        } else {
                            setRoleState("");
                        }
                        field.onChange(value);
                        }}
                        defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select user role..." />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="AGENCY_ADMING">
                                    Agency Admin
                                </SelectItem>
                                {(data?.user?.role === "AGENCY_OWNER" ||
                                    userData?.role === "AGENCY_OWNER") && (
                                    <SelectItem value="AGENCY_OWNER">
                                    Agency Owner
                                    </SelectItem>
                                )}
                                <SelectItem value="SUBACCOUNT_USER">
                                    Sub Account User
                                </SelectItem>
                                <SelectItem value="SUBACCOUNT_GUEST">
                                    Sub Account Guest
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-muted-foreground">{roleState}</p>
                    </FormItem>
                )}
                />

                <Button
                disabled={form.formState.isSubmitting}
                type="submit"
                className="mt-4">
                    {form.formState.isSubmitting ? <Loading /> : "Save User Details"}
                </Button>

                {authUserData?.role === "AGENCY_OWNER" && (
                    <div>
                        <Separator className="my-4" />

                        <FormLabel>User Permissions</FormLabel>
                        <FormDescription className="mb-4">
                            You can give Sub Account access to team member by turning on access control for each Sub Account. This is only visible to agency owners.
                        </FormDescription>

                        <div className="flex flex-col gap-4">
                            {subAccounts?.map((subaccount) => {
                                const subAccountPermissionsDetails = subAccountPermissions?.Permissions.find((perm) => perm.subAccountId === subaccount.id)

                                return (
                                <div key={subaccount.id} className="flex items-center justify-between rounded-lg border p-4">
                                    <div>
                                        <p>{subaccount.name}</p>
                                    </div>
                                    <Switch disabled={loadingPermissions} checked={subAccountPermissionsDetails?.access} onCheckedChange={(perm) => {
                                        onChangePermission(subaccount.id, perm, subAccountPermissionsDetails?.id);
                                    }} />
                                </div>)
                            })}
                        </div>
                    </div>
                )}
                
                </form> 
            </Form>
        </CardContent>
    </Card>
    )
}

export default UserDetails