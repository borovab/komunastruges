// src/pages/SuperAdmin/SuperamdinDepartament/SuperamdinDepartament.jsx
// ✅ Pro UI: header + stats, search, grid cards, better modal, empty/loading states
import React from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../lib/api";
import { useLang } from "../../../contexts/LanguageContext";

function cn(...a) {
  return a.filter(Boolean).join(" ");
}

async function safeCreateDepartment(name) {
  if (typeof api.createDepartment !== "function") throw new Error("api.createDepartment is not a function");
  try {
    return await api.createDepartment({ name });
  } catch {
    return await api.createDepartment(name);
  }
}

async function safeUpdateDepartment(depId, name) {
  if (typeof api.updateDepartment !== "function") throw new Error("api.updateDepartment is not a function");
  try {
    return await api.updateDepartment(depId, { name });
  } catch {
    return await api.updateDepartment({ id: depId, name });
  }
}

function fmtDate(v) {
  if (!v) return "";
  try {
    return new Date(v).toLocaleString();
  } catch {
    return "";
  }
}

export default function SuperamdinDepartament() {
  const { t } = useLang();
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [ok, setOk] = React.useState("");

  const [departments, setDepartments] = React.useState([]);

  // add department
  const [newDepName, setNewDepName] = React.useState("");
  const [addingDep, setAddingDep] = React.useState(false);

  // search
  const [q, setQ] = React.useState("");

  // edit department modal
  const [depEditOpen, setDepEditOpen] = React.useState(false);
  const [depEditId, setDepEditId] = React.useState(null);
  const [depEditName, setDepEditName] = React.useState("");
  const [savingDep, setSavingDep] = React.useState(false);

  const load = async () => {
    setLoading(true);
    setErr("");
    setOk("");
    try {
      const deps = await api.listDepartments();
      setDepartments(deps?.departments || []);
    } catch (e) {
      setErr(e?.message || t("common.errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = React.useMemo(() => {
    const s = String(q || "").trim().toLowerCase();
    if (!s) return departments;
    return departments.filter((d) => String(d?.name || "").toLowerCase().includes(s));
  }, [departments, q]);

  const submitAddDepartment = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    const name = String(newDepName || "").trim();
    if (!name) return setErr(t("superAdminDepartments.errors.nameRequired"));

    setAddingDep(true);
    try {
      await safeCreateDepartment(name);
      setNewDepName("");
      setOk(t("superAdminDepartments.ok.created"));
      await load();
    } catch (e2) {
      setErr(e2?.message || t("common.errorGeneric"));
    } finally {
      setAddingDep(false);
    }
  };

  const openEditDepartment = (dep) => {
    setErr("");
    setOk("");
    setDepEditId(dep?.id || null);
    setDepEditName(dep?.name || "");
    setDepEditOpen(true);
  };

  const closeEditDepartment = () => {
    setDepEditOpen(false);
    setDepEditId(null);
    setDepEditName("");
    setSavingDep(false);
  };

  const submitEditDepartment = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    const id = depEditId;
    const name = String(depEditName || "").trim();
    if (!id) return setErr(t("common.errorGeneric"));
    if (!name) return setErr(t("superAdminDepartments.errors.nameRequired"));

    setSavingDep(true);
    try {
      await safeUpdateDepartment(id, name);
      setOk(t("superAdminDepartments.ok.updated"));
      closeEditDepartment();
      await load();
    } catch (e2) {
      setErr(e2?.message || t("common.errorGeneric"));
      setSavingDep(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-4 py-5 sm:py-7">
      {/* Top Header */}
      <div className="mb-4 sm:mb-6 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600 shadow-sm">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            {t("superAdminDepartments.headerTitle")}
          </div>

          <h2 className="mt-3 text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            {t("superAdminDepartments.headerTitle")}
          </h2>
          <p className="mt-1 text-[13px] sm:text-sm text-slate-600">{t("superAdminDepartments.headerSubtitle")}</p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <button
            type="button"
            onClick={load}
            className="h-10 px-4 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition text-[13px] font-semibold shadow-sm"
          >
            {t("superAdminDepartments.actions.refresh")}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {err ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-700">
          {err}
        </div>
      ) : null}

      {ok ? (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[13px] text-emerald-800">
          {ok}
        </div>
      ) : null}

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Left: Add + Search + Stats */}
        <div className="lg:col-span-1 space-y-3 sm:space-y-4">
          {/* Quick Stats */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-4">
            <div className="text-sm font-semibold text-slate-900">{t("superAdminDepartments.list.title")}</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[11px] font-semibold text-slate-500">{t("superAdminDepartments.list.totalPrefix")}</div>
                <div className="mt-1 text-2xl font-extrabold text-slate-900">{departments.length}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[11px] font-semibold text-slate-500">Showing</div>
                <div className="mt-1 text-2xl font-extrabold text-slate-900">{filtered.length}</div>
              </div>
            </div>
          </div>

          {/* Add Department */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-4">
            <div className="text-sm font-semibold text-slate-900">{t("superAdminDepartments.create.title")}</div>
            <div className="text-[12px] text-slate-500 mt-1">{t("superAdminDepartments.create.subtitle")}</div>

            <form onSubmit={submitAddDepartment} className="mt-3 space-y-2">
              <label className="block text-xs font-medium text-slate-700">{t("superAdminDepartments.create.nameLabel")}</label>
              <div className="flex gap-2">
                <input
                  value={newDepName}
                  onChange={(e) => setNewDepName(e.target.value)}
                  placeholder={t("superAdminDepartments.create.namePlaceholder")}
                  className="flex-1 h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
                <button
                  type="submit"
                  disabled={addingDep}
                  className={cn(
                    "h-11 px-4 rounded-2xl text-white text-sm font-semibold transition shadow-sm",
                    addingDep ? "bg-blue-600/70 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  )}
                >
                  {t("superAdminDepartments.create.add")}
                </button>
              </div>
            </form>
          </div>

          {/* Search */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-4">
            <div className="text-sm font-semibold text-slate-900">Search</div>
            <div className="mt-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Type department name…"
                className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        {/* Right: Department Cards */}
        <div className="lg:col-span-2">
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">Departments</div>
                <div className="text-[12px] text-slate-500 mt-1">
                  {t("superAdminDepartments.list.totalPrefix")} <b className="text-slate-700">{departments.length}</b>
                </div>
              </div>

              {loading ? <div className="text-sm text-slate-500">{t("common.loading")}</div> : null}
            </div>

            {!loading && filtered.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">{t("superAdminDepartments.list.empty")}</div>
                <div className="text-[12px] text-slate-500 mt-1">
                  Create a department on the left, then click it to manage workers.
                </div>
              </div>
            ) : null}

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {filtered.map((d) => (
                <div
                  key={d.id}
                  className="group rounded-3xl border border-slate-200 bg-white hover:bg-slate-50 transition shadow-sm"
                >
                  <div className="p-4 flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => navigate(`/superadmin/departments/${d.id}`)}
                      className="min-w-0 text-left flex-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 text-sm font-bold">
                          {String(d?.name || "?").trim().slice(0, 1).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900 truncate">{d.name}</div>
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">{fmtDate(d.createdAt)}</div>
                        </div>
                      </div>

                      <div className="mt-3 text-[12px] text-slate-600">
                        <span className="inline-flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                          Click to open workers
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditDepartment(d)}
                      className="shrink-0 h-9 px-3 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-[12px] font-semibold shadow-sm"
                    >
                      {t("superAdminDepartments.actions.edit")}
                    </button>
                  </div>

                  <div className="h-px bg-slate-100" />

                  <div className="px-4 py-3 flex items-center justify-between text-[12px] text-slate-500">
                    <span className="truncate">ID: {String(d.id).slice(0, 8)}…</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-600">
                      Open <span className="transition group-hover:translate-x-0.5">→</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* skeleton while loading */}
            {loading ? (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-3xl border border-slate-200 bg-white p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-2xl bg-slate-100" />
                      <div className="flex-1">
                        <div className="h-4 w-40 bg-slate-100 rounded" />
                        <div className="mt-2 h-3 w-24 bg-slate-100 rounded" />
                        <div className="mt-4 h-3 w-32 bg-slate-100 rounded" />
                      </div>
                    </div>
                    <div className="mt-4 h-px bg-slate-100" />
                    <div className="mt-3 h-3 w-28 bg-slate-100 rounded" />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Edit Department Modal */}
      {depEditOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">{t("superAdminDepartments.actions.edit")}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Update department name</div>
              </div>
              <button
                type="button"
                onClick={closeEditDepartment}
                className="h-9 px-3 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-[12px] font-semibold"
              >
                {t("common.close")}
              </button>
            </div>

            <form onSubmit={submitEditDepartment} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  {t("superAdminDepartments.edit.nameLabel")}
                </label>
                <input
                  value={depEditName}
                  onChange={(e) => setDepEditName(e.target.value)}
                  className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeEditDepartment}
                  className="h-11 px-4 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm font-semibold"
                >
                  {t("superAdminDepartments.actions.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={savingDep}
                  className={cn(
                    "h-11 px-4 rounded-2xl text-white text-sm font-semibold transition shadow-sm",
                    savingDep ? "bg-blue-600/70 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  )}
                >
                  {savingDep ? t("common.loading") : t("superAdminDepartments.actions.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
