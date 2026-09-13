import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Trophy, 
  RotateCcw, 
  Zap, 
  Shield, 
  Battery, 
  Star, 
  Play, 
  ChevronRight, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playPop, playChime, playCarRev } from '../utils/audio';

interface StarPickup {
  x: number;
  y: number;
  collected: boolean;
}

interface PowerUp {
  x: number;
  y: number;
  type: 'speed' | 'shield' | 'battery';
  collected: boolean;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'cone' | 'barrier' | 'moving';
  vx?: number;
  minX?: number;
  maxX?: number;
}

interface TrackPoint {
  x: number;
  y: number;
}

interface LevelConfig {
  id: number;
  name: string;
  tagline: string;
  waypoints: TrackPoint[];
  obstacles: Obstacle[];
  stars: StarPickup[];
  powerUps: PowerUp[];
  startPos: { x: number; y: number; angle: number };
  finishLine: { x: number; y: number; width: number; height: number };
}

// 3 Levels Definitions
const LEVEL_CONFIGS: LevelConfig[] = [
  // LEVEL 1: Starter Track (Simple oval with gentle turns)
  {
    id: 1,
    name: 'Level 1 — Starter Track',
    tagline: 'Smooth curves & open track for beginners',
    startPos: { x: 100, y: 380, angle: -Math.PI / 2 },
    finishLine: { x: 80, y: 400, width: 90, height: 16 },
    waypoints: [
      { x: 120, y: 140 },
      { x: 350, y: 90 },
      { x: 680, y: 130 },
      { x: 720, y: 360 },
      { x: 450, y: 410 },
      { x: 140, y: 410 }
    ],
    obstacles: [
      { x: 260, y: 130, width: 22, height: 22, type: 'cone' },
      { x: 500, y: 85, width: 22, height: 22, type: 'cone' },
      { x: 710, y: 240, width: 22, height: 22, type: 'cone' },
      { x: 550, y: 410, width: 22, height: 22, type: 'cone' },
      { x: 320, y: 410, width: 22, height: 22, type: 'cone' }
    ],
    stars: [
      { x: 130, y: 220, collected: false },
      { x: 250, y: 100, collected: false },
      { x: 420, y: 85, collected: false },
      { x: 600, y: 105, collected: false },
      { x: 710, y: 180, collected: false },
      { x: 710, y: 300, collected: false },
      { x: 590, y: 410, collected: false },
      { x: 380, y: 410, collected: false },
      { x: 200, y: 410, collected: false }
    ],
    powerUps: [
      { x: 450, y: 90, type: 'speed', collected: false },
      { x: 680, y: 320, type: 'battery', collected: false },
      { x: 280, y: 410, type: 'shield', collected: false }
    ]
  },
  // LEVEL 2: Tech Track (More chicanes & speed curves)
  {
    id: 2,
    name: 'Level 2 — Tech Track',
    tagline: 'Technical S-curves and gear-ratio zones',
    startPos: { x: 90, y: 420, angle: -Math.PI / 2 },
    finishLine: { x: 70, y: 440, width: 90, height: 16 },
    waypoints: [
      { x: 90, y: 120 },
      { x: 280, y: 90 },
      { x: 400, y: 240 },
      { x: 550, y: 100 },
      { x: 730, y: 140 },
      { x: 720, y: 420 },
      { x: 420, y: 430 },
      { x: 100, y: 440 }
    ],
    obstacles: [
      { x: 180, y: 100, width: 22, height: 22, type: 'cone' },
      { x: 380, y: 210, width: 35, height: 24, type: 'barrier' },
      { x: 480, y: 180, width: 22, height: 22, type: 'cone' },
      { x: 650, y: 110, width: 22, height: 22, type: 'cone' },
      { x: 730, y: 270, width: 40, height: 20, type: 'barrier' },
      { x: 570, y: 425, width: 22, height: 22, type: 'cone' },
      { x: 300, y: 430, width: 30, height: 22, type: 'barrier' }
    ],
    stars: [
      { x: 90, y: 250, collected: false },
      { x: 210, y: 90, collected: false },
      { x: 320, y: 160, collected: false },
      { x: 400, y: 270, collected: false },
      { x: 480, y: 120, collected: false },
      { x: 630, y: 120, collected: false },
      { x: 730, y: 200, collected: false },
      { x: 720, y: 350, collected: false },
      { x: 500, y: 430, collected: false },
      { x: 220, y: 435, collected: false }
    ],
    powerUps: [
      { x: 250, y: 95, type: 'speed', collected: false },
      { x: 420, y: 250, type: 'battery', collected: false },
      { x: 680, y: 180, type: 'shield', collected: false },
      { x: 370, y: 430, type: 'speed', collected: false }
    ]
  },
  // LEVEL 3: Challenge Track (Narrow chicanes & moving obstacles)
  {
    id: 3,
    name: 'Level 3 — Challenge Track',
    tagline: 'Moving drone barriers and hairpins for pro drivers',
    startPos: { x: 80, y: 430, angle: -Math.PI / 2 },
    finishLine: { x: 60, y: 450, width: 90, height: 16 },
    waypoints: [
      { x: 80, y: 100 },
      { x: 260, y: 80 },
      { x: 320, y: 260 },
      { x: 460, y: 270 },
      { x: 510, y: 90 },
      { x: 740, y: 100 },
      { x: 730, y: 430 },
      { x: 540, y: 440 },
      { x: 380, y: 380 },
      { x: 220, y: 440 },
      { x: 80, y: 450 }
    ],
    obstacles: [
      { x: 180, y: 90, width: 22, height: 22, type: 'cone' },
      { x: 390, y: 265, width: 40, height: 24, type: 'moving', vx: 1.5, minX: 350, maxX: 430 },
      { x: 620, y: 95, width: 45, height: 20, type: 'barrier' },
      { x: 735, y: 260, width: 40, height: 24, type: 'moving', vx: -2, minX: 690, maxX: 750 },
      { x: 630, y: 435, width: 22, height: 22, type: 'cone' },
      { x: 440, y: 400, width: 35, height: 20, type: 'barrier' },
      { x: 280, y: 435, width: 22, height: 22, type: 'cone' }
    ],
    stars: [
      { x: 80, y: 240, collected: false },
      { x: 190, y: 85, collected: false },
      { x: 290, y: 160, collected: false },
      { x: 340, y: 270, collected: false },
      { x: 480, y: 260, collected: false },
      { x: 520, y: 140, collected: false },
      { x: 660, y: 95, collected: false },
      { x: 735, y: 180, collected: false },
      { x: 730, y: 340, collected: false },
      { x: 580, y: 435, collected: false },
      { x: 340, y: 400, collected: false },
      { x: 150, y: 445, collected: false }
    ],
    powerUps: [
      { x: 220, y: 85, type: 'shield', collected: false },
      { x: 420, y: 270, type: 'battery', collected: false },
      { x: 590, y: 95, type: 'speed', collected: false },
      { x: 670, y: 435, type: 'battery', collected: false },
      { x: 320, y: 400, type: 'shield', collected: false }
    ]
  }
];

interface RCCarGameProps {
  onExploreRobotics?: () => void;
}

export const RCCarGame: React.FC<RCCarGameProps> = ({ onExploreRobotics }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Unlocked levels persisted in localStorage
  const [unlockedLevel, setUnlockedLevel] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('charithra_rc_unlocked_level');
      return saved ? Math.max(1, parseInt(saved, 10)) : 1;
    } catch {
      return 1;
    }
  });

  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [batteryEmpty, setBatteryEmpty] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [battery, setBattery] = useState<number>(100);
  const [starsCollected, setStarsCollected] = useState<number>(0);
  const [totalStars, setTotalStars] = useState<number>(10);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [hasShield, setHasShield] = useState<boolean>(false);
  const [hasSpeedBoost, setHasSpeedBoost] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Boy Mascot Reaction Text
  const [boySpeech, setBoySpeech] = useState<string>(
    "Ready on the starting grid! Steer with WASD or arrow keys and collect the stars!"
  );

  // Real-time Controls State
  const controlsRef = useRef({
    up: false,
    down: false,
    left: false,
    right: false
  });

  // Active Car Physical State
  const carStateRef = useRef({
    x: 100,
    y: 380,
    angle: -Math.PI / 2,
    speed: 0,
    maxSpeed: 4.8,
    accel: 0.18,
    friction: 0.96,
    turnSpeed: 0.052,
    battery: 100,
    shield: false,
    speedBoostTimer: 0,
    distanceTraveled: 0
  });

  // Active Level State Ref (mutated by game loop)
  const activeLevelRef = useRef<LevelConfig>(JSON.parse(JSON.stringify(LEVEL_CONFIGS[0])));
  const starsTotalRef = useRef<number>(10);
  const scoreRef = useRef<number>(0);
  const starsCountRef = useRef<number>(0);
  const timerRef = useRef<number>(0);
  const trailRef = useRef<{ x: number; y: number; alpha: number }[]>([]);

  // Format Elapsed Time as MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Switch or Initialize Level
  const initLevel = useCallback((lvlId: number) => {
    const rawLvl = LEVEL_CONFIGS.find(l => l.id === lvlId) || LEVEL_CONFIGS[0];
    const clonedLvl: LevelConfig = JSON.parse(JSON.stringify(rawLvl));
    activeLevelRef.current = clonedLvl;

    carStateRef.current = {
      x: clonedLvl.startPos.x,
      y: clonedLvl.startPos.y,
      angle: clonedLvl.startPos.angle,
      speed: 0,
      maxSpeed: 4.8,
      accel: 0.18,
      friction: 0.96,
      turnSpeed: 0.052,
      battery: 100,
      shield: false,
      speedBoostTimer: 0,
      distanceTraveled: 0
    };

    scoreRef.current = 0;
    starsCountRef.current = 0;
    timerRef.current = 0;
    trailRef.current = [];
    starsTotalRef.current = clonedLvl.stars.length;

    setScore(0);
    setBattery(100);
    setStarsCollected(0);
    setTotalStars(clonedLvl.stars.length);
    setElapsedSeconds(0);
    setHasShield(false);
    setHasSpeedBoost(false);
    setGameWon(false);
    setBatteryEmpty(false);
    setAlertMessage(null);
    setCurrentLevelId(lvlId);

    setBoySpeech(
      lvlId === 1 
        ? "Level 1 Starter Track! Keep your wheels on the road and pick up the yellow stars!" 
        : lvlId === 2 
          ? "Level 2 Tech Track! Watch out for the orange barriers in the S-curves!" 
          : "Level 3 Challenge Track! Moving drone barriers ahead! Precision driving required!"
    );
  }, []);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        controlsRef.current.up = true;
        e.preventDefault();
      }
      if (['ArrowDown', 'KeyS'].includes(e.code)) {
        controlsRef.current.down = true;
        e.preventDefault();
      }
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        controlsRef.current.left = true;
        e.preventDefault();
      }
      if (['ArrowRight', 'KeyD'].includes(e.code)) {
        controlsRef.current.right = true;
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) controlsRef.current.up = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) controlsRef.current.down = false;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) controlsRef.current.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) controlsRef.current.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying]);

  // Main Canvas Render & Physics Loop
  useEffect(() => {
    if (!isPlaying) return;

    let animId: number;
    let lastTime = performance.now();
    let secondAccumulator = 0;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updatePhysics = (dt: number) => {
      const car = carStateRef.current;
      const lvl = activeLevelRef.current;

      // Handle Acceleration & Reverse
      if (controlsRef.current.up && car.battery > 0) {
        car.speed += car.accel;
        // Battery drain proportional to speed
        car.battery = Math.max(0, car.battery - 0.035);
      } else if (controlsRef.current.down && car.battery > 0) {
        car.speed -= car.accel * 0.6;
        car.battery = Math.max(0, car.battery - 0.02);
      } else {
        car.speed *= car.friction;
      }

      // Check Battery Out
      if (car.battery <= 0 && Math.abs(car.speed) < 0.1) {
        setBatteryEmpty(true);
        setIsPlaying(false);
        setBoySpeech("Battery drained! Pick up green batteries on the track to keep racing!");
        return;
      }

      // Handle Steering
      const currentMaxSpeed = car.speedBoostTimer > 0 ? car.maxSpeed * 1.4 : car.maxSpeed;
      if (car.speed > currentMaxSpeed) car.speed = currentMaxSpeed;
      if (car.speed < -currentMaxSpeed * 0.45) car.speed = -currentMaxSpeed * 0.45;

      if (Math.abs(car.speed) > 0.05) {
        const dir = car.speed > 0 ? 1 : -1;
        if (controlsRef.current.left) car.angle -= car.turnSpeed * dir;
        if (controlsRef.current.right) car.angle += car.turnSpeed * dir;
      }

      // Move Position
      car.x += Math.cos(car.angle) * car.speed;
      car.y += Math.sin(car.angle) * car.speed;
      car.distanceTraveled += Math.abs(car.speed);

      // Speed boost timer
      if (car.speedBoostTimer > 0) {
        car.speedBoostTimer -= dt;
        if (car.speedBoostTimer <= 0) {
          setHasSpeedBoost(false);
        }
      }

      // Keep car inside canvas bounds
      car.x = Math.max(25, Math.min(canvas.width - 25, car.x));
      car.y = Math.max(25, Math.min(canvas.height - 25, car.y));

      // Leave tire skid trail
      if (Math.abs(car.speed) > 2.5) {
        trailRef.current.push({ x: car.x, y: car.y, alpha: 0.6 });
        if (trailRef.current.length > 30) trailRef.current.shift();
      }

      // Update Moving Obstacles
      lvl.obstacles.forEach((obs) => {
        if (obs.type === 'moving' && obs.vx && obs.minX !== undefined && obs.maxX !== undefined) {
          obs.x += obs.vx;
          if (obs.x <= obs.minX || obs.x >= obs.maxX) {
            obs.vx = -obs.vx;
          }
        }
      });

      // Star Collectibles Check
      lvl.stars.forEach((star) => {
        if (!star.collected) {
          const dist = Math.hypot(car.x - star.x, car.y - star.y);
          if (dist < 26) {
            star.collected = true;
            scoreRef.current += 10;
            starsCountRef.current += 1;
            setScore(scoreRef.current);
            setStarsCollected(starsCountRef.current);
            playPop();
            setBoySpeech("⭐ Star collected! +10 Points!");
          }
        }
      });

      // Power-up Collectibles Check
      lvl.powerUps.forEach((p) => {
        if (!p.collected) {
          const dist = Math.hypot(car.x - p.x, car.y - p.y);
          if (dist < 28) {
            p.collected = true;
            playChime();
            if (p.type === 'speed') {
              car.speedBoostTimer = 4.0;
              setHasSpeedBoost(true);
              setBoySpeech("🚀 NITRO TURBO ENGAGED! Zoom!");
            } else if (p.type === 'battery') {
              car.battery = Math.min(100, car.battery + 35);
              setBoySpeech("🔋 Battery Restored! Power up!");
            } else if (p.type === 'shield') {
              car.shield = true;
              setHasShield(true);
              setBoySpeech("🛡️ Kinetic Shield Active! Safe from 1 bump!");
            }
          }
        }
      });

      // Obstacle Collision Check
      lvl.obstacles.forEach((obs) => {
        const carBox = { x: car.x - 14, y: car.y - 9, w: 28, h: 18 };
        const overlap = (
          carBox.x < obs.x + obs.width &&
          carBox.x + carBox.w > obs.x &&
          carBox.y < obs.y + obs.height &&
          carBox.y + carBox.h > obs.y
        );

        if (overlap) {
          if (car.shield) {
            car.shield = false;
            setHasShield(false);
            setAlertMessage("🛡️ Shield absorbed collision!");
            setTimeout(() => setAlertMessage(null), 1200);
            setBoySpeech("Whoa! The shield took the hit! Keep steering!");
          } else {
            // Bump back and slowdown
            car.speed = -car.speed * 0.5;
            car.battery = Math.max(0, car.battery - 4);
            setAlertMessage("⚠️ Bump! Watch the cones!");
            setTimeout(() => setAlertMessage(null), 1200);
            setBoySpeech("Oops! Try Again — steer smoothly around the cones!");
          }
        }
      });

      // Finish Line Check
      const fl = lvl.finishLine;
      const reachedFinish = (
        car.x >= fl.x &&
        car.x <= fl.x + fl.width &&
        car.y >= fl.y &&
        car.y <= fl.y + fl.height &&
        car.distanceTraveled > 280 // Ensure player actually drove around the track
      );

      if (reachedFinish) {
        setIsPlaying(false);
        setGameWon(true);
        playChime();
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });

        // Unlock next level if applicable
        if (lvl.id >= unlockedLevel && lvl.id < 3) {
          const nextLvl = lvl.id + 1;
          setUnlockedLevel(nextLvl);
          try {
            localStorage.setItem('charithra_rc_unlocked_level', nextLvl.toString());
          } catch {
            // ignore
          }
        }

        setBoySpeech("YES! YOU DID IT! 🎉 Spectacular driving! You mastered the track!");
      }

      setBattery(Math.round(car.battery));
    };

    const drawTrack = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const lvl = activeLevelRef.current;
      const car = carStateRef.current;

      // 1. Background Grass Field
      ctx.fillStyle = '#163820';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle grass texture dots
      ctx.fillStyle = '#1f482a';
      for (let i = 20; i < canvas.width; i += 40) {
        for (let j = 20; j < canvas.height; j += 40) {
          ctx.beginPath();
          ctx.arc(i + (j % 30), j, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 2. Outer Asphalt Track Ribbon
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Red & White Kerbs Edge
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 100;
      ctx.beginPath();
      lvl.waypoints.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.closePath();
      ctx.stroke();

      // Main Dark Asphalt Track
      ctx.strokeStyle = '#222634';
      ctx.lineWidth = 84;
      ctx.beginPath();
      lvl.waypoints.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.closePath();
      ctx.stroke();

      // Dashed White Center Racing Guide Line
      ctx.setLineDash([14, 16]);
      ctx.strokeStyle = '#F5A623';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      lvl.waypoints.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash

      // 3. Checkered Finish Line
      const fl = lvl.finishLine;
      const numSquares = 6;
      const sqW = fl.width / numSquares;
      const sqH = fl.height / 2;
      for (let c = 0; c < numSquares; c++) {
        for (let r = 0; r < 2; r++) {
          ctx.fillStyle = (c + r) % 2 === 0 ? '#ffffff' : '#0a0c10';
          ctx.fillRect(fl.x + c * sqW, fl.y + r * sqH, sqW, sqH);
        }
      }

      // Finish Banner Posts
      ctx.fillStyle = '#F5A623';
      ctx.fillRect(fl.x - 6, fl.y - 2, 6, fl.height + 4);
      ctx.fillRect(fl.x + fl.width, fl.y - 2, 6, fl.height + 4);

      // 4. Draw Tire Skid Trails
      trailRef.current.forEach((t) => {
        ctx.fillStyle = `rgba(10, 12, 16, ${t.alpha})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 4, 0, Math.PI * 2);
        ctx.fill();
        t.alpha -= 0.008;
      });
      trailRef.current = trailRef.current.filter((t) => t.alpha > 0);

      // 5. Draw Obstacles
      lvl.obstacles.forEach((obs) => {
        if (obs.type === 'cone') {
          // Orange Cone
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.arc(obs.x + obs.width / 2, obs.y + obs.height / 2, obs.width / 2, 0, Math.PI * 2);
          ctx.fill();
          // Inner White Ring
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(obs.x + obs.width / 2, obs.y + obs.height / 2, obs.width / 4, 0, Math.PI * 2);
          ctx.fill();
        } else if (obs.type === 'barrier') {
          // Striped Hazard Barrier
          ctx.fillStyle = '#eab308';
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(obs.x + 4, obs.y + 3, obs.width - 8, obs.height - 6);
        } else if (obs.type === 'moving') {
          // Drone Hazard Barrier
          ctx.fillStyle = '#ec4899';
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px monospace';
          ctx.fillText('⚡BOT', obs.x + 3, obs.y + obs.height - 7);
        }
      });

      // 6. Draw Collectibles (Stars)
      lvl.stars.forEach((star) => {
        if (!star.collected) {
          ctx.save();
          ctx.translate(star.x, star.y);
          ctx.fillStyle = '#fbbf24';
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          // Draw 5-point star
          for (let i = 0; i < 5; i++) {
            ctx.lineTo(Math.cos(((18 + i * 72) * Math.PI) / 180) * 10, -Math.sin(((18 + i * 72) * Math.PI) / 180) * 10);
            ctx.lineTo(Math.cos(((54 + i * 72) * Math.PI) / 180) * 4.5, -Math.sin(((54 + i * 72) * Math.PI) / 180) * 4.5);
          }
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      });

      // 7. Draw Power-Ups
      lvl.powerUps.forEach((p) => {
        if (!p.collected) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.beginPath();
          ctx.arc(0, 0, 13, 0, Math.PI * 2);
          if (p.type === 'speed') {
            ctx.fillStyle = '#0ea5e9';
            ctx.shadowColor = '#0ea5e9';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText('🚀', -7, 4);
          } else if (p.type === 'battery') {
            ctx.fillStyle = '#10b981';
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText('🔋', -7, 4);
          } else if (p.type === 'shield') {
            ctx.fillStyle = '#8b5cf6';
            ctx.shadowColor = '#8b5cf6';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText('🛡️', -7, 4);
          }
          ctx.restore();
        }
      });

      // 8. Draw RC Car
      ctx.save();
      ctx.translate(car.x, car.y);
      ctx.rotate(car.angle);

      // Speed boost flames
      if (car.speedBoostTimer > 0) {
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(-18, -4);
        ctx.lineTo(-28 - Math.random() * 8, 0);
        ctx.lineTo(-18, 4);
        ctx.closePath();
        ctx.fill();
      }

      // Shield Aura
      if (car.shield) {
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Car Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(-14, -8, 28, 16);

      // Wheels
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-12, -12, 8, 4); // Front Left
      ctx.fillRect(6, -12, 8, 4);  // Front Right
      ctx.fillRect(-12, 8, 8, 4);   // Rear Left
      ctx.fillRect(6, 8, 8, 4);    // Rear Right

      // Car Main Body (Gold & Black Charithra Brand Palette)
      ctx.fillStyle = '#F5A623';
      ctx.beginPath();
      ctx.roundRect(-14, -8, 28, 16, 4);
      ctx.fill();

      // Black Hood & Roof
      ctx.fillStyle = '#0A0C10';
      ctx.fillRect(-4, -6, 14, 12);

      // Windshield Glass
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(4, -5, 4, 10);

      // Headlights
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(13, -6, 2, 3);
      ctx.fillRect(13, 3, 2, 3);

      // Rear Spoiler Wing
      ctx.fillStyle = '#d97706';
      ctx.fillRect(-16, -9, 3, 18);

      ctx.restore();
    };

    const loop = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Track race timer
      secondAccumulator += dt;
      if (secondAccumulator >= 1) {
        secondAccumulator = 0;
        timerRef.current += 1;
        setElapsedSeconds(timerRef.current);
      }

      updatePhysics(dt);
      drawTrack();
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, unlockedLevel]);

  // Start / Restart Game
  const handleStartGame = () => {
    playCarRev();
    initLevel(currentLevelId);
    setIsPlaying(true);
  };

  const handleNextChallenge = () => {
    playPop();
    const nextLvl = Math.min(3, currentLevelId + 1);
    initLevel(nextLvl);
    setIsPlaying(true);
  };

  // Mobile D-pad Button Handlers
  const handleTouchStart = (dir: 'up' | 'down' | 'left' | 'right') => {
    controlsRef.current[dir] = true;
  };
  const handleTouchEnd = (dir: 'up' | 'down' | 'left' | 'right') => {
    controlsRef.current[dir] = false;
  };

  return (
    <div id="rc-game-screen" className="relative rounded-3xl bg-[#0F121C] border-2 border-orange-500/40 shadow-2xl p-4 sm:p-6 text-white overflow-hidden select-none">
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-charithra-gold/10 rounded-full blur-3xl pointer-events-none" />

      {/* Game Title & HUD Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400">
              CHARITHRA RC RACE
            </span>
            <span className="px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/40 text-[10px] font-bold text-orange-300 uppercase tracking-wide">
              Level {currentLevelId}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Can you reach the finish line? Steer, collect stars, and watch your battery!
          </p>
        </div>

        {/* Level Selection Tabs */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
          {[1, 2, 3].map((lvlId) => {
            const isUnlocked = lvlId <= unlockedLevel;
            const isCurrent = lvlId === currentLevelId;
            return (
              <button
                key={lvlId}
                disabled={!isUnlocked}
                onClick={() => {
                  playPop();
                  initLevel(lvlId);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  isCurrent 
                    ? 'bg-gradient-to-r from-orange-500 to-amber-400 text-charithra-black shadow-md' 
                    : isUnlocked 
                      ? 'text-slate-300 hover:text-white hover:bg-white/10' 
                      : 'text-slate-600 cursor-not-allowed'
                }`}
              >
                <span>Track {lvlId}</span>
                {!isUnlocked && <span className="text-[10px]">🔒</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Dashboard (Score, Battery, Timer, Powerups) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-3.5 relative z-10 text-xs">
        {/* Score Card */}
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-black/40 border border-white/10">
          <div className="w-8 h-8 rounded-lg bg-amber-400/20 flex items-center justify-center text-amber-400">
            <Star className="w-4 h-4 fill-current" />
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-bold block">Stars & Score</span>
            <span className="text-sm sm:text-base font-black text-amber-300 font-mono">
              ⭐ {score} <span className="text-slate-400 text-[11px]">({starsCollected}/{totalStars})</span>
            </span>
          </div>
        </div>

        {/* Timer Card */}
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-black/40 border border-white/10">
          <div className="w-8 h-8 rounded-lg bg-sky-400/20 flex items-center justify-center text-sky-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-bold block">Race Timer</span>
            <span className="text-sm sm:text-base font-black text-sky-300 font-mono">
              ⏱️ {formatTime(elapsedSeconds)}
            </span>
          </div>
        </div>

        {/* Battery Bar Card */}
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-black/40 border border-white/10 col-span-2 sm:col-span-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            battery > 30 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400 animate-pulse'
          }`}>
            <Battery className="w-4 h-4" />
          </div>
          <div className="w-full">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-300">
              <span>RC Battery: {battery}%</span>
              <span className={battery > 25 ? 'text-emerald-400' : 'text-rose-400'}>
                {battery > 0 ? 'ACTIVE' : 'DEPLETED'}
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden mt-1">
              <div 
                className={`h-full transition-all duration-300 ${
                  battery > 45 
                    ? 'bg-gradient-to-r from-emerald-400 to-green-500' 
                    : battery > 20 
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500' 
                      : 'bg-gradient-to-r from-red-500 to-rose-600 animate-pulse'
                }`}
                style={{ width: `${battery}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Screen Canvas Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-[#163820] aspect-[16/10] sm:aspect-[16/9] w-full flex items-center justify-center shadow-inner">
        <canvas
          ref={canvasRef}
          width={820}
          height={500}
          className="w-full h-full object-contain"
        />

        {/* Temporary Alert Toast Overlay */}
        {alertMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-charithra-black/90 border border-amber-400 text-amber-300 text-xs font-bold shadow-lg animate-bounce z-20">
            {alertMessage}
          </div>
        )}

        {/* Active Powerups Floating Badges */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
          {hasSpeedBoost && (
            <span className="px-2 py-0.5 rounded-md bg-sky-500/80 border border-sky-300 text-[10px] font-bold text-white shadow animate-pulse">
              🚀 NITRO BOOST
            </span>
          )}
          {hasShield && (
            <span className="px-2 py-0.5 rounded-md bg-purple-500/80 border border-purple-300 text-[10px] font-bold text-white shadow">
              🛡️ SHIELD
            </span>
          )}
        </div>

        {/* PRE-GAME / START SCREEN OVERLAY */}
        {!isPlaying && !gameWon && !batteryEmpty && (
          <div className="absolute inset-0 bg-charithra-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-30">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-gold-glow mb-4 animate-bounce">
              <Play className="w-8 h-8 text-charithra-black fill-current ml-1" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-heading font-black text-white">
              CHARITHRA RC RACE
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mt-1 mb-6">
              Drive the official Charithra RC car to the finish line! Collect stars (+10), recharge batteries 🔋, and dodge cones!
            </p>

            <button
              id="rc-start-game-btn"
              onClick={handleStartGame}
              className="px-8 py-3.5 rounded-xl font-heading font-black text-sm sm:text-base text-charithra-black bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300 hover:shadow-gold-glow transition transform hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START GAME</span>
            </button>

            <div className="mt-4 flex items-center gap-3 text-[11px] text-slate-400">
              <span className="px-2 py-0.5 rounded bg-white/10 font-mono">WASD / Arrow Keys</span>
              <span>•</span>
              <span>Mobile Touch D-Pad</span>
            </div>
          </div>
        )}

        {/* BATTERY EMPTY RECHARGE SCREEN */}
        {batteryEmpty && (
          <div className="absolute inset-0 bg-charithra-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-30">
            <div className="w-14 h-14 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mb-3 text-red-400 animate-pulse">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-heading font-black text-red-400 uppercase">
              Recharge your RC Car!
            </h3>
            <p className="text-xs text-slate-300 max-w-sm mt-1 mb-5">
              The battery depleted before reaching the checkered line. Remember to drive smooth and collect 🔋 battery pickups!
            </p>
            <button
              onClick={handleStartGame}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-400 to-amber-400 text-charithra-black font-bold text-xs hover:scale-105 transition flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>TRY AGAIN</span>
            </button>
          </div>
        )}

        {/* CELEBRATION MODAL ON FINISH LINE */}
        {gameWon && (
          <div className="absolute inset-0 bg-charithra-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-charithra-gold/20 border-2 border-charithra-gold flex items-center justify-center mb-3 animate-bounce">
              <Trophy className="w-8 h-8 text-charithra-gold" />
            </div>

            <h3 className="text-3xl sm:text-4xl font-heading font-black text-amber-300 uppercase tracking-wide">
              🎉 GREAT JOB!
            </h3>
            <p className="text-sm font-semibold text-white mt-1">
              You completed the Charithra RC Challenge!
            </p>

            {/* Score & Time Badges */}
            <div className="grid grid-cols-3 gap-3 my-5 w-full max-w-xs text-center">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Score</span>
                <span className="text-base font-black text-amber-300 font-mono">⭐ {score}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Time</span>
                <span className="text-base font-black text-sky-300 font-mono">{formatTime(elapsedSeconds)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Stars</span>
                <span className="text-base font-black text-emerald-300 font-mono">{starsCollected}/{totalStars}</span>
              </div>
            </div>

            {/* Completion Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                onClick={handleStartGame}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>PLAY AGAIN</span>
              </button>

              {currentLevelId < 3 && (
                <button
                  onClick={handleNextChallenge}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-400 to-amber-400 text-charithra-black font-black text-xs hover:shadow-gold-glow flex items-center gap-1.5 transition"
                >
                  <span>NEXT CHALLENGE</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {onExploreRobotics && (
                <button
                  onClick={onExploreRobotics}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/30 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>EXPLORE ROBOTICS</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Controls & Character Reaction Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-5 items-center">
        
        {/* Left: Charithra Boy Illustration & Live Reaction Speech */}
        <div className="md:col-span-7 flex items-center gap-3.5 p-3 rounded-2xl bg-black/40 border border-white/10">
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 p-0.5 shrink-0 shadow-md">
            <img 
              src="/assets/mascots/charithra-boy-transparent.png" 
              alt="Charithra Boy holding RC controller" 
              className="w-full h-full object-cover rounded-[14px]"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-black flex items-center justify-center text-[8px] font-bold text-black">
              ✓
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-orange-300">
              <span>Charithra Boy (Track Mentor)</span>
              <span className="text-white/20">•</span>
              <span className="text-slate-400 font-normal">2.4GHz RF Link</span>
            </div>
            <p className="text-xs text-slate-200 mt-0.5 leading-snug font-medium italic">
              "{boySpeech}"
            </p>
          </div>
        </div>

        {/* Right: Mobile Child-Friendly D-PAD Touch Controls */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 block">
            Touch / Button Steering (Child-Friendly)
          </span>

          <div className="flex flex-col items-center gap-1.5">
            {/* UP */}
            <button
              onMouseDown={() => handleTouchStart('up')}
              onMouseUp={() => handleTouchEnd('up')}
              onTouchStart={(e) => { e.preventDefault(); handleTouchStart('up'); }}
              onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('up'); }}
              className="w-12 h-10 rounded-xl bg-orange-500/25 border border-orange-400 text-orange-300 active:bg-orange-500 active:text-black flex items-center justify-center shadow transition"
              aria-label="Drive Forward"
            >
              <ArrowUp className="w-5 h-5" />
            </button>

            {/* LEFT / CENTER / RIGHT */}
            <div className="flex items-center gap-2">
              <button
                onMouseDown={() => handleTouchStart('left')}
                onMouseUp={() => handleTouchEnd('left')}
                onTouchStart={(e) => { e.preventDefault(); handleTouchStart('left'); }}
                onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('left'); }}
                className="w-12 h-10 rounded-xl bg-orange-500/25 border border-orange-400 text-orange-300 active:bg-orange-500 active:text-black flex items-center justify-center shadow transition"
                aria-label="Steer Left"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-mono font-bold text-slate-400">
                ●
              </div>

              <button
                onMouseDown={() => handleTouchStart('right')}
                onMouseUp={() => handleTouchEnd('right')}
                onTouchStart={(e) => { e.preventDefault(); handleTouchStart('right'); }}
                onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('right'); }}
                className="w-12 h-10 rounded-xl bg-orange-500/25 border border-orange-400 text-orange-300 active:bg-orange-500 active:text-black flex items-center justify-center shadow transition"
                aria-label="Steer Right"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* DOWN / REVERSE */}
            <button
              onMouseDown={() => handleTouchStart('down')}
              onMouseUp={() => handleTouchEnd('down')}
              onTouchStart={(e) => { e.preventDefault(); handleTouchStart('down'); }}
              onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('down'); }}
              className="w-12 h-10 rounded-xl bg-orange-500/25 border border-orange-400 text-orange-300 active:bg-orange-500 active:text-black flex items-center justify-center shadow transition"
              aria-label="Reverse"
            >
              <ArrowDown className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
