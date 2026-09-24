import { describe, expect, it } from "vitest";
import { validatePassword } from "./password";

describe("validatePassword (mesma regra do usuario-api)", () => {
  it("aceita senha com 8+ caracteres, letra, número e especial", () => {
    expect(validatePassword("Senha@123")).toBeNull();
  });

  it.each([
    ["Ab@1", "8 caracteres"],
    ["12345678@", "letra"],
    ["Senha@abc", "número"],
    ["Senha1234", "caractere especial"],
  ])("recusa %s (falta: %s)", (password, missing) => {
    expect(validatePassword(password)).toContain(missing);
  });
});
