import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { logoutSession, refreshToken as refreshTokenRequest } from "../api/auth";
import type { LoginResponse } from "../api/types";
import { decodeJwtPayload, getJwtExpiry, getJwtRoles } from "../lib/jwt";
import { isTokenExpired, readStoredSession, SESSION_STORAGE_KEY, type Session } from "./sessionStorage";

const GESTOR_ROLE = "GestorONG";
// Renova o idToken um pouco antes de vencer, nunca exatamente em cima da hora —
// evita mandar uma requisição com um token que expira no meio do caminho.
const REFRESH_MARGIN_MS = 60_000;

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

// Se o idToken guardado já venceu, isso não quer dizer que a sessão acabou — o
// servidor mantém ela viva por 1h (SessionLifetime.Duration, renovada a cada
// refresh) independente do idToken. `staleSession` carrega o refreshToken pra
// AuthProvider tentar recuperar a sessão em vez de já desistir.
function readInitialState(): { session: Session | null; expired: boolean; staleSession: Session | null } {
  const stored = readStoredSession();
  if (!stored) return { session: null, expired: false, staleSession: null };
  if (isTokenExpired(stored.idToken)) return { session: null, expired: true, staleSession: stored };
  return { session: stored, expired: false, staleSession: null };
}

function buildSession(response: LoginResponse): Session {
  const claims = decodeJwtPayload(response.idToken);
  const name = typeof claims?.name === "string" && claims.name.trim() ? claims.name : response.email;

  return {
    email: response.email,
    name,
    idToken: response.idToken,
    refreshToken: response.refreshToken,
    sessionId: response.sessionId,
  };
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

  const login = useCallback((response: LoginResponse) => {
    const next = buildSession(response);
    setSession(next);
    setSessionExpired(false);
    return next;
  }, []);

  // Ao abrir o app com um idToken guardado já vencido, tenta recuperar a sessão
  // com o refreshToken antes de desistir — o servidor pode muito bem ainda estar
  // com ela viva (ver readInitialState). Roda uma vez só, no primeiro render.
  useEffect(() => {
    const stale = initial.staleSession;
    if (!stale) return;

    let cancelled = false;
    refreshTokenRequest(stale.sessionId, stale.refreshToken)
      .then((response) => {
        if (!cancelled) login(response);
      })
      .catch(() => {
        // Já começa como expirado (initial.expired) — nada a fazer aqui.
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Renova o idToken um pouco antes de vencer, em vez de só derrubar a sessão —
  // cada renovação também estende a sessão no servidor por mais 1h, então o
  // usuário só é deslogado de verdade se ficar 1h sem usar o app.
  useEffect(() => {
    if (!session) return;

    const expiry = getJwtExpiry(session.idToken);
    if (expiry === null) return;

    const delay = Math.min(Math.max(expiry - Date.now() - REFRESH_MARGIN_MS, 0), MAX_TIMEOUT_MS);

    const timeout = setTimeout(() => {
      refreshTokenRequest(session.sessionId, session.refreshToken)
        .then((response) => login(response))
        .catch(() => expireSession());
    }, delay);

    return () => clearTimeout(timeout);
  }, [session, login, expireSession]);

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
