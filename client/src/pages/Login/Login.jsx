// Login.jsx (smaller/compact, NO HeroUI)
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setSession, getSession } from "../../lib/api";
import logo from "../../assets/logo.png";

export default function Login() {
  const navigate = useNavigate();
  const existing = getSession();

  React.useEffect(() => {
    if (existing?.user?.role === "admin") navigate("/admin", { replace: true });
        if (existing?.user?.role === "manager") navigate("/manager", { replace: true });
    if (existing?.user?.role === "user") navigate("/user", { replace: true });
  }, [existing, navigate]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const { token, user } = await api.login(username, password);
      setSession({ token, user });
      navigate(user.role === "admin" ? "/admin" : "/user", { replace: true });
    } catch (e2) {
      setErr(e2?.message || "Gabim");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* soft background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-72 w-72 rounded-full bg-blue-200/35 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-72 w-72 rounded-full bg-indigo-200/35 blur-3xl" />
      </div>

      <div className="relative mx-auto min-h-screen max-w-sm px-4 flex items-center">
        <div className="w-full">
          {/* logo (smaller) */}
          <div className="flex justify-center mb-4">
            <div className="h-14 w-14 rounded-3xl bg-white border border-slate-200 shadow-sm grid place-items-center overflow-hidden">
              <img src={logo} alt="Komuna" className="h-9 w-9 object-contain" />
            </div>
          </div>

          {/* card (smaller paddings/fonts) */}
          <form
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            onSubmit={submit}
            className="rounded-3xl border border-slate-200 bg-white shadow-sm p-5"
          >
            <div className="text-center mb-5">
              <h1 className="text-lg font-bold text-slate-900">Login</h1>
              <p className="text-xs text-slate-500 mt-1">Kyçu për të vazhduar.</p>
            </div>

            <label className="block text-xs font-medium text-slate-700 mb-2">Username</label>
            <input
              className="w-full h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              name="login_username"
              inputMode="text"
              placeholder="Username..."
            />

            <div className="h-3" />

            <label className="block text-xs font-medium text-slate-700 mb-2">Password</label>
            <input
              className="w-full h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              name="login_password"
              autoComplete="new-password"
              placeholder="Password..."
            />

            {err ? (
              <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {err}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading || !username || !password}
              className={[
                "mt-4 w-full h-10 rounded-2xl font-semibold text-sm text-white transition",
                "bg-blue-600 hover:bg-blue-700",
                "focus:outline-none focus:ring-4 focus:ring-blue-200",
                "disabled:opacity-60 disabled:cursor-not-allowed",
              ].join(" ")}
            >
              {loading ? "Duke u kyçur..." : "Hyr"}
            </button>

            <div className="mt-4 text-center text-[11px] text-slate-500">
              © {new Date().getFullYear()} Komuna e Strugës
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
