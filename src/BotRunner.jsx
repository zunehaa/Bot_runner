import React, { useState, useEffect, useRef } from 'react';

const BotRunner = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('MENU');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('botRunnerHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const gameRef = useRef({
    player: {
        lane: 1, 
        laneTargetX: 200, // 0-400 space
        visualX: 200, 
        depth: 850, 
        width: 60,
        height: 80,
    },
    obstacles: [],
    coins: [],
    particles: [],
    roadScroll: 0,
    gameSpeed: 5,
    score: 0,
    frameCount: 0,
    difficulty: 1,
    stars: Array.from({ length: 150 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 2,
      opacity: Math.random()
    })),
    nebulas: [
      { x: 100, y: 150, r: 200, color: 'rgba(125, 60, 152, 0.2)' },
      { x: window.innerWidth - 100, y: 400, r: 250, color: 'rgba(77, 63, 168, 0.2)' }
    ],
    landscape: [
        { x: -250, y: 100, size: 90, type: 'planet', color: '#b300ff', rotation: 0, rotS: 0.01 },
        { x: 650, y: 350, size: 60, type: 'planet', color: '#00d9ff', rotation: 0, rotS: -0.015 },
        { x: -180, y: 700, size: 35, type: 'asteroid', color: '#808080', rotation: 0, rotS: 0.02 },
        { x: 580, y: 900, size: 45, type: 'asteroid', color: '#808080', rotation: 0, rotS: -0.01 },
    ]
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
      // Update nebulas for new size
      gameRef.current.nebulas[1].x = window.innerWidth - 100;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const g = gameRef.current;
      if (gameState === 'MENU' && e.code === 'Space') startGame();
      else if (gameState === 'GAME_OVER' && e.code === 'Space') resetGame();
      else if (gameState === 'PLAYING') {
        if (e.code === 'ArrowLeft' && g.player.lane > 0) g.player.lane--;
        if (e.code === 'ArrowRight' && g.player.lane < 2) g.player.lane++;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  useEffect(() => {
    const handleTouch = (e) => {
      if (gameState !== 'PLAYING') return;
      const tx = e.touches[0].clientX;
      const g = gameRef.current;
      if (tx < window.innerWidth / 2 && g.player.lane > 0) g.player.lane--;
      else if (tx >= window.innerWidth / 2 && g.player.lane < 2) g.player.lane++;
    };
    window.addEventListener('touchstart', handleTouch);
    return () => window.removeEventListener('touchstart', handleTouch);
  }, [gameState]);

  const startGame = () => {
    gameRef.current = {
      ...gameRef.current,
      player: { lane: 1, laneTargetX: 200, visualX: 200, depth: 850, width: 60, height: 80 },
      obstacles: [],
      coins: [],
      particles: [],
      roadScroll: 0,
      gameSpeed: 5,
      score: 0,
      frameCount: 0,
      difficulty: 1,
    };
    setScore(0);
    setGameState('PLAYING');
  };

  const resetGame = () => startGame();

  const endGame = () => {
    if (gameRef.current.score > highScore) {
      setHighScore(gameRef.current.score);
      localStorage.setItem('botRunnerHighScore', gameRef.current.score);
    }
    setGameState('GAME_OVER');
  };

  // 3D Perspective Map
  const getPerspectivePos = (internalX, internalDepth, rawW, rawH) => {
    const { width, height } = dimensions;
    const centerX = width / 2;
    const horizonY = height * 0.35;
    const roadCanvasH = height - horizonY;
    
    // factor: 0 (horizon) to 1 (near)
    const factor = internalDepth / 1000;
    const scale = 0.05 + factor * 0.95; 
    
    // internalX is 0-400. Map to -1 to 1 range
    const normX = (internalX / 400) * 2 - 1;
    // Road takes center 70% of screen at near bottom
    const roadWidthNear = width * 0.7;
    const visualX = centerX + normX * (roadWidthNear / 2) * scale;
    const visualY = horizonY + factor * roadCanvasH;
    
    return { x: visualX, y: visualY, s: scale, w: rawW * scale, h: rawH * scale };
  };

  // Draw Runner
  const drawPlayer = (ctx, p, frameCount) => {
    const pos = getPerspectivePos(p.visualX, p.depth, p.width, p.height);
    const { x, y, w, h, s } = pos;
    
    const legO = Math.sin(frameCount * 0.2) * (12 * s);
    const armO = Math.sin(frameCount * 0.2 + Math.PI) * (10 * s);

    ctx.shadowColor = '#00d9ff';
    ctx.shadowBlur = 20 * s;

    // Core
    ctx.fillStyle = '#00d9ff';
    ctx.fillRect(x - w*0.3, y - h*0.2, w*0.6, h*0.5);
    
    // Head (Gold Helmet)
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(x, y - h*0.4, w*0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(x - w*0.2, y - h*0.45, w*0.4, h*0.1);

    // Legs
    ctx.fillStyle = '#00d9ff';
    ctx.fillRect(x - w*0.3, y + h*0.3 + (legO > 0 ? legO : 0), w*0.2, h*0.4 - Math.abs(legO));
    ctx.fillRect(x + w*0.1, y + h*0.3 + (legO < 0 ? -legO : 0), w*0.2, h*0.4 - Math.abs(legO));

    // Arms
    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(x - w*0.5, y - h*0.1 + armO, w*0.15, h*0.3);
    ctx.fillRect(x + w*0.35, y - h*0.1 - armO, w*0.15, h*0.3);

    ctx.shadowBlur = 0;
  };

  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const gameLoop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const g = gameRef.current;
      const { width, height } = dimensions;
      const { player, obstacles, coins, particles, stars, landscape, nebulas } = g;

      const laneXPos = [60, 200, 340];

      // Logic
      g.difficulty = 1 + Math.floor(g.score / 600) * 0.12;
      g.gameSpeed = Math.min(5 + g.difficulty, 13);
      g.roadScroll = (g.roadScroll + g.gameSpeed) % 200;

      // Smooth Switch
      const tx = laneXPos[player.lane];
      player.visualX += (tx - player.visualX) * 0.2;

      // Lifecycle
      if (g.frameCount % 85 === 0) {
        const ln = Math.floor(Math.random() * 3);
        obstacles.push({ ln, x: laneXPos[ln], y: 0, w: 70, h: 70, rot: 0, rotS: (Math.random()-0.5)*0.15 });
      }
      if (g.frameCount % 130 === 0) {
        const ln = Math.floor(Math.random() * 3);
        coins.push({ ln, x: laneXPos[ln], y: 0, rad: 22, collected: false });
      }

      // Collisions & Updates
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const o = obstacles[i];
        o.y += g.gameSpeed;
        o.rot += o.rotS;
        if (Math.abs(o.y - player.depth) < 55 && o.ln === player.lane) { endGame(); return; }
        if (o.y > 1100) { obstacles.splice(i, 1); g.score += 10; setScore(g.score); }
      }
      for (let i = coins.length - 1; i >= 0; i--) {
        const c = coins[i];
        c.y += g.gameSpeed * 0.98;
        if (!c.collected && Math.abs(c.y - player.depth) < 65 && c.ln === player.lane) {
            c.collected = true; g.score += 50; setScore(g.score);
            for(let p=0; p<10; p++) particles.push({ x: c.x, y: c.y, vx: (Math.random()-0.5)*12, vy: (Math.random()-0.5)*12, life: 35 });
        }
        if (c.y > 1100 || c.collected) coins.splice(i, 1);
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]; p.x += p.vx; p.y += p.vy; p.life--;
        if (p.life <= 0) particles.splice(i, 1);
      }

      // Parallax Stars & Nebulas
      stars.forEach(s => s.opacity = 0.4 + Math.sin(g.frameCount * 0.04 + s.x) * 0.5);

      g.frameCount++;

      // DRAW
      ctx.fillStyle = '#0d0221';
      ctx.fillRect(0, 0, width, height);

      // Distant Nebulas
      nebulas.forEach(nb => {
        const gr = ctx.createRadialGradient(nb.x, nb.y, 0, nb.x, nb.y, nb.r);
        gr.addColorStop(0, nb.color);
        gr.addColorStop(1, 'transparent');
        ctx.fillStyle = gr;
        ctx.fillRect(0, 0, width, height);
      });

      // Stars
      stars.forEach(s => {
        ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity * 0.8})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2); ctx.fill();
      });

      // Landscape Side Parallax
      landscape.forEach(obj => {
          obj.y = (obj.y + g.gameSpeed * 0.25) % (height + 250);
          obj.rotation += obj.rotS;
          const dy = obj.y - 120;
          ctx.save();
          ctx.translate(obj.x > 0 ? width - 200 + obj.x - 600 : 150 + obj.x + 200, dy);
          ctx.rotate(obj.rotation);
          ctx.shadowColor = obj.color; ctx.shadowBlur = 25;
          ctx.fillStyle = obj.color;
          if (obj.type === 'planet') {
            ctx.beginPath(); ctx.arc(0, 0, obj.size, 0, Math.PI * 2); ctx.fill();
          } else {
            ctx.fillRect(-obj.size/2, -obj.size/2, obj.size, obj.size);
          }
          ctx.restore(); ctx.shadowBlur = 0;
      });

      const hY = height * 0.35;
      const cX = width / 2;
      const roadW_f = width * 0.04;
      const roadW_n = width * 0.7;

      // Road Surface
      ctx.beginPath();
      ctx.moveTo(cX - roadW_f, hY); ctx.lineTo(cX + roadW_f, hY);
      ctx.lineTo(cX + roadW_n, height); ctx.lineTo(cX - roadW_n, height);
      ctx.closePath();
      ctx.fillStyle = '#1a1a3e';
      ctx.fill();
      ctx.strokeStyle = '#00d9ff';
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Lane Dividers (Dashed Perspective)
      ctx.setLineDash([30, 40]);
      ctx.lineDashOffset = -g.roadScroll * 2;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      [cX - roadW_n/3, cX + roadW_n/3].forEach((bx, i) => {
          const fx = cX + (i === 0 ? -roadW_f/3 : roadW_f/3);
          ctx.beginPath(); ctx.moveTo(fx, hY); ctx.lineTo(bx, height); ctx.stroke();
      });
      ctx.setLineDash([]);

      // Obstacles
      obstacles.forEach(o => {
          const p = getPerspectivePos(o.x, o.y, o.w, o.h);
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(o.rot);
          ctx.shadowColor = '#ff006e'; ctx.shadowBlur = 15;
          ctx.fillStyle = '#ff006e';
          ctx.beginPath(); ctx.moveTo(-p.w/2, -p.h/2); ctx.lineTo(p.w/2-5, -p.h/2+2);
          ctx.lineTo(p.w/2, p.h/2-5); ctx.lineTo(-p.w/2+5, p.h/2);
          ctx.closePath(); ctx.fill();
          ctx.restore();
      });

      // Coins
      coins.forEach(c => {
          if (!c.collected) {
              const p = getPerspectivePos(c.x, c.y, c.rad, c.rad);
              ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(g.frameCount * 0.1);
              ctx.shadowColor = '#ffed4e'; ctx.shadowBlur = 12;
              ctx.fillStyle = '#ffed4e';
              ctx.beginPath();
              for (let i=0; i<5; i++) {
                ctx.lineTo(Math.cos((18+i*72)/180*Math.PI)*p.w, -Math.sin((18+i*72)/180*Math.PI)*p.w);
                ctx.lineTo(Math.cos((54+i*72)/180*Math.PI)*p.w*0.5, -Math.sin((54+i*72)/180*Math.PI)*p.w*0.5);
              }
              ctx.closePath(); ctx.fill(); ctx.restore();
          }
      });

      // Particles
      particles.forEach(pt => {
          const p = getPerspectivePos(pt.x, pt.y, 8, 8);
          ctx.fillStyle = `rgba(255, 237, 78, ${pt.life / 35})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.w, 0, Math.PI * 2); ctx.fill();
      });

      // Runner
      drawPlayer(ctx, player, g.frameCount);

      requestAnimationFrame(gameLoop);
    };

    requestAnimationFrame(gameLoop);
  }, [gameState, dimensions]);

  return (
    <div className="App">
      <canvas ref={canvasRef} width={dimensions.width} height={dimensions.height} />
      <div className="ui-overlay">
        <div className="hud-top">
          <div className="hud-item"><div className="hud-label">Distance</div><div className="hud-value">{score} LY</div></div>
          <div className="hud-item" style={{ textAlign: 'right' }}><div className="hud-label">Record</div><div className="hud-value">{highScore} LY</div></div>
        </div>
      </div>
      {gameState === 'MENU' && (
        <div className="screen-overlay">
          <h1 className="title">🚀 COSMIC RUNNER</h1>
          <p className="subtitle">Subway Odyssey — Modern Perspective</p>
          <button className="btn-primary" onClick={startGame}>START MISSION</button>
          <div className="controls-hint">
            <p>⌨️ KEYBOARD: Left/Right Arrows</p>
            <p>📱 MOBILE: Tap Sides to Switch</p>
            <p>🎯 GOAL: Collect Stars, Dodge Obstacles</p>
          </div>
        </div>
      )}
      {gameState === 'GAME_OVER' && (
        <div className="screen-overlay">
          <h1 className="game-over-title">MISSION TERMINATED</h1>
          <div style={{ display: 'flex', gap: '40px', marginBottom: '40px' }}>
            <div className="hud-item"><div className="hud-label">Distance</div><div className="hud-value" style={{ color: '#ffed4e', fontSize: '48px' }}>{score}</div></div>
            <div className="hud-item"><div className="hud-label">Record</div><div className="hud-value" style={{ fontSize: '48px' }}>{highScore}</div></div>
          </div>
          <button className="btn-primary" onClick={resetGame}>RE-LAUNCH</button>
        </div>
      )}
    </div>
  );
};

export default BotRunner;
