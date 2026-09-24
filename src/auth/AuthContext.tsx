import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { logoutSession } from "../api/auth";
import type { LoginResponse } from "../api/types";
import { decodeJwtPayload, getJwtExpiry, getJwtRoles } from "../lib/jwt";
import { isTokenExpired, readStoredSession, SESSION_STORAGE_KEY, type Session } from "./sessionStorage";

const GESTOR_ROLE = "GestorONG";

interface AuthContextValue {
  session: Session | null;
  // Vem da claim "roles" do token — a usuario-api põe GestorONG lá.
  isGestor: boolean;
  // true quando a sessão foi derrubada por expiração/rejeição (e não por um
  // "Sair" do próprio usuário) — as telas usam pra avisar o porquê.
  sessionExpired: boolean;
  login: (response: LoginResponse) => Session;
  logout: () => void;
  expireSession: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
// setTimeout estoura acima de 2^31-1 ms (~24 dias) e dispara na hora.
const MAX_TIMEOUT_MS = 2_147_483_647;

function readInitialState(): { session: Session | null; expired: boolean } {
  const stored = readStoredSession();
  if (!stored) return { session: null, expired: false };
  if (isTokenExpired(stored.idToken)) return { session: null, expired: true };
  return { session: stored, expired: false };
}

function buildSession(response: LoginResponse): Session {
  const claims = decodeJwtPayload(response.idToken);
  const name = typeof claims?.name === "string" && claims.name.trim() ? claims.name : response.email;

  return { email: response.email, name, idToken: response.idToken, sessionId: response.sessionId };
}

function hasGestorRole(session: Session | null): boolean {
  return session !== null && getJwtRoles(session.idToken).includes(GESTOR_ROLE);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(readInitialState);
  const [session, setSession] = useState<Session | null>(initial.session);
  const [sessionExpired, setSessionExpired] = useState(initial.expired);

  useEffect(() => {
    try {
      if (session) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch {
      // localStorage indisponível (modo privado, etc.) — sessão só dura a aba atual.
    }
  }, [session]);

  const expireSession = useCallback(() => {
    setSession(null);
    setSessionExpired(true);
  }, []);

  // Derruba a sessão sozinha no instante em que o token vence, sem esperar o
  // usuário esbarrar num 403 do gateway.
  useEffect(() => {
    const expiry = session ? getJwtExpiry(session.idToken) : null;
    if (expiry === null) return;

    const timeout = setTimeout(expireSession, Math.min(Math.max(expiry - Date.now(), 0), MAX_TIMEOUT_MS));
    return () => clearTimeout(timeout);
  }, [session, expireSession]);

  const login = useCallback((response: LoginResponse) => {
    const next = buildSession(response);
    setSession(next);
    setSessionExpired(false);
    return next;
  }, []);

  const logout = useCallback(() => {
    // Avisa o usuario-api pra invalidar a sessão no cache dele. Melhor esforço:
    // o usuário sai localmente de qualquer jeito, mesmo se o backend estiver fora.
    if (session) void logoutSession(session.sessionId, session.idToken).catch(() => {});
    setSession(null);
    setSessionExpired(false);
  }, [session]);

  const isGestor = hasGestorRole(session);

  const value = useMemo(
    () => ({ session, isGestor, sessionExpired, login, logout, expireSession }),
    [session, isGestor, sessionExpired, login, logout, expireSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de um AuthProvider");
  return ctx;
}
