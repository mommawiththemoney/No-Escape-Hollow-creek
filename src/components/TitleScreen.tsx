import React from 'react';
import { Phase1SaveData } from '../game/types';
import { WORLD_INTERACTABLES } from '../game/worldData';

interface TitleScreenProps {
  saveData: Phase1SaveData | null;
  onNewGame: () => void;
  onContinue: () => void;
  onOpenSettings: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  saveData,
  onNewGame,
  onContinue,
  onOpenSettings,
}) => {
  return (
    <div className="fixed inset-0 z-20 flex flex-col justify-between p-6 sm:p-12 pointer-events-none">
      {/* Left-third calm dark vignette scrim for typography contrast */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, rgba(8,11,16,0.88) 0%, rgba(8,11,16,0.56) 44%, rgba(8,11,16,0.12) 100%)',
        }}
      />

      <div className="relative z-10 max-w-md pt-6 sm:pt-10 pointer-events-auto">
        <svg
          viewBox="0 0 360 112"
          className="w-full max-w-[340px] h-auto mb-3"
          role="img"
          aria-label="NO ESCAPE"
        >
          <path
            d="M12 24 L20 8 L28 24 M34 24 L40 12 L46 24 M6 24 L54 24"
            fill="none"
            stroke="#d49b4b"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="64"
            y1="17"
            x2="340"
            y2="17"
            stroke="rgba(212, 155, 75, 0.35)"
            strokeWidth="1.5"
          />
          <text
            x="4"
            y="84"
            fill="#f2ede2"
            stroke="#0b0e13"
            strokeWidth="5"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '68px',
              letterSpacing: '0.06em',
              paintOrder: 'stroke fill',
            }}
          >
            NO ESCAPE
          </text>
          <text
            x="6"
            y="106"
            fill="#c6beb0"
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 500,
              fontSize: '14px',
              letterSpacing: '0.03em',
            }}
          >
            Some places don&apos;t want you to leave.
          </text>
        </svg>

        <div className="mt-8 flex flex-col gap-3 max-w-[270px]">
          <button
            type="button"
            data-start="true"
            onClick={onNewGame}
            className="w-full min-h-[46px] px-6 py-3 bg-[#d49b4b] hover:bg-[#e3ab5c] active:translate-y-px text-[#11151c] font-semibold text-base rounded-lg border-2 border-[#11151c] shadow-[0_4px_0_#11151c] transition-colors cursor-pointer text-left flex items-center justify-between focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2ede2]"
          >
            <span>New Game</span>
            <span aria-hidden="true" className="text-sm font-bold">
              →
            </span>
          </button>

          {saveData && (
            <button
              type="button"
              onClick={onContinue}
              className="w-full min-h-[44px] px-5 py-2.5 bg-[#18202b] hover:bg-[#222c3b] text-[#e8ecf2] font-medium text-sm rounded-lg border border-[#3a4556] transition-colors cursor-pointer text-left flex items-center justify-between focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d49b4b]"
            >
              <span>Continue</span>
              <span className="font-mono-tabular text-xs text-[#9ca7b8]">
                {saveData.discoveredIds.length}/{WORLD_INTERACTABLES.length} Clues
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenSettings}
            className="w-full min-h-[44px] px-5 py-2.5 bg-[#141a23] hover:bg-[#1e2734] text-[#cfd6e0] font-medium text-sm rounded-lg border border-[#2d3644] transition-colors cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d49b4b]"
          >
            Settings
          </button>
        </div>
      </div>

      <div className="relative z-10 text-xs sm:text-sm text-[#a6b0bf] tracking-wide">
        WASD Move · Shift Run · Ctrl Sneak · E Interact · F Light · Space Attack · Tab Pack · J Journal · M Map
      </div>
    </div>
  );
};
