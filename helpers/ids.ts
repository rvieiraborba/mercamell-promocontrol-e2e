import { randomUUID } from 'node:crypto';

export function uniqueLabel(prefix: string): string {
  return `${prefix} ${randomUUID().slice(0, 8)}`;
}

export function uniqueTransaction(): string {
  // Testa IDs maiores que oito caracteres e preserva zeros à esquerda.
  return `0000-E2E-${randomUUID().slice(0, 12)}`;
}