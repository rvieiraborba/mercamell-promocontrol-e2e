import { expect, type APIRequestContext } from '@playwright/test';

export interface Ticket { number: number; status: 'ACTIVE' | 'VOID' | 'WINNER' | 'REMOVED'; id: number }
export interface Buyer { id: number; name: string; apartment: string; spent_cents: number; entitled: number; numbers: Ticket[] }
export interface Winner { prize_order: number; prize: string; number: number; participant_id: number; name: string; apartment: string }
export interface EventState {
  id: number;
  name: string;
  frozen: boolean;
  tiers: { amount_cents: number; tickets: number }[];
  brands: string[];
  participants: Buyer[];
  purchases: { id: number; purchase_code: string; event_seq: number; transaction_id: string; amount_cents: number; voided_at: string | null }[];
  prize_images: Record<string, string>;
  winners: Winner[];
  attempts: { participant_id: number; number: number; status: string }[];
  pending_draw: { number: number; name: string; participant_id: number } | null;
}

export async function eventByName(request: APIRequestContext, name: string): Promise<EventState> {
  const index = await request.get('/api/state');
  expect(index.ok()).toBeTruthy();
  const data = await index.json() as { demo: boolean; events: { id: number; name: string }[] };
  expect(data.demo, 'E2E deve rodar APENAS na base de demonstração').toBe(true);
  const event = data.events.find(e => e.name === name);
  expect(event, `Evento não encontrado: ${name}`).toBeDefined();
  const result = await request.get(`/api/event?event_id=${event!.id}`);
  expect(result.ok()).toBeTruthy();
  return await result.json() as EventState;
}
