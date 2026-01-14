import React from "react";
import { DICT } from "./i18n.dict";

const LangContext = React.createContext(null);

const STORAGE_KEY = "app_lang"; // "sq" | "mk"
const LANG_SWITCH_DELAY_MS = 1000;

function getByPath(obj, path) {
  if (!path) return undefined;
  return path.split(".").reduce((acc, k) => (acc && acc[k] != null ? acc[k] : undefined), obj);
}

export function LangProvider({ children, defaultLang = "sq" }) {
  const [lang, _setLang] = React.useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "mk" || saved === "sq" ? saved : defaultLang;
  });

  const [isChangingLang, setIsChangingLang] = React.useState(false);
  const switchTimerRef = React.useRef(null);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang === "sq" ? "sq" : "mk";
  }, [lang]);

  React.useEffect(() => {
    return () => {
      if (switchTimerRef.current) clearTimeout(switchTimerRef.current);
    };
  }, []);

  const changeLang = React.useCallback(
    (next) => {
      const safeNext = next === "mk" ? "mk" : "sq";

      // nëse është e njëjta gjuhë, mos bëj asgjë
      if (safeNext === lang) return;

      setIsChangingLang(true);

      if (switchTimerRef.current) clearTimeout(switchTimerRef.current);

      switchTimerRef.current = setTimeout(() => {
        _setLang(safeNext);
        setIsChangingLang(false);
      }, LANG_SWITCH_DELAY_MS);
    },
    [lang]
  );

  const toggle = React.useCallback(() => {
    changeLang(lang === "sq" ? "mk" : "sq");
  }, [lang, changeLang]);

  const t = React.useCallback(
    (key, vars) => {
      const table = DICT[lang] || DICT.sq;

      let str = getByPath(table, key);
      if (str == null) str = getByPath(DICT.sq, key);
      if (str == null) str = key;

      if (vars && typeof str === "string") {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replaceAll(`{${k}}`, String(v));
        }
      }
      return str;
    },
    [lang]
  );

  const value = React.useMemo(
    () => ({
      lang,

      // ✅ IMPORTANT:
      // ÇDO kod ekzistues që thërret setLang("mk") do e marrë loader-in 2s
      setLang: changeLang,

      changeLang,
      toggle,
      t,
      isChangingLang,
    }),
    [lang, changeLang, toggle, t, isChangingLang]
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = React.useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside <LangProvider />");
  return ctx;
}

export function LangToggleButton({ className = "" }) {
  const { lang, toggle, t, isChangingLang } = useLang();
  return (
    <button type="button" onClick={toggle} className={className} disabled={isChangingLang}>
      {isChangingLang ? (t("common.loading") || "Loading...") : `${t("toggleLabel")}: ${lang === "sq" ? "SQ" : "MK"}`}
    </button>
  );
}
