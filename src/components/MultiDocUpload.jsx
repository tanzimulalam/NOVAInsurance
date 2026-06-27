import React, { useRef, useState } from 'react';
import { FilePlus, Trash2, Loader2 } from 'lucide-react';
import { compressImage } from '../utils/image';

// Lets the user attach multiple photos/documents (stored as compressed data URLs).
const MultiDocUpload = ({ values = [], onChange, label = 'Documents' }) => {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (inputRef.current) inputRef.current.value = '';
    if (files.length === 0) return;
    setBusy(true);
    setError('');
    try {
      const added = [];
      for (const file of files) {
        if (file.type.startsWith('image/')) added.push(await compressImage(file));
      }
      if (added.length === 0) setError('Please choose image files.');
      else onChange([...(values || []), ...added]);
    } catch {
      setError('Could not process one of the files. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const removeAt = (index) => onChange(values.filter((_, i) => i !== index));

  return (
    <div className="id-upload">
      <label className="form-label">{label} (optional)</label>

      {values.length > 0 && (
        <div className="multi-doc-grid">
          {values.map((doc, index) => (
            <div className="multi-doc-item" key={index}>
              <img src={doc} alt={`Document ${index + 1}`} />
              <button type="button" className="multi-doc-remove" title="Remove" onClick={() => removeAt(index)}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="id-upload-actions" style={{ marginTop: values.length > 0 ? '12px' : 0 }}>
        <button type="button" className="btn btn-outline btn-sm" disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? <Loader2 size={16} className="spin" /> : <FilePlus size={16} />} Add Documents
        </button>
      </div>

      {error && <p className="id-upload-error">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
};

export default MultiDocUpload;
