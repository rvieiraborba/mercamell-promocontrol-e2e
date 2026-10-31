import { test, expect } from '@playwright/test';
import { EventosPage } from '../pages/EventosPage';
import { eventByName } from '../helpers/api';
import { uniqueLabel } from '../helpers/ids';

test('CT01 - cria evento com faixas de compras personalizadas', async ({ page, request }) => {
  const name = uniqueLabel('Evento de testes');
  const events = new EventosPage(page);
  await events.abrirInicial();
  await events.criar(name, '20 = 1\n40 = 2\n70 = 3', 'Brinde A\nBrinde B\nBrinde C');

  const saved = await eventByName(request, name);
  expect(saved.tiers).toEqual([
    { amount_cents: 2000, tickets: 1 },
    { amount_cents: 4000, tickets: 2 },
    { amount_cents: 7000, tickets: 3 },
  ]);
  await expect(page.locator('#content')).toContainText('A partir de R$ 20,00');
});

test('CT02 - eventos diferentes mantêm regras independentes', async ({ page, request }) => {
  const a = uniqueLabel('Kiruna E2E');
  const b = uniqueLabel('Superia E2E');
  const events = new EventosPage(page);
  await events.abrirInicial();
  await events.criar(a, '25 = 1\n50 = 2\n80 = 3');
  await events.criar(b, '15 = 1\n30 = 2\n60 = 3');

  const kiruna = await eventByName(request, a);
  const superia = await eventByName(request, b);
  expect(kiruna.id).not.toBe(superia.id);
  expect(kiruna.tiers[0].amount_cents).toBe(2500);
  expect(superia.tiers[0].amount_cents).toBe(1500);
});