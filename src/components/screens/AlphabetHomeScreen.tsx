import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IconButton } from '@/components/ui/IconButton';
import { ALPHABET_DATA } from '@/data/alphabet';

export function AlphabetHomeScreen() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--color-background)',
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: 'var(--space-md) var(--space-lg)',
          borderBottom: '2px solid var(--color-border)',
        }}
      >
        <IconButton onClick={() => navigate('/')}>←</IconButton>
        <h2
          style={{
            flex: 1,
            textAlign: 'center',
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--font-size-xl)',
            color: 'var(--color-primary)',
          }}
        >
          🔤 字母学习
        </h2>
        <div style={{ width: '40px' }} />
      </div>

      {/* Game Mode Selection */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-md)',
          padding: 'var(--space-lg)',
        }}
      >
        <p
          style={{
            fontSize: 'var(--font-size-md)',
            color: 'var(--color-text-light)',
            textAlign: 'center',
            marginBottom: 'var(--space-sm)',
          }}
        >
          选择学习模式
        </p>

        {/* Mode Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div
            onClick={() => navigate('/alphabet/recognize')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-lg)',
              padding: 'var(--space-lg)',
              backgroundColor: 'var(--color-card)',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-md)',
              cursor: 'pointer',
              borderLeft: '6px solid #FF6B6B',
            }}
          >
            <div style={{ fontSize: '48px' }}>🖼️</div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'var(--font-size-lg)',
                  color: 'var(--color-text)',
                }}
              >
                认字母
              </div>
              <div
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-light)',
                }}
              >
                看字母，选图片
              </div>
            </div>
            <div style={{ fontSize: '24px', color: 'var(--color-text-light)' }}>→</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div
            onClick={() => navigate('/alphabet/sound')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-lg)',
              padding: 'var(--space-lg)',
              backgroundColor: 'var(--color-card)',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-md)',
              cursor: 'pointer',
              borderLeft: '6px solid #4ECDC4',
            }}
          >
            <div style={{ fontSize: '48px' }}>🔊</div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'var(--font-size-lg)',
                  color: 'var(--color-text)',
                }}
              >
                听音辨字母
              </div>
              <div
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-light)',
                }}
              >
                听发音，选字母
              </div>
            </div>
            <div style={{ fontSize: '24px', color: 'var(--color-text-light)' }}>→</div>
          </div>
        </motion.div>
      </div>

      {/* A-Z Grid */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 'var(--space-md)',
          overflowY: 'auto',
        }}
      >
        <p
          style={{
            fontSize: 'var(--font-size-md)',
            color: 'var(--color-text-light)',
            marginBottom: 'var(--space-md)',
          }}
        >
          点击字母听发音
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 'var(--space-sm)',
            maxWidth: '400px',
          }}
        >
          {ALPHABET_DATA.map((letter, i) => (
            <motion.div
              key={letter.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02 }}
            >
              <div
                onClick={() => {
                  // Speak the letter using Web Speech API
                  const utterance = new SpeechSynthesisUtterance(letter.letter);
                  utterance.lang = 'en-US';
                  speechSynthesis.speak(utterance);
                }}
                style={{
                  width: '56px',
                  height: '56px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: letter.color,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                  transition: 'transform 0.1s ease',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: 'white',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {letter.letter}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
