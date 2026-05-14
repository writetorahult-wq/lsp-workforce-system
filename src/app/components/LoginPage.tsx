import { supabase } from "../../lib/supabase";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError("");

      await login(email.trim(), password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      setResetError("Please enter your email address.");
      return;
    }

    try {
      setIsResetting(true);
      setResetError("");
      setResetMessage("");

      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) {
        throw error;
      }

      setResetMessage(
        "If the email exists, a password reset link has been sent. Check your inbox."
      );
    } catch (err) {
      setResetError(err instanceof Error ? err.message : "Unable to send reset email.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),transparent_32%),linear-gradient(180deg,_#f8fbff_0%,_#ffffff_100%)] flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col items-center gap-6 text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-blue-600 shadow-[0_24px_80px_-40px_rgba(37,99,235,0.8)]">
            <Briefcase className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900">LSP USA LLC</h1>
            <p className="mt-3 text-base sm:text-lg text-slate-500">Workforce Management System</p>
            <p className="mt-1 text-sm text-slate-400">Chicago Plant</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/95 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
          <div className="p-8 sm:p-10">
            <div className="max-w-xl mx-auto text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900">Employee & Management Login</h2>
              <p className="mt-3 text-sm sm:text-base text-slate-500">Enter your company credentials to continue</p>
            </div>

            {error && (
              <div className="mb-6 rounded-3xl border border-red-200/80 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
                  <p>{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Company Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="your.name@lsp.llc"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex items-center gap-3 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowReset((current) => !current);
                    setResetError("");
                    setResetMessage("");
                  }}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  disabled={isLoading}
                >
                  {showReset ? "Back to sign in" : "Forgot Password?"}
                </button>
              </div>

              {showReset && (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm text-slate-600 mb-4">
                    Enter your email address to receive a password reset link.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="resetEmail" className="block text-sm font-medium text-slate-700 mb-2">
                        Reset Email
                      </label>
                      <input
                        id="resetEmail"
                        type="email"
                        value={resetEmail}
                        onChange={(e) => {
                          setResetEmail(e.target.value);
                          setResetError("");
                          setResetMessage("");
                        }}
                        className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-4 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        placeholder="your.name@lsp.llc"
                        disabled={isResetting}
                      />
                    </div>
                    {resetError && (
                      <p className="text-sm text-red-600">{resetError}</p>
                    )}
                    {resetMessage && (
                      <p className="text-sm text-green-600">{resetMessage}</p>
                    )}
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      disabled={isResetting}
                      className={`w-full rounded-3xl px-6 py-4 text-base font-semibold text-white shadow-lg transition-all ${
                        isResetting
                          ? "bg-blue-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {isResetting ? "Sending reset link..." : "Send Reset Link"}
                    </button>
                  </div>
                </div>
              )}

              {!showReset && (
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full rounded-3xl px-6 py-4 text-base font-semibold text-white shadow-lg transition-all ${
                    isLoading
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Signing in...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </button>
              )}
            </form>
          </div>
        </div>

        <div className="mt-10 text-center text-sm text-slate-500">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-slate-600 shadow-sm">
            <span className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">L</span>
            <span>Manufacturing Workforce Management - Chicago Plant</span>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
            <span>Day Shift: 8AM-8PM</span>
            <span>•</span>
            <span>Night Shift: 8PM-8AM</span>
          </div>
          <p className="mt-4">© 2026 LSP USA LLC. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
