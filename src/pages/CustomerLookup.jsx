import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { leadsApi } from '../api/client';

const formatType = (type) => {
  if (type === 'others') return 'Other Coverage';
  return (type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Unknown') + (type === 'others' ? '' : ' Insurance');
};

const formatDate = (iso) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });
};

const fullName = (d = {}) => [d.firstName, d.lastName].filter(Boolean).join(' ') || d.name || '-';

const CustomerLookup = () => {
  const navigate = useNavigate();
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await leadsApi.searchMine(lastName.trim(), phone.trim());
      setResults(data);
      setSearched(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container fade-in-up" style={{ maxWidth: '720px' }}>
      <button
        onClick={() => navigate('/')}
        style={{
          background: 'none', border: 'none', color: 'var(--blue-700)',
          display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
          marginBottom: '20px', fontSize: '0.95rem', fontWeight: 600,
        }}
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="glass-panel" style={{ padding: '40px' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '6px' }}>Find Your Submission</h2>
        <p style={{ color: 'var(--slate-500)', marginBottom: '24px' }}>
          Enter the last name and phone number you used on your quote to look it up.
        </p>

        <form onSubmit={handleSearch}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input type="text" required className="form-control" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Smith" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input type="tel" required className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" />
            </div>
          </div>

          {error && <p className="id-upload-error">{error}</p>}

          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Search size={16} /> {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
      </div>

      {searched && !loading && (
        <div style={{ marginTop: '24px' }}>
          {results.length === 0 ? (
            <div className="glass-panel" style={{ padding: '28px', textAlign: 'center', color: 'var(--slate-500)' }}>
              No submission found for that last name and phone number. Double-check the spelling, or
              {' '}<a href="#/" onClick={() => navigate('/')} style={{ color: 'var(--blue-700)', fontWeight: 600 }}>start a new quote</a>.
            </div>
          ) : (
            results.map((lead) => (
              <div key={lead.id} className="glass-panel" style={{ padding: '28px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.2rem' }}>{formatType(lead.type)}</h3>
                  <span className={`status-badge status-${lead.status}`}>
                    {lead.status === 'complete' ? 'Received' : 'In progress'}
                  </span>
                </div>
                <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem', marginTop: '4px' }}>
                  Submitted {formatDate(lead.created_at)}
                </p>

                <div className="lead-detail-grid" style={{ marginTop: '16px' }}>
                  <div className="lead-detail-item"><label>Name</label><span>{fullName(lead.data)}</span></div>
                  {lead.data?.phone && <div className="lead-detail-item"><label>Phone</label><span>{lead.data.phone}</span></div>}
                  {lead.data?.email && <div className="lead-detail-item"><label>Email</label><span>{lead.data.email}</span></div>}
                </div>

                {Array.isArray(lead.data?.vehicles) && lead.data.vehicles.length > 0 && (
                  <p style={{ marginTop: '12px', color: 'var(--slate-700)' }}>
                    Vehicles on file: <strong>{lead.data.vehicles.length}</strong>
                  </p>
                )}
                {Array.isArray(lead.data?.additionalPersons) && lead.data.additionalPersons.length > 0 && (
                  <p style={{ color: 'var(--slate-700)' }}>
                    Additional people on file: <strong>{lead.data.additionalPersons.length}</strong>
                  </p>
                )}

                <p style={{ marginTop: '14px', color: 'var(--slate-500)', fontSize: '0.9rem' }}>
                  Need to change something? Call <a href="tel:3477619537" style={{ color: 'var(--blue-700)', fontWeight: 600 }}>(347) 761-9537</a>.
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerLookup;
