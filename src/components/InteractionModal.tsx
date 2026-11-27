import React from 'react';
import { Interactable } from '../game/types';

interface InteractionModalProps {
  item: Interactable | null;
  onClose: () => void;
}

export const InteractionModal: React.FC<InteractionModalProps> = ({
  item,
  onClose,
}) => {
  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-[rgba(6,8,12,0.7)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="clue-title"
    >
      <div className="w-full max-w-lg bg-[#141a22] border-2 border-[#3a4556] rounded-xl p-6 shadow-[0_12px_32px_rgba(0,0,0,0.65)]">
        <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[#d49b4b]">
          {item.subtitle}
        </div>
        <h2
          id="clue-title"
          className="font-display text-3xl font-bold text-[#f3eee4] mt-1 tracking-wide"
        >
          {item.title}
        </h2>

        <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-[#d7dde7]">
          {item.body.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {item.footnote && (
          <div className="mt-5 pt-3 border-t border-[#28313f] text-xs text-[#929eb0]">
            {item.footnote}
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 py-2.5 bg-[#d49b4b] hover:bg-[#e3ab5c] text-[#11151c] font-semibold text-sm rounded-lg border-2 border-[#11151c] shadow-[0_3px_0_#11151c] cursor-pointer transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};
