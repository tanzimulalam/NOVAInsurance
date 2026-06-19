import { useEffect, useRef, useCallback } from 'react';
import { leadsApi } from '../api/client';

export function useLeadTracking(type, formData, isSubmitted) {
  const leadIdRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const storageKey = `lri_lead_${type}`;
    const existingId = sessionStorage.getItem(storageKey);

    if (existingId) {
      leadIdRef.current = existingId;
      return;
    }

    leadsApi
      .create(type, {})
      .then((lead) => {
        leadIdRef.current = lead.id;
        sessionStorage.setItem(storageKey, lead.id);
      })
      .catch(() => {});

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [type]);

  const syncLead = useCallback(
    (data, status) => {
      if (!leadIdRef.current) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        leadsApi
          .update(leadIdRef.current, { data, ...(status ? { status } : {}) })
          .catch(() => {});
      }, 400);
    },
    []
  );

  useEffect(() => {
    if (isSubmitted) return;
    const hasData = Object.values(formData).some((v) => v && String(v).trim() !== '');
    if (hasData && leadIdRef.current) {
      syncLead(formData);
    }
  }, [formData, isSubmitted, syncLead]);

  const markComplete = useCallback(async (data) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!leadIdRef.current) {
      const lead = await leadsApi.create(type, data);
      leadIdRef.current = lead.id;
    }
    await leadsApi.update(leadIdRef.current, { data, status: 'complete' });
    sessionStorage.removeItem(`lri_lead_${type}`);
  }, [type]);

  return { markComplete };
}
