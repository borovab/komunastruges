import React from "react";
import { api } from "../../../lib/api";

export default function UserProfile() {
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [ok, setOk] = React.useState("");

  const [fullName, setFullName] = React.useState("");
  const [password, setPassword] = React.useState("");

  const load = async () => {
    setLoading(true);
    setErr("");
    setOk("");
    try {
      const r = await api.getProfile();
      setFullName(r.user?.fullName || "");
    } catch (e) {
      setErr(e.message || "Gabim");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");
    try {
      await api.updateProfile({
        fullName,
        password: password.trim() ? password : undefined,
      });
      setPassword("");
      setOk("Profili u ruajt.");
      await load();
    } catch (e2) {
      setErr(e2.message || "Gabim");
    }
  };

  return (
    <div style={page}>
      <h2 style={{ marginTop: 0 }}>Profili im</h2>

      {err ? <div style={errBox}>{err}</div> : null}
      {ok ? <div style={okBox}>{ok}</div> : null}

      <div style={card}>
        {loading ? (
          <div>Loading…</div>
        ) : (
          <form onSubmit={save} style={{ display: "grid", gap: 12 }}>
            <div>
              <label style={lbl}>Emri dhe mbiemri</label>
              <input style={inp} value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>

            <div>
              <label style={lbl}>Password i ri (opsional)</label>
              <input
                style={inp}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Lëre bosh nëse s’do me e ndërru"
              />
            </div>

            <button style={btn}>Ruaj</button>
          </form>
        )}
      </div>
    </div>
  );
}

const page = { maxWidth: 720, margin: "0 auto", padding: 16 };
const card = { border: "1px solid #e5e7eb", borderRadius: 16, padding: 14, background: "white", marginTop: 12 };

const lbl = { display: "block", marginBottom: 6, fontSize: 13, opacity: 0.9 };
const inp = { width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #e5e7eb" };
const btn = { padding: "10px 12px", borderRadius: 12, border: "1px solid #111827", background: "#111827", color: "white", cursor: "pointer" };

const errBox = { marginTop: 10, padding: 10, borderRadius: 12, background: "#fee2e2", border: "1px solid #fecaca", color: "#7f1d1d" };
const okBox = { marginTop: 10, padding: 10, borderRadius: 12, background: "#dcfce7", border: "1px solid #bbf7d0", color: "#14532d" };
