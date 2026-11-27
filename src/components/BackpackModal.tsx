import React, { useState } from 'react';
import {
  CRAFTING_RECIPES,
  ITEM_DEFS,
  canCraftRecipe,
  getItemCount,
  getMaxSlots,
} from '../game/survival';
import {
  InventorySlot,
  ItemId,
  JournalEntry,
  MissionState,
  SurvivalStats,
} from '../game/types';

export type BackpackTab = 'inventory' | 'crafting' | 'journal' | 'missions';

interface BackpackModalProps {
  open: boolean;
  initialTab: BackpackTab;
  inventory: InventorySlot[];
  stats: SurvivalStats;
  journal: JournalEntry[];
  missions: MissionState[];
  feedback: string | null;
  onUseItem: (itemId: ItemId) => void;
  onDropItem: (itemId: ItemId) => void;
  onCraft: (recipeId: string) => void;
  onClose: () => void;
}

const CATEGORY_BADGES: Record<string, string> = {
  consumable: 'Supply',
  tool: 'Gear',
  material: 'Material',
  key: 'Key Item',
  document: 'Document',
};

export const BackpackModal: React.FC<BackpackModalProps> = ({
  open,
  initialTab,
  inventory,
  stats,
  journal,
  missions,
  feedback,
  onUseItem,
  onDropItem,
  onCraft,
  onClose,
}) => {
  const [tab, setTab] = useState<BackpackTab>(initialTab);
  const [selectedItemId, setSelectedItemId] = useState<ItemId | null>(null);

  React.useEffect(() => {
    if (open) {
      setTab(initialTab);
    }
  }, [open, initialTab]);

  React.useEffect(() => {
    if (
      open &&
      inventory.length > 0 &&
      (!selectedItemId || !inventory.some((s) => s.itemId === selectedItemId))
    ) {
      setSelectedItemId(inventory[0].itemId);
    }
  }, [open, inventory, selectedItemId]);

  if (!open) return null;

  const maxSlots = getMaxSlots(stats.hasBackpack);
  const selectedSlot =
    inventory.find((s) => s.itemId === selectedItemId) ?? inventory[0] ?? null;
  const selectedDef = selectedSlot ? ITEM_DEFS[selectedSlot.itemId] : null;

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center p-3 sm:p-5 bg-[rgba(6,8,12,0.82)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="backpack-modal-title"
      data-testid="backpack-modal"
    >
      <div className="w-full max-w-3xl max-h-[88vh] flex flex-col bg-[#141a22] border-2 border-[#3a4556] rounded-xl p-4 sm:p-6 shadow-[0_14px_36px_rgba(0,0,0,0.75)]">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#d49b4b]">
              Alex Morgan · Survival Pack
            </div>
            <h2
              id="backpack-modal-title"
              className="font-display text-2xl sm:text-3xl font-bold text-[#f3eee4] tracking-wide"
            >
              {tab === 'inventory'
                ? 'Inventory'
                : tab === 'crafting'
                  ? 'Field Crafting'
                  : tab === 'journal'
                    ? 'Investigation Journal'
                    : 'Mission Tracker'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[42px] px-4 py-2 bg-[#1c2430] hover:bg-[#263141] text-[#e8ecf2] text-sm font-semibold rounded-lg border border-[#3a4556] cursor-pointer whitespace-nowrap"
          >
            Close [Esc]
          </button>
        </div>

        {/* Tab Bar */}
        <div className="mt-3 grid grid-cols-4 gap-1.5 p-1 bg-[#0e1218] rounded-lg border border-[#2a323f]">
          {(
            [
              { id: 'inventory', label: `Pack (${inventory.length}/${maxSlots})` },
              { id: 'crafting', label: 'Crafting' },
              { id: 'journal', label: `Journal (${journal.length})` },
              { id: 'missions', label: 'Missions' },
            ] as Array<{ id: BackpackTab; label: string }>
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              data-testid={`tab-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`min-h-[40px] px-2 rounded-md text-xs sm:text-sm font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                tab === t.id
                  ? 'bg-[#d49b4b] text-[#11151c]'
                  : 'text-[#9ca8b9] hover:text-[#e8ecf2]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {feedback && (
          <div className="mt-3 px-3.5 py-2 rounded-lg bg-[#1d2820] border border-[#3d6a49] text-xs sm:text-sm text-[#c8ebd0]">
            {feedback}
          </div>
        )}

        {/* Tab Content */}
        <div className="mt-4 flex-1 overflow-y-auto pr-1">
          {tab === 'inventory' && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Item Grid */}
              <div className="md:col-span-3">
                {!stats.hasBackpack && (
                  <div className="mb-3 px-3 py-2 rounded-lg bg-[#241e16] border border-[#6e512a] text-xs text-[#e5be84]">
                    Pocket capacity only ({BASE_HINT_TEXT()}). Find your Backpack beside Bus #14 for 16 slots.
                  </div>
                )}

                {inventory.length === 0 ? (
                  <div className="p-6 rounded-lg bg-[#0f141b] border border-[#28313f] text-sm text-[#8a96a8] text-center">
                    Your pack is empty. Search crates, drawers, and vehicles across Hollow Creek.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {inventory.map((slot, idx) => {
                      const def = ITEM_DEFS[slot.itemId];
                      const active = selectedSlot?.itemId === slot.itemId;
                      return (
                        <button
                          key={`${slot.itemId}-${idx}`}
                          type="button"
                          onClick={() => setSelectedItemId(slot.itemId)}
                          className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                            active
                              ? 'bg-[#202938] border-[#d49b4b]'
                              : 'bg-[#10151c] border-[#2b3442] hover:border-[#49576c]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] uppercase tracking-wider text-[#8d9ab0]">
                              {CATEGORY_BADGES[def.category] ?? def.category}
                            </span>
                            <span className="font-mono-tabular text-xs font-bold text-[#d49b4b]">
                              x{slot.qty}
                            </span>
                          </div>
                          <div className="mt-1 text-xs font-semibold text-[#f1ece2] leading-snug">
                            {def.name}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Inspector Panel */}
              <div className="md:col-span-2 bg-[#0f141b] border border-[#2a3342] rounded-lg p-4 flex flex-col justify-between">
                {selectedDef && selectedSlot ? (
                  <>
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-[#d49b4b] font-semibold">
                        {CATEGORY_BADGES[selectedDef.category]}
                      </div>
                      <h3 className="mt-1 font-display text-2xl font-bold text-[#f3eee4]">
                        {selectedDef.name}
                      </h3>
                      <p className="mt-2 text-xs sm:text-sm text-[#c0c8d4] leading-relaxed">
                        {selectedDef.description}
                      </p>
                      <div className="mt-3 text-xs font-mono-tabular text-[#8f9cae]">
                        Quantity in pack: {selectedSlot.qty}
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {selectedDef.usable && (
                        <button
                          type="button"
                          data-testid={`use-item-${selectedDef.id}`}
                          onClick={() => onUseItem(selectedDef.id)}
                          className="flex-1 min-h-[42px] px-4 py-2 bg-[#d49b4b] hover:bg-[#e3ab5c] text-[#11151c] font-semibold text-sm rounded-lg border-2 border-[#11151c] shadow-[0_3px_0_#11151c] cursor-pointer whitespace-nowrap"
                        >
                          {selectedDef.useLabel ?? 'Use'}
                        </button>
                      )}
                      {selectedDef.category !== 'key' &&
                        selectedDef.category !== 'document' &&
                        selectedDef.id !== 'flashlight' && (
                          <button
                            type="button"
                            onClick={() => onDropItem(selectedDef.id)}
                            className="min-h-[42px] px-3 py-2 bg-[#1a222d] hover:bg-[#2a1f24] text-[#d5b5b5] text-xs font-semibold rounded-lg border border-[#3a3340] cursor-pointer whitespace-nowrap"
                          >
                            Drop 1
                          </button>
                        )}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-[#7f8b9c]">
                    Select an item to inspect or use it.
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'crafting' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CRAFTING_RECIPES.map((recipe) => {
                const craftable = canCraftRecipe(inventory, recipe);
                return (
                  <div
                    key={recipe.id}
                    className="p-4 rounded-lg bg-[#0f141b] border border-[#2c3645] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-bold text-[#f3eee4]">
                          {recipe.name}
                        </h3>
                        <span className="text-xs font-mono-tabular text-[#d49b4b]">
                          +{recipe.resultQty}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#b4becc] leading-relaxed">
                        {recipe.description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {recipe.ingredients.map((ing) => {
                          const owned = getItemCount(inventory, ing.itemId);
                          const enough = owned >= ing.qty;
                          return (
                            <span
                              key={ing.itemId}
                              className={`text-[11px] font-mono-tabular px-2 py-1 rounded border ${
                                enough
                                  ? 'bg-[#17251d] border-[#355d43] text-[#a7dfb6]'
                                  : 'bg-[#21181b] border-[#513136] text-[#d9a2a8]'
                              }`}
                            >
                              {ITEM_DEFS[ing.itemId].name}: {owned}/{ing.qty}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!craftable}
                      data-testid={`craft-${recipe.id}`}
                      onClick={() => onCraft(recipe.id)}
                      className={`mt-4 min-h-[42px] w-full px-4 py-2 rounded-lg font-semibold text-sm border-2 transition-colors ${
                        craftable
                          ? 'bg-[#d49b4b] hover:bg-[#e3ab5c] text-[#11151c] border-[#11151c] shadow-[0_3px_0_#11151c] cursor-pointer'
                          : 'bg-[#171d26] text-[#6d788a] border-[#262f3d] cursor-not-allowed'
                      }`}
                    >
                      {craftable ? 'Craft Item' : 'Missing Materials'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'journal' && (
            <div className="space-y-3">
              {journal.length === 0 ? (
                <div className="p-6 rounded-lg bg-[#0f141b] border border-[#28313f] text-sm text-[#8a96a8] text-center">
                  No documents or clues recorded yet. Inspect notes, radios, and drawers to build Alex&apos;s case file.
                </div>
              ) : (
                journal
                  .slice()
                  .reverse()
                  .map((entry) => (
                    <article
                      key={entry.id}
                      className="p-4 rounded-lg bg-[#0f141b] border border-[#2c3645]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#d49b4b] font-semibold uppercase tracking-wider">
                        <span>
                          {entry.district} · {entry.source}
                        </span>
                        <span className="font-mono-tabular text-[#8a96a8]">
                          {entry.timestamp}
                        </span>
                      </div>
                      <h3 className="mt-1 font-display text-xl font-bold text-[#f3eee4]">
                        {entry.title}
                      </h3>
                      <div className="mt-2 space-y-1.5 text-xs sm:text-sm text-[#c7cfd9] leading-relaxed">
                        {entry.lines.map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    </article>
                  ))
              )}
            </div>
          )}

          {tab === 'missions' && (
            <div className="space-y-3">
              {missions.map((m) => (
                <div
                  key={m.id}
                  className={`p-4 rounded-lg border ${
                    m.completed
                      ? 'bg-[#132019] border-[#3b694a]'
                      : 'bg-[#0f141b] border-[#2e3847]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-[#f3eee4]">
                        {m.title}
                      </h3>
                      <p className="text-xs text-[#9eabb9] mt-0.5">{m.summary}</p>
                    </div>
                    <span
                      className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded whitespace-nowrap ${
                        m.completed
                          ? 'bg-[#254932] text-[#a9e3b8]'
                          : 'bg-[#242c38] text-[#d49b4b]'
                      }`}
                    >
                      {m.completed ? 'Completed' : 'Active'}
                    </span>
                  </div>

                  <ul className="mt-3 space-y-1.5">
                    {m.steps.map((s) => (
                      <li
                        key={s.id}
                        className={`text-xs flex items-center gap-2 ${
                          s.completed ? 'text-[#89c99a] line-through' : 'text-[#dce2eb]'
                        }`}
                      >
                        <span
                          className={`inline-flex items-center justify-center w-4 h-4 rounded border text-[10px] font-bold ${
                            s.completed
                              ? 'bg-[#357249] border-[#4ca066] text-[#f3eee4]'
                              : 'border-[#4d5a6f] text-transparent'
                          }`}
                        >
                          ✓
                        </span>
                        <span>{s.label}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-2.5 text-[11px] text-[#d49b4b]">
                    {m.rewardText}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function BASE_HINT_TEXT() {
  return '6 slots';
}
