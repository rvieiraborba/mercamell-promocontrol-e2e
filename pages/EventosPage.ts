import { expect, type Page } from '@playwright/test';

export class EventosPage {
  constructor(private readonly page: Page) {}

  async abrirInicial() {
    await this.page.goto('/');
    await expect(this.page.locator('#pageTitle')).toHaveText('Meus eventos');
    await expect(this.page.locator('#modeFlag')).toContainText('MODO DE TESTE');
  }

  async criar(nome: string, tiers = '25 = 1\n50 = 2\n80 = 3', premios = 'Air fryer\nSanduicheira\nAbridor elétrico de vinho') {
    await this.page.locator('[data-page="events"]').click();
    await this.page.locator('[data-new-event]').click();
    const form = this.page.locator('#eventForm');
    await form.locator('[name="name"]').fill(nome);
    await form.locator('[name="tiers"]').fill(tiers);
    await form.locator('[name="prizes"]').fill(premios);
    await form.getByRole('button', { name: 'Criar evento' }).click();
    await expect(this.page.locator('#pageTitle')).toHaveText('Visão geral');
    await expect(this.page.locator('#eventBreadcrumb')).toContainText(nome.toUpperCase());
  }

  async abrir(nome: string) {
    await this.page.locator('[data-page="events"]').click();
    const card = this.page.locator('.event-card').filter({ hasText: nome });
    await card.locator('[data-open-event]').click();
    await expect(this.page.locator('#pageTitle')).toHaveText('Visão geral');
  }
}