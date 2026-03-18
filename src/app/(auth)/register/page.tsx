"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MESSAGES } from "@/config/message";
import { passwordRegex } from "@/config/regex";
import Link from "next/link";
import googleIcon from "@/assets/icons/google.svg";
import { useAuthStore } from "@/store/auth.store";
import { useAuth0 } from "@auth0/auth0-react";
import { LoaderCircleIcon } from "lucide-react";

const formSchema = z.object({
    email: z
        .string()
        .min(1, { message: MESSAGES.validation.required.email })
        .email({ message: MESSAGES.validation.format.email }),
    password: z
        .string()
        .min(1, { message: MESSAGES.validation.required.password })
        .regex(passwordRegex, { message: MESSAGES.validation.format.password }),
    // phone: z
    //     .string()
    //     .min(10, { message: MESSAGES.validation.required.phone })
    //     .regex(phoneRegex, { message: MESSAGES.validation.format.phone }),

    firstName: z.string().min(1, { message: MESSAGES.validation.required.firstName }),
    lastName: z.string().min(1, { message: MESSAGES.validation.required.lastName })
});

const Register = () => {
    const { register } = useAuthStore();
    const { loginWithRedirect } = useAuth0();
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
            firstName: "",
            lastName: ""
        }
    });

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit((data) => register(data, form))}
                className="flex flex-col lg:basis-1/2 lg:p-22 md:p-14 p-7 w-full justify-center md:gap-8 gap-5"
            >
                <div className="flex-col flex gap-4">
                    <img src="/IVY_IELTS_Logo.svg" alt="" className="h-10 w-10 -ml-1" />
                    <h1 className="text-xl font-medium">Welcome</h1>
                    <div className="flex justify-between text-[13px] items-center">
                        <p>
                            Already have an account?{" "}
                            <Link href="/login" className="text-primary">
                                Log in
                            </Link>
                        </p>
                        {/* <p className='flex'>
                                English <ChevronDown size={18} />
                            </p> */}
                    </div>
                </div>
                <Button
                    className="py-3 h-fit bg-transparent! border cursor-pointer"
                    variant={"ghost"}
                    type="button"
                    onClick={() =>
                        loginWithRedirect({
                            authorizationParams: {
                                connection: "google-oauth2"
                            }
                        })
                    }
                >
                    <img src={googleIcon.src} className="w-5 h-5" />
                    Continue With Google
                </Button>
                <div className="flex items-center overflow-hidden gap-[4%]">
                    <Separator className="data-[orientation=horizontal]:w-[45%]"></Separator>
                    <p className="opacity-40 text-sm">or</p>
                    <Separator className="data-[orientation=horizontal]:w-[45%]"></Separator>
                </div>
                <div className="flex w-full gap-5">
                    <FormField
                        name="firstName"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem className="basis-1/2">
                                <FormLabel className="flex justify-between items-center mb-2">
                                    First Name
                                </FormLabel>
                                <FormControl>
                                    <Input className="py-3 h-fit" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="lastName"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem className="basis-1/2">
                                <FormLabel className="flex justify-between items-center mb-2">
                                    Last Name
                                </FormLabel>
                                <FormControl>
                                    <Input className="py-3 h-fit" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                {/* <FormField
                    name="phone"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex justify-between items-center mb-2">Phone</FormLabel>
                            <FormControl>
                                <Input className="py-3 h-fit" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                /> */}
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="mb-2">Email address</FormLabel>
                            <FormControl>
                                <Input
                                    className="py-3 h-fit"
                                    placeholder="placeholder@example.com"
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
                            <FormLabel className="flex justify-between items-center mb-2">Password</FormLabel>
                            <FormControl>
                                <Input type="password" className="py-3 h-fit" autoComplete="off" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="py-3 h-fit text-white bg-primary! hover:bg-primary/90!">
                    {form.formState.isSubmitting ? (
                        <span className="flex items-center gap-2">
                            <LoaderCircleIcon className="animate-spin" />
                            Registering...
                        </span>
                    ) : (
                        "Register"
                    )}
                </Button>
            </form>
        </Form>
    );
};

export default Register;
