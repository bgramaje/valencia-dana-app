// Get markers from Supabase

import { supabase } from '../markers/route';

export const townsTable = process.env.SUPABASE_TOWNS_TABLE;

export async function GET() {
  const { data: towns, error } = await supabase
    .from(townsTable)
    .select('*')
    .or('total_helpers_markers.neq.0,total_point_markers.neq.0')
    .order('name', { ascending: true }); // 'ascending: true' for alphabetical order

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(towns), { status: 200 });
}
