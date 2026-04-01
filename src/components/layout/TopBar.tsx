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
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ width: '48px' }}>
        {showBack && (
          <IconButton onClick={() => navigate(-1)} label="返回">
            ←
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

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
        {streak > 0 && (
          <span
            style={{
              fontSize: 'var(--font-size-md)',
              fontWeight: 700,
              backgroundColor: 'rgba(255, 152, 56, 0.15)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            🔥 {streak}
          </span>
        )}
        <span
          style={{
            fontSize: 'var(--font-size-md)',
            fontWeight: 700,
            backgroundColor: 'rgba(255, 215, 0, 0.15)',
            padding: '4px 12px',
            borderRadius: 'var(--radius-pill)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          ⭐ {totalStars}
        </span>
      </div>
    </div>
  );
}
