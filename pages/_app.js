import "@/styles/globals.css";
import Head from "next/head";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/logo1.png" />
      </Head>
      <main className={`${outfit.variable} font-body`}>
        <Component {...pageProps} />
      </main>
    </>
  );
}
