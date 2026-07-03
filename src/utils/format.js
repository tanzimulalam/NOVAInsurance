export const VALID_QUOTE_TYPES = ['auto', 'home', 'renters', 'commercial', 'cyber', 'others'];

export const formatPolicyDate = (data = {}) => {
  if (data.policyEffectiveDateText) return data.policyEffectiveDateText;
  if (!data.policyEffectiveDate) return '';
  const [y, m, d] = data.policyEffectiveDate.split('-');
  if (!y || !m || !d) return data.policyEffectiveDate;
  return `${m}/${d}/${y}`;
};

export const isoToDisplay = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return '';
  return `${m}/${d}/${y}`;
};

export const displayToIso = (text) => {
  const match = text.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return '';
  const [, month, day, year] = match;
  const mm = month.padStart(2, '0');
  const dd = day.padStart(2, '0');
  const monthNum = Number(mm);
  const dayNum = Number(dd);
  const yearNum = Number(year);
  if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) return '';
  const date = new Date(yearNum, monthNum - 1, dayNum);
  if (
    date.getFullYear() !== yearNum ||
    date.getMonth() !== monthNum - 1 ||
    date.getDate() !== dayNum
  ) {
    return '';
  }
  return `${year}-${mm}-${dd}`;
};

export const formatTypeLabel = (type) => {
  if (type === 'others') return 'Other Coverage';
  return (type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Unknown') + (type === 'others' ? '' : ' Insurance');
};

export const leadFullName = (data = {}) =>
  [data.firstName, data.lastName].filter(Boolean).join(' ') || data.name || '-';

export const prepareSubmitData = (formData) => {
  const { policyEffectiveDateText, ...rest } = formData;
  let policyEffectiveDate = rest.policyEffectiveDate;
  if (!policyEffectiveDate && policyEffectiveDateText?.trim()) {
    policyEffectiveDate = displayToIso(policyEffectiveDateText);
  }
  return { ...rest, policyEffectiveDate: policyEffectiveDate || '' };
};
