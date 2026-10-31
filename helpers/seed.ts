import type { Page } from '@playwright/test';
import { CompradoresPage } from '../pages/CompradoresPage';
import { ComprasPage } from '../pages/ComprasPage';
import { uniqueLabel, uniqueTransaction } from './ids';

export async function cadastrarParticipantesParaSorteio(page: Page, total = 4): Promise<string[]> {
  const buyers = new CompradoresPage(page);
  const purchases = new ComprasPage(page);
  const names: string[] = [];
  for (let i = 0; i < total; i++) {
    const name = uniqueLabel(`Comprador${i + 1}`);
    names.push(name);
    await buyers.cadastrar(name, String(100 + i));
    await purchases.registrar(name, '80,00', uniqueTransaction());
  }
  return names;
}