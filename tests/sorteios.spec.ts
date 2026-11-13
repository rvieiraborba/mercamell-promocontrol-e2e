import { test, expect } from '@playwright/test';
import { EventosPage } from '../pages/EventosPage';
import { SorteiosPage } from '../pages/SorteiosPage';
import { cadastrarParticipantesParaSorteio } from '../helpers/seed';
import { eventByName } from '../helpers/api';
import { uniqueLabel } from '../helpers/ids';

test('CT10/CT11/CT13 - encerra cadastro, sorteia elegíveis e impede dois prêmios por pessoa', async ({ page, request }) => {
  const eventName = uniqueLabel('Apuração E2E');
  const events = new EventosPage(page);
  await events.abrirInicial();
  await events.criar(eventName);
  const names = await cadastrarParticipantesParaSorteio(page, 4);
  const sorteios = new SorteiosPage(page);
  await sorteios.congelar();
  await page.locator('nav [data-page="purchases"]').click();
  await expect(page.locator('#purchaseForm')).toHaveCount(0);
  await sorteios.abrir();

  for (let i = 0; i < 3; i++) {
    await sorteios.iniciar();
    const number = Number(await page.locator('#drawModal .result-number').innerText());
    const pending = (await eventByName(request, eventName)).pending_draw;
    expect(pending?.number).toBe(number);
    expect(names).toContain(pending?.name);
    await sorteios.confirmar();
    if (i < 2) await sorteios.proximo();
  }

  const state = await eventByName(request, eventName);
  expect(state.winners).toHaveLength(3);
  expect(new Set(state.winners.map(w => w.participant_id)).size).toBe(3);
  for (const winner of state.winners) {
    const buyer = state.participants.find(p => p.id === winner.participant_id)!;
    expect(buyer.numbers.filter(n => n.status === 'WINNER')).toHaveLength(1);
    expect(buyer.numbers.filter(n => n.status === 'ACTIVE')).toHaveLength(0);
  }
  await sorteios.mostrarResultadoFinal();
  for (const winner of state.winners) {
    const row = page.locator('.winner-summary-row').filter({ hasText: winner.name });
    await expect(row).toContainText(`Apartamento ${winner.apartment}`);
  }
});

test('CT12 - resortear por ausência descarta o participante recusado', async ({ page, request }) => {
  const eventName = uniqueLabel('Resorteio E2E');
  const events = new EventosPage(page);
  await events.abrirInicial();
  await events.criar(eventName);
  await cadastrarParticipantesParaSorteio(page, 5);
  const sorteios = new SorteiosPage(page);
  await sorteios.congelar();
  await sorteios.iniciar();
  const previous = (await eventByName(request, eventName)).pending_draw!;
  await sorteios.resortear();
  const next = (await eventByName(request, eventName)).pending_draw!;
  expect(next.participant_id).not.toBe(previous.participant_id);
  const state = await eventByName(request, eventName);
  expect(state.attempts.find(a => a.participant_id === previous.participant_id)?.status).toBe('DECLINED');
  await sorteios.confirmar();
  await sorteios.proximo();
  await sorteios.iniciar();
  const another = (await eventByName(request, eventName)).pending_draw!;
  expect(another.participant_id).not.toBe(previous.participant_id);
});

test('CT14 - cancelar sorteio reabre cadastro mantendo compras e números', async ({ page, request }) => {
  const eventName = uniqueLabel('Cancelamento E2E');
  const events = new EventosPage(page);
  await events.abrirInicial();
  await events.criar(eventName);
  await cadastrarParticipantesParaSorteio(page, 4);
  const sorteios = new SorteiosPage(page);
  await sorteios.congelar();
  await sorteios.iniciar();
  await sorteios.confirmar();
  await sorteios.proximo();
  const before = await eventByName(request, eventName);

  await sorteios.cancelarEReabrir();
  const after = await eventByName(request, eventName);
  expect(after.frozen).toBe(false);
  expect(after.winners).toHaveLength(0);
  expect(after.participants.map(p => p.name).sort()).toEqual(before.participants.map(p => p.name).sort());
  expect(after.purchases.map(p => p.transaction_id).sort()).toEqual(before.purchases.map(p => p.transaction_id).sort());
  expect(after.participants.flatMap(p => p.numbers).every(n => n.status === 'ACTIVE')).toBe(true);
  await page.locator('nav [data-page="purchases"]').click();
  await expect(page.locator('#purchaseForm')).toBeVisible();
});

test('CT15 - exporta PNG com os três ganhadores', async ({ page }) => {
  const eventName = uniqueLabel('Resultado E2E');
  const events = new EventosPage(page);
  await events.abrirInicial();
  await events.criar(eventName);
  await cadastrarParticipantesParaSorteio(page, 4);
  const sorteios = new SorteiosPage(page);
  await sorteios.congelar();
  for (let i = 0; i < 3; i++) {
    await sorteios.iniciar();
    await sorteios.confirmar();
    if (i < 2) await sorteios.proximo();
  }
  await sorteios.mostrarResultadoFinal();

  const downloadPromise = page.waitForEvent('download');
  await page.locator('[data-draw-export]').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^Mercamell_Resultado_.*\.png$/);
  const stream = await download.createReadStream();
  expect(stream).not.toBeNull();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const header = Buffer.concat(chunks).subarray(0, 8);
  expect(header).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
});
