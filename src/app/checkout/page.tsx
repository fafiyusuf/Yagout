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
    
    const payload = {
      ...form,
      amount: Number(form.amount).toFixed(2),
    };

    const res = await fetch('/api/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
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
          {/* **FIX:** Add input fields to the form */}
          <div>
            <label htmlFor="cust_name" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" name="cust_name" id="cust_name" value={form.cust_name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black" />
          </div>
          <div>
            <label htmlFor="email_id" className="block text-sm font-medium text-gray-700">Email Address</label>
            <input type="email" name="email_id" id="email_id" value={form.email_id} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black" />
          </div>
          <div>
            <label htmlFor="mobile_no" className="block text-sm font-medium text-gray-700">Mobile Number</label>
            <input type="tel" name="mobile_no" id="mobile_no" value={form.mobile_no} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black" />
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
            <input type="number" name="amount" id="amount" value={form.amount} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black" />
          </div>
          <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Pay Now
          </button>
        </form>
      </div>
    </div>
  );
}