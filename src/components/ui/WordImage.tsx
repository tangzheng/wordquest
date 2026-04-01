import { emojiToTwemojiUrl, stringToColor } from '@/utils/emoji';

interface WordImageProps {
  emoji: string;
  word: string;
  size?: number;
}

export function WordImage({ emoji, word, size = 120 }: WordImageProps) {
  if (!emoji) {
    // Fallback: colored circle with first letter
    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          backgroundColor: stringToColor(word),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: `${size * 0.5}px`,
          fontFamily: 'var(--font-heading)',
          color: 'white',
        }}
      >
        {word[0]?.toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={emojiToTwemojiUrl(emoji)}
      alt={word}
      width={size}
      height={size}
      style={{
        objectFit: 'contain',
        imageRendering: 'auto',
      }}
      loading="lazy"
      onError={(e) => {
        // Fallback to native emoji if Twemoji fails
        const target = e.currentTarget;
        target.style.display = 'none';
        const span = document.createElement('span');
        span.textContent = emoji;
        span.style.fontSize = `${size * 0.8}px`;
        span.style.lineHeight = '1';
        target.parentElement?.appendChild(span);
      }}
    />
  );
}
