// src/pages/User/UserDashboard/UserDashboard.jsx
import React from "react";
import { api, getSession } from "../../../lib/api";

function cn(...a) {
  return a.filter(Boolean).join(" ");
}

function statusLabel(s) {
  const v = String(s || "").trim().toLowerCase();
  if (v === "submitted") return "pending";
  return v || "—";
}

function todayYMD() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const REASONS = [
  "Detyrë zyrtare",
  "Dalje në terren",
  "Pushim personal",
  "Arsye shëndetësore",
  "Tjetër",
];

function IconBuilding({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-6 w-6", className)} fill="currentColor" aria-hidden="true">
      <path d="M3 21h18v-2H3v2zm2-4h14V8H5v9zm4-6h6V9H9v2zM3 7l9-4 9 4v2H3V7z" />
    </svg>
  );
}
function IconPlus({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-6 w-6", className)} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function IconClipboard({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-6 w-6", className)} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 5h6a2 2 0 0 1 2 2v14H7V7a2 2 0 0 1 2-2z" />
      <path d="M9 5a3 3 0 0 0 6 0" />
      <path d="M9 12h6M9 16h6" />
    </svg>
  );
}
function IconBack({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-6 w-6", className)} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export default function UserDashboard() {
  const session = typeof getSession === "function" ? getSession() : null;
  const me = session?.user || null;

  const [mView, setMView] = React.useState("home"); // home | form | list

  const [reports, setReports] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [okMsg, setOkMsg] = React.useState("");

  const [deptName, setDeptName] = React.useState("");
  const [deptLoading, setDeptLoading] = React.useState(false);

  const [date, setDate] = React.useState(todayYMD());
  const [timeOut, setTimeOut] = React.useState("");
  const [timeReturn, setTimeReturn] = React.useState("");
  const [reasonChoice, setReasonChoice] = React.useState("");
  const [reasonText, setReasonText] = React.useState("");

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const r = await api.listReports();
      setReports(r.reports || []);
    } catch (e) {
      setErr(e?.message || "Gabim");
    } finally {
      setLoading(false);
    }
  };

  const loadDepartment = async () => {
    const depId = me?.departmentId || null;
    if (!depId || typeof api.listDepartments !== "function") return;

    setDeptLoading(true);
    try {
      const d = await api.listDepartments();
      const list = d?.departments || [];
      const found = list.find((x) => String(x.id) === String(depId));
      setDeptName(found?.name || "");
    } catch {
      setDeptName("");
    } finally {
      setDeptLoading(false);
    }
  };

  React.useEffect(() => {
    load();
    loadDepartment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setDate(todayYMD());
    setTimeOut("");
    setTimeReturn("");
    setReasonChoice("");
    setReasonText("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setOkMsg("");

    if (!reasonChoice) return setErr("Zgjidh arsyen.");
    if (!date) return setErr("Zgjidh datën.");
    if (!timeOut) return setErr("Zgjidh orën e daljes.");
    if (!timeReturn) return setErr("Zgjidh orën e kthimit.");

    try {
      await api.createReport({
        reasonChoice,
        reasonText,
        date,
        timeOut,
        timeReturn,
      });

      resetForm();
      setOkMsg("Raporti u dërgua me sukses.");
      await load();
      setMView("list");
    } catch (e2) {
      setErr(e2?.message || "Gabim");
    }
  };

  const MobileTopBar = ({ title, subtitle, back }) => (
    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      <div className="bg-gradient-to-b from-[#2f79ad] to-[#1f5f93] text-white px-4 py-4">
        <div className="flex items-center gap-3">
          {back ? (
            <button
              type="button"
              onClick={() => {
                setErr("");
                setOkMsg("");
                setMView("home");
              }}
              className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/15 transition flex items-center justify-center"
              aria-label="Back"
            >
              <IconBack className="text-white" />
            </button>
          ) : (
            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
              <IconBuilding className="text-white" />
            </div>
          )}

          <div className="min-w-0">
            <div className="text-base font-bold leading-tight">{title}</div>
            <div className="text-xs text-white/85">{subtitle}</div>
          </div>
        </div>
      </div>
    </div>
  );

  const MobileHome = () => (
    <div className="mt-4 space-y-3">
      <button
        type="button"
        onClick={() => {
          setErr("");
          setOkMsg("");
          setMView("form");
        }}
        className="w-full rounded-2xl border border-emerald-700/15 bg-gradient-to-b from-emerald-600 to-emerald-700 shadow-sm px-4 py-4"
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-white/15 flex items-center justify-center">
            <IconPlus className="text-white" />
          </div>
          <div className="text-left">
            <div className="text-white font-bold text-base">Regjistro dalje</div>
            <div className="text-white/85 text-xs">Regjistro dalje me 1 klik</div>
          </div>
        </div>
      </button>

      <button
        type="button"
        onClick={() => {
          setErr("");
          setOkMsg("");
          setMView("list");
        }}
        className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm px-4 py-4 hover:bg-slate-50 transition"
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-[#1f5f93]/10 flex items-center justify-center">
            <IconClipboard className="text-[#1f5f93]" />
          </div>
          <div className="text-left">
            <div className="text-slate-900 font-bold text-base">Daljet e mia</div>
            <div className="text-slate-500 text-xs">Evidenca e daljeve</div>
          </div>
        </div>
      </button>

      <div className="pt-1 flex items-center justify-end">
        <button type="button" onClick={load} className="text-xs font-semibold text-slate-600 hover:text-slate-900">
          Rifresko
        </button>
      </div>
    </div>
  );

  // ✅ MOBILE: inputs smaller (height, padding, text size)
  const MobileInput = "w-80 h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100";
  const MobileROInput = "w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs outline-none";
  const MobileLabel = "block text-[11px] font-medium text-slate-700 mb-1";
  const MobileTextarea =
    "w-full min-h-[80px] rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100";

  const MobileForm = () => (
    <form onSubmit={submit} className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
        <div className="text-sm font-semibold text-slate-900">Regjistro Daljen</div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <label className={MobileLabel}>Emri dhe Mbiemri</label>
          <input value={me?.fullName || ""} readOnly className={MobileROInput} placeholder="—" />
        </div>

        <div>
          <label className={MobileLabel}>ID e Punës</label>
          <input value={me?.username || me?.id || ""} readOnly className={MobileROInput} placeholder="—" />
        </div>

        <div>
          <label className={MobileLabel}>Drejtoria / Sektori</label>
          <input value={deptLoading ? "Duke ngarkuar…" : deptName || "—"} readOnly className={MobileROInput} />
        </div>

        <div>
          <label className={MobileLabel}>Arsyeja e daljes</label>
          <div className="space-y-1.5">
            {REASONS.map((r) => (
              <label key={r} className="flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="radio"
                  name="reasonChoice"
                  checked={reasonChoice === r}
                  onChange={() => setReasonChoice(r)}
                  className="h-3.5 w-3.5"
                />
                <span>{r}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className={MobileLabel}>Data</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={MobileInput} />
          </div>

          <div className="grid grid-cols-1 ">
            <div>
              <label className={MobileLabel}>Ora e daljes</label>
              <input type="time" value={timeOut} onChange={(e) => setTimeOut(e.target.value)} className={MobileInput} />
            </div>

            <div>
              <label className={MobileLabel}>Ora e kthimit</label>
              <input
                type="time"
                value={timeReturn}
                onChange={(e) => setTimeReturn(e.target.value)}
                className={MobileInput}
              />
            </div>
          </div>
        </div>

        <div>
          <label className={MobileLabel}>Shënim (opsionale)</label>
          <textarea
            value={reasonText}
            onChange={(e) => setReasonText(e.target.value)}
            className={MobileTextarea}
            placeholder="Shkruaj shënim..."
          />
        </div>
      </div>

      <div className="p-4 border-t border-slate-200 bg-white">
        <button
          type="submit"
          disabled={loading}
          className={cn(
            "w-full h-10 rounded-lg text-white font-bold shadow-sm transition text-sm",
            loading ? "bg-[#1f5f93]/70 cursor-not-allowed" : "bg-[#1f5f93] hover:bg-[#194f7a]"
          )}
        >
          {loading ? "Duke dërguar…" : "SUBMIT"}
        </button>
      </div>
    </form>
  );

  const MobileList = () => (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-900">Evidenca e daljeve</div>
          <div className="text-[12px] text-slate-500">{reports.length} dalje</div>
        </div>
        <button type="button" onClick={load} className="text-xs font-semibold text-slate-600 hover:text-slate-900">
          Rifresko
        </button>
      </div>

      {!loading && reports.length === 0 ? <div className="p-4 text-sm text-slate-500">S’ka dalje ende.</div> : null}
      {loading ? <div className="p-4 text-sm text-slate-500">Loading…</div> : null}

      {!loading && reports.length > 0 ? (
        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead className="bg-white">
              <tr className="text-left text-slate-600">
                <th className="px-3 py-2 font-semibold whitespace-nowrap">Data</th>
                <th className="px-3 py-2 font-semibold whitespace-nowrap">Emri</th>
                <th className="px-3 py-2 font-semibold whitespace-nowrap">Drejtoria</th>
                <th className="px-3 py-2 font-semibold whitespace-nowrap">Arsyeja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {reports.map((r) => (
                <tr key={r.id}>
                  <td className="px-3 py-2 whitespace-nowrap">{r.date || "—"}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{r.fullName || me?.fullName || "—"}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{r.departmentName || deptName || "—"}</td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{r.reasonChoice || r.reason || "—"}</div>
                    {r.reasonText ? (
                      <div className="text-[11px] text-slate-500 truncate max-w-[220px]">{r.reasonText}</div>
                    ) : null}
                    <div className="mt-1 text-[11px] text-slate-500">
                      {r.timeOut || r.timeLeft ? `Dalja: ${r.timeOut || r.timeLeft}` : ""}
                      {r.timeReturn ? ` • Kthimi: ${r.timeReturn}` : ""}
                    </div>
                    <div className="mt-1">
                      <span
                        className={cn(
                          "inline-flex items-center h-5 px-2 rounded-full text-[10px] font-semibold border",
                          statusLabel(r.status) === "reviewed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        )}
                      >
                        {statusLabel(r.status)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );

  const DesktopUI = () => (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Raporto dalje më herët</h2>
          <p className="text-sm text-slate-500 mt-1">Plotëso raportin dhe shiko raportet e tua.</p>
        </div>

        <button
          type="button"
          onClick={load}
          className="h-10 px-4 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition text-sm font-semibold"
        >
          Rifresko
        </button>
      </div>

      {err ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>
      ) : null}

      {okMsg ? (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {okMsg}
        </div>
      ) : null}

      <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div className="text-sm font-semibold text-slate-900">Dërgo raportim</div>
          <div className="text-[12px] text-slate-500">Plotëso fushat poshtë.</div>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">Ora e daljes</label>
              <input
                type="time"
                value={timeOut}
                onChange={(e) => setTimeOut(e.target.value)}
                className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">Ora e kthimit</label>
              <input
                type="time"
                value={timeReturn}
                onChange={(e) => setTimeReturn(e.target.value)}
                className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-2">Arsyeja e daljes</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {REASONS.map((r) => (
                <label
                  key={r}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border px-3 py-2 text-sm cursor-pointer transition",
                    reasonChoice === r ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50"
                  )}
                >
                  <input
                    type="radio"
                    name="reasonChoiceDesktop"
                    checked={reasonChoice === r}
                    onChange={() => setReasonChoice(r)}
                    className="h-4 w-4"
                  />
                  <span className="text-slate-700">{r}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-2">Shënim / Arsye (opsionale)</label>
            <textarea
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              className="w-full min-h-[110px] rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              placeholder="Shkruaj shënim..."
            />
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row gap-2 sm:justify-end">
          <button
            className={cn(
              "h-11 px-5 rounded-2xl text-white transition text-sm font-semibold",
              loading ? "bg-blue-600/70 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            )}
            type="submit"
            disabled={loading}
          >
            {loading ? "Duke dërguar…" : "Dërgo raportin"}
          </button>
        </div>
      </form>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">Raportet e mia</div>
            <div className="text-[12px] text-slate-500">{reports.length} raporte</div>
          </div>
          {loading ? <div className="text-sm text-slate-500">Loading…</div> : null}
        </div>

        {!loading && reports.length === 0 ? <div className="p-6 text-sm text-slate-500">S’ka raporte ende.</div> : null}

        {!loading && reports.length > 0 ? (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-white">
                <tr className="text-left text-slate-600">
                  <th className="px-4 py-3 font-semibold w-[70px]">#</th>
                  <th className="px-4 py-3 font-semibold">Data</th>
                  <th className="px-4 py-3 font-semibold">Ora e daljes</th>
                  <th className="px-4 py-3 font-semibold">Ora e kthimit</th>
                  <th className="px-4 py-3 font-semibold">Arsye</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Drejtoria</th>
                  <th className="px-4 py-3 font-semibold">Krijuar</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {reports.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-slate-500">{idx + 1}</td>
                    <td className="px-4 py-3 text-slate-700">{r.date || "—"}</td>
                    <td className="px-4 py-3 text-slate-700">{r.timeOut || r.timeLeft || "—"}</td>
                    <td className="px-4 py-3 text-slate-700">{r.timeReturn || "—"}</td>
                    <td className="px-4 py-3 text-slate-700">
                      <div className="font-medium">{r.reasonChoice || r.reason || "—"}</div>
                      {r.reasonText ? <div className="text-xs text-slate-500 truncate max-w-[560px]">{r.reasonText}</div> : null}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center h-7 px-3 rounded-2xl text-xs font-semibold border",
                          statusLabel(r.status) === "reviewed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        )}
                      >
                        {statusLabel(r.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{r.departmentName || deptName || "—"}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <>
      <div className="sm:hidden max-w-md mx-auto px-4 py-6">
        <MobileTopBar
          title={mView === "form" ? "Regjistro Daljen" : "Daljet nga objekti"}
          subtitle="Komuna e Strugës"
          back={mView !== "home"}
        />

        {err ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>
        ) : null}

        {okMsg ? (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {okMsg}
          </div>
        ) : null}

        {mView === "home" ? <MobileHome /> : null}
        {mView === "form" ? <MobileForm /> : null}
        {mView === "list" ? <MobileList /> : null}
      </div>

      <div className="hidden sm:block">
        <DesktopUI />
      </div>
    </>
  );
}
