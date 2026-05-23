"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "../lib/api";
import { useToast } from "../lib/toast";
import { Button } from "../components/ui/Button";
import { AuthShell } from "../components/AuthShell";
import {
  EyeIcon,
  EyeOffIcon,
  MailIcon,
  LockIcon,
  UserIcon,
  PhoneIcon,
} from "../components/Icons";
import type { ReactNode } from "react";

type IconedInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  leftIcon: ReactNode;
  rightIcon?: ReactNode;
};

function PillInput({
  leftIcon,
  rightIcon,
  className = "",
  ...rest
}: IconedInputProps) {
  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
        {leftIcon}
      </span>
      <input
        {...rest}
        className={`w-full h-13 pl-12 ${rightIcon ? "pr-12" : "pr-4"} rounded-xl bg-white text-slate-900 placeholder:text-slate-400 border border-transparent shadow-sm focus:border-[#0a7a90] focus:outline-none focus:ring-2 focus:ring-[#0a7a90]/20 transition-colors ${className}`}
      />
      {rightIcon ? (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
          {rightIcon}
        </span>
      ) : null}
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Name, email and password are required");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setSubmitting(true);
    try {
      await api.post(
        "/auth/advisor/signup",
        { name, email, phoneNumber, password, confirmPassword },
        { skipAuth: true }
      );
      toast.success("Verification code sent to your email");
      router.push(`/verify?email=${encodeURIComponent(email)}&purpose=verify`);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Signup failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      bgImage="/login.png"
      title="Become an Advisor"
      subtitle="Create your account and start guiding clients"
      bottomLink={{
        href: "/login",
        text: "Already have an account?",
        label: "Sign in",
      }}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <PillInput
          autoComplete="name"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          leftIcon={<UserIcon size={18} />}
          required
        />
        <PillInput
          type="email"
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<MailIcon size={18} />}
          required
        />
        <PillInput
          type="tel"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhone(e.target.value)}
          leftIcon={<PhoneIcon size={18} />}
        />
        <PillInput
          type={showPwd ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<LockIcon size={18} />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              aria-label="toggle password"
              className="text-slate-400 hover:text-slate-700"
            >
              {showPwd ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
            </button>
          }
          required
        />
        <PillInput
          type={showPwd ? "text" : "password"}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirm(e.target.value)}
          leftIcon={<LockIcon size={18} />}
          required
        />
        <Button
          type="submit"
          loading={submitting}
          className="w-full mt-2"
          size="lg"
        >
          Create Account
        </Button>
      </form>
    </AuthShell>
  );
}
