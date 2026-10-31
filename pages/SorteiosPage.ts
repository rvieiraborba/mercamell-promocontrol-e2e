import { expect, type Page } from '@playwright/test';

export class SorteiosPage {
  constructor(private readonly page: Page) {}

  async abrir() {
    await this.page.locator('[data-page="draw"]').click();
    await expect(this.page.locator('#pageTitle')).toHaveText('Sorteios');
  }

  async congelar() {
    await this.abrir();
    this.page.once('dialog', async dialog => dialog.accept());
    await this.page.locator('[data-action="freeze"]').click();
    await expect(this.page.getByText('CADASTRO FECHADO').first()).toBeVisible();
  }

  async iniciar() {
    await this.page.locator('#countdownSeconds').selectOption('0');
    await this.page.locator('#soundMode').selectOption('off');
    await this.page.locator('[data-draw-start]').click();
    await expect(this.page.locator('#drawModal .result-number')).toBeVisible();
  }

  async resortear() {
    this.page.once('dialog', async dialog => dialog.accept());
    await this.page.locator('[data-draw-redraw]').click();
    await expect(this.page.locator('#drawModal .result-number')).toBeVisible();
  }

  async confirmar() {
    await this.page.locator('[data-draw-confirm]').click();
    await expect(this.page.locator('#drawModal')).toContainText('GANHADOR CONFIRMADO');
  }

  async proximo() {
    await this.page.locator('[data-draw-next]').click();
    await expect(this.page.locator('#drawModal')).toHaveClass(/hidden/);
  }

  async mostrarResultadoFinal() {
    await this.page.locator('[data-draw-final]').click();
    await expect(this.page.locator('#drawModal')).toContainText('RESULTADO FINAL');
  }

  async cancelarEReabrir() {
    await this.abrir();
    this.page.once('dialog', async dialog => dialog.accept('CANCELAR'));
    await this.page.locator('[data-cancel-draw]').click();
    await expect(this.page.getByText('CADASTRO ABERTO').first()).toBeVisible();
  }
}