import React from 'react';
import './globals.css';
import Head from 'next/head';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SomValencia',
  description: 'Mapa para pedir ayuda',
};

export default function RootLayout({ children }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <html lang="es">
        <body className={`${inter.className} antialiased`}>
          {children}
          <Toaster />
          <Analytics />
        </body>

      </html>
    </>
  );
}
