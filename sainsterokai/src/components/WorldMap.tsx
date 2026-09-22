import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { WORLDS } from '../data/topics';

export default function WorldMap() {
  const { playerProgress, setScreen, selectWorld } = useGameStore();
  const [toastMessage, setToastMessage] = useState('');

  const handleWorldClick = (worldId: string, locked: boolean) => {
    if (locked) {
      setToastMessage('Dunia ini masih berkunci!');
      setTimeout(() => setToastMessage(''), 2000);
    } else {
      selectWorld(worldId as any);
    }
  };

  return (
    <div
      className="screen animate-fadeIn"
      style={{
        background: 'linear-gradient(135deg, var(--green-light), var(--blue-light))',
        padding: '2rem',
        overflowY: 'auto',
      }}
    >
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 className="page-title" style={{ textAlign: 'left', marginBottom: '0.5rem' }}>Peta Dunia Sains 🗺️</h1>
            <p className="page-subtitle" style={{ textAlign: 'left' }}>Hai, {playerProgress?.playerName || 'Saintis'}! Sedia untuk meneroka?</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ background: 'var(--white)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', fontWeight: 'bold', fontSize: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
              ⭐ {playerProgress?.totalStars || 0}
            </div>
            <button 
              className="btn btn-secondary"
              onClick={() => setScreen('profile')}
              style={{ fontSize: '1.5rem', padding: '0.5rem', borderRadius: '50%', width: '3rem', height: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              👤
            </button>
          </div>
        </div>

        {/* Worlds Grid */}
        <div className="grid-2 animate-fadeInUp stagger-1" style={{ gap: '2rem' }}>
          {WORLDS.map((world, idx) => (
            <div
              key={world.id}
              className="card-interactive"
              onClick={() => handleWorldClick(world.id, world.locked)}
              style={{
                background: `linear-gradient(135deg, ${world.gradientFrom}, ${world.gradientTo})`,
                color: 'var(--white)',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                opacity: world.locked ? 0.8 : 1,
                filter: world.locked ? 'grayscale(50%)' : 'none',
              }}
            >
              {world.locked && (
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', fontSize: '2rem', zIndex: 2 }}>
                  🔒
                </div>
              )}
              <div className="emoji-2xl" style={{ marginBottom: '1rem' }}>{world.emoji}</div>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                {world.name}
              </h2>
              <p style={{ fontSize: '1rem', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                {world.description}
              </p>
            </div>
          ))}
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="animate-fadeInUp" style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--gray-900)',
            color: 'var(--white)',
            padding: '1rem 2rem',
            borderRadius: 'var(--radius-full)',
            fontWeight: 'bold',
            zIndex: 1000,
            boxShadow: 'var(--shadow-lg)'
          }}>
            {toastMessage}
          </div>
        )}

      </div>
    </div>
  );
}
