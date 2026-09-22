import React from 'react';
import { useGameStore } from '../store/gameStore';

export default function ResultScreen() {
  const { lastResult, startGame, currentWorld, setScreen, currentGame, currentGameType } = useGameStore();

  if (!lastResult) return null;

  const { stars, score, maxScore } = lastResult;
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  
  let title = '';
  let subtitle = '';
  
  if (stars === 3) {
    title = 'Luar Biasa!';
    subtitle = 'Kamu seorang saintis yang hebat!';
  } else if (stars === 2) {
    title = 'Tahniah!';
    subtitle = 'Usaha yang baik, teruskan!';
  } else {
    title = 'Cuba Lagi!';
    subtitle = 'Jangan putus asa, mari belajar bersama.';
  }

  const handleReplay = () => {
    if (currentGame && currentGameType) {
      startGame(currentGame, currentGameType);
    }
  };

  const handleBack = () => {
    setScreen('topic-select');
  };

  return (
    <div
      className="screen animate-fadeIn"
      style={{
        background: stars === 3 ? 'linear-gradient(135deg, var(--yellow), var(--orange))' : 'linear-gradient(135deg, var(--blue-light), var(--purple-light))',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      {stars === 3 && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div className="animate-float" style={{ position: 'absolute', top: '10%', left: '20%', fontSize: '3rem' }}>🎉</div>
          <div className="animate-float" style={{ position: 'absolute', top: '30%', right: '20%', fontSize: '3rem', animationDelay: '0.5s' }}>🎊</div>
          <div className="animate-float" style={{ position: 'absolute', bottom: '20%', left: '30%', fontSize: '3rem', animationDelay: '1s' }}>✨</div>
        </div>
      )}

      <div className="card animate-bounceIn" style={{ padding: '3rem', maxWidth: '500px', width: '100%', position: 'relative', zIndex: 10 }}>
        <h1 className="page-title" style={{ marginBottom: '0.5rem', color: stars === 3 ? 'var(--orange)' : 'var(--blue)' }}>{title}</h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--gray-700)', marginBottom: '2rem' }}>{subtitle}</p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
          {[1, 2, 3].map((starIdx) => (
            <div 
              key={starIdx} 
              className={starIdx <= stars ? "animate-bounceIn" : ""}
              style={{ 
                fontSize: '4rem', 
                color: starIdx <= stars ? 'var(--yellow)' : 'var(--gray-200)',
                textShadow: starIdx <= stars ? '0 0 20px rgba(255, 215, 0, 0.5)' : 'none',
                animationDelay: `${starIdx * 0.2}s`
              }}
            >
              ★
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--gray-900)' }}>
            {score} / {maxScore} Betul!
          </div>
          <div style={{ fontSize: '1.25rem', color: 'var(--gray-500)', marginTop: '0.5rem' }}>
            {Math.round(percentage)}%
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={handleReplay} style={{ flex: 1 }}>
            Main Lagi 🔄
          </button>
          <button className="btn btn-primary" onClick={handleBack} style={{ flex: 1 }}>
            Kembali ➡️
          </button>
        </div>
      </div>
    </div>
  );
}
