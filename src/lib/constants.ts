export const BAG_SIZES = [
  'Ration',
  'Seed',
  'Goli',
  'Number-8',
  'Number-10',
  'Number-12',
  'Number-6/4',
  'Cut',
] as const;

export const BAG_TYPES = ['JUTE', 'LENO'] as const;

export const DEFAULT_BAG_TYPE = 'JUTE';

/** Example chamber values (free-text in storage forms; used for placeholders) */
export const CHAMBERS = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;

/** Example floor values (free-text in storage forms; used for placeholders) */
export const FLOORS = ['1', '2', '3', '4'] as const;

/** Example row values (free-text in storage forms; used for placeholders) */
export const STORAGE_ROWS = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
] as const;

export const DEFAULT_CHAMBER = CHAMBERS[0];
export const DEFAULT_FLOOR = FLOORS[0];
export const DEFAULT_STORAGE_ROW = STORAGE_ROWS[0];
