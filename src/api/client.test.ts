import { describe, expect, it } from "vitest";
import { ApiError, isPermissionDenied, isSessionRejected } from "./client";

function fakeJwt(payload: object): string {
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${encode({ alg: "none" })}.${encode(payload)}.assinatura`;
}

const validToken = fakeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
const expiredToken = fakeJwt({ exp: Math.floor(Date.now() / 1000) - 60 });

describe("403 do gateway", () => {
  it("com token vencido é sessão rejeitada", () => {
    const error = new ApiError(403, "explicit deny");
    expect(isSessionRejected(error, expiredToken)).toBe(true);
    expect(isPermissionDenied(error, expiredToken)).toBe(false);
  });

  it("com token válido é falta de permissão, não sessão vencida", () => {
    const error = new ApiError(403, "explicit deny");
    expect(isSessionRejected(error, validToken)).toBe(false);
    expect(isPermissionDenied(error, validToken)).toBe(true);
  });

  it("401 sempre derruba a sessão", () => {
    expect(isSessionRejected(new ApiError(401, "Unauthorized"), validToken)).toBe(true);
  });

  it("outros erros não mexem na sessão", () => {
    expect(isSessionRejected(new ApiError(504, "timeout"), validToken)).toBe(false);
    expect(isSessionRejected(new Error("rede"), validToken)).toBe(false);
  });
});
