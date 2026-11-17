import { Page, Locator } from '@playwright/test';
import { NavBar } from '../components/NavBar';
import { MessageBanner } from '../components/MessageBanner';
import { TicketRow } from '../components/TicketRow';

export class BookingsPage {
  readonly page: Page;
  readonly nav: NavBar;
  readonly message: MessageBanner;
  readonly heading: Locator;
  readonly passengerInput: Locator;
  readonly fromSelect: Locator;
  readonly toSelect: Locator;
  readonly seatsInput: Locator;
  readonly bookButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nav = new NavBar(page);
    this.message = new MessageBanner(page);
    this.heading = page.getByRole('heading', { name: 'My bus tickets' });
    this.passengerInput = page.getByLabel('Passenger name');
    this.fromSelect = page.getByLabel('From');
    this.toSelect = page.getByLabel('To');
    this.seatsInput = page.getByLabel('Seats');
    this.bookButton = page.getByRole('button', { name: 'Book ticket' });
  }

  async goto() {
    await this.page.goto('/bookings');
  }

  async bookTicket(passenger: string, from: string, to: string, seats: number) {
    await this.passengerInput.fill(passenger);
    await this.fromSelect.selectOption(from);
    await this.toSelect.selectOption(to);
    await this.seatsInput.fill(String(seats));
    await this.bookButton.click();
  }

  ticket(ticketNo: string): TicketRow {
    return new TicketRow(this.page.getByRole('row').filter({ hasText: ticketNo }));
  }
}