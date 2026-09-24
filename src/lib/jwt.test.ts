import { describe, expect, it } from "vitest";
import { decodeJwtPayload, getJwtExpiry, getJwtRoles } from "./jwt";

function fakeJwt(payload: object): string {
  const encode = (value: object) =>
    btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(value))))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  return `${encode({ alg: "none" })}.${encode(payload)}.assinatura`;
}

describe("decodeJwtPayload", () => {
  it("lê as claims, inclusive com acentos", () => {
    expect(decodeJwtPayload(fakeJwt({ name: "José da Conceição", roles: ["Doador"] }))).toEqual({
      name: "José da Conceição",
      roles: ["Doador"],
    });
  });

  it("devolve null pra token malformado", () => {
    expect(decodeJwtPayload("lixo")).toBeNull();
    expect(decodeJwtPayload("a.%%%.c")).toBeNull();
  });
});

describe("getJwtExpiry", () => {
  it("converte exp (segundos) em milissegundos", () => {
    expect(getJwtExpiry(fakeJwt({ exp: 1_800_000_000 }))).toBe(1_800_000_000_000);
  });

  it("devolve null sem exp ou com token ilegível", () => {
    expect(getJwtExpiry(fakeJwt({ name: "x" }))).toBeNull();
    expect(getJwtExpiry("lixo")).toBeNull();
  });
});

describe("getJwtRoles", () => {
  it("lê o array de roles", () => {
    expect(getJwtRoles(fakeJwt({ roles: ["GestorONG", "Doador"] }))).toEqual(["GestorONG", "Doador"]);
  });

  it("aceita uma role solta em string", () => {
    expect(getJwtRoles(fakeJwt({ roles: "GestorONG" }))).toEqual(["GestorONG"]);
  });

  it("devolve vazio sem a claim ou com token ilegível", () => {
    expect(getJwtRoles(fakeJwt({ name: "Ana" }))).toEqual([]);
    expect(getJwtRoles("lixo")).toEqual([]);
  });
});
