import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authService from '../services/authService';
import FileUpload from './FileUpload';
import ResultsDisplay from './ResultsDisplay';
import './DashboardPage.css';

/**
 * Main dashboard page with file upload, analysis history, and results display
 */
const DashboardPage = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Load analysis history on mount
  useEffect(() => {
    loadAnalysisHistory();
  }, []);

  const loadAnalysisHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await axios.get('http://localhost:8000/api/analyses/', {
        headers: authService.getAuthHeaders(),
        timeout: 30000,
      });
      setAnalysisHistory(response.data);
    } catch (err) {
      console.error('Failed to load analysis history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/api/analyze/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...authService.getAuthHeaders(),
        },
        timeout: 300000,
      });
      setResults(response.data);
      
      // Refresh history after new analysis
      loadAnalysisHistory();
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else {
        setError(
          err.response?.data?.error ||
          err.message ||
          'An error occurred while analyzing the file'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoadAnalysis = async (jobId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8000/api/analyses/${jobId}/`,
        {
          headers: authService.getAuthHeaders(),
          timeout: 30000,
        }
      );
      setResults(response.data.result_json);
    } catch (err) {
      setError('Failed to load analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setError(null);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        <div className="history-sidebar">
          <h3>📋 Analysis History</h3>
          {historyLoading ? (
            <p className="history-loading">Loading...</p>
          ) : analysisHistory.length === 0 ? (
            <p className="history-empty">No analyses yet. Upload a file to get started!</p>
          ) : (
            <ul className="history-list">
              {analysisHistory.map((analysis) => (
                <li key={analysis.id} className="history-item">
                  <button
                    onClick={() => handleLoadAnalysis(analysis.id)}
                    className="history-button"
                  >
                    <div className="history-filename">{analysis.filename}</div>
                    <div className="history-date">
                      {new Date(analysis.upload_date).toLocaleDateString()}
                    </div>
                    <div className="history-size">
                      {analysis.rows_before !== null && `${analysis.rows_before} rows`}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <main className="dashboard-main">
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
      </div>
    </div>
  );
};

export default DashboardPage;
