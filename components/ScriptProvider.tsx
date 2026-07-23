"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  convertAuthor,
  convertPoem,
  convertText,
} from "@/lib/script/convert";
import {
  SCRIPT_COOKIE,
  SCRIPT_STORAGE_KEY,
  scriptClass,
  scriptLang,
  type ScriptMode,
} from "@/lib/script/types";
import type { Author, Poem } from "@/lib/types";

type ScriptContextValue = {
  mode: ScriptMode;
  setMode: (mode: ScriptMode) => void;
  t: (text: string) => string;
  tPoem: (poem: Poem) => Poem;
  tAuthor: (author: Author) => Author;
};

const ScriptContext = createContext<ScriptContextValue | null>(null);

function persistMode(mode: ScriptMode) {
  try {
    localStorage.setItem(SCRIPT_STORAGE_KEY, mode);
  } catch {
    /* ignore quota / private mode */
  }
  document.cookie = `${SCRIPT_COOKIE}=${mode}; path=/; max-age=31536000; SameSite=Lax`;
}

function applyDocumentScript(mode: ScriptMode) {
  const root = document.documentElement;
  root.classList.remove("script-sc", "script-tc");
  root.classList.add(scriptClass(mode));
  root.lang = scriptLang(mode);
}

export function ScriptProvider({
  initialMode,
  children,
}: {
  initialMode: ScriptMode;
  children: ReactNode;
}) {
  const [mode, setModeState] = useState<ScriptMode>(initialMode);

  useEffect(() => {
    let preferred: ScriptMode | null = null;
    try {
      const stored = localStorage.getItem(SCRIPT_STORAGE_KEY);
      if (stored === "sc" || stored === "tc") preferred = stored;
    } catch {
      /* ignore */
    }
    if (preferred && preferred !== mode) {
      setModeState(preferred);
      applyDocumentScript(preferred);
      persistMode(preferred);
      return;
    }
    applyDocumentScript(mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only reconcile storage once on mount
  }, []);

  const setMode = useCallback((next: ScriptMode) => {
    setModeState(next);
    applyDocumentScript(next);
    persistMode(next);
  }, []);

  const value = useMemo<ScriptContextValue>(
    () => ({
      mode,
      setMode,
      t: (text: string) => convertText(text, mode),
      tPoem: (poem: Poem) => convertPoem(poem, mode),
      tAuthor: (author: Author) => convertAuthor(author, mode),
    }),
    [mode, setMode],
  );

  return (
    <ScriptContext.Provider value={value}>{children}</ScriptContext.Provider>
  );
}

export function useScript(): ScriptContextValue {
  const ctx = useContext(ScriptContext);
  if (!ctx) {
    throw new Error("useScript must be used within ScriptProvider");
  }
  return ctx;
}
