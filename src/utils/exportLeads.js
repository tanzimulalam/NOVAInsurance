import * as XLSX from 'xlsx';

const formatType = (type) => {
  if (type === 'others') return 'Other';
  return type ? type.charAt(0).toUpperCase() + type.slice(1) : '';
};

const leadName = (d = {}) => [d.firstName, d.lastName].filter(Boolean).join(' ') || d.name || '';

const summarizePeople = (people) => {
  if (!Array.isArray(people) || people.length === 0) return '';
  return people
    .map((p, i) => {
      const name = [p.firstName, p.lastName].filter(Boolean).join(' ') || `Person ${i + 2}`;
      return p.idPhoto ? `${name} (ID uploaded)` : name;
    })
    .join('; ');
};

const summarizeVehicles = (vehicles) => {
  if (!Array.isArray(vehicles) || vehicles.length === 0) return '';
  return vehicles
    .map((v, i) => {
      const parts = [`Vehicle ${i + 1}`];
      if (v.vin) parts.push(`VIN: ${v.vin}`);
      if (v.vehicleStatus) parts.push(v.vehicleStatus);
      return parts.join(' — ');
    })
    .join('; ');
};

export function downloadLeadsExcel(leads) {
  const rows = leads.map((lead) => {
    const d = lead.data || {};
    return {
      Status: lead.status === 'complete' ? 'Complete' : 'Incomplete',
      Type: formatType(lead.type),
      'First Name': d.firstName || '',
      'Last Name': d.lastName || '',
      'Full Name': leadName(d),
      Phone: d.phone || '',
      Email: d.email || '',
      'Current Insurance Company': d.currentInsuranceCompany || '',
      'Policy Effective Date': d.policyEffectiveDate || d.policyEffectiveDateText || '',
      'Additional People': summarizePeople(d.additionalPersons),
      Vehicles: summarizeVehicles(d.vehicles),
      'ID Uploaded': d.idPhoto ? 'Yes' : 'No',
      'Additional Document': d.additionalDocument ? 'Yes' : 'No',
      'Commercial Documents': Array.isArray(d.documents) ? d.documents.length : 0,
      Submitted: lead.created_at ? new Date(lead.created_at).toLocaleString() : '',
      Updated: lead.updated_at ? new Date(lead.updated_at).toLocaleString() : '',
      'Lead ID': lead.id,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');

  const stamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `low-rate-insurance-leads-${stamp}.xlsx`);
}
