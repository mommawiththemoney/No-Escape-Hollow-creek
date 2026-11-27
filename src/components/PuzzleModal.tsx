import React, { useState } from 'react';

export interface ActivePuzzlePrompt {
  id: string;
  title: string;
  subtitle: string;
  hint: string;
  code: string;
  requiresFuse?: boolean;
  hasFuse: boolean;
}

interface PuzzleModalProps {
  puzzle: ActivePuzzlePrompt | null;
  onSubmitCode: (code: string) => { ok: boolean; message: string };
  onClose: () => void;
}

export const PuzzleModal: React.FC<PuzzleModalProps> = ({
  puzzle,
  onSubmitCode,
  onClose,
}) => {
  const [digits, setDigits] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    setDigits('');
    setErrorMsg(null);
  }, [puzzle?.id]);

  if (!puzzle) return null;

  const appendDigit = (d: string) => {
    setErrorMsg(null);
    setDigits((prev) => (prev.length < 4 ? prev + d : prev));
  };

  const handleUnlock = () => {
    if (puzzle.requiresFuse && !puzzle.hasFuse) {
      setErrorMsg('Power dead: Substation Fuse from General Hospital is required first.');
      return;
    }
    const res = onSubmitCode(digits);
    if (!res.ok) {
      setErrorMsg(res.message);
      setDigits('');
    }
  };

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-[rgba(6,8,12,0.82)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="puzzle-title"
      data-testid="puzzle-modal"
    >
      <div className="w-full max-w-sm bg-[#141a22] border-2 border-[#3a4556] rounded-xl p-5 sm:p-6 shadow-[0_14px_36px_rgba(0,0,0,0.8)]">
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#d49b4b]">
          {puzzle.subtitle}
        </div>
        <h2
          id="puzzle-title"
          className="font-display text-2xl sm:text-3xl font-bold text-[#f3eee4] mt-0.5"
        >
          {puzzle.title}
        </h2>
        <p className="mt-2 text-xs text-[#aeb9c8] leading-relaxed">
          Hint: {puzzle.hint}
        </p>

        {puzzle.requiresFuse && (
          <div
            className={`mt-2.5 px-3 py-1.5 rounded border text-xs font-semibold ${
              puzzle.hasFuse
                ? 'bg-[#17281e] border-[#3d6f4e] text-[#a9e2b9]'
                : 'bg-[#2a1b1b] border-[#663638] text-[#e7a6a6]'
            }`}
          >
            {puzzle.hasFuse
              ? 'Substation Fuse Inserted — Circuit Ready'
              : 'Missing Substation Fuse (Hospital Vault)'}
          </div>
        )}

        {/* 4-Digit LED Readout */}
        <div className="mt-4 py-3 px-4 rounded-lg bg-[#0b0f14] border-2 border-[#2a3444] text-center font-mono-tabular text-2xl tracking-[0.45em] text-[#e6b364]">
          {digits.padEnd(4, '•')}
        </div>

        {errorMsg && (
          <div className="mt-2.5 text-xs text-[#e39b9b] text-center">
            {errorMsg}
          </div>
        )}

        {/* Keypad */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLR', '0', 'DEL'].map(
            (key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (key === 'CLR') {
                    setDigits('');
                    setErrorMsg(null);
                  } else if (key === 'DEL') {
                    setDigits((p) => p.slice(0, -1));
                  } else {
                    appendDigit(key);
                  }
                }}
                className="min-h-[44px] rounded-lg bg-[#1b232e] hover:bg-[#263140] border border-[#384457] text-sm font-mono-tabular font-bold text-[#f0ebe0] cursor-pointer"
              >
                {key}
              </button>
            )
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] flex-1 px-4 py-2 bg-[#1a212b] hover:bg-[#232d3b] text-[#cfd7e3] text-sm font-semibold rounded-lg border border-[#344052] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={digits.length < 4}
            onClick={handleUnlock}
            className={`min-h-[44px] flex-1 px-4 py-2 text-sm font-semibold rounded-lg border-2 ${
              digits.length === 4
                ? 'bg-[#d49b4b] hover:bg-[#e3ab5c] text-[#11151c] border-[#11151c] shadow-[0_3px_0_#11151c] cursor-pointer'
                : 'bg-[#171d26] text-[#6d788a] border-[#262f3d] cursor-not-allowed'
            }`}
          >
            Unlock
          </button>
        </div>
      </div>
    </div>
  );
};
