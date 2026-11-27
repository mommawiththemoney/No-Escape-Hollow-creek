import React from 'react';
import { ITEM_DEFS } from '../game/survival';
import { ItemId } from '../game/types';

export interface ActiveContainerView {
  id: string;
  title: string;
  items: Array<{ itemId: ItemId; qty: number }>;
  noteTitle?: string;
  noteLines?: string[];
  alreadySearched: boolean;
}

interface ContainerModalProps {
  container: ActiveContainerView | null;
  onTakeAll: () => void;
  onClose: () => void;
}

export const ContainerModal: React.FC<ContainerModalProps> = ({
  container,
  onTakeAll,
  onClose,
}) => {
  if (!container) return null;

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-[rgba(6,8,12,0.78)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="container-title"
      data-testid="container-modal"
    >
      <div className="w-full max-w-md bg-[#141a22] border-2 border-[#3a4556] rounded-xl p-5 sm:p-6 shadow-[0_14px_36px_rgba(0,0,0,0.8)]">
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#d49b4b]">
          Container Search
        </div>
        <h2
          id="container-title"
          className="font-display text-2xl sm:text-3xl font-bold text-[#f3eee4] mt-0.5"
        >
          {container.title}
        </h2>

        {container.noteLines && container.noteLines.length > 0 && (
          <div className="mt-3 p-3.5 rounded-lg bg-[#0f141b] border border-[#2d3848]">
            {container.noteTitle && (
              <div className="text-xs font-bold text-[#d49b4b] mb-1">
                {container.noteTitle}
              </div>
            )}
            <div className="space-y-1.5 text-xs sm:text-sm text-[#d6dde8] leading-relaxed">
              {container.noteLines.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <div className="text-xs uppercase tracking-wider text-[#95a2b5] font-semibold mb-2">
            {container.alreadySearched || container.items.length === 0
              ? 'Empty — Already Searched'
              : 'Items Inside'}
          </div>
          {!container.alreadySearched && container.items.length > 0 && (
            <ul className="space-y-2">
              {container.items.map((entry, idx) => {
                const def = ITEM_DEFS[entry.itemId];
                return (
                  <li
                    key={`${entry.itemId}-${idx}`}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#0f141b] border border-[#2b3544]"
                  >
                    <div>
                      <div className="text-sm font-semibold text-[#f2ede2]">
                        {def.name}
                      </div>
                      <div className="text-[11px] text-[#909dad]">
                        {def.description}
                      </div>
                    </div>
                    <span className="font-mono-tabular text-sm font-bold text-[#d49b4b] pl-3">
                      x{entry.qty}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          {!container.alreadySearched && container.items.length > 0 ? (
            <button
              type="button"
              data-testid="container-take-all"
              onClick={onTakeAll}
              className="min-h-[44px] px-5 py-2.5 bg-[#d49b4b] hover:bg-[#e3ab5c] text-[#11151c] font-semibold text-sm rounded-lg border-2 border-[#11151c] shadow-[0_3px_0_#11151c] cursor-pointer whitespace-nowrap"
            >
              Take All [E]
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-5 py-2.5 bg-[#d49b4b] hover:bg-[#e3ab5c] text-[#11151c] font-semibold text-sm rounded-lg border-2 border-[#11151c] shadow-[0_3px_0_#11151c] cursor-pointer whitespace-nowrap"
            >
              Close [E]
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
