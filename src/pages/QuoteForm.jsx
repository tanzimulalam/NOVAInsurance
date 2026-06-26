import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Send, UserPlus, X } from 'lucide-react';
import { useLeadTracking } from '../hooks/useLeadTracking';
import IdUpload from '../components/IdUpload';

const formatTitle = (type) => {
  if (!type) return '';
  return type.charAt(0).toUpperCase() + type.slice(1) + (type === 'others' ? ' Coverage' : ' Insurance');
};

const QuoteForm = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    zip: '',
    contactPreference: 'Phone',
    idPhoto: '',
    additionalPersons: [],
    vin: '',
    license: '',
    dob: '',
    vehicleStatus: 'Owned',
    financeCompany: '',
    lenderName: '',
  });

  const isAuto = type === 'auto';
  const totalSteps = isAuto ? 2 : 1;
  const { markComplete } = useLeadTracking(type);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const setIdPhoto = (dataUrl) => {
    setFormData((prev) => ({ ...prev, idPhoto: dataUrl }));
  };

  const addPerson = () => {
    setFormData((prev) => ({
      ...prev,
      additionalPersons: [
        ...prev.additionalPersons,
        { name: '', phone: '', email: '', address: '', zip: '', contactPreference: 'Phone', idPhoto: '' },
      ],
    }));
  };

  const updatePerson = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      additionalPersons: prev.additionalPersons.map((p, i) =>
        i === index ? { ...p, [field]: value } : p
      ),
    }));
  };

  const removePerson = (index) => {
    setFormData((prev) => ({
      ...prev,
      additionalPersons: prev.additionalPersons.filter((_, i) => i !== index),
    }));
  };

  const handleNext = async (e) => {
    e.preventDefault();
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
          Step {step} of {totalSteps}: {step === 1 ? 'Your Information' : 'Vehicle Details'}
        </p>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <form onSubmit={handleNext}>
          {step === 1 && (
            <div className="form-grid fade-in-up">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input type="text" name="name" required className="form-control" value={formData.name} onChange={handleChange} placeholder="John Smith" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input type="tel" name="phone" required className="form-control" value={formData.phone} onChange={handleChange} placeholder="(555) 123-4567" />
              </div>
              <div className="form-group full-width">
                <label className="form-label">Email Address *</label>
                <input type="email" name="email" required className="form-control" value={formData.email} onChange={handleChange} placeholder="you@email.com" />
              </div>
              <div className="form-group full-width">
                <label className="form-label">Street Address *</label>
                <input type="text" name="address" required className="form-control" value={formData.address} onChange={handleChange} placeholder="123 Main St" />
              </div>
              <div className="form-group">
                <label className="form-label">ZIP Code *</label>
                <input type="text" name="zip" required className="form-control" value={formData.zip} onChange={handleChange} placeholder="10001" />
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Contact</label>
                <select name="contactPreference" className="form-control" value={formData.contactPreference} onChange={handleChange}>
                  <option value="Phone">Phone</option>
                  <option value="Email">Email</option>
                  <option value="Text">Text Message</option>
                </select>
              </div>

              <div className="form-group full-width">
                <IdUpload value={formData.idPhoto} onChange={setIdPhoto} />
              </div>

              {formData.additionalPersons.length > 0 && (
                <div className="full-width">
                  {formData.additionalPersons.map((person, index) => (
                    <div className="person-block" key={index}>
                      <div className="person-block-head">
                        <span className="person-block-title">Additional Person {index + 2}</span>
                        <button type="button" className="btn btn-ghost btn-sm" style={{ color: '#dc2626' }} onClick={() => removePerson(index)}>
                          <X size={14} /> Remove
                        </button>
                      </div>
                      <div className="form-grid">
                        <div className="form-group">
                          <label className="form-label">Full Name *</label>
                          <input
                            type="text"
                            required
                            className="form-control"
                            value={person.name}
                            onChange={(e) => updatePerson(index, 'name', e.target.value)}
                            placeholder="John Smith"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Phone Number *</label>
                          <input
                            type="tel"
                            required
                            className="form-control"
                            value={person.phone}
                            onChange={(e) => updatePerson(index, 'phone', e.target.value)}
                            placeholder="(555) 123-4567"
                          />
                        </div>
                        <div className="form-group full-width">
                          <label className="form-label">Email Address *</label>
                          <input
                            type="email"
                            required
                            className="form-control"
                            value={person.email}
                            onChange={(e) => updatePerson(index, 'email', e.target.value)}
                            placeholder="you@email.com"
                          />
                        </div>
                        <div className="form-group full-width">
                          <label className="form-label">Street Address *</label>
                          <input
                            type="text"
                            required
                            className="form-control"
                            value={person.address}
                            onChange={(e) => updatePerson(index, 'address', e.target.value)}
                            placeholder="123 Main St"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">ZIP Code *</label>
                          <input
                            type="text"
                            required
                            className="form-control"
                            value={person.zip}
                            onChange={(e) => updatePerson(index, 'zip', e.target.value)}
                            placeholder="10001"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Preferred Contact</label>
                          <select
                            className="form-control"
                            value={person.contactPreference}
                            onChange={(e) => updatePerson(index, 'contactPreference', e.target.value)}
                          >
                            <option value="Phone">Phone</option>
                            <option value="Email">Email</option>
                            <option value="Text">Text Message</option>
                          </select>
                        </div>
                        <div className="form-group full-width" style={{ marginBottom: 0 }}>
                          <IdUpload value={person.idPhoto} onChange={(dataUrl) => updatePerson(index, 'idPhoto', dataUrl)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="full-width">
                <button type="button" className="btn btn-outline add-person-btn" onClick={addPerson}>
                  <UserPlus size={16} /> Add Another Person
                </button>
              </div>
            </div>
          )}

          {step === 2 && isAuto && (
            <div className="form-grid fade-in-up">
              <div className="form-group">
                <label className="form-label">VIN *</label>
                <input type="text" name="vin" required className="form-control" value={formData.vin} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Driver&apos;s License *</label>
                <input type="text" name="license" required className="form-control" value={formData.license} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth *</label>
                <input type="date" name="dob" required className="form-control" value={formData.dob} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Vehicle Status</label>
                <select name="vehicleStatus" className="form-control" value={formData.vehicleStatus} onChange={handleChange}>
                  <option value="Owned">Owned</option>
                  <option value="Financed">Financed</option>
                  <option value="Leased">Leased</option>
                </select>
              </div>
              {formData.vehicleStatus === 'Financed' && (
                <div className="form-group full-width">
                  <label className="form-label">Finance Company *</label>
                  <input type="text" name="financeCompany" required className="form-control" value={formData.financeCompany} onChange={handleChange} />
                </div>
              )}
              {formData.vehicleStatus === 'Leased' && (
                <div className="form-group full-width">
                  <label className="form-label">Lender Name *</label>
                  <input type="text" name="lenderName" required className="form-control" value={formData.lenderName} onChange={handleChange} />
                </div>
              )}
            </div>
          )}

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
