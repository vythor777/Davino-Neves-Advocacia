export function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32)
    throw new Error(
      'Configure JWT_SECRET com pelo menos 32 caracteres aleatórios.',
    );
  return secret;
}
