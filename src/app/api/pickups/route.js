import unidecode from 'unidecode';
import { isEmpty } from 'lodash';
import { supabase } from '../markers/route';

export const pickupsTable = process.env.SUPABASE_PICKUPS_TABLE;

export async function GET() {
  const { data: markers, error } = await supabase
    .from(pickupsTable)
    .select('*, location (*)');
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(markers), { status: 200 });
}

// Add a new marker to Supabase
export async function POST(request) {
  const newPickup = await request.json();

  const { location } = newPickup;

  if (!location || location === 'Unknown' || location === '') {
    return new Response(JSON.stringify({ message: 'Una localización es necesaria' }), { status: 403 });
  }

  const { data: town, error: errorTown } = await supabase.rpc('get_similar_towns', {
    search_name: unidecode(location).toLowerCase(), // replace with your dynamic variable
  });

  if (errorTown || isEmpty(town)) {
    return new Response(JSON.stringify({ error: 'Location no encontrado en BBDD' }), { status: 500 });
  }

  const { data, error } = await supabase
    .from(pickupsTable)
    .insert([{ ...newPickup, location: town[0].name, verified: (/true/).test(newPickup.verified) }])
    .select('*');

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(data[0]), { status: 201 });
}
