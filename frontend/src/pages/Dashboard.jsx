import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';
import { businessAPI, aiAPI } from '../services/api';

function Dashboard() {
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [kpis, setKpis] = useState(null);

  useEffect(() => {
    loadBusinesses();
  }, []);

  useEffect(() => {
    if (selectedBusiness) {
      loadKpis();
    }
  }, [selectedBusiness]);

  const loadBusinesses = async () => {
    try {
      const response = await businessAPI.list();
      setBusinesses(response.data);
      if (response.data.length > 0) {
        setSelectedBusiness(response.data[0]);
      }
    } catch (error) {
      console.error('Error loading businesses:', error);
    }
  };

  const loadKpis = async () => {
    if (!selectedBusiness) return;
    try {
      const response = await businessAPI.getKpis(selectedBusiness.id);
      setKpis(response.data);
    } catch (error) {
      console.error('Error loading KPIs:', error);
    }
  };

  const getInsights = async () => {
    if (!selectedBusiness) return;
    
    setLoading(true);
    try {
      const response = await aiAPI.getInsights(selectedBusiness.id);
      setInsights(response.data.response);
    } catch (error) {
      console.error('Error getting insights:', error);
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem' }}>Business Dashboard</h1>

      {businesses.length === 0 ? (
        <div className="card">
          <h2>Welcome to Business Growth Platform</h2>
          <p style={{ marginBottom: '1rem' }}>Get started by setting up your business profile.</p>
          <a href="/setup" className="button">Set Up Your Business</a>
        </div>
      ) : (
        selectedBusiness && (
        <>
          <div className="card">
            <h2>{selectedBusiness.name}</h2>
            <p style={{ color: '#6b7280' }}>{selectedBusiness.industry}</p>
          </div>

          <div className="grid grid-3">
            <div className="stat-card">
              <h3>Monthly Revenue</h3>
              <div className="value">${kpis?.monthly_revenue ? kpis.monthly_revenue.toLocaleString() : '0'}</div>
              <div className="change">
                {kpis?.monthly_revenue_change !== undefined && kpis.monthly_revenue_change !== 0 ? 
                  `↑ ${(kpis.monthly_revenue_change * 100).toFixed(1)}% from last month` : '0% from last month'}
              </div>
            </div>
            <div className="stat-card">
              <h3>Active Customers</h3>
              <div className="value">{kpis?.customer_growth || '0'}</div>
              <div className="change">
                {kpis?.customer_growth_change !== undefined && kpis.customer_growth_change !== 0 ? 
                  `↑ ${(kpis.customer_growth_change * 100).toFixed(1)}% from last month` : '0% from last month'}
              </div>
            </div>
            <div className="stat-card">
              <h3>Conversion Rate</h3>
              <div className="value">{(kpis?.conversion_rate ? (kpis.conversion_rate * 100).toFixed(1) : '0')}%</div>
              <div className="change">
                {kpis?.conversion_rate_change !== undefined && kpis.conversion_rate_change !== 0 ? 
                  `↑ ${(kpis.conversion_rate_change * 100).toFixed(2)}% from last month` : '0% from last month'}
              </div>
            </div>
          </div>

          <div className="card">
            <h2>AI-Powered Business Insights</h2>
            <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
              Get personalized insights and recommendations powered by Gemini AI
            </p>
            <button className="button" onClick={getInsights} disabled={loading}>
              {loading ? 'Analyzing...' : 'Get AI Insights'}
            </button>
            
            {insights && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>
                {insights}
              </div>
            )}
          </div>

          <div className="grid grid-2">
            <div className="card">
              <h3>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                <a href="/analytics" className="button">
                  <BarChart3 size={20} />
                  View Analytics
                </a>
                <a href="/ai-assistant" className="button button-secondary">
                  <TrendingUp size={20} />
                  Talk to AI Assistant
                </a>
              </div>
            </div>
          </div>
        </>
        )
      )}
    </div>
  );
}

export default Dashboard;
