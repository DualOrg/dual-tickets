import { NextResponse } from "next/server";
import { getJwtToken, getAuthenticatedClient } from "@/lib/dual-auth";
import { getDataProvider } from "@/lib/data-provider";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_DUAL_API_URL || 'https://api.dual.network/';
const API_KEY = process.env.DUAL_API_KEY || '';

/**
 * POST /api/admin/backfill-metadata
 *
 * Updates all existing ticket objects with proper metadata fields
 * (name, description, image) so the DUAL console and Blockscout display them correctly.
 *
 * Strategy: Use ebus.execute with an update_object action since direct
 * REST updates to /objects/:id return 405 on the gateway.
 */
export async function POST() {
  try {
    const token = getJwtToken();
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const client = await getAuthenticatedClient();
    if (!client) {
      return NextResponse.json({ error: "Could not get authenticated client" }, { status: 401 });
    }

    const provider = getDataProvider();
    const tickets = await provider.listTickets();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dual-tickets.vercel.app';

    const results: Array<{ id: string; name: string; status: string; error?: string; approach?: string }> = [];

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
    if (API_KEY) headers['X-Api-Key'] = API_KEY;

    for (const ticket of tickets) {
      const td = ticket.ticketData;
      const name = td?.name || `${td?.eventName || 'Event Ticket'} - ${(td?.tier || 'general').toUpperCase()}`;
      const description = td?.description || `On-chain verified ticket for ${td?.eventName || 'event'}`;
      const tokenUri = `${appUrl}/api/metadata/${ticket.id}`;
      const imageUrl = td?.imageUrl;

      // Strategy 1: Use ebus.execute with update_object action
      try {
        const actionPayload: Record<string, any> = {
          action: {
            custom: {
              name: "update_object",
              object_id: ticket.id,
              data: {
                metadata: {
                  name,
                  description,
                  token_uri: tokenUri,
                  ...(imageUrl ? { image: { url: imageUrl } } : {}),
                },
              },
            },
          },
        };
        const result = await client.ebus.execute(actionPayload);
        results.push({ id: ticket.id, name, status: 'updated', approach: 'ebus.execute' });
        continue;
      } catch (ebusErr: any) {
        // ebus approach failed, try other methods
        const ebusDetail = ebusErr.body ? JSON.stringify(ebusErr.body) : ebusErr.message;

        // Strategy 2: Try different REST body structures
        const bodyVariants = [
          // Flat metadata fields at root
          { name, description, token_uri: tokenUri, ...(imageUrl ? { image: { url: imageUrl } } : {}) },
          // Nested under metadata
          { metadata: { name, description, token_uri: tokenUri, ...(imageUrl ? { image: { url: imageUrl } } : {}) } },
          // With object wrapper
          { object: { metadata: { name, description, token_uri: tokenUri, ...(imageUrl ? { image: { url: imageUrl } } : {}) } } },
        ];

        let updated = false;
        for (const bodyObj of bodyVariants) {
          for (const method of ['PUT', 'PATCH', 'POST']) {
            try {
              const res = await fetch(`${BASE_URL}/objects/${ticket.id}`, {
                method,
                headers,
                body: JSON.stringify(bodyObj),
              });
              if (res.ok) {
                results.push({ id: ticket.id, name, status: 'updated', approach: `${method} /objects/:id` });
                updated = true;
                break;
              }
              if (res.status !== 405) {
                const errText = await res.text();
                results.push({ id: ticket.id, name, status: 'error', error: `ebus: ${ebusDetail} | ${method}: ${res.status} ${errText.substring(0, 200)}` });
                updated = true;
                break;
              }
            } catch { /* continue */ }
          }
          if (updated) break;
        }

        if (!updated) {
          results.push({ id: ticket.id, name, status: 'error', error: `ebus: ${ebusDetail} | REST: all 405` });
        }
      }
    }

    return NextResponse.json({
      success: true,
      total: tickets.length,
      updated: results.filter(r => r.status === 'updated').length,
      errors: results.filter(r => r.status === 'error').length,
      results,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
