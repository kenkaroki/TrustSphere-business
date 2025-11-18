import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Activity } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { businessAPI, aiAPI } from "../services/api";

function Analytics() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [kpis, setKpis] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [growthData, setGrowthData] = useState([]);

  useEffect(() => {
    if (user?.business_id) {
      loadAnalyticsData();
    }
  }, [user]);

  const loadAnalyticsData = async () => {
    if (!user?.business_id) return;

    try {
      const [kpisRes, revenueRes, growthRes, metricsRes] = await Promise.all([
        businessAPI.getKpis(user.business_id),
        businessAPI.getRevenueTrends(user.business_id),
        businessAPI.getGrowthByCategory(user.business_id),
        businessAPI.getMetrics(user.business_id),
      ]);

      // Add console logs to debug
      console.log("KPIs Response:", kpisRes.data);
      console.log("Revenue Trends Response:", revenueRes.data);
      console.log("Growth Data Response:", growthRes.data);
      console.log("Metrics Response:", metricsRes.data);

      setKpis(kpisRes.data);
      setRevenueData(revenueRes.data);
      setGrowthData(growthRes.data);
      setMetrics(metricsRes.data);
    } catch (error) {
      console.error("Error loading analytics data:", error);
    }
  };

  const analyzeMetrics = async () => {
    if (!user?.business_id) return;

    setLoading(true);
    try {
      const response = await aiAPI.analyzeMetrics(user.business_id);
      setAnalysis(response.data.response);
    } catch (error) {
      console.error("Error analyzing metrics:", error);
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: "2rem" }}>
        Business Analytics - {user?.name}
      </h1>

      {metrics.length === 0 ? (
        <div className="card">
          <h2>No Metrics Available</h2>
          <p style={{ marginBottom: "1rem" }}>
            Please add metrics to view analytics and insights.
          </p>
          <a href="/add-metrics" className="button">
            Add Metrics
          </a>
        </div>
      ) : (
        <>
          <div className="grid grid-3">
            <div
              className="stat-card"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              <h3>Monthly Revenue</h3>
              <div className="value">
                $
                {kpis?.monthly_revenue
                  ? kpis.monthly_revenue.toLocaleString()
                  : "0"}
              </div>
              <div className="change">
                {kpis?.monthly_revenue_change !== undefined &&
                kpis.monthly_revenue_change !== 0
                  ? `↑ ${(kpis.monthly_revenue_change * 100).toFixed(1)}% YoY`
                  : "0% YoY"}
              </div>
            </div>
            <div
              className="stat-card"
              style={{
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              }}
            >
              <h3>Customer Growth</h3>
              <div className="value">{kpis?.customer_growth || "0"}</div>
              <div className="change">
                {kpis?.customer_growth_change !== undefined &&
                kpis.customer_growth_change !== 0
                  ? `↑ ${(kpis.customer_growth_change * 100).toFixed(1)}% YoY`
                  : "0% YoY"}
              </div>
            </div>
            <div
              className="stat-card"
              style={{
                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              }}
            >
              <h3>Conversion Rate</h3>
              <div className="value">
                {kpis?.conversion_rate
                  ? (kpis.conversion_rate * 100).toFixed(1)
                  : "0"}
                %
              </div>
              <div className="change">
                {kpis?.conversion_rate_change !== undefined &&
                kpis.conversion_rate_change !== 0
                  ? `↑ ${(kpis.conversion_rate_change * 100).toFixed(
                      2
                    )}% from last month`
                  : "0% from last month"}
              </div>
            </div>
          </div>

          <div className="card">
            <h2>Revenue & Customer Trends</h2>
            {revenueData && revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4f46e5"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="customers"
                    stroke="#10b981"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p>Loading revenue data...</p>
            )}
          </div>

          <div className="grid grid-2">
            <div className="card">
              <h2>Growth by Category</h2>
              {growthData && growthData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="growth" fill="#4f46e5" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p>Loading growth data...</p>
              )}
            </div>

            <div className="card">
              <h2>AI Metrics Analysis</h2>
              <p style={{ marginBottom: "1rem", color: "#6b7280" }}>
                Get AI-powered insights from your business metrics
              </p>
              <button
                className="button"
                onClick={analyzeMetrics}
                disabled={loading || metrics.length === 0}
              >
                <Activity size={20} />
                {loading ? "Analyzing..." : "Analyze with AI"}
              </button>

              {analysis && (
                <div
                  style={{
                    marginTop: "1.5rem",
                    padding: "1rem",
                    background: "#f9fafb",
                    borderRadius: "8px",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {analysis}
                </div>
              )}

              {metrics.length === 0 && (
                <p
                  style={{
                    marginTop: "1rem",
                    color: "#9ca3af",
                    fontSize: "0.875rem",
                  }}
                >
                  No metrics available. Add metrics to get AI analysis.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Analytics;
