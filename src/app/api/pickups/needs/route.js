import { supabase } from '../../markers/route';

export const pickupsNeedsTable = process.env.SUPABASE_PICKUPS_NEEDS_TABLE;

export async function GET() {
  const { data, error } = await supabase
    .from(pickupsNeedsTable)
    .select('*');
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(data), { status: 200 });
}
