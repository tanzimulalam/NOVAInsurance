import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, RefreshCw, Trash2, Eye, X, Radio, Search, Download,
  Car, Home, Building2, Shield, Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { leadsApi } from '../api/client';
import { downloadLeadsExcel } from '../utils/exportLeads';
import { formatPolicyDate, leadFullName } from '../utils/format';
import UsagePanel from '../components/UsagePanel';

const typeIcons = {
  auto: Car,
  home: Home,
  renters: Building2,
  commercial: Briefcase,
  cyber: Shield,
  others: Shield,
};

const COMPLEX_KEYS = [
  'idPhoto', 'additionalDocument', 'documents', 'additionalPersons', 'vehicles',
  'policyEffectiveDateText',
];

const formatType = (type) => {
  if (type === 'others') return 'Other';
  return type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Unknown';
};

const formatDate = (iso) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
};

const Portal = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [search, setSearch] = useState('');
  const [fetchError, setFetchError] = useState('');
  const [usageStats, setUsageStats] = useState(null);
  const [usageLoading, setUsageLoading] = useState(true);
  const [usageError, setUsageError] = useState('');

  const fetchUsage = useCallback(async () => {
    try {
      const data = await leadsApi.getUsageStats();
      setUsageStats(data);
      setUsageError('');
    } catch (err) {
      setUsageStats(null);
      const msg = err.message || '';
      setUsageError(
        msg.includes('get_portal_usage_stats')
          ? 'Run the usage-stats SQL in Supabase (see SUPABASE_SETUP.md in the project).'
          : 'Could not load the usage estimate right now.'
      );
    } finally {
      setUsageLoading(false);
    }
  }, []);

  const fetchLeads = useCallback(async () => {
    try {
      const data = await leadsApi.getAll();
      setLeads(data);
      setFetchError('');
    } catch {
      setFetchError('Could not load leads. Try refreshing or signing in again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
    fetchUsage();

    const unsubscribe = leadsApi.subscribe(() => {
      setConnected(true);
      fetchLeads();
      fetchUsage();
    });
    setConnected(true);

    return () => {
      unsubscribe();
    };
  }, [fetchLeads, fetchUsage]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this lead permanently?')) return;
    try {
      await leadsApi.delete(id);
      if (selected?.id === id) setSelected(null);
    } catch {
      alert('Could not delete this lead. Please try again.');
    }
  };

  const completeCount = leads.filter((l) => l.status === 'complete').length;
  const incompleteCount = leads.filter((l) => l.status === 'incomplete').length;

  const getLeadName = (lead) => leadFullName(lead.data || {});
  const getLeadContact = (lead) => lead.data?.phone || lead.data?.email || '-';

  const term = search.trim().toLowerCase();
  const filteredLeads = term
    ? leads.filter((l) => {
        const d = l.data || {};
        const hay = [d.firstName, d.lastName, d.name, d.phone, d.email, d.currentInsuranceCompany, l.type]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return hay.includes(term);
      })
    : leads;

  const handleDownloadExcel = () => {
    if (filteredLeads.length === 0) {
      alert('No leads to download.');
      return;
    }
    if (search.trim() && filteredLeads.length < leads.length) {
      const ok = confirm(
        `You have a search filter active. Download ${filteredLeads.length} matching lead(s) instead of all ${leads.length}?`
      );
      if (!ok) return;
    }
    downloadLeadsExcel(filteredLeads);
  };

  return (
    <div className="portal-layout">
      <header className="portal-header">
        <div className="portal-header-brand">
          <img src={`${import.meta.env.BASE_URL}icon.png`} alt="Low Rate Insurance" />
          <div>
          <h1>Low Rate Insurance Management Portal</h1>
          <p>Welcome, {user?.email} &nbsp;·&nbsp;
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              {connected ? (
                <><span className="live-dot" /> Live</>
              ) : (
                <><Radio size={12} /> Connecting...</>
              )}
            </span>
          </p>
          </div>
        </div>
        <div className="portal-header-actions">
          <button className="btn btn-ghost btn-sm" onClick={handleDownloadExcel} style={{ color: 'var(--white)', borderColor: 'rgba(255,255,255,0.3)' }}>
            <Download size={14} /> Download Excel
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => { fetchLeads(); fetchUsage(); }} style={{ color: 'var(--white)', borderColor: 'rgba(255,255,255,0.3)' }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ color: 'var(--white)', borderColor: 'rgba(255,255,255,0.3)' }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      <div className="portal-body fade-in-up">
        {fetchError && (
          <div className="portal-alert">{fetchError}</div>
        )}
        <div className="portal-stats">
          <div className="glass-panel portal-stat total">
            <div className="num">{leads.length}</div>
            <div style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>Total Leads</div>
          </div>
          <div className="glass-panel portal-stat complete">
            <div className="num">{completeCount}</div>
            <div style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>Complete</div>
          </div>
          <div className="glass-panel portal-stat incomplete">
            <div className="num">{incompleteCount}</div>
            <div style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>Incomplete</div>
          </div>
        </div>

        <UsagePanel stats={usageStats} loading={usageLoading} error={usageError} />

        <div className="portal-search">
          <Search size={16} color="var(--slate-500)" />
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, phone, email, or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="btn btn-ghost btn-sm" onClick={() => setSearch('')} title="Clear">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="glass-panel leads-table-wrap">
          {loading ? (
            <p style={{ padding: '40px', textAlign: 'center', color: 'var(--slate-500)' }}>Loading leads...</p>
          ) : leads.length === 0 ? (
            <p style={{ padding: '40px', textAlign: 'center', color: 'var(--slate-500)' }}>
              No leads yet. Leads will appear here in real-time when visitors fill out quote forms.
            </p>
          ) : filteredLeads.length === 0 ? (
            <p style={{ padding: '40px', textAlign: 'center', color: 'var(--slate-500)' }}>
              No leads match "{search}".
            </p>
          ) : (
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => {
                  const Icon = typeIcons[lead.type] || Shield;
                  return (
                    <tr key={lead.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(lead)}>
                      <td>
                        <span className={`status-badge status-${lead.status}`}>
                          {lead.status === 'complete' ? 'Complete' : 'Incomplete'}
                        </span>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <Icon size={16} color="var(--blue-700)" />
                          {formatType(lead.type)}
                        </span>
                      </td>
                      <td>{getLeadName(lead)}</td>
                      <td>{getLeadContact(lead)}</td>
                      <td style={{ color: 'var(--slate-500)', fontSize: '0.85rem' }}>{formatDate(lead.updated_at)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                          <button className="btn btn-ghost btn-sm" onClick={() => setSelected(lead)} title="View details">
                            <Eye size={14} />
                          </button>
                          <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(lead.id)} title="Delete" style={{ color: '#dc2626' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {selected && (
          <div className="glass-panel lead-detail-panel fade-in-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem' }}>Lead Details</h3>
                <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem', marginTop: '4px' }}>
                  ID: {selected.id} &nbsp;·&nbsp; Created {formatDate(selected.created_at)}
                </p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ margin: '16px 0' }}>
              <span className={`status-badge status-${selected.status}`}>
                {selected.status === 'complete' ? 'Complete' : 'Incomplete'}
              </span>
              <span style={{ marginLeft: '12px', color: 'var(--slate-500)', fontSize: '0.9rem' }}>
                {formatType(selected.type)} Insurance
              </span>
            </div>

            <div className="lead-detail-grid">
              {Object.entries(selected.data || {}).map(([key, value]) => {
                if (COMPLEX_KEYS.includes(key)) return null;
                if (value === null || value === undefined || String(value).trim() === '') return null;
                const label = key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (s) => s.toUpperCase());
                const display =
                  key === 'policyEffectiveDate'
                    ? formatPolicyDate(selected.data)
                    : value;
                return (
                  <div key={key} className="lead-detail-item">
                    <label>{label}</label>
                    <span>{display}</span>
                  </div>
                );
              })}
            </div>

            {selected.data?.idPhoto && (
              <div className="lead-id-photo">
                <label>{selected.type === 'auto' ? "Driver's License" : 'ID Document'}</label>
                <a href={selected.data.idPhoto} target="_blank" rel="noopener noreferrer">
                  <img src={selected.data.idPhoto} alt="ID document" />
                </a>
              </div>
            )}

            {selected.data?.additionalDocument && (
              <div className="lead-id-photo">
                <label>Additional Document</label>
                <a href={selected.data.additionalDocument} target="_blank" rel="noopener noreferrer">
                  <img src={selected.data.additionalDocument} alt="Additional document" />
                </a>
              </div>
            )}

            {Array.isArray(selected.data?.documents) && selected.data.documents.length > 0 && (
              <div className="lead-id-photo">
                <label>Documents ({selected.data.documents.length})</label>
                <div className="multi-doc-grid">
                  {selected.data.documents.map((doc, i) => (
                    <a key={i} href={doc} target="_blank" rel="noopener noreferrer" className="multi-doc-item">
                      <img src={doc} alt={`Document ${i + 1}`} />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(selected.data?.vehicles) && selected.data.vehicles.length > 0 && (
              <div className="lead-persons">
                <h4 style={{ fontSize: '1rem', margin: '20px 0 12px' }}>Vehicles</h4>
                {selected.data.vehicles.map((vehicle, index) => (
                  <div key={index} className="lead-person-item">
                    <h5 style={{ fontSize: '0.9rem', margin: '0 0 10px', color: 'var(--blue-700)' }}>Vehicle {index + 1}</h5>
                    <div className="lead-detail-grid">
                      <div className="lead-detail-item"><label>VIN</label><span>{vehicle.vin || '-'}</span></div>
                      <div className="lead-detail-item"><label>Financial Status</label><span>{vehicle.vehicleStatus || '-'}</span></div>
                      {vehicle.financeCompany && <div className="lead-detail-item"><label>Finance Company</label><span>{vehicle.financeCompany}</span></div>}
                      {vehicle.lenderName && <div className="lead-detail-item"><label>Lender Name</label><span>{vehicle.lenderName}</span></div>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {Array.isArray(selected.data?.additionalPersons) && selected.data.additionalPersons.length > 0 && (
              <div className="lead-persons">
                <h4 style={{ fontSize: '1rem', margin: '20px 0 12px' }}>Additional People</h4>
                {selected.data.additionalPersons.map((person, index) => (
                  <div key={index} className="lead-person-item">
                    <h5 style={{ fontSize: '0.9rem', margin: '0 0 10px', color: 'var(--blue-700)' }}>
                      {[person.firstName, person.lastName].filter(Boolean).join(' ') || `Person ${index + 2}`}
                    </h5>
                    {person.idPhoto && (
                      <div className="lead-id-photo">
                        <label>{selected.type === 'auto' ? "Driver's License" : 'ID Document'}</label>
                        <a href={person.idPhoto} target="_blank" rel="noopener noreferrer">
                          <img src={person.idPhoto} alt={`Person ${index + 2} ID`} />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Portal;
