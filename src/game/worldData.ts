import { AABB, DistrictZone, Interactable, TileKind, WorldProp } from './types';

export const TILE_SIZE = 48;
export const MAP_COLS = 96;
export const MAP_ROWS = 76;
export const WORLD_WIDTH = MAP_COLS * TILE_SIZE; // 4608
export const WORLD_HEIGHT = MAP_ROWS * TILE_SIZE; // 3648

export const PLAYER_SPAWN = {
  x: 780,
  y: 2860,
  facingAngle: -Math.PI / 4,
};

export const DISTRICTS: DistrictZone[] = [
  {
    id: 'bus_station',
    name: 'Abandoned Bus Station',
    x: 0,
    y: 2496,
    w: 1488,
    h: 1152,
    color: '#c98a4b',
  },
  {
    id: 'residential',
    name: 'Residential District',
    x: 0,
    y: 768,
    w: 1632,
    h: 1728,
    color: '#5a80a6',
  },
  {
    id: 'police_station',
    name: 'Police Station',
    x: 1488,
    y: 0,
    w: 1392,
    h: 1392,
    color: '#4e6c94',
  },
  {
    id: 'hospital',
    name: 'Abandoned Hospital',
    x: 2880,
    y: 0,
    w: 1728,
    h: 1392,
    color: '#b84c4c',
  },
  {
    id: 'town_centre',
    name: 'Town Centre',
    x: 1632,
    y: 1392,
    w: 1392,
    h: 1200,
    color: '#d49b4b',
  },
  {
    id: 'old_school',
    name: 'Old School',
    x: 3024,
    y: 1392,
    w: 1584,
    h: 1200,
    color: '#c7a446',
  },
  {
    id: 'industrial',
    name: 'Industrial Zone',
    x: 1488,
    y: 2592,
    w: 1584,
    h: 1056,
    color: '#7a8694',
  },
  {
    id: 'dark_forest',
    name: 'Dark Forest',
    x: 3072,
    y: 2544,
    w: 1536,
    h: 1104,
    color: '#3f7354',
  },
];

export function getDistrictAt(x: number, y: number): string {
  for (const d of DISTRICTS) {
    if (x >= d.x && x <= d.x + d.w && y >= d.y && y <= d.y + d.h) {
      return d.name;
    }
  }
  return 'Hollow Creek';
}

export function createTileGrid(): TileKind[][] {
  const grid: TileKind[][] = [];
  for (let r = 0; r < MAP_ROWS; r++) {
    const row: TileKind[] = [];
    for (let c = 0; c < MAP_COLS; c++) {
      row.push('grass');
    }
    grid.push(row);
  }

  const fillRect = (
    c0: number,
    r0: number,
    c1: number,
    r1: number,
    kind: TileKind
  ) => {
    for (let r = Math.max(0, r0); r <= Math.min(MAP_ROWS - 1, r1); r++) {
      for (let c = Math.max(0, c0); c <= Math.min(MAP_COLS - 1, c1); c++) {
        grid[r][c] = kind;
      }
    }
  };

  // Outer dense forest floor perimeter
  fillRect(0, 0, 95, 3, 'forest_floor');
  fillRect(0, 72, 95, 75, 'forest_floor');
  fillRect(0, 0, 3, 75, 'forest_floor');
  fillRect(91, 0, 95, 75, 'forest_floor');
  // Southeast Dark Forest district
  fillRect(65, 55, 95, 75, 'forest_floor');

  // Gravel shoulders along major avenues
  fillRect(0, 53, 72, 57, 'gravel');
  fillRect(4, 32, 66, 36, 'gravel');
  fillRect(27, 21, 86, 25, 'gravel');
  fillRect(27, 18, 31, 58, 'gravel');
  fillRect(46, 15, 50, 62, 'gravel');
  fillRect(61, 18, 65, 58, 'gravel');

  // Sidewalks bordering avenues
  fillRect(4, 53, 70, 57, 'sidewalk');
  fillRect(5, 32, 65, 36, 'sidewalk');
  fillRect(28, 21, 84, 25, 'sidewalk');
  fillRect(27, 19, 31, 57, 'sidewalk');
  fillRect(46, 16, 50, 61, 'sidewalk');
  fillRect(61, 19, 65, 57, 'sidewalk');

  // Main Asphalt Roads
  fillRect(0, 54, 70, 56, 'road'); // Highway 9 / Elm Avenue
  fillRect(5, 33, 64, 35, 'road'); // Main Street
  fillRect(28, 22, 84, 24, 'road'); // North Hospital Ave
  fillRect(28, 20, 30, 56, 'road'); // North Creek Road
  fillRect(47, 16, 49, 60, 'road'); // Center Avenue
  fillRect(62, 20, 64, 56, 'road'); // East School/Hospital Road

  // Bus Station Asphalt Parking Bay
  fillRect(9, 56, 23, 64, 'road');

  // Residential District Maple Lane side-street & driveways
  fillRect(6, 41, 27, 42, 'road');
  fillRect(10, 25, 13, 32, 'dirt');
  fillRect(19, 25, 22, 32, 'dirt');
  fillRect(11, 43, 14, 49, 'gravel');
  fillRect(20, 43, 23, 49, 'gravel');

  // Town Centre Cobblestone Plaza & Shop Aprons
  fillRect(36, 36, 58, 49, 'sidewalk');
  fillRect(40, 38, 55, 47, 'plaza');

  // Police Station Concrete Lot
  fillRect(34, 8, 55, 20, 'concrete');
  fillRect(44, 15, 52, 22, 'road');

  // Abandoned Hospital Concrete Courtyard & Helipad Pad
  fillRect(66, 6, 88, 21, 'concrete');
  fillRect(78, 12, 86, 21, 'road');

  // Old School Courtyard, Bus Loop & Basketball Court
  fillRect(66, 36, 88, 50, 'concrete');
  fillRect(66, 46, 80, 51, 'road');
  fillRect(79, 37, 87, 44, 'court');

  // Industrial Zone Yard
  fillRect(35, 58, 60, 70, 'concrete');
  fillRect(35, 57, 46, 60, 'gravel');

  // Winding dirt trails in Dark Forest leading to Underground Hatch
  fillRect(65, 56, 70, 58, 'dirt');
  fillRect(69, 57, 73, 63, 'dirt');
  fillRect(72, 62, 82, 64, 'dirt');
  fillRect(77, 64, 80, 69, 'dirt');

  return grid;
}

export const WORLD_PROPS: WorldProp[] = [
  // =========================================================================
  // 1. ABANDONED BUS STATION (SW)
  // =========================================================================
  { id: 'bus_14', kind: 'bus', x: 520, y: 2770, w: 216, h: 90, solid: true },
  { id: 'bus_backpack_prop', kind: 'backpack_prop', x: 702, y: 2884, w: 28, h: 28, solid: false },
  { id: 'bus_flashlight_prop', kind: 'flashlight_prop', x: 806, y: 2766, w: 28, h: 18, solid: false },
  { id: 'note_on_asphalt', kind: 'note_prop', x: 848, y: 2812, w: 26, h: 26, solid: false },
  { id: 'station_crate_prop', kind: 'crate', x: 468, y: 2746, w: 38, h: 38, solid: true },
  { id: 'bus_shelter', kind: 'bus_shelter', x: 544, y: 2498, w: 174, h: 72, solid: true },
  { id: 'shelter_bench', kind: 'bench', x: 590, y: 2576, w: 78, h: 24, solid: true },
  { id: 'station_trash', kind: 'trash_bin', x: 734, y: 2536, w: 28, h: 28, solid: true },
  { id: 'payphone_booth', kind: 'payphone', x: 916, y: 2486, w: 46, h: 50, solid: true },
  { id: 'welcome_sign', kind: 'welcome_sign', x: 1220, y: 2494, w: 102, h: 42, solid: true, label: 'HOLLOW CREEK' },
  { id: 'car_station', kind: 'car_wreck', x: 420, y: 2940, w: 114, h: 58, solid: true },
  { id: 'car_station_2', kind: 'car_blue', x: 960, y: 2930, w: 114, h: 58, solid: true },
  { id: 'station_dumpster', kind: 'dumpster', x: 400, y: 2750, w: 68, h: 44, solid: true },
  { id: 'west_road_barrier', kind: 'road_barrier', x: 184, y: 2594, w: 28, h: 140, solid: true },
  { id: 'west_cone_1', kind: 'traffic_cone', x: 236, y: 2610, w: 22, h: 22, solid: false },
  { id: 'west_cone_2', kind: 'traffic_cone', x: 236, y: 2700, w: 22, h: 22, solid: false },

  // =========================================================================
  // 2. RESIDENTIAL DISTRICT (W / NW)
  // =========================================================================
  // House 1: Miller Residence (North of Maple Lane)
  { id: 'house_miller', kind: 'house_blue', x: 420, y: 1280, w: 260, h: 186, solid: true },
  { id: 'miller_shed', kind: 'shed', x: 270, y: 1290, w: 112, h: 98, solid: true },
  { id: 'miller_mailbox', kind: 'mailbox', x: 690, y: 1500, w: 24, h: 24, solid: true },
  { id: 'fence_miller_1', kind: 'fence_wood_h', x: 260, y: 1510, w: 230, h: 14, solid: true },
  { id: 'fence_miller_2', kind: 'fence_wood_h', x: 586, y: 1510, w: 94, h: 14, solid: true },

  // House 2: Elm House (East of Miller Residence)
  { id: 'house_elm', kind: 'house_ochre', x: 860, y: 1290, w: 248, h: 180, solid: true },
  { id: 'elm_crate', kind: 'crate', x: 830, y: 1490, w: 40, h: 38, solid: true },
  { id: 'car_elm_driveway', kind: 'pickup_rust', x: 1140, y: 1380, w: 120, h: 60, solid: true },

  // House 3: Moss-Roofed Cottage (South of Maple Lane)
  { id: 'house_green_1', kind: 'house_green', x: 420, y: 2060, w: 244, h: 176, solid: true },
  { id: 'fence_green_1', kind: 'fence_wood_h', x: 380, y: 2030, w: 110, h: 14, solid: true },
  { id: 'fence_green_2', kind: 'fence_wood_h', x: 580, y: 2030, w: 110, h: 14, solid: true },
  { id: 'car_green_drive', kind: 'car_white', x: 700, y: 2120, w: 114, h: 58, solid: true },

  // House 4: Boarded Victorian (Maple Lane West)
  { id: 'house_victorian_1', kind: 'house_victorian', x: 920, y: 2060, w: 266, h: 190, solid: true },
  { id: 'vic_mailbox', kind: 'mailbox', x: 1210, y: 2046, w: 24, h: 24, solid: true },
  { id: 'res_car_road', kind: 'car_wreck', x: 740, y: 1620, w: 114, h: 58, solid: true },

  // =========================================================================
  // 3. TOWN CENTRE (CENTRAL)
  // =========================================================================
  // North side of Main Street (Shops)
  { id: 'shop_diner', kind: 'shop_diner', x: 1700, y: 1340, w: 236, h: 168, solid: true },
  { id: 'diner_patio_1', kind: 'patio_table', x: 1720, y: 1524, w: 42, h: 42, solid: true },
  { id: 'diner_patio_2', kind: 'patio_table', x: 1784, y: 1524, w: 42, h: 42, solid: true },
  { id: 'shop_hardware', kind: 'shop_hardware', x: 1990, y: 1340, w: 224, h: 168, solid: true },
  { id: 'hardware_pallet', kind: 'pallet', x: 1954, y: 1470, w: 32, h: 44, solid: true },
  { id: 'shop_pharmacy', kind: 'shop_pharmacy', x: 2440, y: 1340, w: 224, h: 168, solid: true },
  { id: 'pharmacy_van', kind: 'car_white', x: 2684, y: 1410, w: 114, h: 58, solid: true },
  { id: 'shop_cinema', kind: 'shop_cinema', x: 2700, y: 1760, w: 224, h: 176, solid: true },

  // Town Square Cobblestone Plaza
  { id: 'town_fountain', kind: 'fountain', x: 2200, y: 1990, w: 128, h: 128, solid: true },
  { id: 'town_gazebo', kind: 'gazebo', x: 1960, y: 1960, w: 124, h: 124, solid: true },
  { id: 'plaza_bench_1', kind: 'bench', x: 2120, y: 1870, w: 78, h: 24, solid: true },
  { id: 'plaza_bench_2', kind: 'bench', x: 2380, y: 1870, w: 78, h: 24, solid: true },
  { id: 'plaza_bench_3', kind: 'bench', x: 2120, y: 2170, w: 78, h: 24, solid: true },
  { id: 'plaza_hydrant', kind: 'hydrant', x: 1660, y: 1720, w: 24, h: 24, solid: true },
  { id: 'town_car_1', kind: 'car_blue', x: 1780, y: 1620, w: 114, h: 58, solid: true },
  { id: 'town_dumpster', kind: 'dumpster', x: 2620, y: 1760, w: 68, h: 44, solid: true },

  // =========================================================================
  // 4. POLICE STATION (NORTH-CENTRAL)
  // =========================================================================
  { id: 'police_hq', kind: 'police_station', x: 1840, y: 420, w: 320, h: 210, solid: true },
  { id: 'police_car_1', kind: 'police_car', x: 2210, y: 520, w: 116, h: 58, solid: true },
  { id: 'police_car_2', kind: 'police_car', x: 2420, y: 520, w: 116, h: 58, solid: true },
  { id: 'police_barrier', kind: 'road_barrier', x: 2230, y: 690, w: 132, h: 26, solid: true },
  { id: 'police_dumpster', kind: 'dumpster', x: 1710, y: 430, w: 68, h: 44, solid: true },
  { id: 'fence_police_n', kind: 'fence_chain_h', x: 1640, y: 360, w: 980, h: 12, solid: true },
  { id: 'fence_police_w', kind: 'fence_chain_v', x: 1640, y: 360, w: 12, h: 540, solid: true },
  { id: 'fence_police_e', kind: 'fence_chain_v', x: 2608, y: 360, w: 12, h: 540, solid: true },

  // =========================================================================
  // 5. ABANDONED HOSPITAL (NORTHEAST)
  // =========================================================================
  { id: 'hospital_main', kind: 'hospital', x: 3260, y: 320, w: 420, h: 240, solid: true },
  { id: 'hospital_ambulance', kind: 'ambulance', x: 3410, y: 640, w: 128, h: 64, solid: true },
  { id: 'hospital_car', kind: 'car_white', x: 3240, y: 760, w: 114, h: 58, solid: true },
  { id: 'hospital_barrier_1', kind: 'road_barrier', x: 3740, y: 880, w: 124, h: 26, solid: true },
  { id: 'hospital_cone_1', kind: 'traffic_cone', x: 3600, y: 650, w: 22, h: 22, solid: false },
  { id: 'hospital_cone_2', kind: 'traffic_cone', x: 3600, y: 710, w: 22, h: 22, solid: false },
  { id: 'hospital_dumpster', kind: 'dumpster', x: 3170, y: 350, w: 68, h: 44, solid: true },
  { id: 'fence_hosp_n', kind: 'fence_chain_h', x: 3150, y: 260, w: 1020, h: 12, solid: true },
  { id: 'fence_hosp_e', kind: 'fence_chain_v', x: 4160, y: 260, w: 12, h: 680, solid: true },

  // =========================================================================
  // 6. OLD SCHOOL (EAST-CENTRAL)
  // =========================================================================
  { id: 'school_main', kind: 'school', x: 3240, y: 1780, w: 410, h: 226, solid: true },
  { id: 'school_bus_07', kind: 'school_bus', x: 3320, y: 2260, w: 216, h: 90, solid: true },
  { id: 'school_bench_1', kind: 'bench', x: 3740, y: 2130, w: 96, h: 24, solid: true },
  { id: 'school_bench_2', kind: 'bench', x: 3920, y: 2130, w: 96, h: 24, solid: true },
  { id: 'school_trash', kind: 'trash_bin', x: 3670, y: 1990, w: 28, h: 28, solid: true },
  { id: 'school_dumpster', kind: 'dumpster', x: 3180, y: 2040, w: 68, h: 44, solid: true },
  { id: 'fence_school_e', kind: 'fence_chain_v', x: 4220, y: 1720, w: 12, h: 680, solid: true },
  { id: 'fence_school_s', kind: 'fence_chain_h', x: 3820, y: 2390, w: 412, h: 12, solid: true },

  // =========================================================================
  // 7. INDUSTRIAL ZONE (SOUTH-CENTRAL)
  // =========================================================================
  { id: 'ind_warehouse', kind: 'warehouse', x: 1840, y: 2940, w: 360, h: 210, solid: true },
  { id: 'ind_silo_1', kind: 'silo', x: 2480, y: 2890, w: 112, h: 112, solid: true },
  { id: 'ind_silo_2', kind: 'silo', x: 2630, y: 2890, w: 112, h: 112, solid: true },
  { id: 'ind_container_1', kind: 'container_red', x: 2460, y: 3120, w: 154, h: 68, solid: true },
  { id: 'ind_container_2', kind: 'container_blue', x: 2640, y: 3120, w: 154, h: 68, solid: true },
  { id: 'ind_pickup', kind: 'pickup_rust', x: 1700, y: 3180, w: 120, h: 60, solid: true },
  { id: 'ind_barrel_1', kind: 'barrel', x: 2230, y: 2950, w: 34, h: 34, solid: true },
  { id: 'ind_barrel_2', kind: 'barrel', x: 2272, y: 2954, w: 34, h: 34, solid: true },
  { id: 'ind_barrel_3', kind: 'barrel', x: 2250, y: 2992, w: 34, h: 34, solid: true },
  { id: 'ind_pallet_1', kind: 'pallet', x: 2220, y: 3100, w: 56, h: 48, solid: true },
  { id: 'ind_crate_1', kind: 'crate', x: 2290, y: 3106, w: 42, h: 42, solid: true },
  { id: 'fence_ind_s', kind: 'fence_chain_h', x: 1680, y: 3340, w: 1160, h: 12, solid: true },
  { id: 'fence_ind_w', kind: 'fence_chain_v', x: 1680, y: 2800, w: 12, h: 540, solid: true },

  // =========================================================================
  // 8. DARK FOREST & UNDERGROUND HATCH (SOUTHEAST)
  // =========================================================================
  { id: 'forest_shed', kind: 'shed', x: 3440, y: 2960, w: 118, h: 102, solid: true },
  { id: 'hollow_stump', kind: 'hollow_stump', x: 3360, y: 3160, w: 54, h: 48, solid: true },
  { id: 'underground_hatch', kind: 'underground_hatch', x: 3760, y: 3200, w: 74, h: 64, solid: true },
  { id: 'forest_log_1', kind: 'fallen_log', x: 3610, y: 2880, w: 108, h: 30, solid: true },
  { id: 'forest_log_2', kind: 'fallen_log', x: 3920, y: 3120, w: 96, h: 28, solid: true },
  { id: 'forest_boulder_1', kind: 'boulder', x: 3290, y: 2840, w: 62, h: 52, solid: true },
  { id: 'forest_boulder_2', kind: 'boulder', x: 3940, y: 3310, w: 70, h: 56, solid: true },

  // =========================================================================
  // STREETLAMPS ACROSS HOLLOW CREEK
  // =========================================================================
  { id: 'lamp_bs_1', kind: 'lamp_post', x: 470, y: 2540, w: 24, h: 24, solid: true, lit: true },
  { id: 'lamp_bs_2', kind: 'lamp_post', x: 860, y: 2540, w: 24, h: 24, solid: true, lit: true },
  { id: 'lamp_bs_3', kind: 'lamp_post', x: 1280, y: 2540, w: 24, h: 24, solid: true, lit: true },
  { id: 'lamp_res_1', kind: 'lamp_post', x: 1300, y: 2150, w: 24, h: 24, solid: true, lit: true },
  { id: 'lamp_res_2', kind: 'lamp_post', x: 1300, y: 1740, w: 24, h: 24, solid: true, lit: false },
  { id: 'lamp_res_3', kind: 'lamp_post', x: 640, y: 1740, w: 24, h: 24, solid: true, lit: true },
  { id: 'lamp_tc_1', kind: 'lamp_post', x: 1860, y: 1740, w: 24, h: 24, solid: true, lit: true },
  { id: 'lamp_tc_2', kind: 'lamp_post', x: 2210, y: 1740, w: 24, h: 24, solid: true, lit: true },
  { id: 'lamp_tc_3', kind: 'lamp_post', x: 2560, y: 1740, w: 24, h: 24, solid: true, lit: false },
  { id: 'lamp_tc_4', kind: 'lamp_post', x: 2140, y: 2240, w: 24, h: 24, solid: true, lit: true },
  { id: 'lamp_pol_1', kind: 'lamp_post', x: 2210, y: 1000, w: 24, h: 24, solid: true, lit: true },
  { id: 'lamp_hosp_1', kind: 'lamp_post', x: 3120, y: 1000, w: 24, h: 24, solid: true, lit: true },
  { id: 'lamp_sch_1', kind: 'lamp_post', x: 3120, y: 1740, w: 24, h: 24, solid: true, lit: true },
  { id: 'lamp_ind_1', kind: 'lamp_post', x: 2210, y: 2740, w: 24, h: 24, solid: true, lit: true },

  // =========================================================================
  // FOREST BORDER & TOWN TREES / BUSHES
  // =========================================================================
  // South & West Perimeter
  { id: 'tr_1', kind: 'pine_tree', x: 80, y: 240, w: 80, h: 80, solid: true },
  { id: 'tr_2', kind: 'pine_tree', x: 90, y: 580, w: 82, h: 82, solid: true },
  { id: 'tr_3', kind: 'oak_tree', x: 110, y: 960, w: 84, h: 84, solid: true },
  { id: 'tr_4', kind: 'pine_tree', x: 80, y: 1360, w: 80, h: 80, solid: true },
  { id: 'tr_5', kind: 'dead_tree', x: 100, y: 1780, w: 72, h: 72, solid: true },
  { id: 'tr_6', kind: 'pine_tree', x: 90, y: 2180, w: 80, h: 80, solid: true },
  { id: 'tr_7', kind: 'pine_tree', x: 90, y: 2920, w: 80, h: 80, solid: true },
  { id: 'tr_8', kind: 'dead_tree', x: 160, y: 3220, w: 72, h: 72, solid: true },
  { id: 'tr_9', kind: 'pine_tree', x: 380, y: 3340, w: 82, h: 82, solid: true },
  { id: 'tr_10', kind: 'oak_tree', x: 640, y: 3320, w: 84, h: 84, solid: true },
  { id: 'tr_11', kind: 'pine_tree', x: 920, y: 3340, w: 82, h: 82, solid: true },
  { id: 'tr_12', kind: 'pine_tree', x: 1200, y: 3320, w: 80, h: 80, solid: true },
  // North Perimeter
  { id: 'tr_n1', kind: 'pine_tree', x: 420, y: 120, w: 82, h: 82, solid: true },
  { id: 'tr_n2', kind: 'oak_tree', x: 760, y: 160, w: 84, h: 84, solid: true },
  { id: 'tr_n3', kind: 'pine_tree', x: 1120, y: 140, w: 80, h: 80, solid: true },
  { id: 'tr_n4', kind: 'dead_tree', x: 1420, y: 160, w: 74, h: 74, solid: true },
  { id: 'tr_n5', kind: 'pine_tree', x: 1860, y: 110, w: 82, h: 82, solid: true },
  { id: 'tr_n6', kind: 'pine_tree', x: 2420, y: 120, w: 82, h: 82, solid: true },
  { id: 'tr_n7', kind: 'oak_tree', x: 2880, y: 150, w: 84, h: 84, solid: true },
  { id: 'tr_n8', kind: 'pine_tree', x: 3440, y: 110, w: 82, h: 82, solid: true },
  { id: 'tr_n9', kind: 'pine_tree', x: 4040, y: 120, w: 82, h: 82, solid: true },
  // Town Park / Yards
  { id: 'tr_t1', kind: 'oak_tree', x: 1680, y: 2010, w: 84, h: 84, solid: true },
  { id: 'tr_t2', kind: 'oak_tree', x: 2470, y: 2040, w: 84, h: 84, solid: true },
  { id: 'tr_t3', kind: 'pine_tree', x: 740, y: 920, w: 80, h: 80, solid: true },
  { id: 'tr_t4', kind: 'oak_tree', x: 1140, y: 960, w: 84, h: 84, solid: true },
  { id: 'tr_t5', kind: 'dead_tree', x: 3920, y: 1240, w: 74, h: 74, solid: true },
  // Dark Forest Dense Cluster (framing the trail & clearing)
  { id: 'tr_df1', kind: 'pine_tree', x: 3180, y: 2740, w: 82, h: 82, solid: true },
  { id: 'tr_df2', kind: 'pine_tree', x: 3560, y: 2700, w: 82, h: 82, solid: true },
  { id: 'tr_df3', kind: 'dead_tree', x: 3840, y: 2780, w: 74, h: 74, solid: true },
  { id: 'tr_df4', kind: 'pine_tree', x: 4120, y: 2760, w: 84, h: 84, solid: true },
  { id: 'tr_df5', kind: 'pine_tree', x: 4320, y: 2980, w: 84, h: 84, solid: true },
  { id: 'tr_df6', kind: 'oak_tree', x: 4180, y: 3240, w: 86, h: 86, solid: true },
  { id: 'tr_df7', kind: 'pine_tree', x: 3520, y: 3380, w: 84, h: 84, solid: true },
  { id: 'tr_df8', kind: 'dead_tree', x: 3210, y: 3340, w: 74, h: 74, solid: true },
  { id: 'tr_df9', kind: 'pine_tree', x: 4360, y: 3420, w: 84, h: 84, solid: true },
  { id: 'tr_df10', kind: 'pine_tree', x: 4360, y: 1960, w: 84, h: 84, solid: true },
  { id: 'tr_df11', kind: 'pine_tree', x: 4360, y: 1380, w: 84, h: 84, solid: true },
  { id: 'tr_df12', kind: 'pine_tree', x: 4360, y: 740, w: 84, h: 84, solid: true },

  // Yard & Road Bushes
  { id: 'b1', kind: 'bush', x: 380, y: 1460, w: 40, h: 32, solid: false },
  { id: 'b2', kind: 'bush', x: 1120, y: 1460, w: 40, h: 32, solid: false },
  { id: 'b3', kind: 'bush', x: 1890, y: 2140, w: 44, h: 34, solid: false },
  { id: 'b4', kind: 'bush', x: 2340, y: 2140, w: 44, h: 34, solid: false },
  { id: 'b5', kind: 'bush', x: 3680, y: 3120, w: 44, h: 34, solid: false },
  { id: 'b6', kind: 'bush', x: 3840, y: 3310, w: 44, h: 34, solid: false },
];

export function buildWorldColliders(): AABB[] {
  const boxes: AABB[] = [];
  for (const prop of WORLD_PROPS) {
    if (!prop.solid) continue;

    if (
      prop.kind === 'pine_tree' ||
      prop.kind === 'oak_tree' ||
      prop.kind === 'dead_tree'
    ) {
      boxes.push({
        id: prop.id,
        x: prop.x + prop.w * 0.28,
        y: prop.y + prop.h * 0.42,
        w: prop.w * 0.44,
        h: prop.h * 0.4,
        kind: 'tree',
      });
    } else if (prop.kind === 'lamp_post') {
      boxes.push({
        id: prop.id,
        x: prop.x + 5,
        y: prop.y + 6,
        w: 14,
        h: 14,
        kind: 'prop',
      });
    } else {
      boxes.push({
        id: prop.id,
        x: prop.x,
        y: prop.y,
        w: prop.w,
        h: prop.h,
        kind:
          prop.kind === 'bus' || prop.kind === 'school_bus'
            ? 'bus'
            : prop.kind.startsWith('fence')
              ? 'fence'
              : prop.kind.startsWith('house') ||
                  prop.kind.startsWith('shop') ||
                  prop.kind === 'police_station' ||
                  prop.kind === 'hospital' ||
                  prop.kind === 'school' ||
                  prop.kind === 'warehouse' ||
                  prop.kind === 'shed'
                ? 'building'
                : 'prop',
      });
    }
  }
  return boxes;
}

export interface WorldPickup {
  id: string;
  propId?: string;
  title: string;
  verb: 'PICK UP' | 'SEARCH';
  x: number;
  y: number;
  radius: number;
  items: Array<{ itemId: import('./types').ItemId; qty: number }>;
  unlocks?: 'backpack' | 'flashlight';
  message: string;
}

export const WORLD_PICKUPS: WorldPickup[] = [
  {
    id: 'pickup_bus_backpack',
    propId: 'bus_backpack_prop',
    title: 'Alex\'s Travel Backpack',
    verb: 'PICK UP',
    x: 716,
    y: 2898,
    radius: 68,
    unlocks: 'backpack',
    items: [
      { itemId: 'canned_food', qty: 1 },
      { itemId: 'bottled_water', qty: 1 },
      { itemId: 'cloth', qty: 2 },
    ],
    message: 'Backpack recovered! Inventory capacity expanded to 16 slots (+Food, Water, Cloth).',
  },
  {
    id: 'pickup_bus_flashlight',
    propId: 'bus_flashlight_prop',
    title: 'Transit Flashlight',
    verb: 'PICK UP',
    x: 820,
    y: 2775,
    radius: 68,
    unlocks: 'flashlight',
    items: [
      { itemId: 'flashlight', qty: 1 },
      { itemId: 'battery', qty: 1 },
    ],
    message: 'Transit Flashlight equipped! Press [F] or tap Light to pierce the darkness.',
  },
  {
    id: 'pickup_station_crate',
    title: 'Roadside Utility Crate',
    verb: 'SEARCH',
    x: 487,
    y: 2765,
    radius: 70,
    items: [
      { itemId: 'wood', qty: 2 },
      { itemId: 'metal_scrap', qty: 2 },
    ],
    message: 'Found Timber Planks and Metal Scrap inside the crate.',
  },
  {
    id: 'pickup_industrial_crate',
    title: 'Substation Salvage Crate',
    verb: 'SEARCH',
    x: 2311,
    y: 3127,
    radius: 74,
    items: [
      { itemId: 'metal_scrap', qty: 2 },
      { itemId: 'radio_part', qty: 1 },
      { itemId: 'battery', qty: 1 },
    ],
    message: 'Salvaged Radio Coils, Metal Scrap, and an AA Battery Cell.',
  },
];

export const FOREST_HATCH_PUZZLE = {
  id: 'forest_hatch_puzzle',
  title: 'Sealed Underground Hatch',
  subtitle: 'Directorate Steel Bulkhead',
  hint: 'Requires Substation Fuse (Hospital Vault) and the 4-digit override code from High School / Hospital (7391).',
  code: '7391',
  requiresFuse: true,
  x: 3797,
  y: 3232,
  radius: 82,
};

export const WORLD_INTERACTABLES: Interactable[] = [
  {
    id: 'bus_note',
    title: 'Crumpled Warning Note',
    subtitle: 'Found outside Bus #14',
    district: 'Abandoned Bus Station',
    promptVerb: 'READ Note',
    actionVerb: 'READ',
    x: 861,
    y: 2825,
    radius: 68,
    category: 'note',
    soundCue: 'paper',
    grantsItem: 'bus_note_doc',
    grantsQty: 1,
    body: [
      '"If you are reading this, don\'t trust the town. Don\'t follow the lights. And whatever you do, don\'t enter the underground."',
      'The ink is smudged across the corner, as if whoever dropped it ran toward Main Street.',
    ],
    footnote: 'Evidence logged — Bus Station',
  },
  {
    id: 'bus_door',
    title: 'Hollow Creek Bus #14',
    subtitle: 'Route 9 · Last Service Oct 14, 2014',
    district: 'Abandoned Bus Station',
    promptVerb: 'Inspect Bus',
    x: 685,
    y: 2868,
    radius: 76,
    category: 'object',
    soundCue: 'metal',
    body: [
      'The folding doors hang crooked on rusted hinges. Inside, the dashboard clock is frozen at 03:14 AM.',
      'Your backpack was resting on the back seat, yet you have no memory of boarding this bus.',
    ],
  },
  {
    id: 'station_payphone',
    title: 'Transit Payphone',
    subtitle: 'Hollow Creek Bus Depot',
    district: 'Abandoned Bus Station',
    promptVerb: 'Pick Up Receiver',
    x: 939,
    y: 2536,
    radius: 66,
    category: 'object',
    soundCue: 'phone',
    body: [
      'Low white noise crackles through the receiver, followed by a brief, desperate whisper: "...still inside the perimeter? Stay off the side streets after dark..."',
    ],
  },
  {
    id: 'west_fog_road',
    title: 'Highway 9 Westbound',
    subtitle: 'Looping Town Boundary',
    district: 'Abandoned Bus Station',
    promptVerb: 'Inspect Roadblock',
    x: 222,
    y: 2664,
    radius: 76,
    category: 'landmark',
    soundCue: 'whisper',
    body: [
      'Beyond the overturned sawhorses, thick gray fog swallows the asphalt. A rusted sign reads "HOLLOW CREEK — 1 MI" facing the wrong direction.',
      'Every tire track on the damp road curves right back toward town.',
    ],
  },
  {
    id: 'town_sign',
    title: 'Hollow Creek Welcome Sign',
    subtitle: 'District Boundary Marker',
    district: 'Abandoned Bus Station',
    promptVerb: 'Examine Sign',
    x: 1271,
    y: 2540,
    radius: 68,
    category: 'landmark',
    soundCue: 'wood',
    body: [
      '"WELCOME TO HOLLOW CREEK — EST. 1958 — POP. 1,420"',
      'Someone has gouged out the population number and carved a single "0" into the wood.',
    ],
  },
  {
    id: 'miller_mailbox',
    title: 'Miller Residence Mailbox',
    subtitle: '104 Maple Lane',
    district: 'Residential District',
    promptVerb: 'SEARCH Mailbox',
    actionVerb: 'SEARCH',
    x: 702,
    y: 1512,
    radius: 66,
    category: 'clue',
    soundCue: 'metal',
    lootItems: [{ itemId: 'cloth', qty: 1 }],
    body: [
      'A damp municipal flyer dated October 2014 reads: "MANDATORY CURFEW — REPORT ALL SUBTERRANEAN HUMMING TO SHERIFF HAYES."',
    ],
  },
  {
    id: 'elm_supply_crate',
    title: 'Boarded Supply Crate',
    subtitle: 'Elm House Driveway',
    district: 'Residential District',
    promptVerb: 'SEARCH Crate',
    actionVerb: 'SEARCH',
    x: 850,
    y: 1510,
    radius: 66,
    category: 'object',
    soundCue: 'wood',
    lootItems: [
      { itemId: 'battery', qty: 1 },
      { itemId: 'wood', qty: 1 },
    ],
    body: [
      'Stenciled "H.C. WATER & POWER". Empty battery boxes and a cracked flashlight lens sit beside a spare alkaline cell.',
    ],
  },
  {
    id: 'victorian_porch',
    title: 'Boarded Victorian House',
    subtitle: 'Maple Lane South',
    district: 'Residential District',
    promptVerb: 'Inspect Porch',
    x: 1052,
    y: 2258,
    radius: 72,
    category: 'clue',
    soundCue: 'wood',
    body: [
      'Heavy planks are nailed across the front door from the inside. Chalk marks on the porch steps count up to 12.',
    ],
  },
  {
    id: 'diner_menu',
    title: 'Hollow Creek Diner Window',
    subtitle: 'Main Street',
    district: 'Town Centre',
    promptVerb: 'READ Window Menu',
    actionVerb: 'READ',
    x: 1742,
    y: 1528,
    radius: 66,
    category: 'clue',
    soundCue: 'paper',
    body: [
      'Through the dusty glass, half-full coffee mugs sit untouched on the counter. Someone is moving inside behind the counter.',
    ],
  },
  {
    id: 'town_fountain',
    title: 'Town Square Fountain',
    subtitle: 'Hollow Creek Plaza',
    district: 'Town Centre',
    promptVerb: 'READ Plaque',
    actionVerb: 'READ',
    x: 2264,
    y: 2124,
    radius: 84,
    category: 'landmark',
    soundCue: 'wood',
    body: [
      'The dry stone basin is choked with moss. A brass plaque at the base has been pried loose, leaving scratches pointing toward the Industrial Zone.',
    ],
  },
  {
    id: 'pharmacy_van',
    title: 'Creekside Pharmacy Van',
    subtitle: 'Main Street East',
    district: 'Town Centre',
    promptVerb: 'SEARCH Van',
    actionVerb: 'SEARCH',
    x: 2740,
    y: 1475,
    radius: 72,
    category: 'object',
    soundCue: 'metal',
    lootItems: [
      { itemId: 'bandage', qty: 1 },
      { itemId: 'bottled_water', qty: 1 },
    ],
    body: [
      'The rear doors stand open. You salvage an unopened bandage roll and a bottle of water from beneath an overturned tray.',
    ],
  },
  {
    id: 'police_cruiser',
    title: 'Sheriff Cruiser #04',
    subtitle: 'Hollow Creek Precinct',
    district: 'Police Station',
    promptVerb: 'SEARCH Cruiser',
    actionVerb: 'SEARCH',
    x: 2268,
    y: 586,
    radius: 76,
    category: 'clue',
    soundCue: 'phone',
    lootItems: [{ itemId: 'battery', qty: 1 }],
    body: [
      'A logbook on the passenger seat bears Deputy Daniel Hayes\' signature: "10/14 — Power grid fluctuating beneath Sector 4. Calling state backup — no signal."',
    ],
  },
  {
    id: 'police_door',
    title: 'Precinct Notice Board',
    subtitle: 'Hollow Creek Sheriff',
    district: 'Police Station',
    promptVerb: 'READ Notice',
    actionVerb: 'READ',
    x: 2116,
    y: 638,
    radius: 66,
    category: 'landmark',
    soundCue: 'metal',
    body: [
      'Reinforced steel shutters cover the side windows. A handwritten note taped to the board reads: "DO NOT FOLLOW THE WATCHER INTO THE TREES."',
    ],
  },
  {
    id: 'hospital_ambulance',
    title: 'ER Ambulance #02',
    subtitle: 'Hollow Creek General',
    district: 'Abandoned Hospital',
    promptVerb: 'SEARCH Ambulance',
    actionVerb: 'SEARCH',
    x: 3474,
    y: 712,
    radius: 78,
    category: 'clue',
    soundCue: 'metal',
    lootItems: [{ itemId: 'bandage', qty: 1 }],
    body: [
      'Stretcher straps dangle from the rear bay. A dropped clipboard lists 38 patients admitted in a single night complaining of "static in their ears".',
    ],
  },
  {
    id: 'hospital_er',
    title: 'Hospital Quarantine Notice',
    subtitle: 'Quarantine Perimeter',
    district: 'Abandoned Hospital',
    promptVerb: 'READ Notice',
    actionVerb: 'READ',
    x: 3588,
    y: 568,
    radius: 68,
    category: 'note',
    soundCue: 'paper',
    body: [
      '"NOTICE: BASEMENT LEVEL B2 SEALED BY ORDER OF RESEARCH DIRECTORATE. ALL PERSONNEL REPORT TO HELIPAD."',
    ],
  },
  {
    id: 'school_bus_clue',
    title: 'School Bus #07',
    subtitle: 'Hollow Creek High',
    district: 'Old School',
    promptVerb: 'SEARCH School Bus',
    actionVerb: 'SEARCH',
    x: 3428,
    y: 2358,
    radius: 78,
    category: 'object',
    soundCue: 'metal',
    lootItems: [
      { itemId: 'canned_food', qty: 1 },
      { itemId: 'cloth', qty: 1 },
    ],
    body: [
      'Children\'s drawings are still taped inside the windows — every drawing shows the same tall, shadowy figure standing under a yellow streetlamp.',
    ],
  },
  {
    id: 'school_entrance',
    title: 'School Courtyard Board',
    subtitle: 'Hollow Creek High',
    district: 'Old School',
    promptVerb: 'READ Bulletin',
    actionVerb: 'READ',
    x: 3560,
    y: 2014,
    radius: 68,
    category: 'note',
    soundCue: 'paper',
    body: [
      'A faded homecoming banner hangs crookedly above the steps. Behind the glass case, a timetable stops abruptly at October 14.',
    ],
  },
  {
    id: 'industrial_dock',
    title: 'Water & Power Warehouse',
    subtitle: 'Substation 4',
    district: 'Industrial Zone',
    promptVerb: 'INTERACT Control Panel',
    actionVerb: 'INTERACT',
    x: 2020,
    y: 3158,
    radius: 80,
    category: 'clue',
    soundCue: 'metal',
    lootItems: [{ itemId: 'radio_part', qty: 1 }],
    body: [
      'Thick power cables dive straight into concrete conduits marked "SUB-LEVEL FACILITY". Despite the rust, a deep electrical hum vibrates beneath your boots.',
    ],
  },
  {
    id: 'forest_stump',
    title: 'Hollow Pine Stump',
    subtitle: 'Pine Woods Clearing',
    district: 'Dark Forest',
    promptVerb: 'SEARCH Stump',
    actionVerb: 'SEARCH',
    x: 3387,
    y: 3184,
    radius: 70,
    category: 'clue',
    soundCue: 'whisper',
    lootItems: [{ itemId: 'battery', qty: 1 }],
    body: [
      'Inside a rusted tin box lies a Polaroid of Town Square — a tall, faceless silhouette stands beneath the central lamp. Written on the back: "It watches from the pine line. — Evelyn"',
    ],
  },
  {
    id: 'underground_hatch_clue',
    title: 'Forest Ranger Shed Log',
    subtitle: 'Pine Trail Outpost',
    district: 'Dark Forest',
    promptVerb: 'READ Shed Log',
    actionVerb: 'READ',
    x: 3500,
    y: 3068,
    radius: 74,
    category: 'landmark',
    soundCue: 'whisper',
    body: [
      'Directorate maintenance log: "Hatch bulkhead requires both a fresh Substation Fuse and the 4-digit override code kept by the High School and Hospital."',
    ],
    footnote: 'Evidence logged — Dark Forest',
  },
];
