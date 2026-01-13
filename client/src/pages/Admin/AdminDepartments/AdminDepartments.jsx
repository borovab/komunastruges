// src/pages/Admin/AdminDepartments/AdminDepartments.jsx
import React from "react";
import { api } from "../../../lib/api";

function cn(...a) {
  return a.filter(Boolean).join(" ");
}

export default function AdminDepartments() {
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [ok, setOk] = React.useState("");

  const [departments, setDepartments] = React.useState([]);

  // create
  const [name, setName] = React.useState("");

  const load = async () => {
    setLoading(true);
    setErr("");
    setOk("");
    try {
      const r = await api.listDepartments();
      setDepartments(r.departments || []);
    } catch (e) {
      setErr(e?.message || "Gabim");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    const v = name.trim();
    if (!v) return setErr("Shkruaj emrin e departamentit.");

    try {
      await api.createDepartment({ name: v });
      setName("");
      setOk("Departamenti u shtua.");
      await load();
    } catch (e2) {
      setErr(e2?.message || "Gabim");
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-4 py-4 sm:py-5">
      <div className="mb-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">Departamentet</h2>
        <p className="text-[12px] sm:text-sm text-slate-500 mt-1">Shto departamente (pa edit / pa fshirje).</p>
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
          <div className="text-sm font-semibold text-slate-900">Shto departament</div>
          <div className="text-[11px] text-slate-500 mt-1">Emri duhet të jetë unik.</div>

          <form onSubmit={create} className="mt-3 grid gap-3">
            <label className="grid gap-1">
              <span className="text-[12px] font-semibold text-slate-600">Emri</span>
              <input
                className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="p.sh. Administrata"
              />
            </label>

            <button
              type="submit"
              className="h-10 px-4 rounded-xl font-semibold text-sm bg-slate-900 text-white hover:bg-black transition"
            >
              Shto
            </button>
          </form>
        </div>

        {/* List */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">Lista</div>
              <div className="text-[11px] text-slate-500 mt-1">
                Totali: <b className="text-slate-700">{departments.length}</b>
              </div>
            </div>

            <button
              type="button"
              onClick={load}
              className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm font-semibold"
            >
              Rifresko
            </button>
          </div>

          {loading ? <div className="mt-3 text-sm text-slate-500">Loading…</div> : null}

          {!loading && departments.length === 0 ? (
            <div className="mt-3 text-sm text-slate-500">S’ka departamente.</div>
          ) : null}

          <div className="mt-3 grid gap-2">
            {departments.map((d) => (
              <div key={d.id} className="rounded-2xl border border-slate-200 bg-white p-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">{d.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {d.createdAt ? new Date(d.createdAt).toLocaleString() : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
