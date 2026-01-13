import React from "react";
import { api, getSession, setSession } from "../../../lib/api";
import { useLang } from "../../../contexts/LanguageContext"; // 🔁 ndrysho path sipas projektit

function cn(...a) {
  return a.filter(Boolean).join(" ");
}

export default function UserProfile() {
  const { t } = useLang();

  const s = getSession();
  const user = s?.user;

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState("");
  const [ok, setOk] = React.useState("");

  const [fullName, setFullName] = React.useState(user?.fullName || "");
  const [password, setPassword] = React.useState("");
  const [password2, setPassword2] = React.useState("");

  const load = async () => {
    setLoading(true);
    setErr("");
    setOk("");
    try {
      const r = await api.getProfile();
      setFullName(r.user?.fullName || "");

      // refresh session name in UI (optional but nice)
      if (r.user?.fullName) {
        const cur = getSession();
        if (cur?.user) setSession({ ...cur, user: { ...cur.user, fullName: r.user.fullName } });
      }
    } catch (e) {
      setErr(e?.message || t("userProfile.errors.generic"));
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    if (!fullName.trim()) return setErr(t("userProfile.errors.fullNameRequired"));
    if (password.trim() && password.length < 6) return setErr(t("userProfile.errors.passwordMin"));
    if (password.trim() && password !== password2) return setErr(t("userProfile.errors.passwordMatch"));

    setSaving(true);
    try {
      await api.updateProfile({
        fullName: fullName.trim(),
        password: password.trim() ? password : undefined,
      });

      // update session so Nav updates immediately
      const cur = getSession();
      if (cur?.user) {
        setSession({ ...cur, user: { ...cur.user, fullName: fullName.trim() } });
      }

      setPassword("");
      setPassword2("");
      setOk(t("userProfile.ok.saved"));
      await load();
    } catch (e2) {
      setErr(e2?.message || t("userProfile.errors.generic"));
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div style={page} className="up-page">
      <div style={head}>
        <div>
          <h2 style={title} className="up-title">
            {t("userProfile.title")}
          </h2>
          <p style={sub} className="up-sub">
            {t("userProfile.subtitle")}
          </p>
        </div>

        <span style={rolePill} className="up-role">
          {user.role}
        </span>
      </div>

      {err ? <div style={errBox}>{err}</div> : null}
      {ok ? <div style={okBox}>{ok}</div> : null}

      {/* Header card */}
      <div style={card} className="up-card">
        <div style={cardTop}>
          <div style={avatar} className="up-avatar">
            {(fullName || user.fullName || "U").trim().slice(0, 1).toUpperCase()}
          </div>

          <div style={{ lineHeight: 1.2 }}>
            <div style={nameLine}>{fullName || user.fullName}</div>
            <div style={metaLine}>@{user.username}</div>
          </div>
        </div>

        <div style={grid2} className="up-grid2">
          <div>
            <div style={metaLabel}>{t("userProfile.meta.id")}</div>
            <div style={metaValue}>{user.id || "-"}</div>
          </div>

          <div>
            <div style={metaLabel}>{t("userProfile.meta.role")}</div>
            <div style={metaValue}>{user.role}</div>
          </div>
        </div>
      </div>

      {/* Form card */}
      <div style={card} className="up-card">
        {loading ? (
          <div style={{ opacity: 0.85 }}>{t("userProfile.loading")}</div>
        ) : (
          <form onSubmit={save} style={{ display: "grid", gap: 12 }}>
            <label style={labelWrap}>
              <span style={lbl}>{t("userProfile.form.fullName")}</span>
              <input
                style={inp}
                className="up-inp"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t("userProfile.form.placeholders.fullName")}
              />
            </label>

            <div style={grid2Form} className="up-grid2form">
              <label style={labelWrap}>
                <span style={lbl}>{t("userProfile.form.password")}</span>
                <input
                  style={inp}
                  className="up-inp"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("userProfile.form.placeholders.password")}
                  autoComplete="new-password"
                />
              </label>

              <label style={labelWrap}>
                <span style={lbl}>{t("userProfile.form.password2")}</span>
                <input
                  style={inp}
                  className="up-inp"
                  type="password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  placeholder={t("userProfile.form.placeholders.password2")}
                  autoComplete="new-password"
                />
              </label>
            </div>

            <button type="submit" disabled={saving} style={cnBtn(saving)} className="up-btn">
              {saving ? t("userProfile.actions.saving") : t("userProfile.actions.save")}
            </button>

            <div style={hint}>{t("userProfile.hint")}</div>
          </form>
        )}
      </div>
    </div>
  );
}

/* styles */
const page = { maxWidth: 820, margin: "0 auto", padding: 16 };

const head = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
  marginBottom: 12,
  flexWrap: "wrap",
};

const title = { margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" };
const sub = { margin: "6px 0 0", fontSize: 12, color: "#64748b" };

const rolePill = {
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  border: "1px solid #e2e8f0",
  background: "#f8fafc",
  color: "#0f172a",
  alignSelf: "flex-start",
};

const card = {
  border: "1px solid #e2e8f0",
  borderRadius: 18,
  padding: 14,
  background: "white",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
  marginTop: 12,
};

const cardTop = { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" };

const avatar = {
  height: 44,
  width: 44,
  borderRadius: 16,
  display: "grid",
  placeItems: "center",
  fontWeight: 900,
  fontSize: 14,
  color: "#1d4ed8",
  border: "1px solid rgba(29, 78, 216, 0.15)",
  background: "rgba(29, 78, 216, 0.08)",
};

const nameLine = { fontSize: 14, fontWeight: 800, color: "#0f172a" };
const metaLine = { fontSize: 12, color: "#64748b", marginTop: 2 };

const grid2 = {
  marginTop: 12,
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
};

const metaLabel = { fontSize: 11, fontWeight: 800, color: "#94a3b8" };
const metaValue = { marginTop: 4, fontSize: 13, fontWeight: 700, color: "#0f172a", wordBreak: "break-word" };

const labelWrap = { display: "grid", gap: 6 };
const lbl = { fontSize: 12, fontWeight: 800, color: "#475569" };

const inp = {
  height: 42,
  padding: "0 12px",
  borderRadius: 14,
  border: "1px solid #e2e8f0",
  outline: "none",
  fontSize: 14,
  color: "#0f172a",
  width: "100%",
  boxSizing: "border-box",
};

const grid2Form = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
};

const cnBtn = (disabled) => ({
  height: 42,
  padding: "0 14px",
  borderRadius: 14,
  border: "1px solid #0f172a",
  background: disabled ? "#e2e8f0" : "#0f172a",
  color: disabled ? "#475569" : "white",
  cursor: disabled ? "not-allowed" : "pointer",
  fontWeight: 800,
  fontSize: 14,
  width: "100%",
});

const hint = { marginTop: 2, fontSize: 12, color: "#64748b" };

const errBox = {
  marginTop: 10,
  padding: 10,
  borderRadius: 14,
  background: "#fee2e2",
  border: "1px solid #fecaca",
  color: "#7f1d1d",
  fontSize: 13,
};

const okBox = {
  marginTop: 10,
  padding: 10,
  borderRadius: 14,
  background: "#dcfce7",
  border: "1px solid #bbf7d0",
  color: "#14532d",
  fontSize: 13,
};

/* ✅ RESPONSIVE (mobile) */
if (typeof document !== "undefined" && !document.getElementById("user-profile-responsive-css")) {
  const style = document.createElement("style");
  style.id = "user-profile-responsive-css";
  style.innerHTML = `
    @media (max-width: 640px) {
      .up-grid2 { grid-template-columns: 1fr !important; }
      .up-grid2form { grid-template-columns: 1fr !important; }
      .up-page { padding: 12px !important; }
      .up-card { padding: 12px !important; border-radius: 16px !important; }
      .up-inp { height: 36px !important; border-radius: 12px !important; font-size: 12px !important; padding: 0 10px !important; }
      .up-btn { height: 38px !important; border-radius: 12px !important; font-size: 13px !important; }
      .up-title { font-size: 16px !important; }
      .up-sub { font-size: 12px !important; }
      .up-role { font-size: 11px !important; padding: 5px 9px !important; }
      .up-avatar { height: 40px !important; width: 40px !important; border-radius: 14px !important; }
    }
  `;
  document.head.appendChild(style);
}
