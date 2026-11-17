import { Page, Locator } from '@playwright/test';

export class NavBar {
  readonly root: Locator;
  readonly welcomeText: Locator;
  readonly ticketsLink: Locator;
  readonly profileLink: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.root = page.getByRole('banner');
    this.welcomeText = this.root.getByTestId('welcome');
    this.ticketsLink = this.root.getByRole('link', { name: 'My tickets' });
    this.profileLink = this.root.getByRole('link', { name: 'My profile' });
    this.logoutButton = this.root.getByRole('button', { name: 'Log out' });
  }

  async openTickets() { await this.ticketsLink.click(); }
  async openProfile() { await this.profileLink.click(); }
  async logout() { await this.logoutButton.click(); }
}