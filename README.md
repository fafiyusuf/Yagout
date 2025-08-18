This project is a basic implementation of a payment gateway integration within a Next.js application. It allows a user to enter payment details, which are then securely transmitted to a payment provider. The application handles the success and failure callbacks from the provider and displays the result to the user.

### How It Works

The payment flow consists of the following steps:

1.  **Checkout**: The user fills out a form on the `/checkout` page with their name, email, mobile number, and the amount to be paid.
2.  **API Request**: Upon submission, the frontend sends a POST request to the `/api/pay` endpoint with the form data.
3.  **Payload Encryption**: The backend API receives the request, generates a unique order number, and creates a payload. This payload is then encrypted using AES-256-CBC, and a security hash is generated to ensure data integrity.
4.  **Redirection to Payment Gateway**: The API responds with the encrypted payload and the payment gateway's URL. The frontend then dynamically creates a form and automatically submits it, redirecting the user to the payment gateway to complete the payment.
5.  **Callback Handling**: After the payment is processed, the payment gateway sends a POST request to one of the callback URLs (`/api/callback/success` or `/api/callback/fail`).
6.  **Displaying Results**: The callback routes redirect the user to the `/payment-result` page, which displays a success or failure message based on the outcome of the transaction.

### Project Structure

-   `src/app/checkout/page.tsx`: The main page where the user initiates the payment.
-   `src/app/api/pay/route.ts`: The backend endpoint that handles payment requests, encryption, and redirection.
-   `src/app/api/callback/success/routes.ts`: The callback endpoint for successful payments.
-   `src/app/api/callback/fail/routes.ts`: The callback endpoint for failed payments.
-   `src/app/payment-result/page.tsx`: The page that displays the final payment status to the user.
-   `src/style/globals.css`: Global styles for the application.

### Configuration

To run this project, you need to set up the following environment variables. Create a `.env.local` file in the root of the project and add the following:

```
MERCHANT_ID=your_merchant_id
MERCHANT_KEY=your_merchant_key
SUCCESS_URL=/api/callback/success
FAIL_URL=/api/callback/fail
BASE_URL=http://localhost:3000
```

-   `MERCHANT_ID` and `MERCHANT_KEY`: Your credentials provided by the payment gateway.
-   `SUCCESS_URL` and `FAIL_URL`: The callback URLs for the application.
-   `BASE_URL`: The base URL of your application.

### What's Missing

This project is a simplified demonstration and lacks several features required for a production-ready application:

-   **Database Integration**: There is no database to store transaction records, customer information, or order details.
-   **User Authentication**: The application does not have a user management system.
-   **Enhanced Security**: The encryption uses a hardcoded Initialization Vector (IV), which is not secure. A unique IV should be generated for each encryption.
-   **Robust Error Handling**: The error handling is minimal. A production system would require more comprehensive logging and user-friendly error messages.
-   **Input Validation**: There is a lack of thorough server-side validation for the incoming data.
-   **Automated Tests**: The project does not include any unit or integration tests.

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

Open [http://localhost:3000/checkout](http://localhost:3000/checkout) with your browser to see the result.
