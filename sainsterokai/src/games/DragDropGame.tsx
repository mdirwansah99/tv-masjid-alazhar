import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { DRAG_DROP_DATA } from '../data/topics';
import type { GameResult, DragItem, DropZone } from '../types';

export default function DragDropGame() {
  const { currentGame, currentTopic, currentWorld, completeGame, goHome } = useGameStore();
  
  const [data, setData] = useState<any>(null);
  const [placedItems, setPlacedItems] = useState<Record<string, string>>({}); // itemId -> zoneId
  const [mistakes, setMistakes] = useState(0);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{message: string, isError: boolean} | null>(null);

  useEffect(() => {
    if (currentGame && DRAG_DROP_DATA[currentGame]) {
      setData(DRAG_DROP_DATA[currentGame]);
    }
  }, [currentGame]);

  if (!currentGame || !currentTopic || !currentWorld) {
    return <div className="screen flex items-center justify-center">Error: Game context missing</div>;
  }

  if (!data) return <div className="screen flex items-center justify-center">Loading...</div>;

  const totalItems = data.items.length;
  const correctCount = Object.keys(placedItems).length;
  const isComplete = correctCount === totalItems;

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    e.dataTransfer.setData('itemId', itemId);
    setSelectedItem(itemId);
  };

  const handleDrop = (e: React.DragEvent, zone: DropZone) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('itemId');
    processPlacement(itemId, zone);
  };

  const processPlacement = (itemId: string, zone: DropZone) => {
    if (!itemId) return;
    
    if (zone.acceptIds.includes(itemId)) {
      // Correct
      setPlacedItems(prev => ({ ...prev, [itemId]: zone.id }));
      setSelectedItem(null);
      setFeedback({ message: 'Betul!', isError: false });
      setTimeout(() => setFeedback(null), 1500);

      // Check completion
      if (Object.keys(placedItems).length + 1 === totalItems) {
        setTimeout(() => {
          let stars = 3;
          if (mistakes > 0) stars = 2;
          if (mistakes > 3) stars = 1;

          const result: GameResult = {
            gameId: currentGame,
            topicId: currentTopic,
            worldId: currentWorld,
            stars,
            score: totalItems,
            maxScore: totalItems,
            completedAt: new Date().toISOString(),
          };
          completeGame(result);
        }, 1500);
      }
    } else {
      // Wrong
      setMistakes(m => m + 1);
      setFeedback({ message: 'Cuba lagi!', isError: true });
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  const handleItemTap = (itemId: string) => {
    if (placedItems[itemId]) return; // Already placed
    if (selectedItem === itemId) {
      setSelectedItem(null);
    } else {
      setSelectedItem(itemId);
    }
  };

  const handleZoneTap = (zone: DropZone) => {
    if (selectedItem) {
      processPlacement(selectedItem, zone);
    }
  };

  const unplacedItems = data.items.filter((item: DragItem) => !placedItems[item.id]);

  return (
    <div className="screen animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--yellow)', padding: 'var(--space-md)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: 'var(--gray-900)' }}>Kelaskan</h1>
        <button onClick={goHome} className="btn btn-danger" style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)' }}>Keluar</button>
      </div>

      <div style={{ backgroundColor: 'white', padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', textAlign: 'center', marginBottom: 'var(--space-md)', fontWeight: 'bold', boxShadow: 'var(--shadow-sm)' }}>
        {data.instruction}
      </div>

      {/* Progress */}
      <div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 'var(--space-sm)', color: 'var(--gray-900)' }}>
        {correctCount} / {totalItems} betul
      </div>

      {/* Feedback Overlay */}
      {feedback && (
        <div className={`animate-bounceIn`} style={{
          position: 'fixed', top: '20%', left: '50%', transform: 'translate(-50%, -50%)',
          backgroundColor: feedback.isError ? 'var(--red)' : 'var(--green)',
          color: 'white', padding: 'var(--space-md) var(--space-xl)', borderRadius: 'var(--radius-full)',
          fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', zIndex: 100, boxShadow: 'var(--shadow-lg)'
        }}>
          {feedback.message} {feedback.isError ? '❌' : '✅'}
        </div>
      )}

      {/* Source Area */}
      <div style={{ 
        backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-md)', 
        minHeight: '120px', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)', justifyContent: 'center',
        marginBottom: 'var(--space-lg)'
      }}>
        {unplacedItems.map((item: DragItem) => (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => handleDragStart(e, item.id)}
            onClick={() => handleItemTap(item.id)}
            className={`card-interactive animate-fadeIn ${selectedItem === item.id ? 'animate-pulse' : ''}`}
            style={{
              backgroundColor: 'white', padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', 
              boxShadow: selectedItem === item.id ? '0 0 0 4px var(--blue)' : 'var(--shadow-sm)',
              cursor: 'grab', display: 'flex', flexDirection: 'column', alignItems: 'center',
              width: '80px'
            }}
          >
            <span style={{ fontSize: 'var(--font-size-3xl)' }}>{item.emoji}</span>
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'bold', textAlign: 'center', marginTop: '4px' }}>{item.label}</span>
          </div>
        ))}
        {unplacedItems.length === 0 && (
          <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold', color: 'var(--gray-500)', margin: 'auto' }}>
            Semua item telah diletakkan! 🎉
          </div>
        )}
      </div>

      {/* Drop Zones */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-md)', justifyContent: 'center', flex: 1 }}>
        {data.zones.map((zone: DropZone, idx: number) => {
          const zoneItems = data.items.filter((item: DragItem) => placedItems[item.id] === zone.id);
          const colors = ['var(--blue-light)', 'var(--green-light)', 'var(--orange-light)', 'var(--purple-light)'];
          const bgColor = colors[idx % colors.length];

          return (
            <div
              key={zone.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, zone)}
              onClick={() => handleZoneTap(zone)}
              style={{
                flex: '1 1 45%', minWidth: '150px', backgroundColor: bgColor, 
                border: selectedItem ? '3px dashed var(--blue)' : '3px dashed var(--gray-400)',
                borderRadius: 'var(--radius-lg)', padding: 'var(--space-sm)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: selectedItem ? 'pointer' : 'default'
              }}
            >
              <div style={{ fontSize: 'var(--font-size-2xl)' }}>{zone.emoji}</div>
              <div style={{ fontWeight: 'bold', marginBottom: 'var(--space-sm)', textAlign: 'center' }}>{zone.label}</div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                {zoneItems.map((item: DragItem) => (
                  <div key={item.id} className="animate-bounceIn" style={{
                    backgroundColor: 'white', padding: '4px', borderRadius: 'var(--radius-sm)',
                    boxShadow: 'var(--shadow-sm)', fontSize: 'var(--font-size-xl)', width: '40px', textAlign: 'center'
                  }}>
                    {item.emoji}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
