# Ideas

Backlog of features and directions discussed but not yet built.

## Card payments (lofi options)

Currently payments are tracked manually in the admin Ledger, with no in-app card
processing. Two low-fi ways to take card payments without building a full payment
integration from scratch:

- **Bluetooth card reader** (SumUp or Zettle/PayPal are the common UK options) - a
  small ~£19-29 dongle pairs to a phone via Bluetooth, customer taps their card,
  funds land in a linked bank account. No monthly fee, just a per-transaction %
  (roughly 1.7-2.75%). Payment happens on the spot at job completion.
- **Payment link** (SumUp or Stripe Payment Links) - generate a link and text it to
  the customer after the job; they pay on their own phone, no hardware needed at
  all. Better fit for a kid-run team who may not want to carry a reader around, but
  payment happens after the fact rather than at the door, so there's a chase-up risk.

Next step if pursued: wire payment-link generation into the Ledger/job-completion
flow (e.g. a "Send Payment Link" button on a completed job in JobManagement).
