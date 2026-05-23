"use client";

import { FormEvent, Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, ApiError, setAuth } from "../lib/api";
import { useToast } from "../lib/toast";
import { useAuth } from "../lib/auth-context";
import { Button } from "../components/ui/Button";
import { AuthShell } from "../components/AuthShell";
import type { AdvisorUser } from "../lib/types";

const OTP_LENGTH = 6;

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyInner />
    </Suspense>
  );
}

function VerifyInner() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const { setUser } = useAuth();
  const email = params?.get("email") || "";
  const purpose = params?.get("purpose") || "verify";

  const [code, setCode] = useState<string[]>(() =>
    Array(OTP_LENGTH).fill("")
  );
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const setDigit = (i: number, v: string) => {
    const cleaned = v.replace(/\D/g, "").slice(0, 1);
    setCode((prev) => {
      const next = [...prev];
      next[i] = cleaned;
      return next;
    });
    if (cleaned && i < OTP_LENGTH - 1) refs.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (text.length === OTP_LENGTH) {
      e.preventDefault();
      setCode(text.split(""));
      refs.current[OTP_LENGTH - 1]?.focus();
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const otp = code.join("");
    if (otp.length !== OTP_LENGTH) {
      toast.error(`Enter the ${OTP_LENGTH}-digit code`);
      return;
    }
    setSubmitting(true);
    try {
      const r = await api.post<{
        accessToken?: string;
        refreshToken?: string;
        user?: AdvisorUser;
        resetToken?: string;
      }>("/auth/verify-otp", { email, otp }, { skipAuth: true });
      const data = r.data;

      if (purpose === "reset") {
        toast.success("Code verified — set a new password");
        router.push(
          `/reset?token=${encodeURIComponent(data?.resetToken || "")}`
        );
        return;
      }

      if (data?.accessToken && data?.refreshToken && data?.user) {
        if (data.user.role !== "advisor") {
          toast.error("This account is not an advisor account");
          router.push("/login");
          return;
        }
        setAuth(data.accessToken, data.refreshToken, data.user);
        setUser(data.user);
        toast.success("Account verified");
        router.replace("/");
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Verification failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const onResend = async () => {
    if (seconds > 0) return;
    setResending(true);
    try {
      await api.post("/auth/resend-otp", { email, purpose }, { skipAuth: true });
      toast.success("New OTP sent");
      setSeconds(60);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Could not resend";
      toast.error(msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell
      bgImage="/otp.png"
      title="Otp Verification"
      subtitle="Please check your email and enter the 6 digit verification code to continue. The code will expire shortly for security reasons."
    >
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="flex justify-between gap-2 sm:gap-3">
          {Array.from({ length: OTP_LENGTH }).map((_, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={code[i]}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              onPaste={onPaste}
              className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-semibold rounded-xl bg-white border border-slate-200 text-slate-900 focus:border-[#0a7a90] focus:outline-none focus:ring-2 focus:ring-[#0a7a90]/20"
            />
          ))}
        </div>

        <Button type="submit" loading={submitting} className="w-full" size="lg">
          Verify Now
        </Button>

        <div className="text-sm text-center text-slate-500">
          Didn&apos;t receive the code?{" "}
          {seconds > 0 ? (
            <span>Resend in {seconds}s</span>
          ) : (
            <button
              type="button"
              onClick={onResend}
              disabled={resending}
              className="text-[#0a7a90] hover:underline font-semibold disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend"}
            </button>
          )}
        </div>
      </form>
    </AuthShell>
  );
}
