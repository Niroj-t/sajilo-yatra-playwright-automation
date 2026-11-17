import { Locator } from '@playwright/test';

export class TicketRow {
  readonly root: Locator;
  readonly fare: Locator;
  readonly status: Locator;
  readonly cancelButton: Locator;

  constructor(root: Locator) {
    this.root = root;
    this.fare = root.getByTestId('fare');
    this.status = root.getByTestId('status');
    this.cancelButton = root.getByRole('button', { name: 'Cancel' });
  }

  async cancel() {
    await this.cancelButton.click();
  }
}