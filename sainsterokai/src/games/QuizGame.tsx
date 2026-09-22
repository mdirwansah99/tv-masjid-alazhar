import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { QUIZ_QUESTIONS } from '../data/questions';
import type { GameResult } from '../types';

export default function QuizGame() {
  const { currentGame, currentTopic, currentWorld, completeGame, goHome } = useGameStore();
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (currentGame && QUIZ_QUESTIONS[currentGame]) {
      setQuestions(QUIZ_QUESTIONS[currentGame]);
    }
  }, [currentGame]);

  if (!currentGame || !currentTopic || !currentWorld) {
    return <div className="screen flex items-center justify-center">Error: Game context missing</div>;
  }

  if (questions.length === 0) {
    return <div className="screen flex items-center justify-center">Loading...</div>;
  }

  const question = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;

    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = index === question.correctIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setTimeout(() => {
      if (isLastQuestion) {
        const finalScore = score + (isCorrect ? 1 : 0);
        const percentage = (finalScore / questions.length) * 100;
        let stars = 1;
        if (percentage >= 80) stars = 3;
        else if (percentage >= 50) stars = 2;

        const result: GameResult = {
          gameId: currentGame,
          topicId: currentTopic,
          worldId: currentWorld,
          stars,
          score: finalScore,
          maxScore: questions.length,
          completedAt: new Date().toISOString(),
        };
        completeGame(result);
      } else {
        setCurrentIndex((prev) => prev + 1);
        setSelectedOption(null);
        setIsAnswered(false);
      }
    }, 2500);
  };

  return (
    <div className="screen animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--blue-light)', padding: 'var(--space-md)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: 'var(--gray-900)' }}>Kuiz</h1>
        <button onClick={goHome} className="btn btn-danger" style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)' }}>Keluar</button>
      </div>

      {/* Progress */}
      <div style={{ backgroundColor: 'white', padding: 'var(--space-sm)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-md)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: 'bold' }}>
          <span>Soalan {currentIndex + 1} / {questions.length}</span>
          <span>Markah: {score}</span>
        </div>
        <div className="progress-bar" style={{ height: '12px', backgroundColor: 'var(--gray-200)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
          <div className="progress-bar-fill" style={{ width: `${progress}%`, height: '100%', backgroundColor: 'var(--blue)', transition: 'width 0.3s ease' }}></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="card animate-fadeInUp" style={{ backgroundColor: 'white', padding: 'var(--space-xl)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', textAlign: 'center', marginBottom: 'var(--space-xl)', color: 'var(--gray-900)' }}>
          {question.question}
        </h2>

        {/* Options Grid */}
        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', flex: 1 }}>
          {question.options.map((option: string, idx: number) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === question.correctIndex;
            
            let bgStyle = { backgroundColor: 'var(--gray-100)', color: 'var(--gray-900)', border: '2px solid transparent' };
            let animationClass = '';

            if (isAnswered) {
              if (isCorrect) {
                bgStyle = { backgroundColor: 'var(--green)', color: 'white', border: '2px solid var(--green-dark)' };
                animationClass = 'animate-bounceIn';
              } else if (isSelected) {
                bgStyle = { backgroundColor: 'var(--red)', color: 'white', border: '2px solid var(--red-dark)' };
                animationClass = 'animate-shake';
              } else {
                bgStyle = { backgroundColor: 'var(--gray-100)', color: 'var(--gray-500)', border: '2px solid transparent' };
              }
            }

            const prefix = ['A', 'B', 'C', 'D'][idx];

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(idx)}
                disabled={isAnswered}
                className={`card-interactive ${animationClass}`}
                style={{
                  ...bgStyle,
                  padding: 'var(--space-lg)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: 'var(--font-size-xl)',
                  fontWeight: 'bold',
                  transition: 'all 0.2s',
                  cursor: isAnswered ? 'default' : 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ 
                  width: '40px', height: '40px', borderRadius: '50%', 
                  backgroundColor: isAnswered && (isCorrect || isSelected) ? 'rgba(255,255,255,0.3)' : 'white', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  marginRight: 'var(--space-md)', flexShrink: 0 
                }}>
                  {prefix}
                </div>
                <span>{option}</span>
                {isAnswered && isCorrect && <span style={{ marginLeft: 'auto', fontSize: '24px' }}>✅</span>}
                {isAnswered && isSelected && !isCorrect && <span style={{ marginLeft: 'auto', fontSize: '24px' }}>❌</span>}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {isAnswered && (
          <div className="animate-fadeInUp" style={{ 
            marginTop: 'var(--space-xl)', 
            padding: 'var(--space-md)', 
            borderRadius: 'var(--radius-md)', 
            backgroundColor: selectedOption === question.correctIndex ? 'var(--green-light)' : 'var(--orange-light)',
            color: 'var(--gray-900)',
            fontSize: 'var(--font-size-lg)',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            {selectedOption === question.correctIndex ? 'Syabas! ' : 'Oh tidak! '} 
            {question.explanation}
          </div>
        )}
      </div>
    </div>
  );
}
