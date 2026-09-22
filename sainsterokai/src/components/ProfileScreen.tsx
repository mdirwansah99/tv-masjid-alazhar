import React from 'react';
import { useGameStore } from '../store/gameStore';
import { CHARACTERS, WORLDS } from '../data/topics';

export default function ProfileScreen() {
  const { playerProgress, goHome, resetProgress } = useGameStore();

  if (!playerProgress) return null;

  const character = CHARACTERS.find(c => c.id === playerProgress.characterId);
  const completedCount = Object.keys(playerProgress.completedGames).length;

  const handleReset = () => {
    if (window.confirm('Adakah anda pasti mahu memadam semua rekod permainan? Tindakan ini tidak boleh diundur.')) {
      resetProgress();
    }
  };

  return (
    <div
      className="screen animate-fadeIn"
      style={{
        background: 'var(--off-white)',
        padding: '2rem',
        overflowY: 'auto',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
          <button 
            className="btn btn-ghost" 
            onClick={goHome}
            style={{ fontSize: '2rem', marginRight: '1rem', padding: '0.5rem' }}
          >
            ←
          </button>
          <h1 className="page-title" style={{ textAlign: 'left', margin: 0 }}>Profil Saya</h1>
        </div>

        {/* Profile Card */}
        <div className="card animate-fadeInUp" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem', background: character?.bgGradient }}>
          <div className="emoji-2xl" style={{ fontSize: '5rem', background: 'var(--white)', padding: '1rem', borderRadius: '50%', boxShadow: 'var(--shadow-md)' }}>
            {character?.emoji}
          </div>
          <div>
            <h2 style={{ fontSize: '2rem', color: character?.color, marginBottom: '0.5rem' }}>{playerProgress.playerName}</h2>
            <p style={{ fontSize: '1.25rem', color: 'var(--gray-700)' }}>Peneroka Sains Muda</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid-3 animate-fadeInUp stagger-1" style={{ gap: '1.5rem', marginBottom: '3rem' }}>
          <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⭐</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--gray-900)' }}>{playerProgress.totalStars}</div>
            <div style={{ color: 'var(--gray-500)' }}>Jumlah Bintang</div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎮</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--gray-900)' }}>{completedCount}</div>
            <div style={{ color: 'var(--gray-500)' }}>Permainan Selesai</div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏅</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--gray-900)' }}>{playerProgress.badges.length}</div>
            <div style={{ color: 'var(--gray-500)' }}>Lencana Terkumpul</div>
          </div>
        </div>

        {/* Badges Section */}
        {playerProgress.badges.length > 0 && (
          <div className="animate-fadeInUp stagger-2" style={{ marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--gray-700)' }}>Lencana Saya</h3>
            <div className="grid-3" style={{ gap: '1rem' }}>
              {playerProgress.badges.map(badge => (
                <div key={badge.id} className="card" style={{ textAlign: 'center', padding: '1rem', background: 'var(--yellow-light)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{badge.emoji}</div>
                  <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{badge.name}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>{badge.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="animate-fadeInUp stagger-3" style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
          <button 
            className="btn btn-danger" 
            onClick={handleReset}
            style={{ padding: '0.75rem 2rem' }}
          >
            Tetapkan Semula (Reset)
          </button>
        </div>

      </div>
    </div>
  );
}
