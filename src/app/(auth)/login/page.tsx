"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { validation } from "@/config/message";
import { passwordRegex } from "@/config/regex";
import Link from "next/link";
import googleIcon from "@/assets/icons/google.svg";

const formSchema = z.object({
    email: z
        .string()
        .min(1, { message: validation.required.email })
        .email({ message: validation.format.email }),
    password: z
        .string()
        .min(1, { message: validation.required.password })
        .regex(passwordRegex, { message: validation.format.password })
});

const Login = () => {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    });

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(() => {})}
                className="flex flex-col lg:basis-1/2 lg:p-28 md:p-14 p-7 w-full justify-center md:gap-8 gap-5"
            >
                <div className="flex-col flex gap-4">
                    <img src="/IVY_IELTS_Logo.svg" alt="" className="h-10 w-10 -ml-1" />
                    <h1 className="text-xl font-medium">Welcome back</h1>
                    <div className="flex justify-between text-[13px] items-center">
                        <p>
                            New to IVY?{" "}
                            <Link href="/register" className="text-primary">
                                Sign up
                            </Link>
                        </p>
                        {/* <p className='flex'>
                                English <ChevronDown size={18} />
                            </p> */}
                    </div>
                </div>
                {/* <div className='text-sm text-center text-red-500 border border-red-500 border-dashed rounded-md py-3'>
                        This email is already linked to an account. Please log in or reset your password.
                    </div> */}
                <Button
                    className="py-3 h-fit bg-transparent! border cursor-pointer"
                    variant={"ghost"}
                    type="button"
                    // onClick={() =>
                    //     loginWithRedirect({
                    //         authorizationParams: {
                    //             connection: "google-oauth2"
                    //         }
                    //     }).then((response) => {
                    //         console.log(response);
                    //     })
                    // }
                >
                    <img src={googleIcon.src} className="w-5 h-5" />
                    Continue With Google
                </Button>
                <div className="flex items-center overflow-hidden gap-[4%]">
                    <Separator className="data-[orientation=horizontal]:w-[45%]"></Separator>
                    <p className="opacity-40 text-sm">or</p>
                    <Separator className="data-[orientation=horizontal]:w-[45%]"></Separator>
                </div>
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
                                    tabIndex={1}
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
                            <FormLabel className="flex justify-between items-center mb-2">
                                Password
                                <Link href="/forgot-password" className="text-primary!">
                                    Forgot?
                                </Link>
                            </FormLabel>
                            <FormControl>
                                <Input
                                    autoComplete="off"
                                    type="password"
                                    className="py-3 h-fit"
                                    tabIndex={2}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="py-3 h-fit text-white bg-primary! hover:bg-primary/90!">
                    Log In
                </Button>
            </form>
        </Form>
    );
};

export default Login;
