import { test, expect } from '@playwright/test';
import { EventosPage } from '../pages/EventosPage';
import { CompradoresPage } from '../pages/CompradoresPage';
import { eventByName } from '../helpers/api';
import { uniqueLabel } from '../helpers/ids';

test('CT03 - cadastra comprador com apartamento e observações', async ({ page, request }) => {
  const eventName = uniqueLabel('Cadastro E2E');
  const buyerName = uniqueLabel('Morador');
  const events = new EventosPage(page);
  const buyers = new CompradoresPage(page);
  await events.abrirInicial();
  await events.criar(eventName);
  await buyers.cadastrar(buyerName, '82 - Torre A', 'Solicitou contato no evento');
  await buyers.abrir();
  const row = page.locator('#peopleRows tr').filter({ hasText: buyerName });
  await expect(row).toContainText('82 - Torre A');

  const state = await eventByName(request, eventName);
  const saved = state.participants.find(p => p.name === buyerName);
  expect(saved?.apartment).toBe('82 - Torre A');
});