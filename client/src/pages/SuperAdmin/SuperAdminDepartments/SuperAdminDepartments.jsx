// src/pages/SuperAdmin/SuperAdminDepartments/SuperAdminDepartments.jsx (FULL)
// ✅ i18n (NO SQ fallback) + create/edit/delete + confirm delete
import React from "react";
import { api } from "../../../lib/api";
import { useLang } from "../../../contexts/LanguageContext"; // 🔁 ndrysho path sipas projektit

function cn(...a) {
  return a.filter(Boolean).join(" ");
}

export default function SuperAdminDepartments() {
  const { t } = useLang();

  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [ok, setOk] = React.useState("");

  const [departments, setDepartments] = React.useState([]);

  // create
  const [name, setName] = React.useState("");

  // edit
  const [editingId, setEditingId] = React.useState(null);
  const [eName, setEName] = React.useState("");

  const load = async () => {
    setLoading(true);
    setErr("");
    setOk("");
    try {
      const r = await api.listDepartments();
      setDepartments(r?.departments || []);
    } catch (e) {
      setErr(e?.message || t("superAdminDepartments.errors.generic"));
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const create = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    const v = name.trim();
    if (!v) return setErr(t("superAdminDepartments.errors.nameRequired"));

    try {
      await api.createDepartment({ name: v });
      setName("");
      setOk(t("superAdminDepartments.ok.created"));
      await load();
    } catch (e2) {
      setErr(e2?.message || t("superAdminDepartments.errors.generic"));
    }
  };

  const startEdit = (d) => {
    setEditingId(d.id);
    setEName(d.name || "");
    setErr("");
    setOk("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEName("");
  };

  const saveEdit = async (id) => {
    setErr("");
    setOk("");

    const v = eName.trim();
    if (!v) return setErr(t("superAdminDepartments.errors.nameEmpty"));

    try {
      await api.updateDepartment(id, { name: v });
      setOk(t("superAdminDepartments.ok.updated"));
      cancelEdit();
      await load();
    } catch (e) {
      setErr(e?.message || t("superAdminDepartments.errors.generic"));
    }
  };

  const remove = async (id) => {
    const confirmed = window.confirm(t("superAdminDepartments.confirmDelete"));
    if (!confirmed) return;

    setErr("");
    setOk("");
    try {
      await api.deleteDepartment(id);
      setOk(t("superAdminDepartments.ok.deleted"));
      await load();
    } catch (e) {
      setErr(e?.message || t("superAdminDepartments.errors.generic"));
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-4 py-4 sm:py-5">
      <div className="mb-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">{t("superAdminDepartments.headerTitle")}</h2>
        <p className="text-[12px] sm:text-sm text-slate-500 mt-1">{t("superAdminDepartments.headerSubtitle")}</p>
      </div>

      {err ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
          {err}
        </div>
      ) : null}

      {ok ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] text-emerald-800">
          {ok}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Create */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
          <div className="text-sm font-semibold text-slate-900">{t("superAdminDepartments.create.title")}</div>
          <div className="text-[11px] text-slate-500 mt-1">{t("superAdminDepartments.create.subtitle")}</div>

          <form onSubmit={create} className="mt-3 grid gap-3">
            <label className="grid gap-1">
              <span className="text-[12px] font-semibold text-slate-600">{t("superAdminDepartments.create.nameLabel")}</span>
              <input
                className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("superAdminDepartments.create.namePlaceholder")}
              />
            </label>

            <button
              type="submit"
              className="h-10 px-4 rounded-xl font-semibold text-sm bg-slate-900 text-white hover:bg-black transition"
            >
              {t("superAdminDepartments.create.add")}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">{t("superAdminDepartments.list.title")}</div>
              <div className="text-[11px] text-slate-500 mt-1">
                {t("superAdminDepartments.list.totalPrefix")}{" "}
                <b className="text-slate-700">{departments.length}</b>
              </div>
            </div>

            <button
              type="button"
              onClick={load}
              className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm font-semibold"
            >
              {t("superAdminDepartments.actions.refresh")}
            </button>
          </div>

          {loading ? <div className="mt-3 text-sm text-slate-500">{t("common.loading")}</div> : null}

          {!loading && departments.length === 0 ? (
            <div className="mt-3 text-sm text-slate-500">{t("superAdminDepartments.list.empty")}</div>
          ) : null}

          <div className="mt-3 grid gap-2">
            {departments.map((d) => {
              const isEditing = editingId === d.id;

              return (
                <div key={d.id} className="rounded-2xl border border-slate-200 bg-white p-3">
                  {!isEditing ? (
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">{d.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {d.createdAt ? new Date(d.createdAt).toLocaleString() : ""}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(d)}
                          className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm font-semibold"
                        >
                          {t("superAdminDepartments.actions.edit")}
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(d.id)}
                          className="h-9 px-3 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-sm font-semibold"
                        >
                          {t("superAdminDepartments.actions.delete")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      <label className="grid gap-1">
                        <span className="text-[12px] font-semibold text-slate-600">{t("superAdminDepartments.edit.nameLabel")}</span>
                        <input
                          className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 text-sm"
                          value={eName}
                          onChange={(e) => setEName(e.target.value)}
                        />
                      </label>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => saveEdit(d.id)}
                          className="h-10 px-4 rounded-xl font-semibold text-sm bg-slate-900 text-white hover:bg-black transition"
                        >
                          {t("superAdminDepartments.actions.save")}
                        </button>

                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold text-sm"
                        >
                          {t("superAdminDepartments.actions.cancel")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
