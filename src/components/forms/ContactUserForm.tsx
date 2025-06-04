"use client";
import { ContactUserFormSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { FC, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { saveActivityLogsNotification, upsertContact } from "@/lib/queries";
import { useModal } from "@/providers/ModalProvider";
import { useToast } from "@/hooks/use-toast";
import Loading from "../global/Loading";

interface ContactUserFormProps {
  subaccountId: string;
}

const ContactUserForm: FC<ContactUserFormProps> = ({ subaccountId }) => {
  const { setClose, data } = useModal();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof ContactUserFormSchema>>({
    mode: "onChange",
    resolver: zodResolver(ContactUserFormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  useEffect(() => {
    if (data.contact) {
      form.reset(data.contact);
    }
  }, [data, form, form.reset]);

  const isLoading = form.formState.isLoading;

  const handleSubmit = async (
    values: z.infer<typeof ContactUserFormSchema>
  ) => {
    try {
      const response = await upsertContact({
        email: values.email,
        name: values.name,
        subAccountId: subaccountId,
      });

      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Updated a contact | ${response?.name}`,
        subAccountId: subaccountId,
      });

      toast({
        title: "Success",
        description: "Saved funnel details",
      });
      setClose();
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Oppse!",
        description: error.message,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Info</CardTitle>
        <CardDescription>
          {" "}
          You can assign tickets to contacts and set a value for each contact in
          the ticket.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              disabled={isLoading}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="mt-4" disabled={isLoading} type="submit">
              {form.formState.isSubmitting ? (
                <Loading />
              ) : (
                "Save Contact Details"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ContactUserForm;