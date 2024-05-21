import Head from "next/head";
import Link from "next/link";

export default function Home() {

  return (
    <>
      <Head>
        <title>ClonedGPT - Login or Signup</title>
      </Head>
      <div className="flex justify-center items-center min-h-screen w-full bg-gray-800 text-center text-white">
          <div>
                <Link href="/login" className="rounded-md bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600">
                  Login
                </Link>
                <Link href="/signup" className="rounded-md bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600">
                  Signup
                </Link>
          </div>
      </div>
    </>
  );
}
