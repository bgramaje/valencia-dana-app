import React from 'react';
import './globals.css';
import Head from 'next/head';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SOM - Valencia',
  description: 'Aplicación interactiva para solicitar ayuda',
};

export default function RootLayout({ children }) {
  return (
    <>
      <Head>
        <script src="https://unpkg.com/react-scan/dist/auto.global.js" async />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <html lang="es">
        <body className={`${inter.className} antialiased`}>
          {children}
          <Toaster />
          <Analytics />
          <SpeedInsights />
        </body>

      </html>
    </>
  );
}
