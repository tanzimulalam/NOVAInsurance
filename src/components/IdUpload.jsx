import React, { useRef, useState } from 'react';
import { Camera, ImagePlus, Trash2, Loader2 } from 'lucide-react';
import { compressImage } from '../utils/image';

const IdUpload = ({ value, onChange, label = 'Photo ID', required = false }) => {
  const galleryRef = useRef(null);
  const cameraRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file, inputRef) => {
    if (inputRef?.current) inputRef.current.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const dataUrl = await compressImage(file);
      onChange(dataUrl);
    } catch {
      setError('Could not process that image. Please try another.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="id-upload">
      <label className="form-label">{label}{required ? ' *' : ''}</label>

      {value ? (
        <div className="id-upload-preview">
          <img src={value} alt="Uploaded ID" />
          <div className="id-upload-preview-actions">
            <button type="button" className="btn btn-outline btn-sm" onClick={() => galleryRef.current?.click()}>
              <ImagePlus size={14} /> Replace
            </button>
            <button type="button" className="btn btn-ghost btn-sm" style={{ color: '#dc2626' }} onClick={() => onChange('')}>
              <Trash2 size={14} /> Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="id-upload-actions">
          <button type="button" className="btn btn-outline btn-sm" disabled={busy} onClick={() => cameraRef.current?.click()}>
            {busy ? <Loader2 size={16} className="spin" /> : <Camera size={16} />} Take Photo
          </button>
          <button type="button" className="btn btn-outline btn-sm" disabled={busy} onClick={() => galleryRef.current?.click()}>
            {busy ? <Loader2 size={16} className="spin" /> : <ImagePlus size={16} />} Choose from Gallery
          </button>
        </div>
      )}

      {error && <p className="id-upload-error">{error}</p>}

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0], cameraRef)}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0], galleryRef)}
      />
    </div>
  );
};

export default IdUpload;
