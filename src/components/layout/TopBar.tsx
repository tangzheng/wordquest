import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/useGameStore';
import { IconButton } from '@/components/ui/IconButton';

interface TopBarProps {
  title?: string;
  showBack?: boolean;
}

export function TopBar({ title, showBack = true }: TopBarProps) {
  const navigate = useNavigate();
  const totalStars = useGameStore((s) => s.totalStars);
  const streak = useGameStore((s) => s.dailyStreak.current);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-sm) var(--space-md)',
        minHeight: '56px',
      }}
    >
      <div style={{ width: '48px' }}>
        {showBack && (
          <IconButton onClick={() => navigate(-1)} label="返回">
            ◀
          </IconButton>
        )}
      </div>

      {title && (
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--font-size-lg)',
            color: 'var(--color-text)',
            textAlign: 'center',
            flex: 1,
          }}
        >
          {title}
        </h2>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        {streak > 0 && (
          <span style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>
            🔥 {streak}
          </span>
        )}
        <span style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>
          ⭐ {totalStars}
        </span>
      </div>
    </div>
  );
}
