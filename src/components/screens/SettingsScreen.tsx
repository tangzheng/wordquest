import { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useTTS } from '@/hooks/useTTS';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

function ToggleSwitch({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <div
      onClick={onChange}
      role="switch"
      aria-checked={value}
      style={{
        width: '52px',
        height: '28px',
        borderRadius: '14px',
        backgroundColor: value ? 'var(--color-success)' : '#ccc',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: '#fff',
          position: 'absolute',
          top: '2px',
          left: value ? '26px' : '2px',
          transition: 'left 0.2s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      />
    </div>
  );
}

export function SettingsScreen() {
  const settings = useGameStore((s) => s.settings);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const resetProgress = useGameStore((s) => s.resetProgress);
  const [showResetModal, setShowResetModal] = useState(false);
  const { speak } = useTTS();

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="⚙️ 设置" />

      <div
        style={{
          padding: 'var(--space-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-md)',
        }}
      >
        {/* Sound */}
        <Card>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 'var(--font-size-md)' }}>🔊 游戏音效</span>
            <ToggleSwitch
              value={settings.soundEnabled}
              onChange={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            />
          </div>
        </Card>

        {/* Chinese display */}
        <Card>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 'var(--font-size-md)' }}>🇨🇳 显示中文</span>
            <ToggleSwitch
              value={settings.showChinese}
              onChange={() => updateSettings({ showChinese: !settings.showChinese })}
            />
          </div>
        </Card>

        {/* Speech rate */}
        <Card>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--space-sm)',
            }}
          >
            <span style={{ fontSize: 'var(--font-size-md)' }}>
              🗣️ 朗读速度：{settings.speechRate.toFixed(1)}x
            </span>
            <Button
              onClick={() => speak('hello')}
              color="var(--color-secondary)"
              size="normal"
            >
              🔊 试听
            </Button>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)',
            }}
          >
            <span style={{ fontSize: '20px' }}>🐢</span>
            <input
              type="range"
              min="0.5"
              max="1.0"
              step="0.1"
              value={settings.speechRate}
              onChange={(e) => updateSettings({ speechRate: parseFloat(e.target.value) })}
              style={{ flex: 1, height: '40px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '20px' }}>🐇</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-light)',
              padding: '0 28px',
            }}
          >
            <span>慢</span>
            <span>正常</span>
          </div>
        </Card>

        {/* Reset */}
        <div style={{ marginTop: 'var(--space-2xl)', textAlign: 'center' }}>
          <button
            onClick={() => setShowResetModal(true)}
            style={{
              background: 'none',
              border: '1.5px solid rgba(220,80,80,0.4)',
              borderRadius: 'var(--radius-md)',
              color: 'rgba(220,80,80,0.7)',
              padding: 'var(--space-sm) var(--space-lg)',
              fontSize: 'var(--font-size-sm)',
              cursor: 'pointer',
              fontFamily: 'var(--font-heading)',
            }}
          >
            🗑️ 重置所有进度
          </button>
        </div>
      </div>

      <Modal isOpen={showResetModal} onClose={() => setShowResetModal(false)}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: 'var(--space-md)' }}>⚠️</div>
          <h3 style={{ marginBottom: 'var(--space-md)' }}>确定要重置吗？</h3>
          <p style={{ color: 'var(--color-text-light)', marginBottom: 'var(--space-xl)' }}>
            所有星星、徽章和学习进度将被清除，这个操作无法撤销。
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <Button
              onClick={() => setShowResetModal(false)}
              color="var(--color-text-light)"
              fullWidth
            >
              取消
            </Button>
            <Button
              onClick={() => {
                resetProgress();
                setShowResetModal(false);
              }}
              color="var(--color-error)"
              fullWidth
            >
              确定重置
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
