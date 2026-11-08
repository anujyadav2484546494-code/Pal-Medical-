# Pal Medical Store

A browser-based pharmacy management demo with customer, staff, and administrator portals.

## Run locally

Start the included static server from this folder:

```bash
node server.js
```

Then open `http://localhost:3000` in a browser. You can also open `index.html` directly.

## Demo data and configuration

The public source intentionally contains no default staff or administrator accounts, customer history, invoices, prescriptions, distributor contacts, store address, phone number, licence or tax identifiers, or payment destination. The medicine catalogue is sample data only.

Store-specific fields in `js/data.js` are blank. Add private deployment configuration outside the public repository before using contact, payment, tax, or licensing features.

## Security note

This project is a front-end prototype. Its current account and role handling uses browser storage and is not secure for production. Do not enter real patient or staff information. Add server-side authentication, authorization, and protected data storage before using it with real customers or staff.

## Main files

- `index.html` — application shell
- `css/styles.css` — layout and print styles
- `js/data.js` — sample medicine catalogue and blank store configuration
- `js/app.js` — customer, staff, and administrator portal behavior
- `server.js` — zero-dependency local static server
