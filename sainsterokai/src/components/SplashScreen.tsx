import React from 'react';
import { useGameStore } from '../store/gameStore';

export default function SplashScreen() {
  const { playerProgress, setScreen } = useGameStore();
  const hasPlayer = !!playerProgress;

  const handleStart = () => {
    if (hasPlayer) {
      setScreen('world-map');
    } else {
      setScreen('character-select');
    }
  };

  return (
    <div
      className="screen animate-fadeIn"
      style={{
        background: 'linear-gradient(135deg, var(--blue-light), var(--purple-light))',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div className="animate-bounce" style={{ marginBottom: '2rem' }}>
        <span className="emoji-2xl">🔬🧪🌿</span>
      </div>
      
      <h1 className="page-title animate-fadeInUp" style={{ color: 'var(--gray-900)', fontSize: '3rem', marginBottom: '1rem' }}>
        SainsTerokai
      </h1>
      
      <p className="page-subtitle animate-fadeInUp stagger-1" style={{ fontSize: '1.5rem', marginBottom: '3rem' }}>
        Jom Terokai Sains!
      </p>

      <button
        className="btn btn-primary btn-lg animate-fadeInUp stagger-2"
        onClick={handleStart}
        style={{
          fontSize: '1.5rem',
          padding: '1rem 3rem',
          borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {hasPlayer ? 'Sambung Bermain' : 'Mula Bermain'}
      </button>

      {/* Floating background elements */}
      <div style={{ position: 'absolute', top: '10%', left: '10%', opacity: 0.5 }} className="animate-float">🌟</div>
      <div style={{ position: 'absolute', top: '20%', right: '15%', opacity: 0.5, animationDelay: '1s' }} className="animate-float">🚀</div>
      <div style={{ position: 'absolute', bottom: '15%', left: '20%', opacity: 0.5, animationDelay: '2s' }} className="animate-float">🦠</div>
      <div style={{ position: 'absolute', bottom: '25%', right: '10%', opacity: 0.5, animationDelay: '0.5s' }} className="animate-float">🔭</div>
    </div>
  );
}
