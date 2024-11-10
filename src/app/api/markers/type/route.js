import { supabase } from '../route';

const MARKERS_TYPE_TABLE = process.env.SUPABASE_MARKERS_TYPE_TABLE;

export async function GET() {
  // Update the `status` field of the specified marker
  const { data: types, error } = await supabase
    .from(MARKERS_TYPE_TABLE)
    .select('*');

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(types), { status: 200 });
}
