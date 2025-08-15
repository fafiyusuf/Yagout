'use client';
import { useState } from 'react';

export default function CheckoutPage() {
  const [form, setForm] = useState({ cust_name: '', email_id: '', mobile_no: '', amount: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const html = await res.text();
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(html);
      newWindow.document.close();
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h2>Checkout</h2>
      <form onSubmit={handleSubmit}>
        <input name="cust_name" placeholder="Name" onChange={handleChange} required /><br />
        <input name="email_id" placeholder="Email" onChange={handleChange} required /><br />
        <input name="mobile_no" placeholder="Mobile" onChange={handleChange} required /><br />
        <input name="amount" type="number" placeholder="Amount" onChange={handleChange} required /><br />
        <button type="submit">Pay Now</button>
      </form>
    </div>
  );
}
