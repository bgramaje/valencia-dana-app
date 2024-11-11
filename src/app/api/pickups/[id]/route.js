import { supabase } from '../../markers/route';
import { pickupsTable } from '../route';

export async function GET(request, { params }) {
  const { id } = await params; // Get the `id` from the URL params

  if (!id) {
    return new Response(JSON.stringify({ error: 'ID is required' }), { status: 400 });
  }

  // Update the `status` field of the specified marker
  const { data: marker, error } = await supabase
    .from(pickupsTable)
    .select(
      '*, location(*)',
    )
    .eq('id', id) // Reemplaza "id" con el valor del ID que buscas
    .single(); // .single() devuelve un solo objeto en lugar de un array

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(marker), { status: 200 });
}
