import '@tanstack/react-table';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    align?: 'left' | 'right';
    columnWidth?: string;
    compact?: boolean;
    emphasize?: boolean;
    filterLabel?: string;
    filterValueFormatter?: (value: unknown) => string;
    groupable?: boolean;
    groupStart?: boolean;
    mono?: boolean;
    numeric?: boolean;
    wrap?: boolean;
  }
}
