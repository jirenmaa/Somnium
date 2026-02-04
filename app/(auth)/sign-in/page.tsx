"use client";

import Image from "next/image";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";

const Page = () => {
  const handleSignIn = async () => {
    return await authClient.signIn.social({ provider: "google" });
  };

  return (
    <div className="sign-in">
      <aside className="testimonial">
        <Link href="/">
          <Image
            src="/assets/icons/logo.svg"
            alt="logo"
            width={32}
            height={32}
          />
          <h1>Somnium</h1>
        </Link>

        <div className="description">
          <section>
            <figure>
              {Array.from({ length: 5 }).map((_, index) => (
                <Image
                  src="/assets/icons/star.svg"
                  alt="star"
                  width={20}
                  height={20}
                  key={index}
                />
              ))}
            </figure>
            <p>
              Somnium has completely changed the way our team communicates.
              Recording a quick walkthrough feels effortless — and sharing it
              takes seconds. It’s become our go-to tool for clarity and speed.
            </p>
            <article>
              <Image
                src="/assets/images/jessica.png"
                alt="jason"
                width={64}
                height={64}
                className="rounded-full"
              />
              <div>
                <h2>Jessica Chen</h2>
                <p>Customer Success Lead, BrightDesk</p>
              </div>
            </article>
          </section>
        </div>
        <p>&copy; Somnium {new Date().getFullYear()}</p>
      </aside>
      <aside className="google-sign-in">
        <section>
          <Link href="/">
            <Image
              src="/assets/icons/logo.svg"
              alt="logo"
              width={40}
              height={40}
            />
            <h1>Somnium</h1>
          </Link>
          <p>
            Sign in to start capturing ideas, sharing updates with{" "}
            <span>Somnium</span> in minutes.
          </p>
          <button onClick={handleSignIn}>
            <Image
              src="/assets/icons/google.svg"
              alt="google"
              width={22}
              height={22}
            />
            <span>Sign in with Google</span>
          </button>
        </section>
      </aside>

      <div className="overlay"></div>
    </div>
  );
};

export default Page;
