import React from 'react';

interface GameOverModalProps {
  open: boolean;
  outcome: 'defeat' | 'victory';
  cluesFound: number;
  totalClues: number;
  missionsDone: number;
  totalMissions: number;
  hasSave: boolean;
  onLoadSave: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  open,
  outcome,
  cluesFound,
  totalClues,
  missionsDone,
  totalMissions,
  hasSave,
  onLoadSave,
  onRestart,
  onMainMenu,
}) => {
  if (!open) return null;

  const isVictory = outcome === 'victory';

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-[rgba(5,7,11,0.88)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gameover-title"
      data-testid="gameover-modal"
    >
      <div
        className={`w-full max-w-md bg-[#141a22] border-2 rounded-xl p-6 shadow-[0_16px_42px_rgba(0,0,0,0.85)] ${
          isVictory ? 'border-[#d49b4b]' : 'border-[#7a3438]'
        }`}
      >
        <div
          className={`text-xs font-semibold uppercase tracking-[0.1em] ${
            isVictory ? 'text-[#d49b4b]' : 'text-[#d67575]'
          }`}
        >
          {isVictory ? 'Chapter 1 Complete · Hollow Creek' : 'Lost in the Fog'}
        </div>

        <h2
          id="gameover-title"
          className="font-display text-3xl sm:text-4xl font-bold text-[#f3eee4] mt-1 tracking-wide"
        >
          {isVictory ? 'Hatch Unlocked' : 'You Fell in Hollow Creek'}
        </h2>

        <p className="mt-3 text-sm text-[#c7cfd9] leading-relaxed">
          {isVictory
            ? 'With the Substation Fuse slotted and the override code verified, the steel hatch groans open into the Directorate subterranean staircase. The signal beneath Hollow Creek awaits.'
            : 'Exhausted and overwhelmed by the shadows stalking the avenues, Alex collapsed before reaching the underground route.'}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-mono-tabular">
          <div className="p-3 rounded-lg bg-[#0f141b] border border-[#2a3443]">
            <div className="text-[#8a96a8]">CLUES LOGGED</div>
            <div className="text-lg font-bold text-[#f3eee4] mt-0.5">
              {cluesFound} / {totalClues}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-[#0f141b] border border-[#2a3443]">
            <div className="text-[#8a96a8]">MISSIONS</div>
            <div className="text-lg font-bold text-[#f3eee4] mt-0.5">
              {missionsDone} / {totalMissions}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2.5">
          {!isVictory && hasSave && (
            <button
              type="button"
              onClick={onLoadSave}
              className="min-h-[44px] w-full px-5 py-2.5 bg-[#d49b4b] hover:bg-[#e3ab5c] text-[#11151c] font-semibold text-sm rounded-lg border-2 border-[#11151c] shadow-[0_3px_0_#11151c] cursor-pointer"
            >
              Load Last Save
            </button>
          )}
          <button
            type="button"
            onClick={onRestart}
            className={`min-h-[44px] w-full px-5 py-2.5 font-semibold text-sm rounded-lg cursor-pointer ${
              isVictory || !hasSave
                ? 'bg-[#d49b4b] hover:bg-[#e3ab5c] text-[#11151c] border-2 border-[#11151c] shadow-[0_3px_0_#11151c]'
                : 'bg-[#1b232e] hover:bg-[#242e3d] text-[#e8ecf2] border border-[#364152]'
            }`}
          >
            {isVictory ? 'Play Again' : 'Restart New Game'}
          </button>
          <button
            type="button"
            onClick={onMainMenu}
            className="min-h-[44px] w-full px-5 py-2.5 bg-[#141a22] hover:bg-[#1e2632] text-[#c2cbd8] font-medium text-sm rounded-lg border border-[#2d3645] cursor-pointer"
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};
