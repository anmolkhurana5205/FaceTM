"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useState, useTransition } from "react";
import { settings } from "@/actions/settings";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { SettingsSchema } from "@/schemas";
import { FormSuccess } from "@/components/form-success";
import { FormError } from "@/components/form-error";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FaceEnrollment } from "@/components/auth/face-enrollment";
import { disableFaceAuth } from "@/actions/face-auth";

const SettingPage = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const { update } = useSession();
  const [isPending, startTransition] = useTransition();
  const user = useCurrentUser();
  const [isFaceEnrolled, setIsFaceEnrolled] = useState(
    user?.isFaceAuthEnabled || false,
  );

  const handleDisableFace = async () => {
    const result = await disableFaceAuth();
    if (result.success) {
      setIsFaceEnrolled(false);
      setSuccess(result.success);
    }
    if (result.error) setError(result.error);
  };

  const form = useForm<z.infer<typeof SettingsSchema>>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      name: user?.name || undefined,
      role: user?.role || undefined,
      isTwoFactorEnabled: user?.isTwoFactorEnabled || undefined,
    },
  });

  const onSubmit = (values: z.infer<typeof SettingsSchema>) => {
    startTransition(() => {
      settings(values)
        .then((data) => {
          if (data.error) {
            setError(data.error);
          }
          if (data.success) {
            update();
            setSuccess(data.success);
          }
        })
        .catch(() => {
          setError("Something went wrong");
        });
    });
  };

  return (
    <Card className="w-[600px]">
      <CardHeader>
        <p className="text-2xl font-semibold text-center">⚙️ Settings</p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="anmol"
                        disabled={isPending}
                        type="name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      disabled={isPending}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={"ADMIN"}>Admin</SelectItem>
                        <SelectItem value={"USER"}>User</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {user?.isOAuth === false && (
                <FormField
                  control={form.control}
                  name="isTwoFactorEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Two Factor Authentication</FormLabel>
                        <FormDescription>
                          Enable two factor authentication for your account
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          disabled={isPending}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            <FormSuccess message={success} />
            <FormError message={error} />
            <Button disabled={isPending} type="submit">
              Save
            </Button>
            {user?.isOAuth === false && (
              <div className="mt-4 pt-4 border-t">
                <FaceEnrollment
                  isEnrolled={isFaceEnrolled}
                  onDisable={handleDisableFace}
                  onEnroll={() => setIsFaceEnrolled(true)}
                />
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SettingPage;
