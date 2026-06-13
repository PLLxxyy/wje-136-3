import { useMemo, useState } from 'react';

export function useFilters<T extends string>(initial: T) {
  const [active, setActive] = useState<T>(initial);
  return useMemo(() => ({ active, setActive }), [active]);
}
