import { NextRequest, NextResponse } from 'next/server';

type Note = {
  id: number;
  message: string;
  x: number;
  y: number;
  expiresAt: number;
  ip: string;
};

let notes: Note[] = [];
let nextId = 1;

// Store last post times by IP for cooldown
const lastPostByIP: Record<string, number> = {};


// ❌ Remove this line:
// export function getClientIP(req: NextRequest): string {

// ✅ Use this instead:
function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  return 'unknown';
}




export async function GET() {
  const now = Date.now();
  const activeNotes = notes.filter((n) => n.expiresAt > now);
  return NextResponse.json(activeNotes);
}

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  const data = await req.json();
  const { message, x, y, expiresAt, adminToken } = data;

  if (!message || typeof x !== 'number' || typeof y !== 'number' || !expiresAt) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const isAdmin = adminToken === process.env.ADMIN_TOKEN;

  if (!isAdmin) {
    // Check cooldown: 1 note per IP per 24h
    const lastPost = lastPostByIP[ip] || 0;
    if (Date.now() - lastPost < 24 * 60 * 60 * 1000) {
      return NextResponse.json(
        { error: 'คูลดาวน์: คุณสามารถโพสต์บันทึกได้เพียง 1 บันทึกต่อวัน' },
        { status: 429 }
      );
    }
  }

  const note: Note = {
    id: nextId++,
    message,
    x,
    y,
    expiresAt,
    ip,
  };

  notes.push(note);
  if (!isAdmin) lastPostByIP[ip] = Date.now();

  return NextResponse.json(note);
}

export async function DELETE(req: NextRequest) {
  const data = await req.json();
  const { id, adminToken } = data;

  if (adminToken !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  notes = notes.filter((n) => n.id !== id);

  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { id, message, x, y, expiresAt, adminToken } = data;

  if (adminToken !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const noteIndex = notes.findIndex((n) => n.id === id);
  if (noteIndex === -1) {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 });
  }

  notes[noteIndex] = {
    ...notes[noteIndex],
    message,
    x,
    y,
    expiresAt,
  };

  return NextResponse.json(notes[noteIndex]);
}

