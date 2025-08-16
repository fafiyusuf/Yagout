'use client';
import '@/style/globals.css';
import { useState } from 'react';

export default function CheckoutPage() {
  const [form, setForm] = useState({ cust_name: '', email_id: '', mobile_no: '', amount: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create a FormData object from the form elements
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    const res = await fetch('/api/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data) // Use the direct form data
    });

    if (!res.ok) {
        const errorData = await res.json();
        console.error('API Error:', errorData.error);
        alert('Payment failed: ' + errorData.error);
        return;
    }

    const paymentData = await res.json();

    // Dynamically create and submit the form
    const paymentForm = document.createElement('form');
    paymentForm.method = 'POST';
    paymentForm.action = paymentData.url;
    paymentForm.style.display = 'none';

    const meIdInput = document.createElement('input');
    meIdInput.type = 'hidden';
    meIdInput.name = 'me_id';
    meIdInput.value = paymentData.me_id;
    paymentForm.appendChild(meIdInput);

    const merchantRequestInput = document.createElement('input');
    merchantRequestInput.type = 'hidden';
    merchantRequestInput.name = 'merchant_request';
    merchantRequestInput.value = paymentData.merchant_request;
    paymentForm.appendChild(merchantRequestInput);

    const hashInput = document.createElement('input');
    hashInput.type = 'hidden';
    hashInput.name = 'hash';
    hashInput.value = paymentData.hash;
    paymentForm.appendChild(hashInput);

    document.body.appendChild(paymentForm);
    paymentForm.submit();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Checkout</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="sr-only">Name</label>
            <input
              id="name"
              name="cust_name"
              placeholder="Name"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              name="email_id"
              type="email"
              placeholder="Email"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="mobile" className="sr-only">Mobile</label>
            <input
              id="mobile"
              name="mobile_no"
              type="tel"
              placeholder="Mobile"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="amount" className="sr-only">Amount</label>
            <input
              id="amount"
              name="amount"
              type="number"
              placeholder="Amount"
              onChange={handleChange}
              required
              min="0.01"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Pay Now
          </button>
        </form>
      </div>
    </div>
  );
}