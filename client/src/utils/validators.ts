export function validateCPF(cpf: string): { isValid: boolean; error?: string } {
  if (!cpf) return { isValid: false, error: 'CPF é obrigatório.' };
  const clean = cpf.replace(/\D/g, '');

  if (clean.length === 0) {
    return { isValid: false, error: 'CPF é obrigatório.' };
  }

  if (clean.length !== 11) {
    return { isValid: false, error: `CPF deve conter 11 dígitos (atual: ${clean.length}).` };
  }

  if (/^(\d)\1{10}$/.test(clean)) {
    return { isValid: false, error: 'CPF inválido (dígitos repetidos).' };
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean.charAt(i), 10) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(9), 10)) {
    return { isValid: false, error: 'CPF inválido (primeiro dígito verificador incorreto).' };
  }

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean.charAt(i), 10) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(10), 10)) {
    return { isValid: false, error: 'CPF inválido (segundo dígito verificador incorreto).' };
  }

  return { isValid: true };
}

export function validateCreditCard(cardNumber: string): { isValid: boolean; error?: string } {
  if (!cardNumber) return { isValid: false, error: 'Número do cartão é obrigatório.' };
  
  // If card is masked (e.g. from existing record), consider valid
  if (cardNumber.includes('*')) {
    return { isValid: true };
  }

  const clean = cardNumber.replace(/\D/g, '');

  if (clean.length < 13 || clean.length > 19) {
    return { isValid: false, error: `Cartão deve conter entre 13 e 19 dígitos (atual: ${clean.length}).` };
  }

  let sum = 0;
  let shouldDouble = false;

  for (let i = clean.length - 1; i >= 0; i--) {
    let digit = parseInt(clean.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  if (sum % 10 !== 0) {
    return { isValid: false, error: 'Número de cartão inválido (falha na validação Luhn).' };
  }

  return { isValid: true };
}

export function validatePhone(phone: string): { isValid: boolean; error?: string } {
  if (!phone) return { isValid: false, error: 'Telefone é obrigatório.' };
  const clean = phone.replace(/\D/g, '');

  if (clean.length < 10 || clean.length > 11) {
    return { isValid: false, error: `Telefone deve conter DDD + 8 ou 9 dígitos (atual: ${clean.length}).` };
  }

  const ddd = parseInt(clean.substring(0, 2), 10);
  if (ddd < 11 || ddd > 99) {
    return { isValid: false, error: 'DDD inválido.' };
  }

  return { isValid: true };
}

export function validateCEP(cep: string): { isValid: boolean; error?: string } {
  if (!cep) return { isValid: false, error: 'CEP é obrigatório.' };
  const clean = cep.replace(/\D/g, '');
  if (clean.length !== 8) {
    return { isValid: false, error: `CEP deve conter 8 dígitos (atual: ${clean.length}).` };
  }
  return { isValid: true };
}

export function validateCVV(cvv: string): { isValid: boolean; error?: string } {
  if (!cvv) return { isValid: false, error: 'CVV é obrigatório.' };
  const clean = cvv.replace(/\D/g, '');
  if (clean.length < 3 || clean.length > 4) {
    return { isValid: false, error: 'CVV deve ter 3 ou 4 dígitos.' };
  }
  return { isValid: true };
}

export function validateStrongPassword(password: string): { isValid: boolean; error?: string } {
  if (!password || password.length < 8) {
    return { isValid: false, error: 'A senha deve ter no mínimo 8 caracteres.' };
  }
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasSpecialOrNumber = /[^a-zA-Z]/.test(password);

  if (!hasUpper || !hasLower || !hasSpecialOrNumber) {
    return {
      isValid: false,
      error: 'A senha deve conter letras maiúsculas, minúsculas e números ou símbolos.',
    };
  }

  return { isValid: true };
}

export function detectCardBrand(cardNumber: string): string {
  const clean = cardNumber.replace(/\D/g, '');
  if (/^4/.test(clean)) return 'Visa';
  if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/.test(clean)) return 'Mastercard';
  if (/^(4011|4389|4514|4576|5041|5066|5067|6277|6362|6363|650|651|655)/.test(clean)) return 'Elo';
  if (/^3[47]/.test(clean)) return 'Amex';
  return 'Visa';
}
