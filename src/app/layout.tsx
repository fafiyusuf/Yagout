import '@/style/globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'YagoutPay Checkout',
  description: 'Test integration for YagoutPay',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
