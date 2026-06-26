import { useCallback } from 'react';
import { leadsApi } from '../api/client';

// The full quote is saved in a single insert when the visitor submits.
// (We use insert-only because anonymous row updates are not reliable on this
// project, and inserts always work. This means only completed submissions are
// stored, not half-finished drafts.)
export function useLeadTracking(type) {
  const markComplete = useCallback(
    async (data) => {
      await leadsApi.create(type, data, 'complete');
    },
    [type]
  );

  return { markComplete };
}
