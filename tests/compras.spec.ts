import { test, expect } from '@playwright/test';
import { EventosPage } from '../pages/EventosPage';
import { CompradoresPage } from '../pages/CompradoresPage';
import { ComprasPage } from '../pages/ComprasPage';
import { eventByName } from '../helpers/api';
import { uniqueLabel, uniqueTransaction } from '../helpers/ids';

test('CT04 - registra compra com ID longo e zeros à esquerda', async ({ page, request }) => {
  const eventName = uniqueLabel('Compra E2E');
  const person = uniqueLabel('Comprador');
  const transaction = uniqueTransaction();
  const events = new EventosPage(page);
  await events.abrirInicial();
  await events.criar(eventName);
  await new CompradoresPage(page).cadastrar(person, '101');
  await new ComprasPage(page).registrar(person, '35,90', transaction);

  const state = await eventByName(request, eventName);
  expect(state.purchases).toEqual(expect.arrayContaining([
    expect.objectContaining({ transaction_id: transaction, amount_cents: 3590, voided_at: null }),
  ]));
  expect(state.participants.find(p => p.name === person)?.numbers).toHaveLength(1);
});

test('CT05 - impede repetir ID de transação no mesmo evento', async ({ page, request }) => {
  const eventName = uniqueLabel('Duplicidade E2E');
  const person = uniqueLabel('Cliente');
  const transaction = uniqueTransaction();
  const events = new EventosPage(page);
  await events.abrirInicial();
  await events.criar(eventName);
  await new CompradoresPage(page).cadastrar(person, '23');
  const purchases = new ComprasPage(page);
  await purchases.registrar(person, '25,00', transaction);
  await purchases.registrar(person, '30,00', transaction);

  await expect(page.locator('#toast.error')).toBeVisible();
  const state = await eventByName(request, eventName);
  expect(state.purchases.filter(p => p.transaction_id === transaction)).toHaveLength(1);
  expect(state.participants[0].spent_cents).toBe(2500);
});

test('CT06 - acumula valores de compras da mesma pessoa', async ({ page, request }) => {
  const eventName = uniqueLabel('Acúmulo E2E');
  const person = uniqueLabel('Comprador');
  const events = new EventosPage(page);
  await events.abrirInicial();
  await events.criar(eventName);
  await new CompradoresPage(page).cadastrar(person, '55');
  const purchases = new ComprasPage(page);
  await purchases.registrar(person, '20,00', uniqueTransaction());
  await purchases.registrar(person, '30,00', uniqueTransaction());
  const state = await eventByName(request, eventName);
  const buyer = state.participants.find(p => p.name === person)!;
  expect(buyer.spent_cents).toBe(5000);
  expect(buyer.numbers.filter(t => t.status === 'ACTIVE')).toHaveLength(2);
});