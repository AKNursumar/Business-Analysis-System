import React, { useState } from 'react';
import './ResultsDisplay.css';

function ResultsDisplay({ results }) {
  const [activeTab, setActiveTab] = useState('inspection');
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [columnCharts, setColumnCharts] = useState({});
  const [loadingCharts, setLoadingCharts] = useState(false);

  // Debug: Log results to see what's being returned
  React.useEffect(() => {
    console.log('ResultsDisplay received:', results);
    console.log('Charts object:', results?.charts);
    if (results?.charts) {
      console.log('Charts keys:', Object.keys(results.charts));
      Object.entries(results.charts).forEach(([key, value]) => {
        console.log(`Chart ${key}:`, value ? 'Present' : 'Missing/Null');
      });
    }
  }, [results]);

  const formatNumber = (num) => {
    if (typeof num !== 'number') return num;
    return num.toFixed(2);
  };

  const getNumericColumns = () => {
    return Object.entries(results.stats_after.mean || {})
      .map(([col]) => col);
  };

  const fetchColumnCharts = async (column) => {
    if (columnCharts[column]) {
      // Charts already loaded for this column
      return;
    }

    setLoadingCharts(true);
    try {
      const jobId = results.job_id;
      const response = await fetch(
        `/api/analyses/${jobId}/column/${encodeURIComponent(column)}/charts/`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setColumnCharts(prev => ({ ...prev, [column]: data }));
        console.log(`Column charts for ${column}:`, data);
      } else {
        console.error('Error fetching column charts:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching column charts:', error);
    } finally {
      setLoadingCharts(false);
    }
  };

  const handleColumnSelect = (column) => {
    setSelectedColumn(column);
    fetchColumnCharts(column);
  };

  const numericColumns = getNumericColumns();

  // Initialize selectedColumn if not set
  if (!selectedColumn && numericColumns.length > 0) {
    selectedColumn === null && numericColumns.length > 0 && setSelectedColumn(numericColumns[0]);
  }

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
        <button
          className={`tab ${activeTab === 'columns' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('columns');
            setSelectedColumn(selectedColumn || numericColumns[0]);
          }}
        >
          📊 Column Analysis
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
            
            {/* Cleaning Summary Pie Chart */}
            {results.charts?.cleaning ? (
              <div className="chart-container">
                <h4>🧹 Cleaning Summary</h4>
                <img 
                  src={results.charts.cleaning} 
                  alt="Cleaning Summary" 
                  style={{ maxWidth: '100%', height: 'auto' }}
                  onError={(e) => console.error('Chart image failed to load:', e)}
                />
              </div>
            ) : (
              <div className="chart-container">
                <h4>🧹 Cleaning Summary</h4>
                <p style={{ color: '#666' }}>Chart not available</p>
              </div>
            )}

            {/* Text Report */}
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
            
            {/* Stats Before Charts */}
            {results.charts?.stats_before ? (
              <div className="chart-container">
                <h4>📊 Mean vs Median by Column</h4>
                <img 
                  src={results.charts.stats_before} 
                  alt="Mean vs Median" 
                  style={{ maxWidth: '100%', height: 'auto' }}
                  onError={(e) => console.error('Chart image failed to load:', e)}
                />
              </div>
            ) : (
              <div className="chart-container">
                <h4>📊 Mean vs Median by Column</h4>
                <p style={{ color: '#999' }}>Chart not generated</p>
              </div>
            )}

            {results.charts?.minmax_before ? (
              <div className="chart-container">
                <h4>📈 Min-Max Range by Column</h4>
                <img 
                  src={results.charts.minmax_before} 
                  alt="Min-Max Range" 
                  style={{ maxWidth: '100%', height: 'auto' }}
                  onError={(e) => console.error('Chart image failed to load:', e)}
                />
              </div>
            ) : (
              <div className="chart-container">
                <h4>📈 Min-Max Range by Column</h4>
                <p style={{ color: '#999' }}>Chart not generated</p>
              </div>
            )}

            {/* Table View */}
            <div className="stats-grid">
              {Object.entries(results.stats_before).map(([statType, values]) => (
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
          </div>
        )}

        {activeTab === 'after' && (
          <div className="content-section">
            <h3>Statistics After Outlier Removal</h3>
            
            {/* Before/After Comparison Chart */}
            {results.charts?.outlier_comparison ? (
              <div className="chart-container">
                <h4>📊 Data Volume Before & After Outlier Removal</h4>
                <img 
                  src={results.charts.outlier_comparison} 
                  alt="Outlier Comparison" 
                  style={{ maxWidth: '100%', height: 'auto' }}
                  onError={(e) => console.error('Chart image failed to load:', e)}
                />
              </div>
            ) : (
              <div className="chart-container">
                <h4>📊 Data Volume Before & After Outlier Removal</h4>
                <p style={{ color: '#999' }}>Chart not generated</p>
              </div>
            )}

            {/* Statistics Note */}
            <div className="stats-note">
              <strong>📌 Summary:</strong> {results.outliers_removed} outliers were removed using the IQR method
            </div>
            
            {/* Stats After Charts */}
            {results.charts?.stats_after ? (
              <div className="chart-container">
                <h4>📊 Mean vs Median by Column</h4>
                <img 
                  src={results.charts.stats_after} 
                  alt="Mean vs Median" 
                  style={{ maxWidth: '100%', height: 'auto' }}
                  onError={(e) => console.error('Chart image failed to load:', e)}
                />
              </div>
            ) : (
              <div className="chart-container">
                <h4>📊 Mean vs Median by Column</h4>
                <p style={{ color: '#999' }}>Chart not generated</p>
              </div>
            )}

            {results.charts?.minmax_after ? (
              <div className="chart-container">
                <h4>📈 Min-Max Range by Column</h4>
                <img 
                  src={results.charts.minmax_after} 
                  alt="Min-Max Range" 
                  style={{ maxWidth: '100%', height: 'auto' }}
                  onError={(e) => console.error('Chart image failed to load:', e)}
                />
              </div>
            ) : (
              <div className="chart-container">
                <h4>📈 Min-Max Range by Column</h4>
                <p style={{ color: '#999' }}>Chart not generated</p>
              </div>
            )}

            {/* Table View */}
            <div className="stats-grid">
              {Object.entries(results.stats_after).map(([statType, values]) => (
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
          </div>
        )}

        {activeTab === 'columns' && (
          <div className="content-section">
            <h3>📊 Individual Column Analysis</h3>
            
            {/* Column Selector */}
            <div className="column-selector">
              <label>Select Column:</label>
              <div className="column-buttons">
                {numericColumns.map((col) => (
                  <button
                    key={col}
                    className={`column-btn ${selectedColumn === col ? 'active' : ''}`}
                    onClick={() => handleColumnSelect(col)}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>

            {selectedColumn && (
              <div>
                {/* Column Details Card */}
                <div className="column-details">
                  <div className="details-grid">
                    <div className="detail-card">
                      <div className="detail-label">Mean</div>
                      <div className="detail-value">{formatNumber(results.stats_after.mean?.[selectedColumn])}</div>
                    </div>
                    <div className="detail-card">
                      <div className="detail-label">Median</div>
                      <div className="detail-value">{formatNumber(results.stats_after.median?.[selectedColumn])}</div>
                    </div>
                    <div className="detail-card">
                      <div className="detail-label">Min</div>
                      <div className="detail-value">{formatNumber(results.stats_after.min?.[selectedColumn])}</div>
                    </div>
                    <div className="detail-card">
                      <div className="detail-label">Max</div>
                      <div className="detail-value">{formatNumber(results.stats_after.max?.[selectedColumn])}</div>
                    </div>
                    <div className="detail-card">
                      <div className="detail-label">Sum</div>
                      <div className="detail-value">{formatNumber(results.stats_after.sum?.[selectedColumn])}</div>
                    </div>
                    <div className="detail-card">
                      <div className="detail-label">Range</div>
                      <div className="detail-value">
                        {formatNumber(
                          (results.stats_after.max?.[selectedColumn] || 0) -
                            (results.stats_after.min?.[selectedColumn] || 0)
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Loading indicator */}
                {loadingCharts && (
                  <div className="chart-container">
                    <p style={{ textAlign: 'center', color: '#666' }}>Loading charts for {selectedColumn}...</p>
                  </div>
                )}

                {/* Column-specific charts */}
                {columnCharts[selectedColumn] && (
                  <>
                    {columnCharts[selectedColumn].distribution && (
                      <div className="chart-container">
                        <h4>📊 Distribution of {selectedColumn}</h4>
                        <img 
                          src={columnCharts[selectedColumn].distribution} 
                          alt="Distribution" 
                          style={{ maxWidth: '100%', height: 'auto' }}
                          onError={(e) => console.error('Distribution chart failed to load:', e)}
                        />
                      </div>
                    )}

                    {columnCharts[selectedColumn].kde && (
                      <div className="chart-container">
                        <h4>📈 Density Plot of {selectedColumn}</h4>
                        <img 
                          src={columnCharts[selectedColumn].kde} 
                          alt="KDE" 
                          style={{ maxWidth: '100%', height: 'auto' }}
                          onError={(e) => console.error('KDE chart failed to load:', e)}
                        />
                      </div>
                    )}

                    {columnCharts[selectedColumn].boxplot && (
                      <div className="chart-container">
                        <h4>📦 Box Plot of {selectedColumn}</h4>
                        <img 
                          src={columnCharts[selectedColumn].boxplot} 
                          alt="Box Plot" 
                          style={{ maxWidth: '100%', height: 'auto' }}
                          onError={(e) => console.error('Box plot failed to load:', e)}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultsDisplay;
