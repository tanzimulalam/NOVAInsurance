import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Send, UserPlus, Car, X } from 'lucide-react';
import { useLeadTracking } from '../hooks/useLeadTracking';
import IdUpload from '../components/IdUpload';
import MultiDocUpload from '../components/MultiDocUpload';
import { INSURANCE_COMPANIES } from '../constants/insuranceCompanies';

const formatTitle = (type) => {
  if (!type) return '';
  return type.charAt(0).toUpperCase() + type.slice(1) + (type === 'others' ? ' Coverage' : ' Insurance');
};

const emptyVehicle = () => ({ vin: '', vehicleStatus: 'Owned', financeCompany: '', lenderName: '' });

const isoToDisplay = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return '';
  return `${m}/${d}/${y}`;
};

const displayToIso = (text) => {
  const match = text.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return '';
  const [, month, day, year] = match;
  const mm = month.padStart(2, '0');
  const dd = day.padStart(2, '0');
  const date = new Date(`${year}-${mm}-${dd}T12:00:00`);
  if (Number.isNaN(date.getTime()) || date.getFullYear() !== Number(year)) return '';
  return `${year}-${mm}-${dd}`;
};

const QuoteForm = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isAuto = type === 'auto';
  const isCommercial = type === 'commercial';
  const totalSteps = isAuto ? 2 : 1;

  const idLabel = isAuto ? "Driver's License" : 'State ID';
  const personNoun = isAuto ? 'Driver' : type === 'home' ? 'Co-Applicant' : isCommercial ? 'Partner' : 'Person';
  const addPersonLabel = isAuto
    ? 'Add Another Driver'
    : type === 'home'
      ? 'Add Co-Applicant'
      : isCommercial
        ? 'Add Another Partner'
        : 'Add Another Person';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    currentInsuranceCompany: '',
    policyEffectiveDate: '',
    policyEffectiveDateText: '',
    idPhoto: '',
    additionalDocument: '',
    documents: [],
    additionalPersons: [],
    vehicles: isAuto ? [emptyVehicle()] : [],
  });

  const { markComplete } = useLeadTracking(type);

  // Fix scroll position when the form loads and on step change.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [step]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const setField = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handlePolicyDatePicker = (e) => {
    const iso = e.target.value;
    setFormData((prev) => ({
      ...prev,
      policyEffectiveDate: iso,
      policyEffectiveDateText: isoToDisplay(iso),
    }));
  };

  const handlePolicyDateText = (e) => {
    const text = e.target.value;
    const iso = displayToIso(text);
    setFormData((prev) => ({
      ...prev,
      policyEffectiveDateText: text,
      policyEffectiveDate: iso || prev.policyEffectiveDate,
    }));
  };

  const addPerson = () => {
    setFormData((prev) => ({
      ...prev,
      additionalPersons: [...prev.additionalPersons, { firstName: '', lastName: '', idPhoto: '' }],
    }));
  };
  const updatePerson = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      additionalPersons: prev.additionalPersons.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    }));
  };
  const removePerson = (index) => {
    setFormData((prev) => ({
      ...prev,
      additionalPersons: prev.additionalPersons.filter((_, i) => i !== index),
    }));
  };

  const addVehicle = () => {
    setFormData((prev) => ({ ...prev, vehicles: [...prev.vehicles, emptyVehicle()] }));
  };
  const updateVehicle = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      vehicles: prev.vehicles.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
    }));
  };
  const removeVehicle = (index) => {
    setFormData((prev) => ({ ...prev, vehicles: prev.vehicles.filter((_, i) => i !== index) }));
  };

  const handleNext = async (e) => {
    e.preventDefault();

    // Driver's License is mandatory for auto insurance.
    if (step === 1 && isAuto && !formData.idPhoto) {
      setError("Please upload the primary driver's license to continue.");
      return;
    }
    setError('');

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setSubmitting(true);
      try {
        await markComplete(formData);
        setStep('success');
      } catch {
        setStep('success');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const progress = step === 'success' ? 100 : ((step - 1) / totalSteps) * 100 + (100 / totalSteps) * 0.5;

  if (step === 'success') {
    return (
      <div className="container fade-in-up" style={{ maxWidth: '600px', marginTop: '40px' }}>
        <div className="glass-panel" style={{ padding: '48px 40px', textAlign: 'center' }}>
          <CheckCircle size={64} color="var(--green-500)" style={{ margin: '0 auto 24px' }} />
          <h2 style={{ fontSize: '2rem', marginBottom: '12px' }}>Thank You!</h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--slate-500)', marginBottom: '32px' }}>
            We have received your {formatTitle(type)} quote request. Our team will review your information and get back to you shortly.
          </p>
          <div style={{ background: 'var(--blue-100)', padding: '24px', borderRadius: 'var(--radius-sm)', textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', color: 'var(--blue-700)' }}>Your Agent</h3>
            <p><strong>Md Ahmed</strong></p>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>Licensed Insurance Agent | DRLP</p>
            <p style={{ margin: '10px 0' }}>
              <a href="tel:3477619537" style={{ color: 'var(--blue-700)', fontWeight: 600 }}>(347) 761-9537</a>
            </p>
            <p>
              <a href="mailto:md.ahmed@lowrateprotection.com" style={{ color: 'var(--green-700)', fontWeight: 600 }}>md.ahmed@lowrateprotection.com</a>
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: '28px' }}>
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container fade-in-up" style={{ maxWidth: '720px' }}>
      <button
        onClick={() => (step > 1 ? setStep(step - 1) : navigate('/'))}
        style={{
          background: 'none', border: 'none', color: 'var(--blue-700)',
          display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
          marginBottom: '20px', fontSize: '0.95rem', fontWeight: 600,
        }}
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="glass-panel" style={{ padding: '40px' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '6px' }}>{formatTitle(type)} Quote</h2>
        <p style={{ color: 'var(--slate-500)', marginBottom: '24px' }}>
          Step {step} of {totalSteps}: {step === 1 ? 'Your Information' : 'Vehicle Information'}
        </p>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <form onSubmit={handleNext}>
          {step === 1 && (
            <div className="form-grid fade-in-up">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input type="text" name="firstName" required className="form-control" value={formData.firstName} onChange={handleChange} placeholder="John" />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input type="text" name="lastName" required className="form-control" value={formData.lastName} onChange={handleChange} placeholder="Smith" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input type="tel" name="phone" required className="form-control" value={formData.phone} onChange={handleChange} placeholder="(555) 123-4567" />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input type="email" name="email" required className="form-control" value={formData.email} onChange={handleChange} placeholder="you@email.com" />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Current Insurance Company *</label>
                <select
                  name="currentInsuranceCompany"
                  required
                  className="form-control"
                  value={formData.currentInsuranceCompany}
                  onChange={handleChange}
                >
                  <option value="">Select current insurance company</option>
                  {INSURANCE_COMPANIES.map((company) => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
              </div>

              <div className="form-group full-width">
                <label className="form-label">New Policy Effective Date</label>
                <div className="date-dual-input">
                  <input
                    type="date"
                    className="form-control"
                    value={formData.policyEffectiveDate}
                    onChange={handlePolicyDatePicker}
                    aria-label="Pick policy effective date"
                  />
                  <input
                    type="text"
                    className="form-control"
                    value={formData.policyEffectiveDateText}
                    onChange={handlePolicyDateText}
                    placeholder="MM/DD/YYYY"
                    aria-label="Enter policy effective date"
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <IdUpload value={formData.idPhoto} onChange={(v) => setField('idPhoto', v)} label={idLabel} required={isAuto} />
              </div>

              {isAuto && (
                <div className="form-group full-width">
                  <IdUpload value={formData.additionalDocument} onChange={(v) => setField('additionalDocument', v)} label="Upload Additional Document" />
                </div>
              )}

              {isCommercial && (
                <div className="form-group full-width">
                  <MultiDocUpload values={formData.documents} onChange={(v) => setField('documents', v)} label="Upload Documents" />
                </div>
              )}

              {formData.additionalPersons.length > 0 && (
                <div className="full-width">
                  {formData.additionalPersons.map((person, index) => (
                    <div className="person-block" key={index}>
                      <div className="person-block-head">
                        <span className="person-block-title">{personNoun} {index + 2}</span>
                        <button type="button" className="btn btn-ghost btn-sm" style={{ color: '#dc2626' }} onClick={() => removePerson(index)}>
                          <X size={14} /> Remove
                        </button>
                      </div>
                      <div className="form-grid">
                        <div className="form-group">
                          <label className="form-label">First Name *</label>
                          <input
                            type="text"
                            required
                            className="form-control"
                            value={person.firstName}
                            onChange={(e) => updatePerson(index, 'firstName', e.target.value)}
                            placeholder="Jane"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Last Name *</label>
                          <input
                            type="text"
                            required
                            className="form-control"
                            value={person.lastName}
                            onChange={(e) => updatePerson(index, 'lastName', e.target.value)}
                            placeholder="Smith"
                          />
                        </div>
                        <div className="form-group full-width" style={{ marginBottom: 0 }}>
                          <IdUpload value={person.idPhoto} onChange={(v) => updatePerson(index, 'idPhoto', v)} label={idLabel} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="full-width">
                <button type="button" className="btn btn-outline add-person-btn" onClick={addPerson}>
                  <UserPlus size={16} /> {addPersonLabel}
                </button>
              </div>
            </div>
          )}

          {step === 2 && isAuto && (
            <div className="fade-in-up">
              {formData.vehicles.map((vehicle, index) => (
                <div className="person-block" key={index}>
                  <div className="person-block-head">
                    <span className="person-block-title">Vehicle {index + 1}</span>
                    {index > 0 && (
                      <button type="button" className="btn btn-ghost btn-sm" style={{ color: '#dc2626' }} onClick={() => removeVehicle(index)}>
                        <X size={14} /> Remove
                      </button>
                    )}
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">VIN Number</label>
                      <input
                        type="text"
                        className="form-control"
                        value={vehicle.vin}
                        onChange={(e) => updateVehicle(index, 'vin', e.target.value)}
                        placeholder="Vehicle Identification Number"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Vehicle Financial Status</label>
                      <select
                        className="form-control"
                        value={vehicle.vehicleStatus}
                        onChange={(e) => updateVehicle(index, 'vehicleStatus', e.target.value)}
                      >
                        <option value="Owned">Owned</option>
                        <option value="Financed">Financed</option>
                        <option value="Leased">Leased</option>
                      </select>
                    </div>
                    {vehicle.vehicleStatus === 'Financed' && (
                      <div className="form-group full-width">
                        <label className="form-label">Finance Company *</label>
                        <input
                          type="text"
                          required
                          className="form-control"
                          value={vehicle.financeCompany}
                          onChange={(e) => updateVehicle(index, 'financeCompany', e.target.value)}
                        />
                      </div>
                    )}
                    {vehicle.vehicleStatus === 'Leased' && (
                      <div className="form-group full-width">
                        <label className="form-label">Lender Name *</label>
                        <input
                          type="text"
                          required
                          className="form-control"
                          value={vehicle.lenderName}
                          onChange={(e) => updateVehicle(index, 'lenderName', e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <button type="button" className="btn btn-outline add-person-btn" onClick={addVehicle}>
                <Car size={16} /> Add Another Vehicle
              </button>
            </div>
          )}

          {error && <p className="id-upload-error" style={{ marginTop: '16px' }}>{error}</p>}

          <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : step === totalSteps ? (
                <><Send size={16} /> Submit Request</>
              ) : (
                'Next Step'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuoteForm;
