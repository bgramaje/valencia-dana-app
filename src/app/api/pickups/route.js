import { supabase } from '../markers/route';

export const pickupsTable = process.env.SUPABASE_PICKUPS_TABLE;

export async function GET() {
  const { data: markers, error } = await supabase
    .from(pickupsTable)
    .select('*, location (*)');

    console.log(markers);
    
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(markers), { status: 200 });
}
