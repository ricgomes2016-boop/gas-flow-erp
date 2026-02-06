// Máscaras de input reutilizáveis

export function formatPhone(value: string): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, "");
  
  // Limita a 11 dígitos
  const limited = numbers.slice(0, 11);
  
  // Aplica a máscara (00) 00000-0000
  if (limited.length <= 2) {
    return limited.length > 0 ? `(${limited}` : "";
  }
  if (limited.length <= 7) {
    return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
  }
  return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
}

export function formatCEP(value: string): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, "");
  
  // Limita a 8 dígitos
  const limited = numbers.slice(0, 8);
  
  // Aplica a máscara 00000-000
  if (limited.length <= 5) {
    return limited;
  }
  return `${limited.slice(0, 5)}-${limited.slice(5)}`;
}

export function formatCurrency(value: string): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, "");
  
  if (numbers.length === 0) return "";
  
  // Converte para centavos e formata
  const cents = parseInt(numbers, 10);
  const reais = cents / 100;
  
  return reais.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function parseCurrency(formattedValue: string): number {
  // Remove R$, espaços e pontos, troca vírgula por ponto
  const cleaned = formattedValue
    .replace(/[R$\s.]/g, "")
    .replace(",", ".");
  
  const value = parseFloat(cleaned);
  return isNaN(value) ? 0 : value;
}

export function formatCNPJ(value: string): string {
  const numbers = value.replace(/\D/g, "");
  const limited = numbers.slice(0, 14);
  
  if (limited.length <= 2) return limited;
  if (limited.length <= 5) return `${limited.slice(0, 2)}.${limited.slice(2)}`;
  if (limited.length <= 8) return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5)}`;
  if (limited.length <= 12) return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8)}`;
  return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8, 12)}-${limited.slice(12)}`;
}

export function formatCPF(value: string): string {
  const numbers = value.replace(/\D/g, "");
  const limited = numbers.slice(0, 11);
  
  if (limited.length <= 3) return limited;
  if (limited.length <= 6) return `${limited.slice(0, 3)}.${limited.slice(3)}`;
  if (limited.length <= 9) return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6)}`;
  return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6, 9)}-${limited.slice(9)}`;
}

export function formatCpfCnpj(value: string): string {
  const numbers = value.replace(/\D/g, "");
  
  // Se tem mais de 11 dígitos, formata como CNPJ
  if (numbers.length > 11) {
    return formatCNPJ(value);
  }
  
  return formatCPF(value);
}

export function validateCPF(cpf: string): boolean {
  const numbers = cpf.replace(/\D/g, "");
  
  if (numbers.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(numbers)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers.charAt(9))) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers.charAt(10))) return false;
  
  return true;
}

export function validateCNPJ(cnpj: string): boolean {
  const numbers = cnpj.replace(/\D/g, "");
  
  if (numbers.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(numbers)) return false;
  
  // Validação do primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(numbers.charAt(i)) * weights1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(numbers.charAt(12))) return false;
  
  // Validação do segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(numbers.charAt(i)) * weights2[i];
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (digit2 !== parseInt(numbers.charAt(13))) return false;
  
  return true;
}

export function validateCpfCnpj(value: string): { valid: boolean; type: "cpf" | "cnpj" | null; message: string } {
  const numbers = value.replace(/\D/g, "");
  
  if (numbers.length === 0) {
    return { valid: true, type: null, message: "" };
  }
  
  if (numbers.length === 11) {
    const isValid = validateCPF(value);
    return {
      valid: isValid,
      type: "cpf",
      message: isValid ? "CPF válido" : "CPF inválido",
    };
  }
  
  if (numbers.length === 14) {
    const isValid = validateCNPJ(value);
    return {
      valid: isValid,
      type: "cnpj",
      message: isValid ? "CNPJ válido" : "CNPJ inválido",
    };
  }
  
  return {
    valid: false,
    type: numbers.length < 11 ? "cpf" : "cnpj",
    message: numbers.length < 11 ? "CPF incompleto" : "CNPJ incompleto",
  };
}
