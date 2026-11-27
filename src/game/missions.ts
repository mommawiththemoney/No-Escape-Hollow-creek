import {
  InventorySlot,
  MissionState,
  NpcActor,
  NpcDialogueLine,
  SurvivalStats,
} from './types';
import { getItemCount } from './survival';

export const INTRO_DIALOGUE_LINES: NpcDialogueLine[] = [
  {
    speaker: 'Alex Morgan',
    role: 'Outside Bus #14 · 03:14 AM',
    text: 'My head is pounding... Where am I? The last thing I remember is rain on a highway windshield, and now Bus #14 is stalled in empty fog.',
  },
  {
    speaker: 'Alex Morgan',
    role: 'Abandoned Bus Station',
    text: 'My backpack and flashlight fell beside the bus when I stumbled out, and there is a folded sheet of paper lying on the wet asphalt. Better grab my gear and read that note before heading into town.',
  },
];

export const NPCS: NpcActor[] = [
  {
    id: 'npc_mara',
    name: 'Mara Vance',
    role: 'Diner Cook · Last Resident',
    location: 'interior_diner',
    x: 245,
    y: 235,
    radius: 68,
    jacketColor: '#7a4938',
    lines: [
      {
        speaker: 'Mara Vance',
        role: 'Hollow Creek Diner',
        text: 'Keep your voice down! You made it past the bus barricade? Twelve years I have watched those roads loop people right back to the welcome sign.',
      },
      {
        speaker: 'Mara Vance',
        role: 'Hollow Creek Diner',
        text: 'If you want answers about why everyone vanished, search 104 Maple Lane for Deputy Hayes\' safe. His key opens the Sheriff\'s Precinct Evidence Room.',
        choices: [
          {
            label: 'Where can I get supplies?',
            nextIndex: 2,
          },
          {
            label: 'What is in the Dark Forest?',
            nextIndex: 3,
          },
        ],
      },
      {
        speaker: 'Mara Vance',
        role: 'Hollow Creek Diner',
        text: 'Check our kitchen fridge and the cash register — my manager locked the back office with the frozen clock time, 0314. Take these spare strips and water.',
        choices: [
          {
            label: 'Thank you, Mara. Stay safe.',
            rewardItem: { itemId: 'cloth', qty: 2 },
            missionFlag: 'spoke_mara',
          },
        ],
      },
      {
        speaker: 'Mara Vance',
        role: 'Hollow Creek Diner',
        text: 'An underground Directorate bunker sits beneath the pines. Only the Hospital Surgeon\'s vault holds the Substation Fuse, and the High School still has the hatch override code.',
        choices: [
          {
            label: 'I will find the fuse and code.',
            rewardItem: { itemId: 'bottled_water', qty: 1 },
            missionFlag: 'spoke_mara',
          },
        ],
      },
    ],
  },
  {
    id: 'npc_radio_tech',
    name: 'Eli Mercer',
    role: 'Ham Radio Scout · Plaza Gazebo',
    location: 'exterior',
    x: 2022,
    y: 2116,
    radius: 74,
    jacketColor: '#3f5a6e',
    lines: [
      {
        speaker: 'Eli Mercer',
        role: 'Town Square Gazebo',
        text: 'Don\'t shine your flashlight straight at The Watcher in the square. Crouch with [Ctrl] or duck into bushes and wardrobes if one spots you.',
      },
      {
        speaker: 'Eli Mercer',
        role: 'Town Square Gazebo',
        text: 'Here — take this extra battery cell. You can craft bandages from cloth or forge a crowbar from scrap and wood inside your Backpack [Tab].',
        choices: [
          {
            label: 'Got it. Watch the square.',
            rewardItem: { itemId: 'battery', qty: 1 },
            missionFlag: 'spoke_eli',
          },
        ],
      },
    ],
  },
];

export interface MissionEvalInput {
  stats: SurvivalStats;
  inventory: InventorySlot[];
  discoveredIds: Set<string>;
  openedContainerIds: Set<string>;
  solvedPuzzleIds: Set<string>;
  missionFlags: Set<string>;
  visitedDistricts: Set<string>;
  currentInteriorId: string | null;
}

export function buildMissionsState(
  input: MissionEvalInput,
  previouslyCompleted: Set<string>
): {
  missions: MissionState[];
  newlyCompleted: MissionState[];
} {
  const hasBackpack = input.stats.hasBackpack;
  const hasFlashlight = input.stats.hasFlashlight;
  const readBusNote = input.discoveredIds.has('bus_note');
  const enteredTown =
    input.visitedDistricts.has('Residential District') ||
    input.visitedDistricts.has('Town Centre') ||
    input.visitedDistricts.has('Industrial Zone');

  const enteredMaple =
    input.currentInteriorId === 'interior_maple_house' ||
    input.missionFlags.has('entered_interior_maple_house');
  const searchedAnyContainer = input.openedContainerIds.size >= 2;
  const hasMedSupply =
    getItemCount(input.inventory, 'bandage') > 0 ||
    getItemCount(input.inventory, 'medkit') > 0 ||
    input.missionFlags.has('used_or_crafted_med');

  const spokeMara = input.missionFlags.has('spoke_mara');
  const hasEvidence =
    getItemCount(input.inventory, 'hospital_keycard') > 0 ||
    input.openedContainerIds.has('pl_evidence_locker');
  const hasFuse =
    getItemCount(input.inventory, 'fuse') > 0 ||
    input.solvedPuzzleIds.has('hs_fuse_vault');

  const knowsHatchCode =
    input.openedContainerIds.has('sc_class_board') ||
    input.solvedPuzzleIds.has('hs_fuse_vault');
  const reachedForest = input.visitedDistricts.has('Dark Forest');
  const unlockedHatch = input.solvedPuzzleIds.has('forest_hatch_puzzle');

  const missions: MissionState[] = [
    {
      id: 'm1_awakening',
      title: 'Wake Up in Hollow Creek',
      summary: 'Gather your gear at the Abandoned Bus Station and enter the town.',
      rewardText: 'Reward: +25 Max Stamina & AA Battery Cell',
      completed:
        previouslyCompleted.has('m1_awakening') ||
        (hasBackpack && hasFlashlight && readBusNote && enteredTown),
      steps: [
        { id: 'm1_backpack', label: 'Pick up your Backpack beside Bus #14', completed: hasBackpack },
        { id: 'm1_flashlight', label: 'Collect the Transit Flashlight', completed: hasFlashlight },
        { id: 'm1_note', label: 'Read the Crumpled Warning Note', completed: readBusNote },
        { id: 'm1_town', label: 'Follow Highway 9 past the sign into town', completed: enteredTown },
      ],
    },
    {
      id: 'm2_shelter',
      title: 'Scavenge & Survive',
      summary: 'Search houses in Residential District for keys, food, and tools.',
      rewardText: 'Reward: +15 Max Health & Timber Plank',
      completed:
        previouslyCompleted.has('m2_shelter') ||
        (enteredMaple && searchedAnyContainer && hasMedSupply),
      steps: [
        { id: 'm2_house', label: 'Enter 104 Maple Lane House', completed: enteredMaple },
        { id: 'm2_search', label: 'Search drawers or cabinets (2+)', completed: searchedAnyContainer },
        { id: 'm2_meds', label: 'Obtain or craft a Bandage / Medkit', completed: hasMedSupply },
      ],
    },
    {
      id: 'm3_signal',
      title: 'Signal in the Static',
      summary: 'Talk to survivors in Town Centre and trace the Directorate keycard.',
      rewardText: 'Reward: +20 Battery Reserve & Metal Scrap',
      completed:
        previouslyCompleted.has('m3_signal') ||
        (spokeMara && hasEvidence && hasFuse),
      steps: [
        { id: 'm3_mara', label: 'Speak with Mara Vance inside the Diner', completed: spokeMara },
        { id: 'm3_precinct', label: 'Recover Hospital Keycard from Precinct Evidence', completed: hasEvidence },
        { id: 'm3_hospital', label: 'Retrieve Substation Fuse from General Hospital', completed: hasFuse },
      ],
    },
    {
      id: 'm4_underground',
      title: 'Beneath Hollow Creek',
      summary: 'Decode the Dark Forest hatch override and unlock the facility.',
      rewardText: 'Chapter 1 Escape Unlocked',
      completed:
        previouslyCompleted.has('m4_underground') ||
        (knowsHatchCode && reachedForest && unlockedHatch),
      steps: [
        { id: 'm4_code', label: 'Find Hatch Override Code (Hospital / High School)', completed: knowsHatchCode },
        { id: 'm4_forest', label: 'Travel to the Dark Forest clearing', completed: reachedForest },
        { id: 'm4_hatch', label: 'Unlock the Sealed Underground Hatch', completed: unlockedHatch },
      ],
    },
  ];

  const newlyCompleted = missions.filter(
    (m) => m.completed && !previouslyCompleted.has(m.id)
  );

  return { missions, newlyCompleted };
}
