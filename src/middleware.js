// middleware.js (raíz del proyecto)

import { NextResponse } from 'next/server';

export async function middleware() {
  // Obtener los dominios permitidos desde las variables de entorno
  /*
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [];

  const origin = req.headers.get('origin') || req.headers.get('referer');

  const res = NextResponse.next();

  // Verificar si el origen de la solicitud es uno de los permitidos
  const isAllowedOrigin = allowedOrigins.some((allowedOrigin) => origin?.startsWith(allowedOrigin));

  if (isAllowedOrigin) {
    // Establecer los encabezados CORS para los orígenes permitidos
    res.headers.set('Access-Control-Allow-Origin', origin);
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  } else {
    // Si el origen no está permitido, devolver 403 Forbidden
    return new NextResponse('Forbidden', { status: 403 });
  }

  */

  const res = NextResponse.next();

  // res.headers.set('Access-Control-Allow-Origin', origin);
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return res;
}
