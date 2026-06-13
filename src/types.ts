export interface Theme {
  bgColor: string;
  textColor: string;
  borderColor: string;
  accentColor: string;
}

export type WidgetType =
  | 'text'
  | 'heading'
  | 'button'
  | 'input'
  | 'textarea'
  | 'select'
  | 'radioGroup'
  | 'checkbox'
  | 'chart'
  | 'table'
  | 'status_alert';

export interface ChartDataItem {
  name: string;
  value: number;
}

export interface Widget {
  id: string;
  type: WidgetType;
  value?: string;
  label?: string;
  placeholder?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'info' | 'warning' | 'alarm';
  options?: string[];
  chartType?: 'line' | 'bar' | 'pie';
  chartData?: ChartDataItem[];
  tableHeaders?: string[];
  tableRows?: string[][];
}

export interface Layout {
  type: 'container';
  direction: 'flex-col' | 'flex-row' | 'grid-2';
  gap?: number;
  children: Widget[];
}

export interface AppResponse {
  appName: string;
  windowTitle: string;
  desktopIcon: string;
  theme: Theme;
  layout: Layout;
  logs: string[];
  appState: string;
}

export interface AppInstance {
  id: string; // unique instance ID for multiple windows of same app
  appKey: string; // e.g. 'terminal', 'paint'
  appName: string;
  windowTitle: string;
  iconName: string;
  startingPrompt: string;
  theme: Theme;
  layout: Layout;
  logs: string[];
  appState: string; // serialized JSON
  history: Array<{ action: string; title: string }>;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  loading: boolean;
  error: string | null;
  // Drag state
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PremadeApp {
  appKey: string;
  name: string;
  description: string;
  iconName: string;
  startingPrompt: string;
  category: string;
  rating: number;
}
