"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AuthGoogleOption } from "@/components/layout/auth-google-option";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MESSAGES } from "@/config/message";
import { passwordRegex } from "@/config/regex";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { LoaderCircleIcon } from "lucide-react";

const formSchema = z.object({
    email: z
        .string()
        .min(1, { message: MESSAGES.validation.required.email })
        .email({ message: MESSAGES.validation.format.email }),
    password: z
        .string()
        .min(1, { message: MESSAGES.validation.required.password })
        .regex(passwordRegex, { message: MESSAGES.validation.format.password })
});

const Login = () => {
    const { login } = useAuthStore();
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    });

    return (
        <Form {...form}>
            <form noValidate
                onSubmit={form.handleSubmit((data) => login(data, form))}
                className="flex flex-col gap-4"
            >
                <div className="mb-1 space-y-2">
                    <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Sign in</h1>
                    <p className="text-sm text-muted-foreground">
                        New to IVY?{" "}
                        <Link href="/register" className="rounded-sm font-medium text-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                            Create an account
                        </Link>
                    </p>
                </div>
                <AuthGoogleOption />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email address</FormLabel>
                            <FormControl>
                                <Input
                                    className="min-h-11"
                                    type="email"
                                    autoComplete="email"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    name="password"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input
                                    autoComplete="current-password"
                                    type="password"
                                    className="min-h-11"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="min-h-11" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? (
                        <span className="flex items-center gap-2">
                            <LoaderCircleIcon className="motion-safe:animate-spin" aria-hidden="true" />
                            Signing in?
                        </span>
                    ) : (
                        "Sign in"
                    )}
                </Button>
            </form>
        </Form>
    );
};

export default Login;
