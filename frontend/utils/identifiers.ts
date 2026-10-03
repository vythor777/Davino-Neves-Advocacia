/** Validates numeric CPF/CNPJ check digits without consulting personal data. */
export function isValidCpfCnpj(value: string): boolean {
  if (!/^[\d.\-/\s]+$/.test(value)) return false;
  const digits = value.replace(/\D/g, '');
  if (![11, 14].includes(digits.length) || /^(\d)\1+$/.test(digits)) return false;
  const numbers = [...digits].map(Number);
  const check = (length: number, weights: number[]) => {
    const remainder = numbers.slice(0, length).reduce((sum, n, i) => sum + n * weights[i], 0) % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  if (digits.length === 11) {
    return numbers[9] === check(9, [10,9,8,7,6,5,4,3,2]) &&
      numbers[10] === check(10, [11,10,9,8,7,6,5,4,3,2]);
  }
  return numbers[12] === check(12, [5,4,3,2,9,8,7,6,5,4,3,2]) &&
    numbers[13] === check(13, [6,5,4,3,2,9,8,7,6,5,4,3,2]);
}

/** CNJ Resolution 65: move DD to the end and check modulo 97. */
export function isValidCnj(value: string): boolean {
  if (!/^(\d{20}|\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4})$/.test(value.trim())) return false;
  const digits = value.replace(/\D/g, '');
  if (/^0+$/.test(digits) || !/[1-9]/.test(digits[13]) || Number(digits.slice(9, 13)) === 0) return false;
  const reordered = digits.slice(0, 7) + digits.slice(9) + digits.slice(7, 9);
  let remainder = 0;
  for (const digit of reordered) remainder = (remainder * 10 + Number(digit)) % 97;
  return remainder === 1;
}
