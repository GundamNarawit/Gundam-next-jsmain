'use client';
import { useEffect, useState } from 'react';

export default function Note({
  id, message, x, y, expiresAt
}: any) {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    function update() {
      const diff = expiresAt - Date.now();
      if (diff <= 0) return setTimeLeft('Expired');
      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`Expires in: ${hours}h ${mins}m`);
    }
    update();
    const iv = setInterval(update, 60000);
    return () => clearInterval(iv);
  }, [expiresAt]);

  if (timeLeft === 'Expired') return null;

  return (
    <div
      className="absolute bg-yellow-100 border p-2 rounded shadow w-48"
      style={{ left: x, top: y }}
      data-id={id}
    >
      <p>{message}</p>
      <small className="text-gray-600">{timeLeft}</small>
    </div>
  );
}
