'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ADMIN_CODE = '053836306';

export default function AdminLogin() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code === ADMIN_CODE) {
      localStorage.setItem('adminToken', code);
      router.push('/admin');
    } else {
      setError('Incorrect code');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-indigo-400 via-purple-400 to-pink-400 px-4">
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-indigo-700">
          Admin Login
        </h1>
        <input
          type="password"
          placeholder="Enter admin code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full border border-indigo-300 rounded-md p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}
