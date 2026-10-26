import { useCallback, useState } from 'react';

/** Widget sizes on the 6-column dashboard grid: third = 2 columns, half = 3, full = 6. */
export type WidgetSize = 'third' | 'half' | 'full';

export interface PlacedWidget {
  id: string;
  size: WidgetSize;
}

/** Maya's dashboard as designed (Figma 365:33581). */
export const DEFAULT_LAYOUT: PlacedWidget[] = [
  { id: 'overall', size: 'half' },
  { id: 'roster', size: 'half' },
  { id: 'saved-searches', size: 'third' },
  { id: 'reports', size: 'third' },
  { id: 'attention', size: 'third' },
];

/** Resize button steps through these sizes. */
export const NEXT_SIZE: Record<WidgetSize, WidgetSize> = { third: 'half', half: 'full', full: 'third' };

const STORAGE_KEY = 'vt-dashboard-layout';

function readLayout(): PlacedWidget[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as PlacedWidget[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Storage blocked or bad JSON: use the default.
  }
  return DEFAULT_LAYOUT;
}

/** The saved layout, remembered across reloads. Customise edits a copy and calls `save` on Done. */
export function useDashboardLayout() {
  const [layout, setLayout] = useState<PlacedWidget[]>(readLayout);
  const save = useCallback((next: PlacedWidget[]) => {
    setLayout(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore: still applies for this visit.
    }
  }, []);
  return { layout, save };
}
