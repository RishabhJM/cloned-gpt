import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Label } from "@/components/ui/label";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
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
import Image from "next/image";
import Link from "next/link";

import GoogleButton from "react-google-button";

// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";

const supabaseUrl = "https://xcnsfjtsufywoloplzac.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showEmailText, setShowEmailText] = useState(false);
  supabase.auth.onAuthStateChange(async (event) => {
    console.log(event);
    if (event === "INITIAL_SESSION") {
      // handle initial session
      console.log("SESSION INITIALIZED");
    } else if (event === "SIGNED_IN") {
      // handle sign in event
      console.log("Signed IN");
      router.push("/chat");
    }
  });
  const handleSignUp = async () => {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: "http://localhost:3000/chat",
      },
    });
    setEmail("");
    setPassword("");
    setShowEmailText(true);
    console.log("MUST HAVE SIGNEDUP");
  };
  const handleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/chat",
      },
    });
  };

  const handleEmail = (e) => {
    setEmail(e.target.value);
  };
  const handlePassword = (e) => {
    setPassword(e.target.value);
  };
  return (
    <div className="bg-gray-800 w-screen h-screen flex justify-center items-center">
      <Card className="bg-white text-black w-1/2">
        <CardHeader className="flex items-center">
          <Image src="/logo1.png" width={100} height={100} alt=""></Image>
          <CardTitle>Create an account</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="email-login">Email</Label>
          <Input
            type="email"
            placeholder="Email"
            id="email-login"
            value={email}
            onChange={handleEmail}
          />
          <Label htmlFor="password-login">Password</Label>
          <Input
            type="password"
            placeholder="Password"
            id="password-login"
            value={password}
            onChange={handlePassword}
          />
          <Button
            type="submit"
            className="my-4 bg-emerald-700"
            onClick={() => handleSignUp()}
          >
            Submit
          </Button>
          {showEmailText && <div>Check your email to confirm!</div>}

          <div className="text-center">
            Already have an account?
            <Link href="/login" className="text-emerald-700">
              Login
            </Link>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <GoogleButton onClick={() => handleSignIn()} />
        </CardFooter>
      </Card>
    </div>
  );
}
