# Sajilo Yatra (Module 8 Session 1 lab app)

A tiny bus ticket booking site for practising the **Page Object Model**.
One Node file, no database, no packages to install.

## Start it

```bash
cd sajilo-yatra
npm start            # http://localhost:4300
```

Requires Node.js 18 or later. Different port: `PORT=4400 npm start` (PowerShell: `$env:PORT=4400; npm start`).

## Log in

| Username | Password | Name |
|---|---|---|
| ram.thapa | Yatra@123 | Ram Thapa (9841000001, Kathmandu) |
| sita.gurung | Yatra@123 | Sita Gurung (9851000002, Pokhara) |

Every login starts a **fresh session** with the same three tickets:

| Ticket | Passenger | Route | Seats | Fare | Status |
|---|---|---|---|---|---|
| SY-1001 | Ram Thapa | Kathmandu to Pokhara | 2 | Rs. 2,400 | Confirmed |
| SY-1002 | Gita Rai | Kathmandu to Chitwan | 1 | Rs. 900 | Confirmed |
| SY-1003 | Hari Karki | Pokhara to Lumbini | 3 | Rs. 4,500 | Cancelled |

The first ticket you book is always **SY-1004**. Data lives in memory and is lost when the app stops.

Fare per seat depends on the destination: Kathmandu 1,200, Pokhara 1,200, Chitwan 900, Lumbini 1,500, Janakpur 1,400.

## Pages

| URL | What it shows |
|---|---|
| /login | Login form and message box |
| /bookings | Header bar, booking form, message box, "All tickets" table |
| /profile | Header bar and traveller details |

## Messages you will see

- `Username and password are required`, `Invalid username or password`, `You have logged out`
- `Ticket SY-1004 booked for <passenger>`, `Ticket SY-1001 cancelled`
- `Passenger name is required`, `From and To cannot be the same`, `Seats must be between 1 and 6`

## Locators used in the lab

- Header: `getByRole('banner')`, inside it `getByTestId('welcome')`, links `My tickets` and `My profile`, button `Log out`
- Message box: `getByRole('status')`, inside it button `Dismiss message`
- Login: labels `Username`, `Password`, button `Log in`
- Booking form: labels `Passenger name`, `From`, `To`, `Seats`, button `Book ticket`
- Table row: `getByRole('row').filter({ hasText: 'SY-1001' })`, inside it test ids `fare` and `status`, button `Cancel`
- Profile: test ids `profile-name`, `profile-username`, `profile-phone`, `profile-city`

## Redesign day (Lab Part D)

```bash
npm run start:redesign
```

Renames two buttons: `Log in` becomes `Sign in`, `Book ticket` becomes `Book now`. Restart with `npm start` afterwards.

## API (for curious testers)

| Method | Path | Notes |
|---|---|---|
| GET | /api/health | `{ "status": "ok", "redesign": false }` |
| POST | /api/login | `{ username, password }` sets a session cookie |
| POST | /api/logout | ends the session |
| GET | /api/me | current traveller |
| GET | /api/tickets | tickets for this session |
| POST | /api/tickets | `{ passenger, from, to, seats }` returns 201 or 400 |
| POST | /api/tickets/:no/cancel | 200, 404 or 409 |
