import { Page, Locator } from '@playwright/test';

export class MessageBanner {
  readonly root: Locator;
  readonly dismissButton: Locator;

  constructor(page: Page) {
    this.root = page.getByRole('status');
    this.dismissButton = this.root.getByRole('button', { name: 'Dismiss message' });
  }

  async dismiss() {
    await this.dismissButton.click();
  }
}