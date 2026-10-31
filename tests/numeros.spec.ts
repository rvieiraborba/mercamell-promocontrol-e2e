import { test, expect } from '@playwright/test';
import { EventosPage } from '../pages/EventosPage';
import { CompradoresPage } from '../pages/CompradoresPage';
import { ComprasPage } from '../pages/ComprasPage';
import { eventByName } from '../helpers/api';
import { uniqueLabel, uniqueTransaction } from '../helpers/ids';

test('CT07/CT08/CT09 - regras, bônus de marca e máximo de quatro números', async ({ page, request }) => {
  const eventName = uniqueLabel('Faixas E2E');
  const person = uniqueLabel('Cliente');
  const events = new EventosPage(page);
  await events.abrirInicial();
  await events.criar(eventName);
  await new CompradoresPage(page).cadastrar(person, 'A-12');
  const purchases = new ComprasPage(page);

  await purchases.registrar(person, '30,00', uniqueTransaction());
  let p = (await eventByName(request, eventName)).participants.find(x => x.name === person)!;
  expect(p.numbers.filter(n => n.status === 'ACTIVE')).toHaveLength(1);

  await purchases.registrar(person, '20,00', uniqueTransaction(), ['Honey Cake']);
  p = (await eventByName(request, eventName)).participants.find(x => x.name === person)!;
  expect(p.numbers.filter(n => n.status === 'ACTIVE')).toHaveLength(3); // R$ 50 -> 2 + 1 bônus

  await purchases.registrar(person, '30,00', uniqueTransaction(), ['Vittai']);
  p = (await eventByName(request, eventName)).participants.find(x => x.name === person)!;
  expect(p.numbers.filter(n => n.status === 'ACTIVE')).toHaveLength(4); // R$ 80 -> 3 + 1 bônus

  await purchases.registrar(person, '100,00', uniqueTransaction());
  p = (await eventByName(request, eventName)).participants.find(x => x.name === person)!;
  expect(p.spent_cents).toBe(18000);
  expect(p.numbers.filter(n => n.status === 'ACTIVE')).toHaveLength(4);

  await page.locator('[data-page="tickets"]').click();
  const row = page.locator('table tbody tr').filter({ hasText: person });
  await expect(row.locator('.num.active')).toHaveCount(4);
  expect(new Set(p.numbers.map(t => t.number)).size).toBe(4);
});