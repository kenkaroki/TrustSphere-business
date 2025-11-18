import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { businessAPI } from '../services/api';
import { List, DollarSign, Users, BarChart, ArrowRight, TrendingUp, Plus, Trash } from 'lucide-react';

function AddMetrics() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [metrics, setMetrics] = useState([{ metric_type: '', value: '', period: '' }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [businessId, setBusinessId] = useState('');

  useEffect(() => {
    if (user && user.business_id) {
      setBusinessId(user.business_id);
    }
  }, [user]);

  const handleChange = (index, e) => {
    const updatedMetrics = [...metrics];
    updatedMetrics[index][e.target.name] = e.target.value;
    setMetrics(updatedMetrics);
  };

  const addMetric = () => {
    setMetrics([...metrics, { metric_type: '', value: '', period: '' }]);
  };

  const removeMetric = (index) => {
    const updatedMetrics = [...metrics];
    updatedMetrics.splice(index, 1);
    setMetrics(updatedMetrics);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const metricsPayload = metrics.map(metric => ({
      business_id: businessId,
      metric_type: metric.metric_type,
      value: parseFloat(metric.value),
      period: metric.period,
    }));

    try {
      await businessAPI.addMetricsBatch(metricsPayload);
      navigate('/');
    } catch (err) {
      setError('An error occurred while submitting your metrics.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '5rem' }}>
        <p>Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '800px', marginTop: '4rem' }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <TrendingUp size={48} style={{ color: '#3b82f6', marginBottom: '1rem' }} />
          <h1 style={{ marginBottom: '0.5rem' }}>Add Business Metrics</h1>
          <p style={{ color: '#6b7280' }}>
            Provide your business metrics to get personalized analysis and insights.
          </p>
        </div>

        {error && (
          <div className="error" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {metrics.map((metric, index) => (
            <div key={index} className="grid-container" style={{ display: 'grid', gridTemplateColumns: '3fr 2fr 2fr 1fr', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
              <div className="form-group">
                <label>Metric Type</label>
                <select
                  name="metric_type"
                  className="input"
                  value={metric.metric_type}
                  onChange={(e) => handleChange(index, e)}
                  required
                >
                  <option value="">Select Metric Type</option>
                  <option value="revenue">Revenue</option>
                  <option value="customers">Customers</option>
                  <option value="conversion_rate">Conversion Rate</option>
                  <option value="marketing_spend">Marketing Spend</option>
                  <option value="churn_rate">Churn Rate</option>
                  <option value="average_order_value">Average Order Value</option>
                </select>
              </div>

              <div className="form-group">
                <label>Value</label>
                <input
                  type="number"
                  name="value"
                  className="input"
                  value={metric.value}
                  onChange={(e) => handleChange(index, e)}
                  placeholder="e.g., 5000"
                  required
                />
              </div>

              <div className="form-group">
                <label>Period</label>
                <input
                  type="month"
                  name="period"
                  className="input"
                  value={metric.period}
                  onChange={(e) => handleChange(index, e)}
                  required
                />
              </div>

              <div className="form-group" style={{ paddingTop: '1.5rem' }}>
                <button type="button" className="button-icon" onClick={() => removeMetric(index)}>
                  <Trash size={20} />
                </button>
              </div>
            </div>
          ))}

          <button type="button" className="button-secondary" onClick={addMetric} style={{ marginRight: '1rem' }}>
            <Plus size={20} style={{ marginRight: '0.5rem' }} />
            Add Another Metric
          </button>

          <button type="submit" className="button" disabled={loading} style={{ marginTop: '1.5rem' }}>
            {loading ? 'Saving Metrics...' : 'Save Metrics'}
            {!loading && <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddMetrics;
