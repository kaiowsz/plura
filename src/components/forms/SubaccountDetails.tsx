"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { v4 } from "uuid";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import { Agency, SubAccount } from "@prisma/client";
import { saveActivityLogsNotification, upsertSubAccount } from "@/lib/queries";
import { useEffect } from "react";
import Loading from "../global/Loading";
import { useModal } from "@/providers/ModalProvider";
import FileUpload from "../global/FileUpload";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string(),
  companyEmail: z.string(),
  companyPhone: z.string().min(1),
  address: z.string(),
  city: z.string(),
  subAccountLogo: z.string(),
  zipCode: z.string(),
  state: z.string(),
  country: z.string(),
});

//CHALLENGE Give access for Subaccount Guest they should see a different view maybe a form that allows them to create tickets

//CHALLENGE layout.tsx oonly runs once as a result if you remove permissions for someone and they keep navigating the layout.tsx wont fire again. solution- save the data inside metadata for current user.

interface SubAccountDetailsProps {
  //To add the sub account to the agency
  agencyDetails: Agency;
  details?: Partial<SubAccount>;
  userId: string;
  userName: string;
}

const SubAccountDetails: React.FC<SubAccountDetailsProps> = ({
  details,
  agencyDetails,
  userId,
  userName,
}) => {
  const { setClose } = useModal();
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: details?.name,
      companyEmail: details?.companyEmail,
      companyPhone: details?.companyPhone,
      address: details?.address,
      city: details?.city,
      zipCode: details?.zipCode,
      state: details?.state,
      country: details?.country,
      subAccountLogo: details?.subAccountLogo,
    },
  });

  console.log(agencyDetails);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const newValues = form.getValues();

      console.log(newValues.companyPhone);

      const response = await upsertSubAccount({
        id: details?.id ? details.id : v4(),
        address: values.address || newValues.address,
        subAccountLogo: values.subAccountLogo || newValues.subAccountLogo,
        city: values.city || newValues.city,
        companyPhone: values.companyPhone || newValues.companyPhone,
        country: values.country || newValues.country,
        name: values.name || newValues.name,
        state: values.state || newValues.state,
        zipCode: values.zipCode || newValues.zipCode,
        createdAt: new Date(),
        updatedAt: new Date(),
        companyEmail: values.companyEmail || newValues.companyEmail,
        agencyId: agencyDetails.id,
        connectAccountId: "",
        goal: 5000,
      });
      if (!response) throw new Error("No response from server");
      await saveActivityLogsNotification({
        agencyId: response.agencyId,
        description: `${userName} | updated sub account | ${response.name}`,
        subAccountId: response.id,
      });

      toast({
        title: "Subaccount details saved",
        description: "Successfully saved your subaccount details.",
      });

      setClose();
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Oppse!",
        description: "Could not save sub account details.",
      });
      console.log(error);
    }
  }

  useEffect(() => {
    if (details) {
      form.reset(details);
    }
  }, [details]);

  const isLoading = form.formState.isSubmitting;

  // ADD Subscription Restrictions according to Selected Plan.
  //CHALLENGE Create this form.
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sub Account Information</CardTitle>
        <CardDescription>Please enter business details</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              disabled={isLoading}
              control={form.control}
              name="subAccountLogo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Logo</FormLabel>
                  <FormControl>
                    <FileUpload
                      apiEndpoint="subAccountLogo"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex md:flex-row gap-4">
              <FormField
                disabled={isLoading}
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Account Name</FormLabel>
                    <FormControl>
                      <Input
                        required
                        placeholder="Your agency name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={isLoading}
                control={form.control}
                name="companyEmail"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Acount Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex md:flex-row gap-4">
              <FormField
                disabled={isLoading}
                control={form.control}
                name="companyPhone"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Acount Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone" required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              disabled={isLoading}
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input required placeholder="123 st..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex md:flex-row gap-4">
              <FormField
                disabled={isLoading}
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input required placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={isLoading}
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input required placeholder="State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={isLoading}
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Zipcpde</FormLabel>
                    <FormControl>
                      <Input required placeholder="Zipcode" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              disabled={isLoading}
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input required placeholder="Country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loading /> : "Save Account Information"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SubAccountDetails;