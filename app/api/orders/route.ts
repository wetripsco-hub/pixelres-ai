import { NextResponse } from 'next/server';

// Deprecated: this endpoint trusted client-supplied prices and statuses.
// Orders are created through /api/orders/create, which prices on the server.
export async function POST() {
  return NextResponse.json({ error: 'Gone. Use /api/orders/create.' }, { status: 410 });
}
