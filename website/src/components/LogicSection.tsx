import React, { useState } from 'react';
import { 
  Brain, 
  Puzzle, 
  Lightbulb, 
  Sparkles, 
  CheckCircle2, 
  Shapes, 
  Trophy,
  ArrowRight
} from 'lucide-react';
import { playPop, playChime } from '../utils/audio';
import confetti from 'canvas-confetti';

export const LogicSection: React.FC = () => {
  // 4 pieces to assemble in the interactive logic board
  const [piecesPlaced, setPiecesPlaced] = useState<number[]>([1, 2]); // pieces 1 and 2 already in place
  const [celebrating, setCelebrating] = useState(false);

  const placePiece = (id: number) => {
    if (piecesPlaced.includes(id)) return;
    playPop();
    const updated = [...piecesPlaced, id];
    setPiecesPlaced(updated);

    if (updated.length === 4) {
      // Final piece connected!
      playChime();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      setCelebrating(true);
    }
  };

  const resetPuzzle = () => {
    playPop();
    setPiecesPlaced([1, 2]);
    setCelebrating(false);
  };

  return (
    <section id="logic-section" className="py-20 lg:py-28 bg-[#111422] text-white relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-1/4 right-10 w-96 h-96 bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-charithra-gold/15 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header (Prompt: Think. Solve. Discover.) */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-xs font-bold uppercase tracking-wider">
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span>Logic & Critical Thinking Lab</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Think. Solve.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
              Discover.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            Logic isn't just about math tests. It's how children break complex problems down into simple patterns, building self-reliance that lasts a lifetime.
          </p>
        </div>

        {/* Layout: Interactive Giant Puzzle Scene + Puzzle Mini-Game */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Section 5 Scene: Charithra Girl and friends solving the giant glowing puzzle */}
          <div className="lg:col-span-7">
            <div className="relative rounded-3xl overflow-hidden border-2 border-purple-500/40 shadow-2xl group">
              <img 
                src="/assets/scenes/logic-puzzle.jpg" 
                alt="Charithra Girl and friends enthusiastically placing the final glowing piece of a giant 3D logic puzzle" 
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
              />

              {/* Celebration Overlay when final piece connects */}
              {celebrating && (
                <div className="absolute inset-0 bg-charithra-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fadeIn z-30">
                  <div className="w-16 h-16 rounded-full bg-charithra-gold/20 border-2 border-charithra-gold flex items-center justify-center mb-3 animate-bounce">
                    <Trophy className="w-8 h-8 text-charithra-gold" />
                  </div>
                  <h3 className="font-heading font-black text-3xl sm:text-4xl text-amber-300 tracking-wide uppercase">
                    ✨ YOU GOT IT!
                  </h3>
                  <p className="text-sm text-slate-200 mt-2 max-w-sm font-semibold">
                    The final logic block locked into place! Critical thinking turns confusion into confidence.
                  </p>
                  <button
                    onClick={resetPuzzle}
                    className="mt-4 px-6 py-2 rounded-xl bg-charithra-gold text-charithra-black font-bold text-xs hover:bg-charithra-gold-light transition"
                  >
                    Play Again
                  </button>
                </div>
              )}

              {/* Bottom Scene Caption */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 text-white flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Puzzle className="w-4 h-4 text-purple-400" />
                  <span>Giant 3D Pattern & Logic Board</span>
                </div>
                <span className="text-amber-300 font-semibold">Discovery in Action</span>
              </div>
            </div>
          </div>

          {/* Interactive Puzzle Assembly Board for the User */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-6 rounded-3xl bg-[#181C2C] border border-purple-500/30 shadow-xl space-y-4">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-400" />
                  <h3 className="font-heading font-bold text-lg text-white">
                    Interactive Logic Challenge
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-purple-300 px-2.5 py-0.5 rounded-full bg-purple-500/20">
                  {piecesPlaced.length} / 4 Connected
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Help Charithra Girl and her friends complete the pattern! Tap the remaining logic pieces to snap them into the circuit board:
              </p>

              {/* Logic Pieces Tray */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  { id: 1, name: 'Hexagon Matrix', icon: '⬢ 01', color: 'border-sky-400 bg-sky-500/10 text-sky-300' },
                  { id: 2, name: 'Tri-Logic Block', icon: '▲ 02', color: 'border-emerald-400 bg-emerald-500/10 text-emerald-300' },
                  { id: 3, name: 'Binary Star Path', icon: '★ 03', color: 'border-purple-400 bg-purple-500/10 text-purple-300' },
                  { id: 4, name: 'Golden Prism Core', icon: '◆ 04', color: 'border-amber-400 bg-amber-500/10 text-amber-300' }
                ].map((piece) => {
                  const isPlaced = piecesPlaced.includes(piece.id);
                  return (
                    <button
                      key={piece.id}
                      onClick={() => placePiece(piece.id)}
                      disabled={isPlaced}
                      className={`p-3.5 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between min-h-[90px] ${
                        isPlaced 
                          ? 'opacity-50 border-slate-700 bg-black/30 cursor-default' 
                          : `${piece.color} hover:scale-105 shadow-md active:scale-95 cursor-pointer`
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono font-bold text-xs">
                        <span>{piece.icon}</span>
                        {isPlaced && <span className="text-emerald-400 text-xs">✓ Snapped</span>}
                      </div>
                      <span className="font-heading font-bold text-xs text-white mt-2">
                        {piece.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Trigger Button */}
              {!celebrating ? (
                <button
                  onClick={() => {
                    placePiece(3);
                    setTimeout(() => placePiece(4), 300);
                  }}
                  className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm text-charithra-black bg-gradient-to-r from-amber-400 to-charithra-gold hover:shadow-gold-glow transition flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Snap All Remaining Pieces!</span>
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-center font-bold text-xs">
                  🎉 Challenge Completed! Formula unlocked.
                </div>
              )}

            </div>

            {/* Micro Highlights */}
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Spatial Reasoning</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Pattern Algorithms</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
