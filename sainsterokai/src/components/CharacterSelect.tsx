import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { CHARACTERS } from '../data/topics';
import { CharacterId } from '../types';

export default function CharacterSelect() {
  const { setCharacter } = useGameStore();
  const [name, setName] = useState('');
  const [selectedId, setSelectedId] = useState<CharacterId | null>(null);

  const handleStart = () => {
    if (name.trim() && selectedId) {
      setCharacter(selectedId, name.trim());
    }
  };

  return (
    <div
      className="screen animate-fadeIn"
      style={{
        background: 'linear-gradient(135deg, var(--yellow), var(--orange-light))',
        padding: '2rem',
        overflowY: 'auto',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h1 className="page-title" style={{ marginBottom: '2rem' }}>Pilih Watak Kamu!</h1>

        <div style={{ marginBottom: '2rem' }} className="animate-fadeInUp stagger-1">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama Saintis Muda..."
            style={{
              padding: '1rem 2rem',
              fontSize: '1.5rem',
              borderRadius: 'var(--radius-full)',
              border: '4px solid var(--white)',
              boxShadow: 'var(--shadow-md)',
              width: '100%',
              maxWidth: '400px',
              textAlign: 'center',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div className="grid-3 animate-fadeInUp stagger-2" style={{ marginBottom: '3rem' }}>
          {CHARACTERS.map((char) => {
            const isSelected = selectedId === char.id;
            return (
              <div
                key={char.id}
                className="card-interactive"
                onClick={() => setSelectedId(char.id)}
                style={{
                  background: char.bgGradient,
                  border: isSelected ? `6px solid ${char.color}` : '6px solid transparent',
                  transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: isSelected ? `0 0 20px ${char.color}80` : 'var(--shadow-md)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div className="emoji-2xl" style={{ marginBottom: '1rem' }}>{char.emoji}</div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: char.color }}>{char.name}</h2>
                <p style={{ fontSize: '1rem', color: 'var(--gray-700)' }}>{char.description}</p>
              </div>
            );
          })}
        </div>

        <button
          className="btn btn-primary btn-lg animate-fadeInUp stagger-3"
          onClick={handleStart}
          disabled={!name.trim() || !selectedId}
          style={{
            fontSize: '1.5rem',
            padding: '1rem 3rem',
            borderRadius: 'var(--radius-full)',
            opacity: (!name.trim() || !selectedId) ? 0.5 : 1,
            cursor: (!name.trim() || !selectedId) ? 'not-allowed' : 'pointer',
          }}
        >
          Mula Pengembaraan!
        </button>
      </div>
    </div>
  );
}
