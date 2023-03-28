export const ALERT_MESSAGE_IDENTIFY =
  'Failed to read identify report from device.';

export const ALERT_MESSAGE_RUN_APPLICATION_FW =
  'Failed to run application firmware.';

export type LogData = {
  time: number;
  index: number;
  event: number;
  layer: number;
  level: number;
  payload: string;
};

export const LAYERS = [
  'Physical',
  'Control',
  'Express',
  'Data',
  'Mgmt',
  'Comm',
  'Config'
];

export const LAYERS_FULL = [
  'Physical',
  'Control',
  'Express',
  'Data',
  'Management',
  'Communication',
  'Configuration'
];

export const LOG_LEVELS = ['Error', 'Warning', 'Info', 'Verbose'];

export const DEFAULT_LAYER_FILTER = [true, true, true, true, true, true, true];

export const DEFAULT_LOG_LEVEL_FILTER = [true, true, true, true];

export const VIRIDIS_COLORS = ['#FDE725', '#26828E', '#3E4A89', '#440154'];

export const MIN_TABLE_ROWS = 13;

export const VFLOW_TABLE_WIDTH = 700;
