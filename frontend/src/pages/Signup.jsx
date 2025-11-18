import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    industry: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const industries = [
    'Technology', 'Retail', 'Healthcare', 'Finance', 'Manufacturing',
    'Education', 'Food & Beverage', 'Real Estate', 'Consulting', 'E-commerce', 'Other'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await signup(
      formData.name,
      formData.email,
      formData.password,
      formData.industry,
      formData.description
    );

    if (result.success) {
      // Redirect to metrics page after successful signup
      navigate('/add-metrics');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="container" style={{ maxWidth: '600px', marginTop: '4rem' }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Building2 size={48} style={{ color: '#3b82f6', marginBottom: '1rem' }} />
          <h1 style={{ marginBottom: '0.5rem' }}>Create Your Account</h1>
          <p style={{ color: '#6b7280' }}>Get started with AI-powered business insights</p>
        </div>

        {error && (
          <div className="error" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Business Name *</label>
            <input
              type="text"
              name="name"
              className="input"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Acme Inc."
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              className="input"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              className="input"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="At least 6 characters"
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label>Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              className="input"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Re-enter your password"
            />
          </div>

          <div className="form-group">
            <label>Industry *</label>
            <select
              name="industry"
              className="select"
              value={formData.industry}
              onChange={handleChange}
              required
            >
              <option value="">Select an industry</option>
              {industries.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Business Description *</label>
            <textarea
              name="description"
              className="textarea"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Describe your business, products/services, target market, etc."
              rows={4}
            />
          </div>

          <button type="submit" className="button" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Creating Account...' : 'Create Account'}
            {!loading && <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', color: '#6b7280' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
