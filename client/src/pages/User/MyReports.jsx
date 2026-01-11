import React from "react";
import { api } from "../../lib/api";

export default function UserDashboard() {
  const [reports, setReports] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [okMsg, setOkMsg] = React.useState("");

  // form
  const [department, setDepartment] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [date, setDate] = React.useState(() => new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
  const [timeLeft, setTimeLeft] = React.useState(""); // HH:MM

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const r = await api.getReports(); // server e filtron automatikisht per user
      setReports(r.reports || []);
    } catch (e) {
      setErr(e.message || "Gabim");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setOkMsg("");

    try {
      await api.createReport({
        department: department.trim() || null,
        reason: reason.trim(),
        date: String(date || "").trim(),
        timeLeft: String(timeLeft || "").trim(),
      });

      setDepartment("");
      setReason("");
      setTimeLeft("");
      setOkMsg("Raporti u dërgua me sukses.");
      await load();
    } catch (e2) {
      setErr(e2.message || "Gabim");
    }
  };

  return (
    <div style={page}>
      <h2>Punëtor • Raportet e mia</h2>

      {err ? <div style={errBox}>{err}</div> : null}
      {okMsg ? <div style={okBox}>{okMsg}</div> : null}

      <div style={card}>
        <h3 style={{ marginTop: 0 }}>Raporto dalje më herët</h3>

        <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
          <div>
            <label style={lbl}>Sektori / Drejtoria (opsionale)</label>
            <input style={inp} value={department} onChange={(e) => setDepartment(e.target.value)} />
          </div>

          <div>
            <label style={lbl}>Arsyeja</label>
            <textarea
              style={txt}
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Shkruaj arsyen pse po del më herët…"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={lbl}>Data</label>
              <input style={inp} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div>
              <label style={lbl}>Ora e daljes</label>
              <input style={inp} type="time" value={timeLeft} onChange={(e) => setTimeLeft(e.target.value)} />
            </div>
          </div>

          <button style={btn}>Dërgo raportin</button>

          <div style={{ fontSize: 12, opacity: 0.75 }}>
            Raporti shkon direkt te admini për verifikim.
          </div>
        </form>
      </div>

      <h3 style={{ marginTop: 18 }}>Historiku</h3>

      {loading ? <div>Loading…</div> : null}
      {!loading && reports.length === 0 ? <div style={{ opacity: 0.8 }}>S’ke raporte ende.</div> : null}

      <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
        {reports.map((r) => (
          <div key={r.id} style={item}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <b>{r.date} • {r.timeLeft}</b>
              <span style={pill(r.status)}>{r.status}</span>
            </div>

            {r.department ? (
              <div style={{ marginTop: 6, fontSize: 13, opacity: 0.85 }}>
                {r.department}
              </div>
            ) : null}

            <div style={{ marginTop: 8 }}>{r.reason}</div>

            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
              Created: {new Date(r.createdAt).toLocaleString()}
              {r.reviewedAt ? ` • Reviewed: ${new Date(r.reviewedAt).toLocaleString()}` : ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const page = { maxWidth: 900, margin: "0 auto", padding: 16 };

const errBox = {
  marginTop: 10,
  padding: 10,
  borderRadius: 12,
  background: "#fee2e2",
  border: "1px solid #fecaca",
  color: "#7f1d1d",
};
const okBox = {
  marginTop: 10,
  padding: 10,
  borderRadius: 12,
  background: "#dcfce7",
  border: "1px solid #bbf7d0",
  color: "#14532d",
};

const card = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 12,
  background: "white",
  marginTop: 12,
};

const lbl = { display: "block", marginBottom: 6, fontSize: 13, opacity: 0.9 };
const inp = { width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #e5e7eb" };
const txt = { width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #e5e7eb", resize: "vertical" };

const btn = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #111827",
  background: "#111827",
  color: "white",
  cursor: "pointer",
};

const item = { border: "1px solid #e5e7eb", borderRadius: 16, padding: 12, background: "white" };

const pill = (s) => ({
  fontSize: 12,
  padding: "4px 8px",
  borderRadius: 999,
  border: "1px solid #e5e7eb",
  background: s === "reviewed" ? "#dcfce7" : "#fef9c3",
});
