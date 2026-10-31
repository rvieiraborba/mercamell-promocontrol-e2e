import { expect, type Page } from '@playwright/test';

export class ComprasPage {
  constructor(private readonly page: Page) {}

  async registrar(nome: string, valor: string, transacao: string, marcas: string[] = []) {
    await this.page.locator('[data-page="purchases"]').click();
    const form = this.page.locator('#purchaseForm');
    await expect(form).toBeVisible();
    const opt = form.locator('select[name="participant_id"] option').filter({ hasText: nome });
    const id = await opt.getAttribute('value');
    expect(id, `Comprador ${nome} não encontrado no cadastro`).toBeTruthy();
    await form.locator('select[name="participant_id"]').selectOption(id!);
    await form.locator('[name="amount"]').fill(valor);
    await form.locator('[name="transaction_id"]').fill(transacao);
    for (const marca of marcas) {
      await form.getByLabel(marca, { exact: true }).check();
    }
    await form.getByRole('button', { name: 'Registrar compra e calcular números' }).click();
  }

  linha(transacao: string) {
    return this.page.locator('table tbody tr').filter({ hasText: transacao });
  }
}