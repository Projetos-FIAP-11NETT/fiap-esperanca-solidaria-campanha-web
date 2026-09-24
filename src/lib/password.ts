// Espelha CreateUserCommandValidator (usuario-api) — a mesma regra aqui evita
// mandar pro backend uma senha que ele vai recusar.
export function validatePassword(password: string): string | null {
  if (password.length < 8) return "A senha deve ter ao menos 8 caracteres.";
  if (!/\p{L}/u.test(password)) return "A senha deve ter ao menos uma letra.";
  if (!/\d/.test(password)) return "A senha deve ter ao menos um número.";
  if (!/[^\p{L}\d]/u.test(password)) return "A senha deve ter ao menos um caractere especial.";
  return null;
}
