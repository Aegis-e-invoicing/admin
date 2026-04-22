import { createContext, useContext, useState, type ReactNode } from "react";
import type { AppEnvironmentMode } from "../lib/api";

interface EnvModeContextValue {
  envMode: AppEnvironmentMode;
  setEnvMode: (mode: AppEnvironmentMode) => void;
}

const EnvModeContext = createContext<EnvModeContextValue>({
  envMode: 1, // Sandbox default
  setEnvMode: () => {},
});

export function EnvModeProvider({ children }: { children: ReactNode }) {
  const [envMode, setEnvMode] = useState<AppEnvironmentMode>(1);
  return (
    <EnvModeContext.Provider value={{ envMode, setEnvMode }}>
      {children}
    </EnvModeContext.Provider>
  );
}

export function useEnvMode() {
  return useContext(EnvModeContext);
}
