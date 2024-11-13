export const pickupsNeedsTable = process.env.SUPABASE_PICKUPS_NEEDS_TABLE;

export async function GET() {
  return new Response(JSON.stringify({ key: process.env.MASTER_KEY_PICKUPS }), { status: 200 });
}
