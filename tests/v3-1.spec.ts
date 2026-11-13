import { test, expect } from '@playwright/test';
import { EventosPage } from '../pages/EventosPage';
import { CompradoresPage } from '../pages/CompradoresPage';
import { ComprasPage } from '../pages/ComprasPage';
import { eventByName } from '../helpers/api';
import { uniqueLabel } from '../helpers/ids';

test('CT16 - código automático, sequência por evento e não reutilização após estorno', async ({ page, request }) => {
  const events = new EventosPage(page);
  const compras = new ComprasPage(page);
  const name = uniqueLabel('Sequência');
  const person = uniqueLabel('Cliente');
  await events.abrirInicial();
  await events.criar(name);
  await new CompradoresPage(page).cadastrar(person, '501');
  await compras.registrar(person, '25,00');
  let state = await eventByName(request, name);
  const first = state.purchases[0];
  expect(first.transaction_id).toBe('');
  expect(first.event_seq).toBe(1);
  expect(first.purchase_code).toBe(`${String(state.id).padStart(3, '0')}-000001`);
  page.once('dialog', d => d.accept());
  await compras.linha(first.purchase_code).locator('[data-void-purchase]').click();
  await expect(compras.linha(first.purchase_code)).toContainText('ESTORNADA');
  await compras.registrar(person, '50,00');
  state = await eventByName(request, name);
  expect(state.purchases.map(p => p.event_seq).sort()).toEqual([1, 2]);
  expect(state.purchases.find(p => p.id === first.id)?.purchase_code).toBe(first.purchase_code);
  expect(state.purchases.find(p => p.id === first.id)?.voided_at).toBeTruthy();
  expect(state.participants[0].spent_cents).toBe(5000);

  const other = uniqueLabel('Outro evento');
  await events.criar(other);
  await new CompradoresPage(page).cadastrar(person, '501');
  await compras.registrar(person, '25,00');
  const second = await eventByName(request, other);
  expect(second.purchases[0].event_seq).toBe(1);
  expect(second.purchases[0].purchase_code).not.toBe(first.purchase_code);
});

test('CT17 - envia, substitui e remove foto; backup inclui a imagem', async ({ page, request }) => {
  const events = new EventosPage(page);
  const name = uniqueLabel('Fotos');
  await events.abrirInicial();
  await events.criar(name);
  await page.locator('nav [data-page="settings"]').click();
  // Imagens sintéticas geradas no navegador, sem fotos de pessoas.
  const png = async (color: string) => Buffer.from(await page.evaluate(color => {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 32;
    const ctx = canvas.getContext('2d')!; ctx.fillStyle = color; ctx.fillRect(0, 0, 32, 32);
    return canvas.toDataURL('image/png').split(',')[1];
  }, color), 'base64');
  await page.locator('#prizeImage1').setInputFiles({ name: 'premio.png', mimeType: 'image/png', buffer: await png('red') });
  const preview = page.locator('.prize-upload-preview');
  await expect(preview).toBeVisible();
  const original = (await eventByName(request, name)).prize_images['1'];
  expect(original).toMatch(/^data:image\/jpeg;base64,/);
  await expect(preview).toHaveJSProperty('naturalWidth', 32);
  await page.locator('#prizeImage1').setInputFiles({ name: 'outro.png', mimeType: 'image/png', buffer: await png('blue') });
  await expect.poll(async () => (await eventByName(request, name)).prize_images['1']).not.toBe(original);
  const image = (await eventByName(request, name)).prize_images['1'];
  const backup = await request.get('/api/backup');
  expect(backup.ok()).toBeTruthy();
  const data = await backup.json();
  expect(data.demo).toBe(true);
  expect(JSON.stringify(data)).toContain(image);
  await page.reload();
  await events.abrir(name);
  await page.locator('nav [data-page="settings"]').click();
  await expect(preview).toHaveAttribute('src', image);
  page.once('dialog', d => d.accept());
  await page.locator('[data-prize-remove="1"]').click();
  await expect(preview).toHaveCount(0);
  expect((await eventByName(request, name)).prize_images['1']).toBeUndefined();
});

test('CT18 - arquivo inválido não é salvo como foto', async ({ page, request }) => {
  const name = uniqueLabel('Imagem inválida');
  const events = new EventosPage(page);
  await events.abrirInicial();
  await events.criar(name);
  await page.locator('nav [data-page="settings"]').click();
  await page.locator('#prizeImage1').setInputFiles({ name: 'falso.png', mimeType: 'image/png', buffer: Buffer.from('nao e imagem') });
  await expect(page.locator('#toast.error')).toContainText('Não foi possível salvar a imagem');
  expect((await eventByName(request, name)).prize_images['1']).toBeUndefined();
});
