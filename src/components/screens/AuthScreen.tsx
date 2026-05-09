import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TopBar } from '@/components/layout/TopBar';

interface AuthScreenProps {
  onClose: () => void;
}

export function AuthScreen({ onClose }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { signIn, signUp, loading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !password) {
      setError('请填写邮箱和密码');
      return;
    }

    if (password.length < 6) {
      setError('密码至少需要6个字符');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (isSignUp) {
      const { error } = await signUp(email, password);
      if (error) {
        setError(error.message);
      } else {
        setSuccess('注册成功！请查收验证邮件。');
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      } else {
        onClose();
      }
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title={isSignUp ? '注册' : '登录'} showBack />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 'var(--space-lg)',
          gap: 'var(--space-lg)',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: 'var(--space-md)' }}>🔐</div>

        <Card style={{ width: '100%', maxWidth: '360px', padding: 'var(--space-lg)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', marginBottom: '4px', color: 'var(--color-text-light)' }}>
                邮箱
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{
                  width: '100%',
                  padding: 'var(--space-sm) var(--space-md)',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid rgba(0,0,0,0.1)',
                  fontSize: 'var(--font-size-md)',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', marginBottom: '4px', color: 'var(--color-text-light)' }}>
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                style={{
                  width: '100%',
                  padding: 'var(--space-sm) var(--space-md)',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid rgba(0,0,0,0.1)',
                  fontSize: 'var(--font-size-md)',
                  outline: 'none',
                }}
              />
            </div>

            {isSignUp && (
              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', marginBottom: '4px', color: 'var(--color-text-light)' }}>
                  确认密码
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••"
                  style={{
                    width: '100%',
                    padding: 'var(--space-sm) var(--space-md)',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid rgba(0,0,0,0.1)',
                    fontSize: 'var(--font-size-md)',
                    outline: 'none',
                  }}
                />
              </div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  padding: 'var(--space-sm)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(255,135,135,0.15)',
                  color: 'var(--color-error)',
                  fontSize: 'var(--font-size-sm)',
                  textAlign: 'center',
                }}
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  padding: 'var(--space-sm)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(81,207,102,0.15)',
                  color: 'var(--color-success)',
                  fontSize: 'var(--font-size-sm)',
                  textAlign: 'center',
                }}
              >
                {success}
              </motion.div>
            )}

            <Button type="submit" onClick={() => {}} loading={loading} fullWidth size="large">
              {isSignUp ? '注册' : '登录'}
            </Button>
          </form>

          <div style={{ marginTop: 'var(--space-md)', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setSuccess(null);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary)',
                fontSize: 'var(--font-size-sm)',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              {isSignUp ? '已有账号？登录' : '没有账号？注册'}
            </button>
          </div>
        </Card>

        {!isSignUp && (
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-light)', textAlign: 'center', maxWidth: '300px' }}>
            登录后可同步游戏进度到云端，在不同设备间继续学习
          </p>
        )}
      </motion.div>
    </div>
  );
}