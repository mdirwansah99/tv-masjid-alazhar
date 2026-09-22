import React from 'react';
import { useGameStore } from '../store/gameStore';
import { WORLDS } from '../data/topics';

export default function TopicSelect() {
  const { currentWorld, goHome, startGame, selectTopic, playerProgress } = useGameStore();

  const world = WORLDS.find((w) => w.id === currentWorld);

  if (!world) {
    return null;
  }

  // Group topics by tahun
  const topicsByTahun = world.topics.reduce((acc, topic) => {
    if (!acc[topic.tahun]) acc[topic.tahun] = [];
    acc[topic.tahun].push(topic);
    return acc;
  }, {} as Record<number, typeof world.topics>);

  return (
    <div
      className="screen animate-fadeIn"
      style={{
        background: 'var(--off-white)',
        padding: '2rem',
        overflowY: 'auto',
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
          <button 
            className="btn btn-ghost" 
            onClick={goHome}
            style={{ fontSize: '2rem', marginRight: '1rem', padding: '0.5rem' }}
          >
            ←
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="emoji-xl">{world.emoji}</span>
            <h1 className="page-title" style={{ textAlign: 'left', margin: 0 }}>{world.name}</h1>
          </div>
        </div>

        {/* Topics by Tahun */}
        {Object.entries(topicsByTahun).map(([tahun, topics]) => (
          <div key={tahun} style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--gray-700)', marginBottom: '1rem', borderBottom: '2px solid var(--gray-200)', paddingBottom: '0.5rem' }}>
              Tahun {tahun}
            </h2>
            
            <div className="grid-2" style={{ gap: '1.5rem' }}>
              {topics.map((topic, index) => (
                <div key={topic.id} className="card animate-fadeInUp" style={{ animationDelay: `${index * 0.1}s`, padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="emoji-xl">{topic.icon}</div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <h3 style={{ fontSize: '1.25rem', margin: 0 }}>{topic.title}</h3>
                        <span style={{ fontSize: '0.75rem', background: 'var(--blue-light)', color: 'var(--blue)', padding: '0.125rem 0.5rem', borderRadius: 'var(--radius-full)', fontWeight: 'bold' }}>
                          Tahun {topic.tahun}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', margin: 0 }}>{topic.description}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {topic.games.map((game) => {
                      const gameIcon = game.type === 'quiz' ? '📝' : game.type === 'drag-drop' ? '🧩' : '🔬';
                      const progress = playerProgress?.completedGames[game.id];
                      
                      return (
                        <button
                          key={game.id}
                          className="btn btn-secondary"
                          onClick={() => { selectTopic(topic.id); startGame(game.id, game.type); }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.75rem 1rem',
                            textAlign: 'left',
                            width: '100%',
                            background: 'var(--gray-100)',
                            border: '1px solid var(--gray-200)',
                            color: 'var(--gray-900)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '1.25rem' }}>{gameIcon}</span>
                            <span style={{ fontWeight: 'bold' }}>{game.title}</span>
                          </div>
                          {progress && (
                            <div style={{ display: 'flex', gap: '0.125rem' }}>
                              {[...Array(3)].map((_, i) => (
                                <span key={i} style={{ color: i < progress.stars ? 'var(--yellow)' : 'var(--gray-300)', fontSize: '1.25rem' }}>
                                  ★
                                </span>
                              ))}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}
