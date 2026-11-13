import { expect, type Page } from '@playwright/test';

export class CompradoresPage {
  constructor(private readonly page: Page) {}

  async abrir() {
    await this.page.locator('nav [data-page="people"]').click();
    await expect(this.page.locator('#pageTitle')).toHaveText('Compradores');
  }

  async cadastrar(nome: string, apartamento: string, observacoes = 'Criado pela automação') {
    await this.abrir();
    const form = this.page.locator('#personForm');
    await form.locator('[name="name"]').fill(nome);
    await form.locator('[name="apartment"]').fill(apartamento);
    await form.locator('[name="note"]').fill(observacoes);
    await form.getByRole('button', { name: 'Cadastrar comprador' }).click();
    await expect(this.page.locator('#pageTitle')).toHaveText('Registro de compras');
  }
}