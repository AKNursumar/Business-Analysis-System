import React, { useState } from 'react';
import './ResultsDisplay.css';

function ResultsDisplay({ results }) {
  const [activeTab, setActiveTab] = useState('inspection');

  const formatNumber = (num) => {
    if (typeof num !== 'number') return num;
    return num.toFixed(2);
  };

  const renderStatistics = (stats) => {
    return (
      <div className="stats-grid">
        {Object.entries(stats).map(([statType, values]) => (
          <div key={statType} className="stat-section">
            <h4>{statType.charAt(0).toUpperCase() + statType.slice(1)}</h4>
            <div className="stat-values">
              {Object.entries(values).map(([column, value]) => (
                <div key={column} className="stat-item">
                  <span className="stat-label">{column}</span>
                  <span className="stat-value">{formatNumber(value)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="results-container">
      <div className="results-header">
        <h2>📈 Analysis Results</h2>
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-label">Rows (Before Cleaning)</div>
            <div className="summary-value">{results.rows_before_outlier_removal}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Rows (After Cleaning)</div>
            <div className="summary-value">{results.rows_after_outlier_removal}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Outliers Removed</div>
            <div className="summary-value">{results.outliers_removed}</div>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'inspection' ? 'active' : ''}`}
          onClick={() => setActiveTab('inspection')}
        >
          📊 Data Inspection
        </button>
        <button
          className={`tab ${activeTab === 'cleaning' ? 'active' : ''}`}
          onClick={() => setActiveTab('cleaning')}
        >
          🧹 Cleaning Report
        </button>
        <button
          className={`tab ${activeTab === 'before' ? 'active' : ''}`}
          onClick={() => setActiveTab('before')}
        >
          📈 Stats (Before)
        </button>
        <button
          className={`tab ${activeTab === 'after' ? 'active' : ''}`}
          onClick={() => setActiveTab('after')}
        >
          ✨ Stats (After)
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'inspection' && (
          <div className="content-section">
            <h3>Data Inspection</h3>
            <div className="inspection-grid">
              <div className="inspection-item">
                <label>Shape</label>
                <span>{results.inspection.shape[0]} rows × {results.inspection.shape[1]} columns</span>
              </div>
              <div className="inspection-item">
                <label>Columns</label>
                <div className="columns-list">
                  {results.inspection.columns.map((col) => (
                    <span key={col} className="column-tag">{col}</span>
                  ))}
                </div>
              </div>
            </div>

            <h4>Data Types</h4>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Column</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(results.inspection.data_types).map(([col, type]) => (
                  <tr key={col}>
                    <td>{col}</td>
                    <td>{type}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h4>Missing Values</h4>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Column</th>
                  <th>Missing Count</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(results.inspection.missing_values).map(([col, count]) => (
                  <tr key={col}>
                    <td>{col}</td>
                    <td className={count > 0 ? 'missing' : 'complete'}>{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h4>Sample Data (First 5 Rows)</h4>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    {results.inspection.columns.map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.inspection.sample_data.map((row, idx) => (
                    <tr key={idx}>
                      {results.inspection.columns.map((col) => (
                        <td key={col}>{formatNumber(row[col])}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'cleaning' && (
          <div className="content-section">
            <h3>Data Cleaning Report</h3>
            <div className="cleaning-report">
              <div className="report-item">
                <div className="report-icon">🔄</div>
                <div className="report-details">
                  <h4>Duplicates Removed</h4>
                  <p className="report-value">{results.cleaning_report.duplicates_removed}</p>
                </div>
              </div>

              {Object.keys(results.cleaning_report.numeric_columns_filled).length > 0 && (
                <div className="report-item">
                  <div className="report-icon">🔢</div>
                  <div className="report-details">
                    <h4>Numeric Columns with Missing Values Filled</h4>
                    <ul>
                      {Object.entries(results.cleaning_report.numeric_columns_filled).map(([col, count]) => (
                        <li key={col}>{col}: {count} values</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {Object.keys(results.cleaning_report.categorical_columns_filled).length > 0 && (
                <div className="report-item">
                  <div className="report-icon">📝</div>
                  <div className="report-details">
                    <h4>Categorical Columns with Missing Values Filled</h4>
                    <ul>
                      {Object.entries(results.cleaning_report.categorical_columns_filled).map(([col, count]) => (
                        <li key={col}>{col}: {count} values</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'before' && (
          <div className="content-section">
            <h3>Statistics Before Outlier Removal</h3>
            {renderStatistics(results.stats_before)}
          </div>
        )}

        {activeTab === 'after' && (
          <div className="content-section">
            <h3>Statistics After Outlier Removal</h3>
            <div className="stats-note">
              <strong>Note:</strong> {results.outliers_removed} outliers were removed using the IQR method
            </div>
            {renderStatistics(results.stats_after)}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultsDisplay;
