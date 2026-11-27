import React from 'react';
import {
  DISTRICTS,
  WORLD_HEIGHT,
  WORLD_INTERACTABLES,
  WORLD_WIDTH,
} from '../game/worldData';

interface MapModalProps {
  open: boolean;
  playerX: number;
  playerY: number;
  discoveredIds: Set<string>;
  onClose: () => void;
}

export const MapModal: React.FC<MapModalProps> = ({
  open,
  playerX,
  playerY,
  discoveredIds,
  onClose,
}) => {
  if (!open) return null;

  const pxPct = (playerX / WORLD_WIDTH) * 100;
  const pyPct = (playerY / WORLD_HEIGHT) * 100;

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-[rgba(6,8,12,0.8)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="map-title"
    >
      <div className="w-full max-w-3xl bg-[#141a22] border-2 border-[#3a4556] rounded-xl p-5 sm:p-6 shadow-[0_12px_32px_rgba(0,0,0,0.75)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[#d49b4b]">
              Regional Survey · 1998 Edition
            </div>
            <h2
              id="map-title"
              className="font-display text-3xl font-bold text-[#f3eee4] tracking-wide"
            >
              Hollow Creek Town Map
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[42px] px-4 py-2 bg-[#1c2430] hover:bg-[#263141] text-[#e8ecf2] text-sm font-semibold rounded-lg border border-[#3a4556] cursor-pointer"
          >
            Close [M]
          </button>
        </div>

        {/* Interactive Town Map Viewport */}
        <div className="mt-4 relative w-full aspect-[96/76] max-h-[58vh] bg-[#161e1a] border-2 border-[#2e3846] rounded-lg overflow-hidden">
          {/* Main Connecting Roads Overlay (under district badges) */}
          <svg
            viewBox="0 0 96 76"
            preserveAspectRatio="none"
            className="absolute inset-0 z-0 w-full h-full pointer-events-none opacity-65"
          >
            {/* Horizontal Avenues */}
            <rect x="0" y="54" width="70" height="2.4" fill="#4f5866" />
            <rect x="5" y="33" width="59" height="2.4" fill="#4f5866" />
            <rect x="28" y="22" width="56" height="2.4" fill="#4f5866" />
            {/* Vertical Avenues */}
            <rect x="28" y="20" width="2.4" height="36" fill="#4f5866" />
            <rect x="47" y="16" width="2.4" height="44" fill="#4f5866" />
            <rect x="62" y="20" width="2.4" height="36" fill="#4f5866" />
          </svg>

          {/* District Regions */}
          {DISTRICTS.map((d) => {
            const left = `${(d.x / WORLD_WIDTH) * 100}%`;
            const top = `${(d.y / WORLD_HEIGHT) * 100}%`;
            const width = `${(d.w / WORLD_WIDTH) * 100}%`;
            const height = `${(d.h / WORLD_HEIGHT) * 100}%`;
            const districtClues = WORLD_INTERACTABLES.filter(
              (c) => c.district === d.name
            );
            const foundHere = districtClues.filter((c) =>
              discoveredIds.has(c.id)
            ).length;

            return (
              <div
                key={d.id}
                style={{ left, top, width, height }}
                className="absolute z-10 border border-[rgba(255,255,255,0.08)] flex flex-col items-start justify-start p-2 text-left pointer-events-none"
              >
                <div
                  className="text-[10px] sm:text-xs font-bold tracking-wide uppercase px-1.5 py-0.5 rounded bg-[rgba(11,14,19,0.86)]"
                  style={{ color: d.color }}
                >
                  {d.name}
                </div>
                <div className="mt-0.5 text-[10px] font-mono-tabular text-[#b8c1cf] bg-[rgba(11,14,19,0.75)] px-1.5 rounded">
                  {foundHere}/{districtClues.length} Clues
                </div>
              </div>
            );
          })}

          {/* Discovered Clue Markers */}
          {WORLD_INTERACTABLES.map((item) => {
            const found = discoveredIds.has(item.id);
            return (
              <div
                key={item.id}
                title={found ? item.title : `${item.district} — Unexplored`}
                style={{
                  left: `${(item.x / WORLD_WIDTH) * 100}%`,
                  top: `${(item.y / WORLD_HEIGHT) * 100}%`,
                }}
                className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border border-[#0b0e13] ${
                  found ? 'bg-[#d49b4b]' : 'bg-[#465264] opacity-70'
                }`}
              />
            );
          })}

          {/* Alex Morgan Live Location Marker */}
          <div
            style={{ left: `${pxPct}%`, top: `${pyPct}%` }}
            aria-label="Alex Morgan current location"
            className="absolute z-30 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
          >
            <div className="w-4 h-4 rounded-full bg-[#f4ede0] border-2 border-[#d49b4b] shadow-[0_0_0_3px_rgba(212,155,75,0.35)]" />
            <span className="mt-1 px-1.5 py-0.5 rounded bg-[#0b0e13] text-[#f4ede0] text-[10px] font-bold tracking-wide whitespace-nowrap">
              YOU
            </span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#9ca8b9]">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f4ede0] border border-[#d49b4b]" />
              Alex Morgan
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d49b4b]" />
              Clue Found
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#465264]" />
              Unexplored
            </span>
          </div>
          <span className="font-mono-tabular">
            Total Evidence: {discoveredIds.size} / {WORLD_INTERACTABLES.length}
          </span>
        </div>
      </div>
    </div>
  );
};
