import {
  CraftingRecipe,
  InventoryItemDef,
  InventorySlot,
  ItemId,
  MovementStance,
  SurvivalStats,
  WeatherKind,
} from './types';

export const BASE_INVENTORY_SLOTS = 6;
export const BACKPACK_INVENTORY_SLOTS = 16;

export const ITEM_DEFS: Record<ItemId, InventoryItemDef> = {
  canned_food: {
    id: 'canned_food',
    name: 'Canned Beans',
    category: 'consumable',
    description: 'Dented tin of cold rations. Restores +35 Hunger and +5 Health.',
    stackable: true,
    maxStack: 6,
    usable: true,
    useLabel: 'Eat',
    effects: { hunger: 35, hp: 5 },
  },
  bottled_water: {
    id: 'bottled_water',
    name: 'Bottled Water',
    category: 'consumable',
    description: 'Sealed spring water. Restores +42 Thirst and +18 Stamina.',
    stackable: true,
    maxStack: 6,
    usable: true,
    useLabel: 'Drink',
    effects: { thirst: 42, stamina: 18 },
  },
  medkit: {
    id: 'medkit',
    name: 'Trauma Medkit',
    category: 'consumable',
    description: 'Sterile gauze, antiseptic, and splints. Restores +55 Health.',
    stackable: true,
    maxStack: 4,
    usable: true,
    useLabel: 'Apply',
    effects: { hp: 55 },
  },
  bandage: {
    id: 'bandage',
    name: 'Cloth Bandage',
    category: 'consumable',
    description: 'Clean wrapped cloth strip. Restores +24 Health.',
    stackable: true,
    maxStack: 6,
    usable: true,
    useLabel: 'Wrap',
    effects: { hp: 24 },
  },
  flashlight: {
    id: 'flashlight',
    name: 'Transit Flashlight',
    category: 'tool',
    description: 'Heavy steel beam lamp. Press [F] or Light button to toggle.',
    stackable: false,
    maxStack: 1,
    usable: true,
    useLabel: 'Toggle',
  },
  battery: {
    id: 'battery',
    name: 'AA Battery Cell',
    category: 'consumable',
    description: 'Fresh alkaline cell. Recharges +45% Flashlight Battery.',
    stackable: true,
    maxStack: 8,
    usable: true,
    useLabel: 'Load Cell',
    effects: { battery: 45 },
  },
  wood: {
    id: 'wood',
    name: 'Timber Plank',
    category: 'material',
    description: 'Dry splintered pine slat useful for crafting tools and handles.',
    stackable: true,
    maxStack: 10,
    usable: false,
  },
  metal_scrap: {
    id: 'metal_scrap',
    name: 'Metal Scrap',
    category: 'material',
    description: 'Bent steel brackets and rebar salvaged from town wrecks.',
    stackable: true,
    maxStack: 10,
    usable: false,
  },
  cloth: {
    id: 'cloth',
    name: 'Cloth Strip',
    category: 'material',
    description: 'Clean torn fabric suitable for bandages or grips.',
    stackable: true,
    maxStack: 10,
    usable: false,
  },
  radio_part: {
    id: 'radio_part',
    name: 'Transceiver Coil',
    category: 'material',
    description: 'Copper induction coil from Hollow Creek emergency radios.',
    stackable: true,
    maxStack: 6,
    usable: false,
  },
  crowbar: {
    id: 'crowbar',
    name: 'Iron Crowbar',
    category: 'tool',
    description: 'Heavy prying bar. Increases defense strike power and reach [Space].',
    stackable: false,
    maxStack: 1,
    usable: false,
  },
  rust_key: {
    id: 'rust_key',
    name: 'Maple House Study Key',
    category: 'key',
    description: 'Brass key tagged "104 Maple — Study".',
    stackable: false,
    maxStack: 1,
    usable: false,
  },
  precinct_key: {
    id: 'precinct_key',
    name: 'Sheriff Evidence Key',
    category: 'key',
    description: 'Stamped "H.C.P.D. EVIDENCE". Unlocks the Precinct Evidence Room.',
    stackable: false,
    maxStack: 1,
    usable: false,
  },
  hospital_keycard: {
    id: 'hospital_keycard',
    name: 'Directorate Keycard',
    category: 'key',
    description: 'Magnetic badge granting access to the Chief Surgeon Office.',
    stackable: false,
    maxStack: 1,
    usable: false,
  },
  fuse: {
    id: 'fuse',
    name: 'Substation Fuse',
    category: 'key',
    description: 'High-voltage cylinder required by the Dark Forest Underground Hatch.',
    stackable: false,
    maxStack: 1,
    usable: false,
  },
  bus_note_doc: {
    id: 'bus_note_doc',
    name: 'Crumpled Warning Note',
    category: 'document',
    description: '"Don\'t trust the town. Don\'t follow the lights. Don\'t enter the underground."',
    stackable: false,
    maxStack: 1,
    usable: false,
  },
};

export const CRAFTING_RECIPES: CraftingRecipe[] = [
  {
    id: 'craft_bandage',
    resultId: 'bandage',
    resultQty: 1,
    name: 'Cloth Bandage',
    description: 'Wrap two clean cloth strips to stop bleeding (+24 HP).',
    ingredients: [{ itemId: 'cloth', qty: 2 }],
  },
  {
    id: 'craft_crowbar',
    resultId: 'crowbar',
    resultQty: 1,
    name: 'Improvised Crowbar',
    description: 'Forge scrap steel onto a timber grip for stronger self-defense.',
    ingredients: [
      { itemId: 'metal_scrap', qty: 2 },
      { itemId: 'wood', qty: 1 },
    ],
  },
  {
    id: 'craft_battery',
    resultId: 'battery',
    resultQty: 1,
    name: 'Salvaged Battery Cell',
    description: 'Combine metal contacts with a radio coil (+45% Flashlight).',
    ingredients: [
      { itemId: 'metal_scrap', qty: 1 },
      { itemId: 'radio_part', qty: 1 },
    ],
  },
  {
    id: 'craft_medkit',
    resultId: 'medkit',
    resultQty: 1,
    name: 'Field Medkit',
    description: 'Wash bandages with clean water for a full +55 HP trauma pack.',
    ingredients: [
      { itemId: 'bandage', qty: 1 },
      { itemId: 'cloth', qty: 1 },
      { itemId: 'bottled_water', qty: 1 },
    ],
  },
];

export function createInitialSurvivalStats(): SurvivalStats {
  return {
    hp: 100,
    maxHp: 100,
    stamina: 100,
    maxStamina: 100,
    hunger: 88,
    maxHunger: 100,
    thirst: 86,
    maxThirst: 100,
    battery: 100,
    maxBattery: 100,
    hasBackpack: false,
    hasFlashlight: false,
    flashlightOn: false,
    equippedWeapon: 'none',
    hiddenInSpotId: null,
    attackCooldown: 0,
    attackSwingTimer: 0,
    invulnTimer: 0,
  };
}

export function getMaxSlots(hasBackpack: boolean): number {
  return hasBackpack ? BACKPACK_INVENTORY_SLOTS : BASE_INVENTORY_SLOTS;
}

export function getItemCount(inventory: InventorySlot[], itemId: ItemId): number {
  let total = 0;
  for (const slot of inventory) {
    if (slot.itemId === itemId) total += slot.qty;
  }
  return total;
}

export function addItemToInventory(
  inventory: InventorySlot[],
  itemId: ItemId,
  qty: number,
  maxSlots: number
): { inventory: InventorySlot[]; added: number } {
  const def = ITEM_DEFS[itemId];
  const next = inventory.map((s) => ({ ...s }));
  let remaining = qty;

  if (def.stackable) {
    for (const slot of next) {
      if (slot.itemId === itemId && slot.qty < def.maxStack) {
        const space = def.maxStack - slot.qty;
        const put = Math.min(space, remaining);
        slot.qty += put;
        remaining -= put;
        if (remaining <= 0) break;
      }
    }
  }

  while (remaining > 0 && next.length < maxSlots) {
    const put = def.stackable ? Math.min(def.maxStack, remaining) : 1;
    next.push({ itemId, qty: put });
    remaining -= put;
  }

  return { inventory: next, added: qty - remaining };
}

export function removeItemFromInventory(
  inventory: InventorySlot[],
  itemId: ItemId,
  qty: number
): { inventory: InventorySlot[]; removed: number } {
  let remaining = qty;
  const next: InventorySlot[] = [];
  for (const slot of inventory) {
    if (slot.itemId === itemId && remaining > 0) {
      const take = Math.min(slot.qty, remaining);
      remaining -= take;
      if (slot.qty - take > 0) {
        next.push({ itemId: slot.itemId, qty: slot.qty - take });
      }
    } else {
      next.push({ ...slot });
    }
  }
  return { inventory: next, removed: qty - remaining };
}

export function consumeInventoryItem(
  inventory: InventorySlot[],
  stats: SurvivalStats,
  itemId: ItemId
): { inventory: InventorySlot[]; stats: SurvivalStats; message: string | null } {
  const def = ITEM_DEFS[itemId];
  if (!def.usable || getItemCount(inventory, itemId) <= 0) {
    return { inventory, stats, message: null };
  }

  if (itemId === 'flashlight') {
    if (!stats.hasFlashlight) {
      return { inventory, stats, message: 'No flashlight collected.' };
    }
    const nextOn = stats.battery > 0 ? !stats.flashlightOn : false;
    return {
      inventory,
      stats: { ...stats, flashlightOn: nextOn },
      message: nextOn ? 'Flashlight turned ON.' : 'Flashlight turned OFF.',
    };
  }

  const nextStats = { ...stats };
  if (def.effects) {
    if (def.effects.hp) {
      nextStats.hp = Math.min(nextStats.maxHp, nextStats.hp + def.effects.hp);
    }
    if (def.effects.stamina) {
      nextStats.stamina = Math.min(
        nextStats.maxStamina,
        nextStats.stamina + def.effects.stamina
      );
    }
    if (def.effects.hunger) {
      nextStats.hunger = Math.min(
        nextStats.maxHunger,
        nextStats.hunger + def.effects.hunger
      );
    }
    if (def.effects.thirst) {
      nextStats.thirst = Math.min(
        nextStats.maxThirst,
        nextStats.thirst + def.effects.thirst
      );
    }
    if (def.effects.battery) {
      nextStats.battery = Math.min(
        nextStats.maxBattery,
        nextStats.battery + def.effects.battery
      );
    }
  }

  const { inventory: nextInv } = removeItemFromInventory(inventory, itemId, 1);
  return {
    inventory: nextInv,
    stats: nextStats,
    message: `Used ${def.name}.`,
  };
}

export function canCraftRecipe(
  inventory: InventorySlot[],
  recipe: CraftingRecipe
): boolean {
  return recipe.ingredients.every(
    (ing) => getItemCount(inventory, ing.itemId) >= ing.qty
  );
}

export function craftItem(
  inventory: InventorySlot[],
  recipe: CraftingRecipe,
  maxSlots: number
): { inventory: InventorySlot[]; crafted: boolean; message: string } {
  if (!canCraftRecipe(inventory, recipe)) {
    return { inventory, crafted: false, message: 'Missing required materials.' };
  }
  let working = inventory;
  for (const ing of recipe.ingredients) {
    working = removeItemFromInventory(working, ing.itemId, ing.qty).inventory;
  }
  const res = addItemToInventory(working, recipe.resultId, recipe.resultQty, maxSlots);
  if (res.added <= 0) {
    return {
      inventory,
      crafted: false,
      message: 'Inventory full. Free a slot before crafting.',
    };
  }
  return {
    inventory: res.inventory,
    crafted: true,
    message: `Crafted ${recipe.name}!`,
  };
}

export function stepSurvivalStats(
  stats: SurvivalStats,
  stance: MovementStance,
  dt: number,
  inRain: boolean
): SurvivalStats {
  const next = { ...stats };
  next.attackCooldown = Math.max(0, next.attackCooldown - dt);
  next.attackSwingTimer = Math.max(0, next.attackSwingTimer - dt);
  next.invulnTimer = Math.max(0, next.invulnTimer - dt);

  // Stamina drain on run, recovery on walk/sneak/idle
  if (stance === 'run') {
    next.stamina = Math.max(0, next.stamina - 17 * dt);
  } else {
    const recov = stance === 'idle' ? 18 : 10;
    next.stamina = Math.min(next.maxStamina, next.stamina + recov * dt);
  }

  // Hunger & Thirst gradual drain (faster when running or in rain)
  const activityMult = stance === 'run' ? 1.55 : stance === 'walk' ? 1.0 : 0.72;
  next.hunger = Math.max(0, next.hunger - 0.19 * activityMult * dt);
  next.thirst = Math.max(
    0,
    next.thirst - (0.24 * activityMult + (inRain ? -0.02 : 0)) * dt
  );

  // Starvation / dehydration gentle bleed if completely depleted
  if (next.hunger <= 0 || next.thirst <= 0) {
    next.hp = Math.max(0, next.hp - 1.2 * dt);
  }

  // Flashlight battery drain
  if (next.hasFlashlight && next.flashlightOn) {
    next.battery = Math.max(0, next.battery - 0.85 * dt);
    if (next.battery <= 0) {
      next.flashlightOn = false;
    }
  }

  return next;
}

export function formatGameClock(clockMinutes: number): string {
  const mins = ((Math.floor(clockMinutes) % 1440) + 1440) % 1440;
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function getDayPhaseLabel(clockMinutes: number): string {
  const mins = ((clockMinutes % 1440) + 1440) % 1440;
  if (mins < 330 || mins >= 1230) return 'Night';
  if (mins < 450) return 'Dawn';
  if (mins < 1050) return 'Day';
  return 'Dusk';
}

/**
 * Computes ambient darkness alpha in [0.08, 0.76] based on time of day & weather.
 * Interiors are consistently shadowed unless illuminated by player flashlight.
 */
export function getAmbientDarkness(
  clockMinutes: number,
  weather: WeatherKind,
  inInterior: boolean
): number {
  if (inInterior) return 0.48;
  const mins = ((clockMinutes % 1440) + 1440) % 1440;
  let base = 0.1;
  if (mins < 330 || mins >= 1260) {
    base = 0.42; // Night
  } else if (mins < 450) {
    const t = (mins - 330) / 120;
    base = 0.42 - t * 0.32; // Dawn
  } else if (mins < 1050) {
    base = 0.1; // Overcast Hollow Creek day
  } else {
    const t = (mins - 1050) / 210;
    base = 0.1 + t * 0.32; // Dusk into Night
  }
  const weatherBoost = weather === 'rain' ? 0.06 : weather === 'fog' ? 0.04 : 0;
  return Math.min(0.52, base + weatherBoost);
}
