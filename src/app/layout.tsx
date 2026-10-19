import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from '@/components/providers';

export const metadata: Metadata = {
  title: 'FixFlow — AI-Assisted Maintenance Management',
  description: 'Enterprise maintenance and work order management platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
