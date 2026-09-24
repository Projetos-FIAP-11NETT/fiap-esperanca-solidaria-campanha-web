import { describe, expect, it } from "vitest";
import { formatCpf, onlyDigits, validateCpf } from "./cpf";

describe("validateCpf (mesma regra do usuario-api)", () => {
  it("aceita 11 dígitos, com ou sem pontuação", () => {
    expect(validateCpf("12345678901")).toBeNull();
    expect(validateCpf("123.456.789-01")).toBeNull();
  });

  it("recusa vazio", () => {
    expect(validateCpf("")).toContain("obrigatório");
  });

  it.each([["1234567890"], ["123456789012"]])("recusa quantidade errada de dígitos (%s)", (cpf) => {
    expect(validateCpf(cpf)).toContain("11 dígitos");
  });
});

describe("onlyDigits", () => {
  it("remove tudo que não é dígito", () => {
    expect(onlyDigits("123.456.789-01")).toBe("12345678901");
  });
});

describe("formatCpf", () => {
  it("formata como 000.000.000-00 enquanto digita", () => {
    expect(formatCpf("12345678901")).toBe("123.456.789-01");
    expect(formatCpf("123")).toBe("123");
    expect(formatCpf("1234567")).toBe("123.456.7");
  });

  it("ignora dígitos além do 11º", () => {
    expect(formatCpf("123456789019999")).toBe("123.456.789-01");
  });
});
