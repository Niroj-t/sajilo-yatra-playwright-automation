import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { BookingsPage } from '../pages/BookingsPage';
import { ProfilePage } from '../pages/ProfilePage';

test.use({ baseURL: 'http://localhost:4300' });

test.describe('Sajilo Yatra (with POM)', () => {
  test('shows an error for a wrong password', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('ram.thapa', 'wrong-password');
    await expect(loginPage.message.root).toHaveText('Invalid username or password');
  });

  test.describe('after logging in', () => {
    let bookingsPage: BookingsPage;

    test.beforeEach(async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login('ram.thapa', 'Yatra@123');
      bookingsPage = new BookingsPage(page);
    });

    test('logs in and greets the traveller', async () => {
      await expect(bookingsPage.heading).toBeVisible();
      await expect(bookingsPage.nav.welcomeText).toHaveText('Namaste, Ram Thapa');
    });

    test('books a ticket from Kathmandu to Pokhara', async () => {
      await bookingsPage.bookTicket('Anita Shrestha', 'Kathmandu', 'Pokhara', 2);
      await expect(bookingsPage.message.root).toHaveText('Ticket SY-1004 booked for Anita Shrestha');
      const ticket = bookingsPage.ticket('SY-1004');
      await expect(ticket.fare).toHaveText('Rs. 2,400');
      await expect(ticket.status).toHaveText('Confirmed');
    });

    test('does not allow the same From and To city', async () => {
      await bookingsPage.bookTicket('Bikash Tamang', 'Chitwan', 'Chitwan', 1);
      await expect(bookingsPage.message.root).toHaveText('From and To cannot be the same');
      await expect(bookingsPage.ticket('SY-1004').root).toHaveCount(0);
    });

    test('cancels a confirmed ticket', async () => {
      const ticket = bookingsPage.ticket('SY-1001');
      await ticket.cancel();
      await expect(bookingsPage.message.root).toHaveText('Ticket SY-1001 cancelled');
      await expect(ticket.status).toHaveText('Cancelled');
      await expect(ticket.cancelButton).toHaveCount(0);
    });

    test('logs out and shows a message', async ({ page }) => {
      await bookingsPage.nav.logout();
      const loginPage = new LoginPage(page);
      await expect(page).toHaveURL(/\/login/);
      await expect(loginPage.message.root).toHaveText('You have logged out');
    });

    // C+: new test, no new locators needed
    test('shows the traveller profile', async ({ page }) => {
      await bookingsPage.nav.openProfile();
      const profilePage = new ProfilePage(page);
      await expect(profilePage.heading).toBeVisible();
      await expect(profilePage.fullName).toHaveText('Ram Thapa');
      await expect(profilePage.phone).toHaveText('9841000001');
      await expect(profilePage.homeCity).toHaveText('Kathmandu');
    });
  });
});