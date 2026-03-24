import React, { useState } from 'react';
import axios from 'axios';
import FileUpload from './components/FileUpload';
import ResultsDisplay from './components/ResultsDisplay';
import './App.css';

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (file) => {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/analyze/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResults(response.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.message ||
        'An error occurred while analyzing the file'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setError(null);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>📊 Business Analytics System</h1>
        <p>Upload your CSV data and get instant analysis</p>
      </header>

      <main className="main-content">
        {!results ? (
          <FileUpload onUpload={handleFileUpload} loading={loading} error={error} />
        ) : (
          <>
            <ResultsDisplay results={results} />
            <button className="reset-button" onClick={handleReset}>
              Upload Another File
            </button>
          </>
        )}
      </main>

      <footer className="footer">
        <p>© 2024 Business Analytics System. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
