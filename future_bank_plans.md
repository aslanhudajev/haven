# Future Banking Integrations

## The Problem

Goal contributions count toward settlement (fairness math), but there's a real-world gap: where does the saved money actually live? With purchases, money is already spent and settlement just evens things out. With goals, money is being *saved*, so there needs to be somewhere for it to land — ideally a shared account the household controls.

## Integration Tiers

### Tier 1: Read-Only Account Linking (lowest effort)

Use an Open Banking aggregator to show a linked shared bank account balance inside goal cards.

- **Tink** (Visa-owned, Swedish, PSD2-compliant) — strongest candidate for the Swedish market
- **Plaid** — dominant in the US/UK
- **GoCardless** (formerly Nordigen) — free account data API in the EU

What this enables: "Your household savings account has 12,400 kr" shown next to the goal progress bar. No money movement, just visibility.

Regulatory burden: minimal. PSD2 AISP (Account Information Service Provider) registration, or operate under the aggregator's license.

### Tier 2: Payment Initiation (medium effort)

Trigger real bank transfers from within the app — "Contribute 500 kr to vacation goal" moves money from the user's bank to the shared account.

- Tink and Plaid both support PSD2 **PISP** (Payment Initiation Service Provider)
- User authorizes each transfer via their bank's Strong Customer Authentication (SCA)

Regulatory burden: moderate. PISP registration or agent agreement with the provider.

### Tier 3: Embedded Accounts via BaaS (heavy lift)

Issue real bank accounts (IBANs/local account numbers) within the app. Each household gets a shared sub-account for goals.

**Banking-as-a-Service providers:**

| Provider | Region | Notes |
|---|---|---|
| Swan | EU (French license) | Modern API, EUR IBANs |
| Solarisbank | EU (German license) | White-label banking, used by many fintechs |
| Modulr | UK/EU | Payment accounts, not full banking |
| Railsr (formerly Railsbank) | UK/EU | Cards + accounts |
| Treezor | EU (French license) | White-label e-money |

What this enables: each household goal has a real pot of money. Contributions are real transfers. The app becomes the financial hub.

Regulatory burden: heavy. KYC/AML obligations, partnership agreements, compliance infrastructure.

### Tier 4: Own E-Money License

Operate like **Dreams** (dreams.se) — hold user funds under an e-money license from Finansinspektionen, partner with a licensed bank for fund safeguarding.

- Dreams is not a bank. They have an **e-money license** and partner with banks to hold funds in segregated accounts.
- This is the model for fintech apps that wrap savings goals around real money without building banking infrastructure.
- Klarna started with an e-money license before getting a full banking license years later.

Regulatory burden: significant but achievable. E-money license application with the Swedish FSA, ongoing compliance, fund safeguarding requirements.

## Recommended Path

1. **Now:** Goals count toward settlement math. Users manage shared savings externally.
2. **Near-term:** Add a "tip" when creating a goal suggesting the household open a shared savings account at their bank.
3. **Next milestone:** Tink integration for read-only account linking (show shared account balance in the app).
4. **Later:** Payment initiation so goal contributions trigger real transfers.
5. **Series A territory:** BaaS integration or e-money license for embedded accounts.

## Reference

- [Tink](https://tink.com) — Open Banking API (Visa)
- [Dreams](https://dreams.se) — Swedish savings app (e-money license model)
- [Swan](https://swan.io) — EU BaaS
- [Solarisbank](https://solarisbank.com) — EU white-label banking
- [PSD2 overview](https://ec.europa.eu/info/law/payment-services-psd-2-directive-eu-2015-2366_en)
