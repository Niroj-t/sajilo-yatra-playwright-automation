import { Page, Locator } from '@playwright/test';
import { NavBar } from '../components/NavBar';

export class ProfilePage {
  readonly page: Page;
  readonly nav: NavBar;
  readonly heading: Locator;
  readonly fullName: Locator;
  readonly phone: Locator;
  readonly homeCity: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nav = new NavBar(page);
    this.heading = page.getByRole('heading', { name: 'My profile' });
    this.fullName = page.getByTestId('profile-name');
    this.phone = page.getByTestId('profile-phone');
    this.homeCity = page.getByTestId('profile-city');
  }
}