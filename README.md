# UPA IT MASTER LOGBOOK V4

A minimalist registration, hardware tracking, and transaction logbook system for IT equipment.

🌐 **Live Website:** [https://emzie123.github.io/UPA/](https://emzie123.github.io/UPA/)

---

## Logbook Specifications (V4)

1. **Date & Timestamp**: Interactive input removed per spec. Automatically recorded upon transaction submission.
2. **Ticket Number**: 20-character limit with live counter.
3. **Type of Transaction**: Searchable auto-filtered combobox (Issuance, Return, Replacement, etc.).
4. **Type of Asset**: Dropdown menu (Headset, Laptop, Desktop / CPU, Monitor, Peripherals, Other).
5. **Machine Name (Asset Model)**: Dynamic dropdown dynamically populated with models, prominently including Jabra Biz series.
6. **Serial Number**: 25-character limit with live counter (default sample removed).
7. **Quantity**: Fixed to 1 item per transaction entry.
8. **Asset Status**: Dropdown menu for current hardware state (Working/Deployed, In Stock, Defective, etc.).
9. **Account**: Searchable auto-filtered combobox for company programs/campaigns.
10. **Name**: Validated format: `Last Name, First Name M.I.`
11. **Workday ID**: 12-character limit with live counter.
12. **Remarks**: Optional notes field.
13. **Concentrix Email / Personal**: Required corporate or exit contact email.

## Additional Features
- Minimalist, distraction-free monochrome UI with high contrast and clean typography.
- Persistent in-browser Master Logbook with instant search and CSV export.
- Confirmation receipt modal with transaction metadata.
