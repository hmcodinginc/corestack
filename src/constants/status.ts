export const STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING',
} as const;

export type StatusType = typeof STATUS[keyof typeof STATUS];

export const STATUS_OPTIONS = [
  { label: 'Active', value: STATUS.ACTIVE },
  { label: 'Inactive', value: STATUS.INACTIVE },
  { label: 'Pending', value: STATUS.PENDING },
];
