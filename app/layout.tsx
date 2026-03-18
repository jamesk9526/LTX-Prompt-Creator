
import type { Metadata } from 'next';
import { AppShell } from './components/app-shell';

export const metadata: Metadata = {
  title: 'Oyama Prompt Pro',
  description: 'A premium prompt engineering studio for crafting, versioning, and testing AI prompts.',
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
