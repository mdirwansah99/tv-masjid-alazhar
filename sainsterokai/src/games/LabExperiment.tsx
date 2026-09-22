import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { LAB_DATA } from '../data/topics';
import type { GameResult, LabStep } from '../types';

export default function LabExperiment() {
  const { currentGame, currentTopic, currentWorld, completeGame, goHome } = useGameStore();
  
  const [data, setData] = useState<any>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showMaterials, setShowMaterials] = useState(true);
  const [stepState, setStepState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [mistakes, setMistakes] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  useEffect(() => {
    if (currentGame && LAB_DATA[currentGame]) {
      setData(LAB_DATA[currentGame]);
    }
  }, [currentGame]);

  if (!currentGame || !currentTopic || !currentWorld) {
    return <div className="screen flex items-center justify-center">Error: Game context missing</div>;
  }

  if (!data) return <div className="screen flex items-center justify-center">Loading...</div>;

  const steps = data.steps;
  const currentStep: LabStep = steps[currentStepIndex];
  const isFinished = currentStepIndex >= steps.length;

  const handleOptionSelect = (option: string) => {
    if (stepState === 'correct') return;

    setSelectedOption(option);
    
    if (option === currentStep.correctAnswer) {
      setStepState('correct');
    } else {
      setStepState('wrong');
      setMistakes(m => m + 1);
    }
  };

  const nextStep = () => {
    setStepState('idle');
    setSelectedOption(null);
    setCurrentStepIndex(prev => prev + 1);
  };

  const finishExperiment = () => {
    let stars = 3;
    if (mistakes > 0 && mistakes <= 2) stars = 2;
    if (mistakes > 2) stars = 1;

    const result: GameResult = {
      gameId: currentGame,
      topicId: currentTopic,
      worldId: currentWorld,
      stars,
      score: steps.length,
      maxScore: steps.length,
      completedAt: new Date().toISOString(),
    };
    completeGame(result);
  };

  return (
    <div className="screen animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #E0F7FA, #B2EBF2)', padding: 'var(--space-md)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
        <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold', color: 'var(--gray-900)' }}>Eksperimen</h1>
        <button onClick={goHome} className="btn btn-danger" style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)' }}>Keluar</button>
      </div>

      {!isFinished && (
        <>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-md)' }}>
            <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold' }}>{data.title}</h2>
            <p style={{ color: 'var(--gray-700)' }}>{data.objective}</p>
          </div>

          {showMaterials ? (
            <div className="card animate-fadeInUp" style={{ backgroundColor: 'white', borderRadius: 'var(--radius-xl)', padding: 'var(--space-xl)', boxShadow: 'var(--shadow-lg)', maxWidth: '500px', margin: '0 auto', width: '100%' }}>
              <h3 style={{ fontSize: 'var(--font-size-2xl)', textAlign: 'center', marginBottom: 'var(--space-lg)', borderBottom: '2px solid var(--gray-200)', paddingBottom: 'var(--space-sm)' }}>📋 Bahan-bahan</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {data.materials.map((mat: any, idx: number) => (
                  <li key={idx} className="stagger-1 animate-fadeIn" style={{ fontSize: 'var(--font-size-xl)', margin: 'var(--space-sm) 0', display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: 'var(--font-size-3xl)', marginRight: 'var(--space-md)' }}>{mat.emoji}</span>
                    {mat.name}
                  </li>
                ))}
              </ul>
              <button onClick={() => setShowMaterials(false)} className="btn btn-primary" style={{ width: '100%', padding: 'var(--space-md)', fontSize: 'var(--font-size-xl)', marginTop: 'var(--space-xl)', borderRadius: 'var(--radius-full)' }}>
                Mula Eksperimen 🚀
              </button>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Progress */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-md)', gap: '8px' }}>
                {steps.map((_: any, idx: number) => (
                  <div key={idx} style={{ 
                    width: '12px', height: '12px', borderRadius: '50%', 
                    backgroundColor: idx < currentStepIndex ? 'var(--green)' : idx === currentStepIndex ? 'var(--blue)' : 'var(--gray-300)',
                    transition: 'all 0.3s'
                  }} />
                ))}
              </div>

              {/* Lab Card */}
              <div className="card animate-fadeInUp" style={{ backgroundColor: 'white', borderRadius: 'var(--radius-xl)', padding: 'var(--space-xl)', boxShadow: 'var(--shadow-lg)', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                
                {currentStep.emoji && (
                  <div className="animate-float" style={{ fontSize: '80px', marginBottom: 'var(--space-md)' }}>
                    {currentStep.emoji}
                  </div>
                )}
                
                <h3 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
                  {currentStep.instruction}
                </h3>

                {currentStep.type === 'select' && currentStep.options && (
                  <div className="grid-2" style={{ width: '100%', gap: 'var(--space-md)', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    {currentStep.options.map((option: string, idx: number) => {
                      const isSelected = selectedOption === option;
                      const isCorrect = option === currentStep.correctAnswer;
                      
                      let bgStyle = { backgroundColor: 'var(--gray-100)', color: 'var(--gray-900)' };
                      if (stepState !== 'idle') {
                        if (isCorrect) bgStyle = { backgroundColor: 'var(--green)', color: 'white' };
                        else if (isSelected) bgStyle = { backgroundColor: 'var(--red)', color: 'white' };
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleOptionSelect(option)}
                          disabled={stepState === 'correct'}
                          className="card-interactive"
                          style={{
                            ...bgStyle,
                            padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-lg)', fontWeight: 'bold',
                            border: 'none', transition: 'all 0.2s',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                          }}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Feedback */}
                {stepState === 'correct' && (
                  <div className="animate-bounceIn" style={{ marginTop: 'var(--space-xl)', backgroundColor: 'var(--green-light)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', width: '100%', textAlign: 'center', fontWeight: 'bold' }}>
                    <p style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)' }}>{currentStep.feedbackCorrect}</p>
                    <button onClick={nextStep} className="btn btn-primary" style={{ padding: '8px 24px', borderRadius: 'var(--radius-full)' }}>Seterusnya →</button>
                  </div>
                )}

                {stepState === 'wrong' && (
                  <div className="animate-shake" style={{ marginTop: 'var(--space-xl)', backgroundColor: 'var(--orange-light)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', width: '100%', textAlign: 'center', fontWeight: 'bold' }}>
                    <p style={{ fontSize: 'var(--font-size-lg)' }}>{currentStep.feedbackWrong}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {isFinished && (
        <div className="card animate-bounceIn" style={{ backgroundColor: 'white', borderRadius: 'var(--radius-xl)', padding: 'var(--space-xl)', boxShadow: 'var(--shadow-lg)', textAlign: 'center', margin: 'auto' }}>
          <div style={{ fontSize: '100px' }}>🎉</div>
          <h2 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', marginBottom: 'var(--space-md)' }}>Eksperimen Selesai!</h2>
          <p style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-xl)' }}>Syabas Saintis Muda!</p>
          <button onClick={finishExperiment} className="btn btn-primary" style={{ padding: '16px 32px', fontSize: 'var(--font-size-xl)', borderRadius: 'var(--radius-full)' }}>Tamat</button>
        </div>
      )}
    </div>
  );
}
