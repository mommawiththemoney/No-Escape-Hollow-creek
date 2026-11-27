import React, { useRef, useState } from 'react';

interface MobileControlsProps {
  visible: boolean;
  canInteract: boolean;
  interactLabel: string;
  hasFlashlight: boolean;
  flashlightOn: boolean;
  hasCrowbar: boolean;
  onJoystickMove: (x: number, y: number) => void;
  onRunChange: (held: boolean) => void;
  onSneakToggle: () => void;
  sneakActive: boolean;
  onInteract: () => void;
  onToggleFlashlight: () => void;
  onAttack: () => void;
  onOpenInventory: () => void;
}

const MAX_KNOB_DIST = 36;

export const MobileControls: React.FC<MobileControlsProps> = ({
  visible,
  canInteract,
  interactLabel,
  hasFlashlight,
  flashlightOn,
  hasCrowbar,
  onJoystickMove,
  onRunChange,
  onSneakToggle,
  sneakActive,
  onInteract,
  onToggleFlashlight,
  onAttack,
  onOpenInventory,
}) => {
  const baseRef = useRef<HTMLDivElement | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const [knobOffset, setKnobOffset] = useState({ x: 0, y: 0 });

  if (!visible) return null;

  const updateStick = (clientX: number, clientY: number) => {
    const el = baseRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const dist = Math.hypot(dx, dy);

    if (dist < 4) {
      setKnobOffset({ x: 0, y: 0 });
      onJoystickMove(0, 0);
      return;
    }

    const clamped = Math.min(MAX_KNOB_DIST, dist);
    const nx = (dx / dist) * (clamped / MAX_KNOB_DIST);
    const ny = (dy / dist) * (clamped / MAX_KNOB_DIST);
    setKnobOffset({
      x: (dx / dist) * clamped,
      y: (dy / dist) * clamped,
    });
    onJoystickMove(nx, ny);
  };

  const resetStick = () => {
    pointerIdRef.current = null;
    setKnobOffset({ x: 0, y: 0 });
    onJoystickMove(0, 0);
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-10 pointer-events-none flex items-end justify-between p-3 sm:p-5"
      data-testid="mobile-controls"
    >
      {/* Left: Virtual Thumbstick */}
      <div
        ref={baseRef}
        role="application"
        aria-label="Movement joystick"
        onPointerDown={(e) => {
          e.preventDefault();
          pointerIdRef.current = e.pointerId;
          e.currentTarget.setPointerCapture(e.pointerId);
          updateStick(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (pointerIdRef.current !== e.pointerId) return;
          updateStick(e.clientX, e.clientY);
        }}
        onPointerUp={(e) => {
          if (pointerIdRef.current !== e.pointerId) return;
          resetStick();
        }}
        onPointerCancel={resetStick}
        className="pointer-events-auto relative w-28 h-28 rounded-full bg-[rgba(15,20,28,0.74)] border-2 border-[#465366] flex items-center justify-center touch-none shadow-[0_4px_12px_rgba(0,0,0,0.45)]"
      >
        <div
          className="w-12 h-12 rounded-full bg-[#d49b4b] border-2 border-[#11151c] shadow-[0_2px_0_#11151c]"
          style={{
            transform: `translate(${knobOffset.x}px, ${knobOffset.y}px)`,
          }}
        />
      </div>

      {/* Right: 2-Row Action Cluster */}
      <div className="pointer-events-auto flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          {hasFlashlight && (
            <button
              type="button"
              onClick={onToggleFlashlight}
              className={`min-w-[52px] min-h-[44px] px-2.5 rounded-lg border-2 font-semibold text-xs cursor-pointer whitespace-nowrap ${
                flashlightOn
                  ? 'bg-[#f0c76e] text-[#11151c] border-[#11151c]'
                  : 'bg-[rgba(15,20,28,0.88)] text-[#e8ecf2] border-[#3d4859]'
              }`}
            >
              Light
            </button>
          )}
          <button
            type="button"
            onClick={onAttack}
            className="min-w-[56px] min-h-[44px] px-2.5 rounded-lg bg-[rgba(15,20,28,0.88)] active:bg-[#3a2626] text-[#e8ecf2] border-2 border-[#5a3b3e] font-semibold text-xs cursor-pointer whitespace-nowrap"
          >
            {hasCrowbar ? 'Strike' : 'Shove'}
          </button>
          <button
            type="button"
            onClick={onOpenInventory}
            className="min-w-[50px] min-h-[44px] px-2.5 rounded-lg bg-[rgba(15,20,28,0.88)] text-[#e8ecf2] border-2 border-[#3d4859] font-semibold text-xs cursor-pointer whitespace-nowrap"
          >
            Pack
          </button>
        </div>

        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={onSneakToggle}
            aria-pressed={sneakActive}
            className={`min-w-[54px] min-h-[46px] px-2.5 rounded-lg border-2 font-semibold text-xs cursor-pointer transition-colors whitespace-nowrap ${
              sneakActive
                ? 'bg-[#d49b4b] text-[#11151c] border-[#11151c]'
                : 'bg-[rgba(15,20,28,0.88)] text-[#e8ecf2] border-[#3d4859]'
            }`}
          >
            Sneak
          </button>

          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              onRunChange(true);
            }}
            onPointerUp={() => onRunChange(false)}
            onPointerLeave={() => onRunChange(false)}
            onPointerCancel={() => onRunChange(false)}
            className="min-w-[52px] min-h-[46px] px-2.5 rounded-lg bg-[rgba(15,20,28,0.88)] active:bg-[#2c3747] text-[#e8ecf2] border-2 border-[#3d4859] font-semibold text-xs cursor-pointer whitespace-nowrap"
          >
            Run
          </button>

          <button
            type="button"
            onClick={onInteract}
            disabled={!canInteract}
            className={`min-w-[74px] min-h-[52px] px-3 rounded-lg border-2 font-bold text-xs transition-colors whitespace-nowrap ${
              canInteract
                ? 'bg-[#d49b4b] text-[#11151c] border-[#11151c] shadow-[0_3px_0_#11151c] cursor-pointer'
                : 'bg-[rgba(15,20,28,0.58)] text-[#6c7788] border-[#2b3340] cursor-not-allowed'
            }`}
          >
            {canInteract ? interactLabel : 'Interact'}
          </button>
        </div>
      </div>
    </div>
  );
};
