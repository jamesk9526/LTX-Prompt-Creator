
import type { Metadata } from 'next';
import { AppShell } from './components/app-shell';

export const metadata: Metadata = {
  title: 'LTX Prompter Walkthrough',
  description: 'Electron + Next.js walkthrough for LTX Prompter',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
