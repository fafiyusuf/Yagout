YagoutPay Next.js demo integrating checkout, payment initialization, and callback handling. It submits encrypted payment requests to YagoutPay using provided merchant credentials and redirects back to a result page with rich status details.

### How It Works

Current flow

1) Checkout: `/checkout` collects name, email, phone, amount.
2) Initialize payment: Frontend calls `/api/pay`.
	- Server generates `order_no`, builds request blocks, encrypts with AES‑256‑CBC, and creates a SHA‑256 hash (as required by YagoutPay).
	- Responds with `gatewayUrl` and fields for a form auto‑post to YagoutPay.
3) Gateway: User completes payment on YagoutPay.
4) Callbacks: YagoutPay hits our success/fail route handlers (`/api/callback/success` or `/api/callback/fail`) via POST (and GET supported).
	- We build a safe absolute redirect using base URL (handles missing Host headers) and 303 redirect the browser to `/payment-result`.
	- We forward useful details (orderId, txnId, amount, currency, message, code, time) as query params when available.
5) Result page: `/payment-result` shows success/fail and displays the forwarded details.
6) Root redirect: visiting `/` auto‑redirects to `/checkout`.

### Project Structure

-   `src/app/checkout/page.tsx`: The main page where the user initiates the payment.
-   `src/app/api/pay/route.ts`: The backend endpoint that handles payment requests, encryption, and redirection.
-   `src/app/api/callback/success/route.ts`: Success callback (POST/GET). Builds absolute redirects and forwards details to the result page.
-   `src/app/api/callback/fail/route.ts`: Fail callback (POST/GET). Same as above for failures.
-   `src/app/page.tsx`: Redirects root `/` to `/checkout`.
-   `src/app/payment-result/page.tsx`: The page that displays the final payment status to the user.
-   `src/style/globals.css`: Global styles for the application.

### Configuration

Configuration

Create a `.env.local` file in the project root:

```
MERCHANT_ID=your_merchant_id
MERCHANT_KEY=your_merchant_key_base64
SUCCESS_URL=/api/callback/success
FAIL_URL=/api/callback/fail
BASE_URL=http://localhost:3000
```

-   `MERCHANT_ID` and `MERCHANT_KEY`: Merchant credentials from YagoutPay. Key must be base64‑encoded as per gateway spec.
-   `SUCCESS_URL` and `FAIL_URL`: The callback URLs for the application.
-   `BASE_URL`: The base URL of your application.

Notes:
- The app normalizes callback URLs to absolute (using `BASE_URL` or request origin), preventing Invalid URL errors when Host headers are missing.
- YagoutPay may still show their result page briefly unless you configure a separate Return URL and enable auto‑redirect in their dashboard.

SDK status and what’s next

Done in this repo (usable reference for SDK):
- Build encrypted request and hash using provided merchant credentials.
- Post to YagoutPay’s gateway with generated order number and amount.
- Handle success/fail callbacks robustly (POST/GET), construct absolute redirects, and forward key details to UI.
- Provide a simple checkout UI and a result page that shows message/reason and IDs.

Next steps for the SDK (server‑side library):
- Public API
	- `init(config)`: accept merchantId, merchantKey, baseUrl, returnUrl, notify URLs, env.
	- `createPayment(input)`: build encrypted payload + hash; return `gatewayUrl` + `formFields` for auto‑post.
	- `verifyCallback(payload)`: verify signatures/hashes from YagoutPay; return normalized result.
- Types and validation
	- Strong TypeScript types for inputs/outputs; runtime validation (zod) for configs and payloads.
- Security
	- Keep keys server‑only; never expose merchantKey to the browser.
	- Consider unique IV per request if YagoutPay spec allows (current demo uses fixed IV provided by spec).
- Configurability
	- Allow integrators to set their own return_url (browser) and notify/callback URLs (server) separately.
- Docs & examples
	- Provide a Next.js example (this repo) showing form auto‑post and callback handling.
	- Add examples for Express/NestJS.
- Tests
	- Unit tests for encryption/hash and callback verification.
	- Integration tests with recorded fixtures.

What’s left to make this production‑ready (app side):
- Persist orders and transaction status in a database; reconcile on callbacks (idempotent updates).
- Server‑side verification of callback signatures before trusting status.
- Input validation on `/api/pay` (amount ranges, required fields, email/phone formats).
- Better error handling and structured logging.
- Optionally support a separate user Return URL to skip gateway receipt (if supported), with 0s auto‑redirect.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/checkout`.
