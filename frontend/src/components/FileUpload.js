import React, { useState } from 'react';
import './FileUpload.css';

function FileUpload({ onUpload, loading, error }) {
  const [dragActive, setDragActive] = useState(false);

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
      onUpload(files[0]);
    }
  };

  const handleChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      onUpload(files[0]);
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

      {error && <div className="error-message">{error}</div>}

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
