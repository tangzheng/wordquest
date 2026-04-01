import { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export function SettingsScreen() {
  const settings = useGameStore((s) => s.settings);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const resetProgress = useGameStore((s) => s.resetProgress);
  const [showResetModal, setShowResetModal] = useState(false);

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
            <Button
              onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
              color={settings.soundEnabled ? 'var(--color-success)' : 'var(--color-text-light)'}
            >
              {settings.soundEnabled ? '开' : '关'}
            </Button>
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
            <Button
              onClick={() => updateSettings({ showChinese: !settings.showChinese })}
              color={settings.showChinese ? 'var(--color-success)' : 'var(--color-text-light)'}
            >
              {settings.showChinese ? '开' : '关'}
            </Button>
          </div>
        </Card>

        {/* Speech rate */}
        <Card>
          <div style={{ marginBottom: 'var(--space-sm)' }}>
            <span style={{ fontSize: 'var(--font-size-md)' }}>
              🗣️ 朗读速度：{settings.speechRate.toFixed(1)}x
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.0"
            step="0.1"
            value={settings.speechRate}
            onChange={(e) => updateSettings({ speechRate: parseFloat(e.target.value) })}
            style={{ width: '100%', height: '40px', cursor: 'pointer' }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-light)',
            }}
          >
            <span>慢</span>
            <span>正常</span>
          </div>
        </Card>

        {/* Reset */}
        <Card style={{ marginTop: 'var(--space-lg)' }}>
          <Button
            onClick={() => setShowResetModal(true)}
            color="var(--color-error)"
            fullWidth
          >
            🗑️ 重置所有进度
          </Button>
        </Card>
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
