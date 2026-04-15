import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import './ResultsDisplay.css';

function ResultsDisplay({ results }) {
  const [activeTab, setActiveTab] = useState('inspection');
  const [selectedColumn, setSelectedColumn] = useState(null);

  const formatNumber = (num) => {
    if (typeof num !== 'number') return num;
    return num.toFixed(2);
  };

  // Prepare data for statistics charts
  const prepareStatsChartData = (stats) => {
    const columns = Object.keys(stats.mean || {});
    return columns.map((col) => ({
      name: col,
      mean: stats.mean?.[col],
      median: stats.median?.[col],
      min: stats.min?.[col],
      max: stats.max?.[col],
    }));
  };

  // Prepare data for before/after comparison
  const prepareOutlierComparisonData = () => {
    return [
      {
        name: 'Rows',
        before: results.rows_before_outlier_removal,
        after: results.rows_after_outlier_removal,
      },
    ];
  };

  // Prepare data for cleaning summary pie chart
  const prepareCleaningData = () => {
    const data = [
      {
        name: 'Duplicates Removed',
        value: results.cleaning_report.duplicates_removed,
        color: '#FF6B6B',
      },
      {
        name: 'Remaining Data',
        value: results.rows_before_outlier_removal - results.cleaning_report.duplicates_removed,
        color: '#4ECDC4',
      },
    ];
    return data.filter((d) => d.value > 0);
  };

  // Prepare individual column data
  const getNumericColumns = () => {
    return Object.entries(results.stats_after.mean || {})
      .map(([col]) => col);
  };

  const getColumnStats = (columnName, stats) => {
    return [
      {
        stat: 'Mean',
        value: stats.mean?.[columnName] || 0,
      },
      {
        stat: 'Median',
        value: stats.median?.[columnName] || 0,
      },
      {
        stat: 'Min',
        value: stats.min?.[columnName] || 0,
      },
      {
        stat: 'Max',
        value: stats.max?.[columnName] || 0,
      },
    ];
  };

  const numericColumns = getNumericColumns();

  const renderStatistics = (stats) => {
    const chartData = prepareStatsChartData(stats);
    return (
      <div>
        {/* Chart Visualization */}
        <div className="chart-container">
          <h4>📊 Mean vs Median by Column</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="mean" fill="#667eea" name="Mean" />
              <Bar dataKey="median" fill="#764ba2" name="Median" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Range Chart (Min-Max) */}
        <div className="chart-container">
          <h4>📈 Min-Max Range by Column</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="min" stroke="#FF6B6B" name="Min" />
              <Line type="monotone" dataKey="max" stroke="#51CF66" name="Max" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Table View */}
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
            
            {/* Cleaning Summary Chart */}
            <div className="chart-container">
              <h4>🧹 Cleaning Summary</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={prepareCleaningData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {prepareCleaningData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

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
            {renderStatistics(results.stats_before)}
          </div>
        )}

        {activeTab === 'after' && (
          <div className="content-section">
            <h3>Statistics After Outlier Removal</h3>
            
            {/* Before/After Comparison Chart */}
            <div className="chart-container">
              <h4>📊 Data Volume Before & After Outlier Removal</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={prepareOutlierComparisonData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="before" fill="#FF6B6B" name="Before Removal" />
                  <Bar dataKey="after" fill="#51CF66" name="After Removal" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Statistics Note */}
            <div className="stats-note">
              <strong>📌 Summary:</strong> {results.outliers_removed} outliers were removed using the IQR method
            </div>
            
            {/* Statistics */}
            {renderStatistics(results.stats_after)}
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
                    onClick={() => setSelectedColumn(col)}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>

            {selectedColumn && (
              <div>
                {/* Column Statistics Chart */}
                <div className="chart-container">
                  <h4>📈 Statistics for "{selectedColumn}"</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getColumnStats(selectedColumn, results.stats_after)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="stat" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatNumber(value)} />
                      <Bar dataKey="value" fill="#667eea" name="Value" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

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

                {/* Before/After Comparison for Column */}
                <div className="chart-container">
                  <h4>📊 Before/After Outlier Removal - {selectedColumn}</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        {
                          label: selectedColumn,
                          Mean_Before: results.stats_before?.mean?.[selectedColumn] || 0,
                          Mean_After: results.stats_after?.mean?.[selectedColumn] || 0,
                          Median_Before: results.stats_before?.median?.[selectedColumn] || 0,
                          Median_After: results.stats_after?.median?.[selectedColumn] || 0,
                        },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatNumber(value)} />
                      <Legend />
                      <Bar dataKey="Mean_Before" fill="#FF6B6B" name="Mean (Before)" />
                      <Bar dataKey="Mean_After" fill="#51CF66" name="Mean (After)" />
                      <Bar dataKey="Median_Before" fill="#FFA500" name="Median (Before)" />
                      <Bar dataKey="Median_After" fill="#4ECDC4" name="Median (After)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultsDisplay;
