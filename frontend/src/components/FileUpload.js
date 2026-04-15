import React, { useState } from 'react';
import './FileUpload.css';

const MAX_FILE_SIZE = 5242880; // 5MB in bytes

function FileUpload({ onUpload, loading, error, onFileError }) {
  const [dragActive, setDragActive] = useState(false);
  const [sizeError, setSizeError] = useState(null);
  
  const validateFile = (file) => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setSizeError(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 5MB limit`);
      if (onFileError) onFileError(`File size exceeds 5MB limit`);
      return false;
    }
    // Check file type
    if (!file.name.endsWith('.csv')) {
      setSizeError('Please upload a CSV file');
      if (onFileError) onFileError('Only CSV files are accepted');
      return false;
    }
    setSizeError(null);
    return true;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      if (validateFile(files[0])) {
        onUpload(files[0]);
      }
    }
  };

  const handleChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      if (validateFile(files[0])) {
        onUpload(files[0]);
      }
    }
  };

  return (
    <div className="file-upload-container">
      <div
        className={`upload-area ${dragActive ? 'active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="upload-content">
          <div className="upload-icon">📁</div>
          <h2>Upload Your CSV File</h2>
          <p>Drag and drop your CSV file here, or click to select</p>
          <input
            type="file"
            accept=".csv"
            onChange={handleChange}
            disabled={loading}
            className="file-input"
            id="file-input"
          />
          <label htmlFor="file-input" className="file-label">
            {loading ? 'Analyzing...' : 'Select File'}
          </label>
        </div>
      </div>

      {(error || sizeError) && <div className="error-message">{sizeError || error}</div>}

      {loading && (
        <div className="loading-message">
          <div className="spinner"></div>
          <p>Analyzing your data, please wait...</p>
        </div>
      )}

      <div className="info-box">
        <h3>Requirements:</h3>
        <ul>
          <li>File must be in CSV format</li>
          <li>Maximum file size: 5MB</li>
          <li>Must contain numeric columns for analysis</li>
        </ul>
      </div>
    </div>
  );
}

export default FileUpload;
