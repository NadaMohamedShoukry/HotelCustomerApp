import Image from "next/image";

import Link from "next/link";
import background from "@/public/bg.png";
export default function Home() {
  return (
    <main className="mt-24">
      {/* first : it will prefetch all the routes that are linked on a
      certain page (This only works in production not in development)
      each page we visit in the browser will be cached in the browser */}

      <Image
        src={background}
        fill
        placeholder="blur"
        quality={80}
        className="object-cover object-top"
        alt="Mountains and forests with two cabins"
      />

      <div className="relative z-10 text-center">
        <h1 className="text-8xl text-primary-50 mb-10 tracking-tight font-normal">
          Welcome to paradise.
        </h1>
        <Link
          href="/cabins"
          className="bg-accent-500 px-8 py-6 text-primary-800 text-lg font-semibold hover:bg-accent-600 transition-all"
        >
          Explore luxury cabins
        </Link>
      </div>
    </main>
  );
}
