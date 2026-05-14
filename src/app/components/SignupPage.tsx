import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { UserPlus, CheckCircle, AlertCircle } from "lucide-react";

export function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail || !password || !name) {
        setError("Name, email, and password are required.");
        return;
      }

      const { error: authError } = await supabase.auth.signUp(
        {
          email: normalizedEmail,
          password,
        },
        {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            full_name: name,
            role,
          },
        }
      );

      if (authError) {
        throw authError;
      }

      const { error: insertError } = await supabase.from("employees").insert({
        name,
        email: normalizedEmail,
        role,
        department: department || (role === "hr_admin" ? "Executive" : role === "team_leader" ? "Manufacturing" : "Operations"),
        position: position || (role === "hr_admin" ? "HR Administrator" : role === "team_leader" ? "Team Leader" : "Employee"),
      });

      if (insertError) {
        console.warn("[Supabase] Employee insert issue:", insertError.message);
      }

      setSuccess("User has been created. A confirmation email has been sent if required.");
      setName("");
      setEmail("");
      setPassword("");
      setDepartment("");
      setPosition("");
      setRole("employee");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create user.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-blue-600 shadow-[0_24px_80px_-40px_rgba(37,99,235,0.8)] mb-6">
            <UserPlus className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900">Create Workforce User</h1>
          <p className="mt-3 text-base sm:text-lg text-slate-500">Admin-only utility for onboarding new employees and managers.</p>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/95 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
          <div className="p-8 sm:p-10">
            {error && (
              <div className="mb-6 rounded-3xl border border-red-200/80 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
                  <p>{error}</p>
                </div>
              </div>
            )}
            {success && (
              <div className="mb-6 rounded-3xl border border-green-200/80 bg-green-50 px-5 py-4 text-sm text-green-700 shadow-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />
                  <p>{success}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Full name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="user@lsp.llc"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Create a strong password"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                  <select
                    id="role"
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="employee">Employee</option>
                    <option value="team_leader">Team Leader</option>
                    <option value="hr_admin">HR Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-slate-700 mb-2">Department</label>
                  <input
                    id="department"
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Manufacturing"
                  />
                </div>
                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-slate-700 mb-2">Position</label>
                  <input
                    id="position"
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Position"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full sm:w-auto rounded-3xl px-6 py-4 text-base font-semibold text-white shadow-lg transition-all ${
                    isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isLoading ? "Creating user..." : "Create User"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="w-full sm:w-auto rounded-3xl border border-slate-200 px-6 py-4 text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
