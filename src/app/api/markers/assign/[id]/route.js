import StatusCode from 'status-code-enum';

import { NextResponse } from 'next/server';
import { hasAnyAttribute } from '@/lib/utils';

import { markersTable, supabase } from '../../route';

export async function PUT(request, { params }) {
  const { id } = await params; // Get the `id` from the URL params
  const { code, ...rest } = await request.json(); // Get the `status` from the request body

  if (!id) {
    return NextResponse.json(
      { error: 'ID is required' },
      { status: StatusCode.ClientErrorBadRequest },
    );
  }

  const { data: markerDB, error: errorSelect } = await supabase
    .from(markersTable)
    .select('*')
    .eq('id', id)
    .single();

  if (errorSelect) {
    return NextResponse.json(
      { error: errorSelect.message },
      { status: StatusCode.ServerErrorInternal },
    );
  }

  if (hasAnyAttribute(markerDB, ['helper_name', 'helper_password', 'helper_telf'])) {
    return NextResponse.json(
      { error: 'El marcador ya ha sido asignado a alguien. Refresca' },
      { status: StatusCode.ClientErrorConflict },
    );
  }

  const { data, error } = await supabase
    .from(markersTable)
    .update(rest)
    .eq('id', id)
    .select();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: StatusCode.ServerErrorInternal },
    );
  }

  return NextResponse.json(data[0], { status: StatusCode.SuccessOK });
}
