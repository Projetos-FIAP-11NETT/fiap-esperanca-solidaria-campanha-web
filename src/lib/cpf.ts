// Espelha User.ValidateCPF (usuario-api, fiap-esperanca-solidaria-usuario-domain/Entities/User.cs):
// só o formato é checado (11 dígitos numéricos, não vazio) — o backend não confere os
// dígitos verificadores, então o front também não confere, pra não recusar um CPF que
// o backend aceitaria.
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

// Formata pra exibição (000.000.000-00) enquanto o usuário digita; o valor enviado pro
// backend usa onlyDigits() por cima disso, sem pontuação.
export function formatCpf(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function validateCpf(cpf: string): string | null {
  const digits = onlyDigits(cpf);
  if (!digits) return "O CPF é obrigatório.";
  if (digits.length !== 11) return "O CPF deve ter 11 dígitos.";
  return null;
}
