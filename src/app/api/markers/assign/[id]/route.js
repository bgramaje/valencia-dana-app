import { hasAnyAttribute } from '@/lib/utils';
import { markersTable, supabase } from '../../route';

export async function PUT(request, { params }) {
  const { id } = await params; // Get the `id` from the URL params
  const { code, ...rest } = await request.json(); // Get the `status` from the request body

  if (!id) {
    return new Response(JSON.stringify({ error: 'ID is required' }), { status: 400 });
  }

  const { data: markerDB, error: errorSelect } = await supabase
    .from(markersTable)
    .select('*')
    .eq('id', id)
    .single();

  if (errorSelect) {
    return new Response(
      JSON.stringify(
        { error: errorSelect.message },
      ),
      { status: 500 },
    );
  }

  if (hasAnyAttribute(markerDB, ['helper_name', 'helper_password', 'helper_telf'])) {
    return new Response(
      JSON.stringify(
        { error: 'El marcador ya ha sido asignado a alguien. Refresca' },
      ),
      { status: 204 },
    );
  }

  const { data, error } = await supabase
    .from(markersTable)
    .update(rest)
    .eq('id', id)
    .select();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(data[0]), { status: 200 });
}
