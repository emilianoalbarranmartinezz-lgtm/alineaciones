import type { Metadata } from 'next';
import { Barlow_Condensed, Inter } from 'next/font/google';
import { AppShell } from '@/components/layout/AppShell';
import './globals.css';

const body = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const display = Barlow_Condensed({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-display', display: 'swap' });

export const metadata: Metadata = {
  title: 'Football Tactical Studio',
  description: 'Estudio táctico de fútbol: alineaciones, formaciones y comparadores.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${body.variable} ${display.variable}`}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
