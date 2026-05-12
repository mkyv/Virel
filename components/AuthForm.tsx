"use client";

import {
  useState,
  useEffect,
  type FormEvent,
  type ChangeEvent,
} from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { createClient } from "@/libs/supabase/client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_COOLDOWN_S = 30;

interface Props {
  mode: "signin" | "signup";
}

// Auth con OTP code (no magic link). Dos pasos:
//   1. Email → POST signInWithOtp → email con código de 6 dígitos.
//   2. Code → verifyOtp → sesión seteada → redirect a /api/auth/callback que
//      sincroniza el locale del profile y termina en /dashboard.
//
// `mode` controla:
//   - shouldCreateUser: true en signup, false en signin (signin rechaza emails desconocidos).
//   - El CTA cruzado del footer ("¿No tenés cuenta? → /signup" o viceversa).
export default function AuthForm({ mode }: Props) {
  const t = useTranslations("app.auth");
  const tMode = useTranslations(`app.${mode}`);
  const supabase = createClient();

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendRemaining, setResendRemaining] = useState(0);

  // Cooldown del botón "Resend code"
  useEffect(() => {
    if (resendRemaining <= 0) return;
    const interval = setInterval(() => {
      setResendRemaining((r) => Math.max(0, r - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendRemaining]);

  const sendCode = async (isResend = false): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: mode === "signup" },
      });
      if (error) throw error;
      setResendRemaining(RESEND_COOLDOWN_S);
      if (isResend) toast.success(t("codeResent"));
      return true;
    } catch (e) {
      // Supabase devuelve mensaje específico cuando shouldCreateUser=false y el email no existe.
      const message =
        e instanceof Error ? e.message.toLowerCase() : "";
      if (mode === "signin" && message.includes("not")) {
        toast.error(t("noAccount"));
      } else {
        toast.error(t("error"));
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      toast.error(t("invalidEmail"));
      return;
    }
    const ok = await sendCode();
    if (ok) {
      setStep("code");
      setCode("");
    }
  };

  const handleCodeSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (code.length !== 6) {
      toast.error(t("invalidCode"));
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "email",
      });
      if (error) throw error;
      // Sesión seteada. Redirigir al callback para que sincronice locale +
      // mande al callbackUrl final.
      window.location.href = "/api/auth/callback";
    } catch {
      toast.error(t("invalidCode"));
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/api/auth/callback",
        },
      });
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  const handleCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCode(event.target.value.replace(/\D/g, "").slice(0, 6));
  };

  // ── Step 2: code input ─────────────────────────────────────────────────────
  if (step === "code") {
    return (
      <div className="space-y-6">
        <p className="text-sm text-base-content/80 text-center">
          {t("codeSent", { email })}
        </p>

        <form onSubmit={handleCodeSubmit} className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            autoComplete="one-time-code"
            placeholder={t("codePlaceholder")}
            value={code}
            onChange={handleCodeChange}
            className="input input-bordered w-full text-center text-2xl tracking-widest"
            autoFocus
            required
          />

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isLoading || code.length !== 6}
          >
            {isLoading && (
              <span className="loading loading-spinner loading-xs"></span>
            )}
            {t("verify")}
          </button>
        </form>

        <div className="text-center text-sm text-base-content/70 space-y-2">
          <p>{t("codeValidity")}</p>
          <button
            type="button"
            onClick={() => sendCode(true)}
            disabled={resendRemaining > 0 || isLoading}
            className="link link-primary disabled:opacity-50 disabled:no-underline"
          >
            {resendRemaining > 0
              ? t("resendIn", { seconds: resendRemaining })
              : t("resendCode")}
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setStep("email");
            setCode("");
            setResendRemaining(0);
          }}
          className="btn btn-ghost btn-sm btn-block"
        >
          {t("changeEmail")}
        </button>
      </div>
    );
  }

  // ── Step 1: email input ────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <input
          type="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input input-bordered w-full placeholder:opacity-60"
          required
          autoFocus
        />
        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={isLoading}
        >
          {isLoading && (
            <span className="loading loading-spinner loading-xs"></span>
          )}
          {t("continueWithEmail")}
        </button>
      </form>

      <div className="divider text-xs text-base-content/50 font-medium">
        {t("or")}
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={isLoading}
        className="btn btn-block"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          viewBox="0 0 48 48"
        >
          <path
            fill="#FFC107"
            d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
          />
          <path
            fill="#FF3D00"
            d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
          />
          <path
            fill="#4CAF50"
            d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
          />
          <path
            fill="#1976D2"
            d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
          />
        </svg>
        {t("continueWithGoogle")}
      </button>

      <p className="text-center text-sm text-base-content/70">
        {mode === "signin" ? (
          <>
            {tMode("noAccountPrompt")}{" "}
            <Link href="/signup" className="link link-primary">
              {tMode("signUpCta")}
            </Link>
          </>
        ) : (
          <>
            {tMode("haveAccountPrompt")}{" "}
            <Link href="/signin" className="link link-primary">
              {tMode("signInCta")}
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
