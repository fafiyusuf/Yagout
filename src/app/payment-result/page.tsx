'use client';

import '@/style/globals.css';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const SuccessDisplay = () => (
  <>
    <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
    <h1 className="text-3xl font-bold text-gray-800 mt-4">Payment Successful!</h1>
    <p className="text-gray-600 mt-2">Thank you for your purchase. Your transaction has been completed.</p>
  </>
);

const FailDisplay = () => (
  <>
    <svg className="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
    <h1 className="text-3xl font-bold text-gray-800 mt-4">Payment Failed</h1>
    <p className="text-gray-600 mt-2">Unfortunately, we were unable to process your payment.</p>
  </>
);

const ErrorDisplay = () => (
   <>
    <h1 className="text-3xl font-bold text-gray-800 mt-4">Invalid Access</h1>
    <p className="text-gray-600 mt-2">This page cannot be accessed directly.</p>
  </>
);

export default function PaymentResultPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');

  const renderContent = () => {
    switch (status) {
      case 'success':
        return <SuccessDisplay />;
      case 'failed':
        return <FailDisplay />;
      default:
        return <ErrorDisplay />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
      <div className="bg-white p-10 rounded-lg shadow-md">
        {renderContent()}
        <Link href="/checkout">
          <span className="inline-block mt-6 px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 cursor-pointer">
            {status === 'success' ? 'Make Another Payment' : 'Try Again'}
          </span>
        </Link>
      </div>
    </div>
  );
}