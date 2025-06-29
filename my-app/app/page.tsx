'use client';

import { useEffect, useState, useRef } from 'react';

type Note = {
  id: number;
  message: string;
  x: number;
  y: number;
  expiresAt: number;
};

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [message, setMessage] = useState('');
  const [pos, setPos] = useState({ x: 100, y: 100 }); // default pos
  const [cooldownMsg, setCooldownMsg] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const scrollStart = useRef({ left: 0, top: 0 });

  // Track canvas size dynamically
  const [canvasSize, setCanvasSize] = useState({ width: 2000, height: 1500 });

  useEffect(() => {
    fetchNotes();

    // Poll notes every 3 seconds for realtime effect
    const interval = setInterval(fetchNotes, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // On window resize, adjust canvas size to at least fill screen + 1000px extra for panning
    function updateCanvasSize() {
      setCanvasSize({
        width: window.innerWidth + 1000,
        height: window.innerHeight + 1000,
      });
    }
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  function fetchNotes() {
    fetch('/api/notes')
      .then((res) => res.json())
      .then(setNotes);
  }

  async function postNote() {
    if (!message.trim()) {
      alert('กรุณาใส่ข้อความ');
      return;
    }

    const expiresAt = Date.now() + 3 * 24 * 60 * 60 * 1000; // 3 วัน

    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        x: pos.x,
        y: pos.y,
        expiresAt,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setCooldownMsg(data.error || 'เกิดข้อผิดพลาดในการส่งโน้ต');
      return;
    }

    setCooldownMsg('');
    setMessage('');
    fetchNotes();
  }

  function onCanvasClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    const clickX = e.clientX - rect.left + containerRef.current.scrollLeft;
    const clickY = e.clientY - rect.top + containerRef.current.scrollTop;

    setPos({ x: clickX, y: clickY });
  }

  // Mouse drag handlers
  function onMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (!containerRef.current) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    scrollStart.current = {
      left: containerRef.current.scrollLeft,
      top: containerRef.current.scrollTop,
    };
    containerRef.current.style.cursor = 'grabbing';
  }

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!isDragging.current || !containerRef.current) return;
    e.preventDefault();
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    containerRef.current.scrollLeft = scrollStart.current.left - dx;
    containerRef.current.scrollTop = scrollStart.current.top - dy;
  }

  function endDrag() {
    isDragging.current = false;
    if (containerRef.current) containerRef.current.style.cursor = 'grab';
  }

  // Touch drag handlers
  function onTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    if (!containerRef.current) return;
    isDragging.current = true;
    const touch = e.touches[0];
    dragStart.current = { x: touch.clientX, y: touch.clientY };
    scrollStart.current = {
      left: containerRef.current.scrollLeft,
      top: containerRef.current.scrollTop,
    };
  }

  function onTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    if (!isDragging.current || !containerRef.current) return;
    e.preventDefault();
    const touch = e.touches[0];
    const dx = touch.clientX - dragStart.current.x;
    const dy = touch.clientY - dragStart.current.y;

    containerRef.current.scrollLeft = scrollStart.current.left - dx;
    containerRef.current.scrollTop = scrollStart.current.top - dy;
  }

  function onTouchEnd() {
    endDrag();
  }

  function getCountdown(expiresAt: number) {
    const diff = expiresAt - Date.now();
    if (diff <= 0) return 'หมดอายุ';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    return `${days} วัน ${hours} ชม. ${mins} นาที ${secs} วิ`;
  }

  return (
    <div
      style={{
        fontFamily: "'Sarabun', sans-serif",
        padding: 20,
        userSelect: isDragging.current ? 'none' : 'auto',
      }}
    >
      <h1 style={{ textAlign: 'center', fontSize: 30, fontWeight: 'bold', marginBottom: 15, color: 'purple' }}>
  Satit fakbok
</h1>
      <h1 style={{ textAlign: 'center', fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
        วางโน้ตของคุณแบบไม่ระบุตัวตน (ลากเพื่อเลื่อน, คลิกเพื่อวาง)
      </h1>

      <div
        ref={containerRef}
        onClick={onCanvasClick}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          width: '100vw',
          height: 'calc(100vh - 120px)', // leave space for header + form
          border: '2px solid black',
          overflow: 'auto',
          cursor: 'grab',
          position: 'relative',
          backgroundColor: '#f0f4f8',
          touchAction: 'none',
        }}
      >
        <div
          style={{
            width: canvasSize.width,
            height: canvasSize.height,
            position: 'relative',
          }}
        >
          {notes.map((note) => (
            <div
              key={note.id}
              style={{
                position: 'absolute',
                top: note.y,
                left: note.x,
                backgroundColor: 'yellow',
                padding: '6px 8px',
                borderRadius: 4,
                maxWidth: 200,
                pointerEvents: 'none',
                whiteSpace: 'pre-wrap',
                boxShadow: '0 0 5px rgba(0,0,0,0.3)',
                fontSize: 14,
              }}
            >
              <div>{note.message}</div>
              <div style={{ fontSize: 10, marginTop: 4, color: '#555' }}>
                หมดอายุใน: {getCountdown(note.expiresAt)}
              </div>
            </div>
          ))}

          <div
            style={{
              position: 'absolute',
              top: pos.y - 5,
              left: pos.x - 5,
              width: 10,
              height: 10,
              backgroundColor: 'red',
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <textarea
          rows={3}
          placeholder="เขียนข้อความของคุณที่นี่..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{
            border: '1px solid #ccc',
            padding: 8,
            width: '90vw',
            maxWidth: 320,
            fontFamily: "'Sarabun', sans-serif",
            resize: 'none',
          }}
        />
        <br />
        <button
          onClick={postNote}
          style={{
            marginTop: 8,
            padding: '8px 16px',
            backgroundColor: '#2563eb',
            color: 'white',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 'bold',
            border: 'none',
            fontFamily: "'Sarabun', sans-serif",
          }}
        >
          ส่งโน้ต
        </button>
        {cooldownMsg && (
          <p style={{ marginTop: 8, color: 'red', fontWeight: 'bold' }}>{cooldownMsg}</p>
        )}
        <h1 style={{ textAlign: 'center', fontSize: 30, fontWeight: 'bold', marginBottom: 15, color: 'red' }}>
  By Gundam 1/4
</h1>

      </div>
    </div>
  );
}
