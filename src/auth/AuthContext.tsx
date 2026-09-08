import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface GestorSession {
  email: string;
}

interface AuthContextValue {
  session: GestorSession | null;
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "gestor-session";

function readSession(): GestorSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GestorSession) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<GestorSession | null>(readSession);

  useEffect(() => {
    try {
      if (session) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // localStorage indisponível (modo privado, etc.) — sessão só dura a aba atual.
    }
  }, [session]);

  return (
    <AuthContext.Provider
      value={{
        session,
        login: (email) => setSession({ email }),
        logout: () => setSession(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de um AuthProvider");
  return ctx;
}
