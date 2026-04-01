import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';

interface AppShellProps {
  title?: string;
  showBack?: boolean;
}

export function AppShell({ title, showBack }: AppShellProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        minHeight: '100dvh',
        maxWidth: '600px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      <TopBar title={title} showBack={showBack} />
      <main
        style={{
          flex: 1,
          padding: 'var(--space-md)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
