import React, { useRef, useEffect, useState } from 'react';
import { useAudio } from '../hooks/useAudio';
import { useTelemetry } from '../hooks/useTelemetry';

const ASTEROIDS = [
  { id: 0, x: 300, y: 150, r: 50, color: '#45a29e', highColor: '#66fcf1', freq: 261.63 }, // C4
  { id: 1, x: 450, y: 300, r: 50, color: '#c5a3ff', highColor: '#e0caff', freq: 329.63 }, // E4
  { id: 2, x: 300, y: 450, r: 50, color: '#ffb347', highColor: '#ffd180', freq: 392.00 }, // G4
  { id: 3, x: 150, y: 300, r: 50, color: '#ff6666', highColor: '#ff9999', freq: 523.25 }  // C5
];

export default function GameCanvas() {
  const canvasRef = useRef(null);
  const { initAudio, playTone, playSuccessChime, playFailureBuzzer } = useAudio();
  const { logEvent } = useTelemetry();

  // Game State
  const [gameState, setGameState] = useState('MENU');
  const [score, setScore] = useState(0);
  const [sequenceLength, setSequenceLength] = useState(3);
  const [message, setMessage] = useState(null); 
  const [characterState, setCharacterState] = useState('idle'); // idle, happy, sad, alert
  
  // Refs for mutable game logic
  const engineState = useRef({
    showSpeed: 1000,
    streak: 0,
    sequence: [],
    playerStep: 0,
    isRedAlert: false,
    highlightedAsteroid: -1,
    internalState: 'MENU',
    timerIds: []
  });

  const clearAllTimers = () => {
    engineState.current.timerIds.forEach(clearTimeout);
    engineState.current.timerIds = [];
  };

  const safeTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    engineState.current.timerIds.push(id);
    return id;
  };

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ASTEROIDS.forEach((ast, index) => {
        ctx.beginPath();
        ctx.arc(ast.x, ast.y, ast.r, 0, Math.PI * 2);
        
        const isHigh = engineState.current.highlightedAsteroid === index;
        ctx.fillStyle = isHigh ? ast.highColor : ast.color;
        
        if (isHigh) {
          ctx.shadowBlur = 30;
          ctx.shadowColor = ast.highColor;
        } else {
          ctx.shadowBlur = 0;
        }
        
        ctx.fill();
        ctx.strokeStyle = '#0b0c10';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const changeState = (newState) => {
    engineState.current.internalState = newState;
    setGameState(newState);
  };

  const showMsg = (text, isAlert = false, duration = 0) => {
    setMessage({ text, isAlert });
    if (duration > 0) {
      safeTimeout(() => setMessage(null), duration);
    }
  };

  const startGame = () => {
    initAudio();
    clearAllTimers();
    setScore(0);
    setSequenceLength(3);
    setCharacterState('idle');
    engineState.current.showSpeed = 1000;
    engineState.current.streak = 0;
    
    logEvent('SESSION_START', { initialSeqLen: 3 });
    startRound(3, 1000);
  };

  const startRound = (currentLen, currentSpeed) => {
    changeState('SHOWING_SEQ');
    setCharacterState('idle');
    engineState.current.playerStep = 0;
    
    const seq = [];
    for (let i = 0; i < currentLen; i++) {
      seq.push(Math.floor(Math.random() * ASTEROIDS.length));
    }
    engineState.current.sequence = seq;
    engineState.current.isRedAlert = Math.random() < 0.3;

    showMsg('Memorize the pattern...', false, 2000);
    safeTimeout(() => playSequence(0, seq, currentSpeed), 1000);
  };

  const playSequence = (index, seq, currentSpeed) => {
    if (index < seq.length) {
      const astId = seq[index];
      engineState.current.highlightedAsteroid = astId;
      playTone(ASTEROIDS[astId].freq, 'sine', 0.4);
      
      safeTimeout(() => {
        engineState.current.highlightedAsteroid = -1;
        safeTimeout(() => {
          playSequence(index + 1, seq, currentSpeed);
        }, currentSpeed / 2);
      }, currentSpeed / 2);
    } else {
      if (engineState.current.isRedAlert) {
        handleRedAlert();
      } else {
        startPlayerTurn();
      }
    }
  };

  const handleRedAlert = () => {
    changeState('WAITING_INHIBITION');
    setCharacterState('alert'); // Robot looks panicked!
    showMsg('RED ALERT! DO NOT CLICK YET!', true);
    playTone(200, 'square', 0.8, 0.2);
    logEvent('INHIBITION_TASK_START', { waitDuration: 3000 });
    
    safeTimeout(() => {
      if (engineState.current.internalState === 'WAITING_INHIBITION') { 
        setMessage(null);
        setCharacterState('idle'); // Safe now
        playTone(600, 'sine', 0.2); 
        startPlayerTurn();
        logEvent('INHIBITION_TASK_SUCCESS', { waited: true });
      }
    }, 3000);
  };

  const startPlayerTurn = () => {
    changeState('PLAYER_TURN');
    showMsg('Your Turn!', false, 1000);
  };

  const handleRoundEnd = (win) => {
    let { streak, showSpeed } = engineState.current;
    
    setSequenceLength((prevLen) => {
      let nextLen = prevLen;
      
      if (win) {
        setScore(s => s + 100);
        streak++;
        setCharacterState('happy');
        showMsg('Pattern Correct!', false, 1500);
        playSuccessChime();
        logEvent('ROUND_WON', { streak, seqLen: prevLen });
        
        if (streak >= 2) {
          nextLen++;
          showSpeed = Math.max(500, showSpeed - 100); 
          streak = 0;
          logEvent('DDA_INCREASE', { newSeqLen: nextLen, newSpeed: showSpeed });
          safeTimeout(() => {
            showMsg('Level Up! Harder Sequence.', false, 1500);
            playTone(880, 'sine', 0.5); 
          }, 1000);
        }
      } else {
        streak--;
        setCharacterState('sad');
        showMsg('Pattern Failed!', true, 2000);
        playFailureBuzzer();
        logEvent('ROUND_LOST', { streak, seqLen: prevLen });
        
        if (streak <= -2 && prevLen > 2) {
          nextLen--;
          showSpeed = Math.min(1500, showSpeed + 200);
          streak = 0;
          logEvent('DDA_DECREASE', { newSeqLen: nextLen, newSpeed: showSpeed });
          safeTimeout(() => showMsg('Difficulty Adjusted.', false, 1500), 1000);
        }
      }

      engineState.current.streak = streak;
      engineState.current.showSpeed = showSpeed;
      
      changeState('MENU');
      safeTimeout(() => startRound(nextLen, showSpeed), 3000);
      
      return nextLen;
    });
  };

  const handleCanvasClick = (e) => {
    const { internalState, sequence, playerStep } = engineState.current;
    if (internalState === 'MENU' || internalState === 'SHOWING_SEQ') return;

    initAudio();

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let clickedId = -1;
    for (let i = 0; i < ASTEROIDS.length; i++) {
      const ast = ASTEROIDS[i];
      const dist = Math.sqrt((mouseX - ast.x) ** 2 + (mouseY - ast.y) ** 2);
      if (dist <= ast.r) {
        clickedId = i;
        break;
      }
    }

    if (clickedId === -1) return; 

    if (internalState === 'WAITING_INHIBITION') {
      logEvent('INHIBITION_TASK_FAILED', { clickedEarly: true });
      showMsg('Impulsive Click! Wait for the signal!', true, 2000);
      setCharacterState('sad');
      engineState.current.streak--; 
      handleRoundEnd(false);
      return;
    }

    if (internalState === 'PLAYER_TURN') {
      engineState.current.highlightedAsteroid = clickedId;
      playTone(ASTEROIDS[clickedId].freq, 'sine', 0.2); 

      safeTimeout(() => { engineState.current.highlightedAsteroid = -1; }, 200);

      if (clickedId === sequence[playerStep]) {
        engineState.current.playerStep++;
        if (engineState.current.playerStep === sequence.length) {
          handleRoundEnd(true); 
        }
      } else {
        handleRoundEnd(false);
      }
    }
  };

  return (
    <div className="game-wrapper">
      <div className="hud">
        <span>Score: {score}</span>
        <span>Seq Length: {sequenceLength}</span>
      </div>
      <canvas 
        ref={canvasRef} 
        width={600} 
        height={600} 
        onMouseDown={handleCanvasClick}
      />
      
      {/* ANIMATED MENTOR CHARACTER */}
      <div className="mentor-container">
        <img 
          src={`/assets/robot_${characterState}.jpg`} 
          alt="Mentor Robot" 
          className={`mentor-robot emotion-${characterState}`} 
        />
      </div>

      <div className="ui-layer">
        {message && (
          <div className={`message-box ${message.isAlert ? 'red-alert' : ''}`}>
            {message.text}
          </div>
        )}
        
        {gameState === 'MENU' && score === 0 && (
          <button className="start-btn" onClick={startGame}>
            Initialize System & Audio
          </button>
        )}
      </div>
    </div>
  );
}
