import { AABB, BuildingInterior } from './types';

export function createBuildingInteriors(): Record<string, BuildingInterior> {
  const mapleHouse: BuildingInterior = {
    id: 'interior_maple_house',
    name: '104 Maple Lane — Miller Residence',
    district: 'Residential District',
    width: 720,
    height: 560,
    spawnX: 360,
    spawnY: 500,
    exitDoor: { x: 360, y: 536, radius: 56 },
    exteriorEntrance: {
      x: 550,
      y: 1478,
      radius: 66,
      label: '104 Maple Lane House',
    },
    exteriorReturnPos: { x: 550, y: 1492, facingAngle: Math.PI / 2 },
    rooms: [
      { id: 'foyer', name: 'Entry Hallway', x: 240, y: 320, w: 240, h: 240, floor: 'wood' },
      { id: 'living', name: 'Living Room', x: 0, y: 260, w: 240, h: 300, floor: 'carpet' },
      { id: 'kitchen', name: 'Kitchen', x: 0, y: 0, w: 360, h: 260, floor: 'tile_checker' },
      { id: 'study', name: 'Master Study', x: 360, y: 0, w: 360, h: 320, floor: 'wood' },
      { id: 'mudroom', name: 'Storage Closet', x: 480, y: 320, w: 240, h: 240, floor: 'concrete' },
    ],
    walls: [
      // Outer shell walls
      { id: 'mh_w_n', x: 0, y: 0, w: 720, h: 20, kind: 'wall' },
      { id: 'mh_w_s1', x: 0, y: 540, w: 310, h: 20, kind: 'wall' },
      { id: 'mh_w_s2', x: 410, y: 540, w: 310, h: 20, kind: 'wall' },
      { id: 'mh_w_w', x: 0, y: 0, w: 20, h: 560, kind: 'wall' },
      { id: 'mh_w_e', x: 700, y: 0, w: 20, h: 560, kind: 'wall' },
      // Living <-> Foyer divider (doorway at y: 390..460)
      { id: 'mh_lf_1', x: 232, y: 260, w: 16, h: 130, kind: 'wall' },
      { id: 'mh_lf_2', x: 232, y: 460, w: 16, h: 80, kind: 'wall' },
      // Kitchen <-> Living divider (doorway at x: 100..170)
      { id: 'mh_kl_1', x: 20, y: 252, w: 80, h: 16, kind: 'wall' },
      { id: 'mh_kl_2', x: 170, y: 252, w: 190, h: 16, kind: 'wall' },
      // Kitchen <-> Study divider (solid wall)
      { id: 'mh_ks_1', x: 352, y: 20, w: 16, h: 240, kind: 'wall' },
      // Study <-> Foyer/Mudroom divider (doorway at x: 400..470)
      { id: 'mh_sf_1', x: 352, y: 312, w: 48, h: 16, kind: 'wall' },
      { id: 'mh_sf_2', x: 470, y: 312, w: 230, h: 16, kind: 'wall' },
      // Foyer <-> Mudroom divider (doorway at y: 390..460)
      { id: 'mh_fm_1', x: 472, y: 320, w: 16, h: 70, kind: 'wall' },
      { id: 'mh_fm_2', x: 472, y: 460, w: 16, h: 80, kind: 'wall' },
    ],
    furniture: [
      { id: 'mh_rug', kind: 'rug', x: 64, y: 350, w: 128, h: 96, solid: false },
      { id: 'mh_sofa', kind: 'sofa', x: 32, y: 318, w: 86, h: 40, solid: true },
      { id: 'mh_tv_table', kind: 'table', x: 70, y: 466, w: 96, h: 44, solid: true },
      { id: 'mh_k_counter', kind: 'counter', x: 28, y: 28, w: 180, h: 46, solid: true },
      { id: 'mh_k_stove', kind: 'stove', x: 214, y: 28, w: 54, h: 46, solid: true },
      { id: 'mh_k_fridge', kind: 'fridge', x: 282, y: 28, w: 58, h: 52, solid: true },
      { id: 'mh_k_table', kind: 'table', x: 140, y: 128, w: 92, h: 58, solid: true },
      { id: 'mh_bed', kind: 'bed', x: 564, y: 38, w: 118, h: 82, solid: true },
      { id: 'mh_desk', kind: 'desk', x: 390, y: 38, w: 104, h: 52, solid: true },
      { id: 'mh_shelf', kind: 'bookshelf', x: 650, y: 170, w: 42, h: 110, solid: true },
      { id: 'mh_safe', kind: 'safe', x: 400, y: 224, w: 52, h: 52, solid: true },
      { id: 'mh_wardrobe', kind: 'wardrobe', x: 616, y: 454, w: 74, h: 58, solid: true },
      { id: 'mh_cabinet', kind: 'cabinet', x: 608, y: 336, w: 82, h: 42, solid: true },
    ],
    doors: [
      {
        id: 'mh_door_study',
        x: 400,
        y: 312,
        w: 70,
        h: 16,
        orientation: 'h',
        open: false,
        locked: true,
        requiredKeyId: 'rust_key',
        label: 'Study Door (Locked)',
      },
      {
        id: 'mh_door_kitchen',
        x: 100,
        y: 252,
        w: 70,
        h: 16,
        orientation: 'h',
        open: false,
        locked: false,
        label: 'Kitchen Door',
      },
    ],
    containers: [
      {
        id: 'mh_fridge_box',
        title: 'Miller Kitchen Fridge',
        verb: 'SEARCH',
        x: 310,
        y: 96,
        radius: 56,
        searched: false,
        loot: [
          { itemId: 'bottled_water', qty: 2 },
          { itemId: 'canned_food', qty: 1 },
        ],
        noteTitle: 'Kitchen Magnet Note',
        noteLines: [
          'Held to the fridge door by a pine-tree magnet: "Evacuation date circled in red: 10/14. Keep the study safe locked on 1014."',
        ],
      },
      {
        id: 'mh_kitchen_drawer',
        title: 'Kitchen Utensil Drawer',
        verb: 'SEARCH',
        x: 118,
        y: 90,
        radius: 54,
        searched: false,
        loot: [
          { itemId: 'rust_key', qty: 1 },
          { itemId: 'cloth', qty: 2 },
        ],
      },
      {
        id: 'mh_mudroom_cabinet',
        title: 'Mudroom Supply Cabinet',
        verb: 'SEARCH',
        x: 644,
        y: 392,
        radius: 56,
        searched: false,
        loot: [
          { itemId: 'wood', qty: 2 },
          { itemId: 'metal_scrap', qty: 1 },
          { itemId: 'battery', qty: 1 },
        ],
      },
      {
        id: 'mh_study_desk',
        title: 'Miller Study Desk',
        verb: 'SEARCH',
        x: 442,
        y: 108,
        radius: 56,
        searched: false,
        loot: [
          { itemId: 'bandage', qty: 1 },
          { itemId: 'radio_part', qty: 1 },
        ],
        noteTitle: 'Surveyor Diary',
        noteLines: [
          'Oct 13 — "The water company sealed the forest hatch again. When the streetlights flicker at 3 AM, you can hear voices rising through the floor vents."',
        ],
      },
    ],
    hideSpots: [
      {
        id: 'mh_wardrobe_hide',
        label: 'Oak Wardrobe',
        x: 616,
        y: 440,
        radius: 58,
      },
    ],
    puzzles: [
      {
        id: 'mh_study_safe',
        title: 'Miller Wall Safe',
        subtitle: '4-Digit Combination Lock',
        hint: 'Check the evacuation date circled on the kitchen fridge magnet.',
        code: '1014',
        x: 426,
        y: 250,
        radius: 60,
        solved: false,
        rewardItems: [
          { itemId: 'precinct_key', qty: 1 },
          { itemId: 'medkit', qty: 1 },
        ],
        journalTitle: 'Inside Miller Safe',
        journalLines: [
          'Deputy Hayes left a spare Sheriff Evidence Key inside with a note: "If town goes silent, unlock the Precinct Evidence Room first."',
        ],
      },
    ],
  };

  const diner: BuildingInterior = {
    id: 'interior_diner',
    name: 'Hollow Creek Diner',
    district: 'Town Centre',
    width: 720,
    height: 520,
    spawnX: 360,
    spawnY: 465,
    exitDoor: { x: 360, y: 496, radius: 56 },
    exteriorEntrance: {
      x: 1860,
      y: 1524,
      radius: 68,
      label: 'Hollow Creek Diner',
    },
    exteriorReturnPos: { x: 1860, y: 1546, facingAngle: Math.PI / 2 },
    rooms: [
      { id: 'dining', name: 'Main Dining Floor', x: 0, y: 200, w: 720, h: 320, floor: 'tile_checker' },
      { id: 'kitchen', name: 'Diner Kitchen', x: 0, y: 0, w: 420, h: 200, floor: 'concrete' },
      { id: 'office', name: "Manager's Office", x: 420, y: 0, w: 300, h: 200, floor: 'wood' },
    ],
    walls: [
      { id: 'dn_n', x: 0, y: 0, w: 720, h: 20, kind: 'wall' },
      { id: 'dn_s1', x: 0, y: 500, w: 310, h: 20, kind: 'wall' },
      { id: 'dn_s2', x: 410, y: 500, w: 310, h: 20, kind: 'wall' },
      { id: 'dn_w', x: 0, y: 0, w: 20, h: 520, kind: 'wall' },
      { id: 'dn_e', x: 700, y: 0, w: 20, h: 520, kind: 'wall' },
      // Kitchen <-> Dining (doorway at x: 320..390)
      { id: 'dn_kd1', x: 20, y: 192, w: 300, h: 16, kind: 'wall' },
      { id: 'dn_kd2', x: 390, y: 192, w: 120, h: 16, kind: 'wall' },
      // Office <-> Dining (doorway at x: 510..580)
      { id: 'dn_od1', x: 580, y: 192, w: 120, h: 16, kind: 'wall' },
      // Kitchen <-> Office wall
      { id: 'dn_ko', x: 412, y: 20, w: 16, h: 176, kind: 'wall' },
    ],
    furniture: [
      { id: 'dn_counter', kind: 'counter', x: 64, y: 248, w: 230, h: 44, solid: true },
      { id: 'dn_booth1', kind: 'table', x: 52, y: 370, w: 102, h: 54, solid: true },
      { id: 'dn_booth2', kind: 'table', x: 520, y: 360, w: 112, h: 56, solid: true },
      { id: 'dn_stove', kind: 'stove', x: 36, y: 30, w: 88, h: 46, solid: true },
      { id: 'dn_fridge', kind: 'fridge', x: 146, y: 30, w: 62, h: 52, solid: true },
      { id: 'dn_k_prep', kind: 'counter', x: 230, y: 30, w: 150, h: 46, solid: true },
      { id: 'dn_desk', kind: 'desk', x: 564, y: 40, w: 110, h: 52, solid: true },
      { id: 'dn_locker', kind: 'locker', x: 444, y: 34, w: 58, h: 48, solid: true },
    ],
    doors: [
      {
        id: 'dn_door_office',
        x: 510,
        y: 192,
        w: 70,
        h: 16,
        orientation: 'h',
        open: false,
        locked: true,
        requiredPuzzleId: 'dn_keypad',
        label: 'Office Door (Keypad Locked)',
      },
    ],
    containers: [
      {
        id: 'dn_register',
        title: 'Diner Cash Register',
        verb: 'SEARCH',
        x: 180,
        y: 308,
        radius: 58,
        searched: false,
        loot: [
          { itemId: 'battery', qty: 1 },
          { itemId: 'cloth', qty: 1 },
        ],
        noteTitle: 'Frozen Wall Clock Receipt',
        noteLines: [
          'The last order ticket stamped at 03:14 AM has "0314" underlined twice beside the back office keycode.',
        ],
      },
      {
        id: 'dn_walkin_fridge',
        title: 'Diner Pantry Fridge',
        verb: 'SEARCH',
        x: 176,
        y: 96,
        radius: 56,
        searched: false,
        loot: [
          { itemId: 'canned_food', qty: 2 },
          { itemId: 'bottled_water', qty: 2 },
        ],
      },
      {
        id: 'dn_office_desk',
        title: "Manager's Desk Drawer",
        verb: 'SEARCH',
        x: 618,
        y: 112,
        radius: 58,
        searched: false,
        loot: [
          { itemId: 'metal_scrap', qty: 2 },
          { itemId: 'wood', qty: 1 },
          { itemId: 'radio_part', qty: 1 },
        ],
      },
    ],
    hideSpots: [
      {
        id: 'dn_pantry_locker',
        label: 'Staff Storage Locker',
        x: 472,
        y: 94,
        radius: 56,
      },
    ],
    puzzles: [
      {
        id: 'dn_keypad',
        title: 'Back Office Keypad',
        subtitle: 'Time-Locked Door',
        hint: 'Check the frozen bus/diner timestamp (03:14) on the register receipt.',
        code: '0314',
        x: 545,
        y: 224,
        radius: 60,
        solved: false,
        rewardItems: [{ itemId: 'canned_food', qty: 1 }],
        journalTitle: 'Diner Back Office Unlocked',
        journalLines: [
          'The office door clicked open at 03:14. Inside sit salvaged radio coils and scrap metal.',
        ],
      },
    ],
  };

  const police: BuildingInterior = {
    id: 'interior_police',
    name: "Hollow Creek Sheriff's Precinct",
    district: 'Police Station',
    width: 760,
    height: 540,
    spawnX: 380,
    spawnY: 486,
    exitDoor: { x: 380, y: 516, radius: 56 },
    exteriorEntrance: {
      x: 2000,
      y: 642,
      radius: 72,
      label: "Sheriff's Precinct",
    },
    exteriorReturnPos: { x: 2000, y: 668, facingAngle: Math.PI / 2 },
    rooms: [
      { id: 'lobby', name: 'Precinct Lobby', x: 0, y: 240, w: 480, h: 300, floor: 'concrete' },
      { id: 'cells', name: 'Holding Cells', x: 480, y: 0, w: 280, h: 540, floor: 'concrete' },
      { id: 'evidence', name: 'Evidence Room', x: 0, y: 0, w: 480, h: 240, floor: 'tile_checker' },
    ],
    walls: [
      { id: 'pl_n', x: 0, y: 0, w: 760, h: 20, kind: 'wall' },
      { id: 'pl_s1', x: 0, y: 520, w: 330, h: 20, kind: 'wall' },
      { id: 'pl_s2', x: 430, y: 520, w: 330, h: 20, kind: 'wall' },
      { id: 'pl_w', x: 0, y: 0, w: 20, h: 540, kind: 'wall' },
      { id: 'pl_e', x: 740, y: 0, w: 20, h: 540, kind: 'wall' },
      // Evidence Room <-> Lobby (doorway at x: 180..250)
      { id: 'pl_el1', x: 20, y: 232, w: 160, h: 16, kind: 'wall' },
      { id: 'pl_el2', x: 250, y: 232, w: 230, h: 16, kind: 'wall' },
      // Lobby <-> Cells (doorway at y: 340..410)
      { id: 'pl_lc1', x: 472, y: 20, w: 16, h: 320, kind: 'wall' },
      { id: 'pl_lc2', x: 472, y: 410, w: 16, h: 110, kind: 'wall' },
    ],
    furniture: [
      { id: 'pl_desk', kind: 'counter', x: 120, y: 310, w: 220, h: 46, solid: true },
      { id: 'pl_cabinet1', kind: 'cabinet', x: 36, y: 40, w: 120, h: 46, solid: true },
      { id: 'pl_locker1', kind: 'locker', x: 360, y: 40, w: 80, h: 50, solid: true },
      { id: 'pl_cell_bed', kind: 'bed', x: 610, y: 50, w: 110, h: 74, solid: true },
      { id: 'pl_wardrobe', kind: 'locker', x: 630, y: 420, w: 80, h: 54, solid: true },
    ],
    doors: [
      {
        id: 'pl_door_evidence',
        x: 180,
        y: 232,
        w: 70,
        h: 16,
        orientation: 'h',
        open: false,
        locked: true,
        requiredKeyId: 'precinct_key',
        label: 'Evidence Room (Locked)',
      },
    ],
    containers: [
      {
        id: 'pl_front_desk',
        title: 'Dispatch Terminal & Drawers',
        verb: 'SEARCH',
        x: 225,
        y: 372,
        radius: 58,
        searched: false,
        loot: [
          { itemId: 'battery', qty: 1 },
          { itemId: 'bottled_water', qty: 1 },
        ],
        noteTitle: 'Deputy Hayes Audio Transcript',
        noteLines: [
          '"Evacuation failed. The hospital basement keycard is locked inside Evidence. Find the Maple Street safe key first if Evidence is bolted."',
        ],
      },
      {
        id: 'pl_evidence_locker',
        title: 'Secured Evidence Locker',
        verb: 'SEARCH',
        x: 396,
        y: 108,
        radius: 62,
        searched: false,
        loot: [
          { itemId: 'hospital_keycard', qty: 1 },
          { itemId: 'crowbar', qty: 1 },
          { itemId: 'medkit', qty: 1 },
        ],
        noteTitle: 'Confiscated Lab Memo',
        noteLines: [
          'Directorate badge recovered from Dr. Kessler. Emergency hatch override requires the Substation Fuse from General Hospital.',
        ],
      },
      {
        id: 'pl_cell_bench',
        title: 'Holding Cell Locker',
        verb: 'SEARCH',
        x: 650,
        y: 140,
        radius: 58,
        searched: false,
        loot: [
          { itemId: 'metal_scrap', qty: 2 },
          { itemId: 'cloth', qty: 2 },
        ],
      },
    ],
    hideSpots: [
      {
        id: 'pl_cell_hide',
        label: 'Armory Steel Locker',
        x: 660,
        y: 446,
        radius: 58,
      },
    ],
    puzzles: [],
  };

  const hospital: BuildingInterior = {
    id: 'interior_hospital',
    name: 'Hollow Creek General Hospital',
    district: 'Abandoned Hospital',
    width: 780,
    height: 540,
    spawnX: 390,
    spawnY: 486,
    exitDoor: { x: 390, y: 516, radius: 56 },
    exteriorEntrance: {
      x: 3470,
      y: 572,
      radius: 74,
      label: 'General Hospital ER',
    },
    exteriorReturnPos: { x: 3470, y: 598, facingAngle: Math.PI / 2 },
    rooms: [
      { id: 'reception', name: 'ER Reception', x: 0, y: 260, w: 460, h: 280, floor: 'hospital_tile' },
      { id: 'ward', name: 'Quarantine Ward B', x: 460, y: 0, w: 320, h: 540, floor: 'hospital_tile' },
      { id: 'surgeon', name: "Chief Surgeon's Office", x: 0, y: 0, w: 460, h: 260, floor: 'wood' },
    ],
    walls: [
      { id: 'hs_n', x: 0, y: 0, w: 780, h: 20, kind: 'wall' },
      { id: 'hs_s1', x: 0, y: 520, w: 340, h: 20, kind: 'wall' },
      { id: 'hs_s2', x: 440, y: 520, w: 340, h: 20, kind: 'wall' },
      { id: 'hs_w', x: 0, y: 0, w: 20, h: 540, kind: 'wall' },
      { id: 'hs_e', x: 760, y: 0, w: 20, h: 540, kind: 'wall' },
      // Surgeon <-> Reception (doorway at x: 180..250)
      { id: 'hs_sr1', x: 20, y: 252, w: 160, h: 16, kind: 'wall' },
      { id: 'hs_sr2', x: 250, y: 252, w: 210, h: 16, kind: 'wall' },
      // Reception <-> Ward (doorway at y: 340..410)
      { id: 'hs_rw1', x: 452, y: 20, w: 16, h: 320, kind: 'wall' },
      { id: 'hs_rw2', x: 452, y: 410, w: 16, h: 110, kind: 'wall' },
    ],
    furniture: [
      { id: 'hs_triage', kind: 'counter', x: 80, y: 320, w: 180, h: 44, solid: true },
      { id: 'hs_bed1', kind: 'hospital_bed', x: 600, y: 48, w: 120, h: 66, solid: true },
      { id: 'hs_bed2', kind: 'hospital_bed', x: 600, y: 156, w: 120, h: 66, solid: true },
      { id: 'hs_ward_cab', kind: 'cabinet', x: 640, y: 440, w: 96, h: 48, solid: true },
      { id: 'hs_locker', kind: 'locker', x: 490, y: 40, w: 68, h: 52, solid: true },
      { id: 'hs_desk', kind: 'desk', x: 60, y: 44, w: 120, h: 54, solid: true },
      { id: 'hs_safe', kind: 'safe', x: 340, y: 44, w: 58, h: 54, solid: true },
    ],
    doors: [
      {
        id: 'hs_door_surgeon',
        x: 180,
        y: 252,
        w: 70,
        h: 16,
        orientation: 'h',
        open: false,
        locked: true,
        requiredKeyId: 'hospital_keycard',
        label: "Surgeon's Office (Keycard)",
      },
    ],
    containers: [
      {
        id: 'hs_triage_tray',
        title: 'ER Triage Cabinet',
        verb: 'SEARCH',
        x: 164,
        y: 384,
        radius: 60,
        searched: false,
        loot: [
          { itemId: 'bandage', qty: 2 },
          { itemId: 'battery', qty: 1 },
        ],
      },
      {
        id: 'hs_ward_supply',
        title: 'Quarantine Supply Cart',
        verb: 'SEARCH',
        x: 684,
        y: 420,
        radius: 60,
        searched: false,
        loot: [
          { itemId: 'medkit', qty: 1 },
          { itemId: 'bottled_water', qty: 1 },
        ],
        noteTitle: 'Ward B Chart #24-08',
        noteLines: [
          'Patient Intake #2408 — "Chief Surgeon changed his office safe lock to our final ward count: 2408."',
        ],
      },
      {
        id: 'hs_surgeon_desk',
        title: "Chief Surgeon's Desk",
        verb: 'SEARCH',
        x: 120,
        y: 118,
        radius: 58,
        searched: false,
        loot: [
          { itemId: 'radio_part', qty: 1 },
          { itemId: 'canned_food', qty: 1 },
        ],
      },
    ],
    hideSpots: [
      {
        id: 'hs_ward_locker',
        label: 'Quarantine Scrub Locker',
        x: 524,
        y: 108,
        radius: 58,
      },
    ],
    puzzles: [
      {
        id: 'hs_fuse_vault',
        title: 'Directorate Emergency Vault',
        subtitle: '4-Digit Biometric Override',
        hint: 'Check Ward B patient intake chart #24-08.',
        code: '2408',
        x: 368,
        y: 112,
        radius: 64,
        solved: false,
        rewardItems: [
          { itemId: 'fuse', qty: 1 },
          { itemId: 'medkit', qty: 1 },
        ],
        journalTitle: 'Substation Fuse & Hatch Code',
        journalLines: [
          'Recovered the Substation Fuse. A Directorate slip inside reads: "FINAL OVERRIDE FOR FOREST HATCH: 7391 — Check High School chalkboard if forgotten."',
        ],
      },
    ],
  };

  const school: BuildingInterior = {
    id: 'interior_school',
    name: 'Hollow Creek High School',
    district: 'Old School',
    width: 760,
    height: 520,
    spawnX: 380,
    spawnY: 466,
    exitDoor: { x: 380, y: 496, radius: 56 },
    exteriorEntrance: {
      x: 3445,
      y: 2018,
      radius: 74,
      label: 'Hollow Creek High',
    },
    exteriorReturnPos: { x: 3445, y: 2046, facingAngle: Math.PI / 2 },
    rooms: [
      { id: 'hall', name: 'Main Corridor', x: 0, y: 280, w: 760, h: 240, floor: 'tile_checker' },
      { id: 'class4', name: 'Classroom 104', x: 0, y: 0, w: 420, h: 280, floor: 'wood' },
      { id: 'principal', name: "Principal's Office", x: 420, y: 0, w: 340, h: 280, floor: 'carpet' },
    ],
    walls: [
      { id: 'sc_n', x: 0, y: 0, w: 760, h: 20, kind: 'wall' },
      { id: 'sc_s1', x: 0, y: 500, w: 330, h: 20, kind: 'wall' },
      { id: 'sc_s2', x: 430, y: 500, w: 330, h: 20, kind: 'wall' },
      { id: 'sc_w', x: 0, y: 0, w: 20, h: 520, kind: 'wall' },
      { id: 'sc_e', x: 740, y: 0, w: 20, h: 520, kind: 'wall' },
      // Hall <-> Class4 (doorway at x: 180..250)
      { id: 'sc_hc1', x: 20, y: 272, w: 160, h: 16, kind: 'wall' },
      { id: 'sc_hc2', x: 250, y: 272, w: 170, h: 16, kind: 'wall' },
      // Hall <-> Principal (doorway at x: 540..610)
      { id: 'sc_hp1', x: 420, y: 272, w: 120, h: 16, kind: 'wall' },
      { id: 'sc_hp2', x: 610, y: 272, w: 130, h: 16, kind: 'wall' },
      // Class4 <-> Principal wall
      { id: 'sc_cp', x: 412, y: 20, w: 16, h: 256, kind: 'wall' },
    ],
    furniture: [
      { id: 'sc_lockers_l', kind: 'locker', x: 40, y: 310, w: 140, h: 48, solid: true },
      { id: 'sc_lockers_r', kind: 'locker', x: 560, y: 310, w: 140, h: 48, solid: true },
      { id: 'sc_desk1', kind: 'desk', x: 70, y: 74, w: 80, h: 46, solid: true },
      { id: 'sc_desk2', kind: 'desk', x: 200, y: 74, w: 80, h: 46, solid: true },
      { id: 'sc_desk3', kind: 'desk', x: 70, y: 158, w: 80, h: 46, solid: true },
      { id: 'sc_p_desk', kind: 'desk', x: 520, y: 54, w: 130, h: 56, solid: true },
      { id: 'sc_p_shelf', kind: 'bookshelf', x: 676, y: 140, w: 48, h: 100, solid: true },
    ],
    doors: [
      {
        id: 'sc_door_class',
        x: 180,
        y: 272,
        w: 70,
        h: 16,
        orientation: 'h',
        open: false,
        locked: false,
        label: 'Classroom 104 Door',
      },
    ],
    containers: [
      {
        id: 'sc_hall_locker',
        title: 'Student Locker #14',
        verb: 'SEARCH',
        x: 110,
        y: 374,
        radius: 56,
        searched: false,
        loot: [
          { itemId: 'canned_food', qty: 1 },
          { itemId: 'bottled_water', qty: 1 },
          { itemId: 'cloth', qty: 2 },
        ],
      },
      {
        id: 'sc_class_board',
        title: 'Classroom 104 Chalkboard',
        verb: 'SEARCH',
        x: 240,
        y: 136,
        radius: 64,
        searched: false,
        loot: [{ itemId: 'battery', qty: 1 }],
        noteTitle: 'Scrawled Chalk Message',
        noteLines: [
          'Written frantically across the slate: "DO NOT TRUST THE SIRENS — FOREST HATCH OVERRIDE CODE: 7391 — BRING THE FUSE FROM HOSPITAL."',
        ],
      },
      {
        id: 'sc_principal_desk',
        title: "Principal's Filing Cabinet",
        verb: 'SEARCH',
        x: 585,
        y: 132,
        radius: 60,
        searched: false,
        loot: [
          { itemId: 'medkit', qty: 1 },
          { itemId: 'metal_scrap', qty: 2 },
          { itemId: 'wood', qty: 2 },
        ],
      },
    ],
    hideSpots: [
      {
        id: 'sc_hall_hide',
        label: 'Janitor Tall Locker',
        x: 630,
        y: 374,
        radius: 56,
      },
    ],
    puzzles: [],
  };

  return {
    [mapleHouse.id]: mapleHouse,
    [diner.id]: diner,
    [police.id]: police,
    [hospital.id]: hospital,
    [school.id]: school,
  };
}

export function getInteriorColliders(interior: BuildingInterior): AABB[] {
  const boxes: AABB[] = [...interior.walls];
  for (const f of interior.furniture) {
    if (!f.solid) continue;
    boxes.push({
      id: f.id,
      x: f.x,
      y: f.y,
      w: f.w,
      h: f.h,
      kind: 'furniture',
    });
  }
  for (const d of interior.doors) {
    if (!d.open) {
      boxes.push({
        id: d.id,
        x: d.x,
        y: d.y,
        w: d.w,
        h: d.h,
        kind: 'wall',
      });
    }
  }
  return boxes;
}
