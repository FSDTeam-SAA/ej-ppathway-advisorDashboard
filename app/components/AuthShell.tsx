"use client";

import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

type AuthShellProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  bgImage: string;
  bgAlt?: string;
  variant?: "default" | "login";
  bottomLink?: { href: string; text: string; label: string };
};

export function AuthShell({
  title,
  subtitle,
  children,
  bgImage,
  bgAlt = "Prophetic Pathway",
  variant = "default",
  bottomLink,
}: AuthShellProps) {
  return (
    <div className="min-h-screen flex items-stretch bg-[#F4F2FB]">
      {/* Left side – image */}
      <div className="relative hidden lg:block lg:w-1/2">
        <Image
          src={bgImage}
          alt={bgAlt}
          fill
          priority
          sizes="(min-width:1024px) 50vw, 100vw"
          className="object-cover"
        />
        {/* Right-edge curved wave dividers */}
        <svg
          aria-hidden
          viewBox="0 0 200 1000"
          preserveAspectRatio="none"
          className="absolute top-0 -right-px h-full w-50 pointer-events-none"
        >
          {variant === "login" ? (
            <>
              {/* Outer teal accent */}
              <path
                d="M0,0 C 120,250 -20,650 120,1000 L200,1000 L200,0 Z"
                fill="#0a7a90"
              />
              {/* Gold accent */}
              <path
                d="M30,0 C 150,250 10,650 150,1000 L200,1000 L200,0 Z"
                fill="#e8a72b"
              />
              {/* Light-violet panel */}
              <path
                d="M60,0 C 180,250 40,650 180,1000 L200,1000 L200,0 Z"
                fill="#F4F2FB"
              />
            </>
          ) : (
            <>
              {/* Subtle violet accent stripe */}
              <path
                d="M40,0 C 160,250 20,650 160,1000 L200,1000 L200,0 Z"
                fill="#D9CCF2"
                opacity="0.55"
              />
              <path
                d="M70,0 C 190,250 50,650 190,1000 L200,1000 L200,0 Z"
                fill="#F4F2FB"
              />
            </>
          )}
        </svg>
      </div>

      {/* Right side – form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center">
            <Image
              src="/logo.png"
              alt="Prophetic Pathway"
              width={180}
              height={64}
              priority
              className="h-auto w-45 object-contain"
            />
          </div>

          <h1 className="text-2xl md:text-[28px] font-bold text-slate-900 text-center mb-2">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-sm text-slate-500 text-center mb-8 max-w-sm mx-auto">
              {subtitle}
            </p>
          ) : (
            <div className="mb-6" />
          )}

          {children}

          {bottomLink ? (
            <p className="text-sm text-slate-500 mt-6 text-center">
              {bottomLink.text}{" "}
              <Link
                href={bottomLink.href}
                className="text-[#0a7a90] font-semibold hover:underline"
              >
                {bottomLink.label}
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
