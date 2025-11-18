import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { businessAPI, aiAPI } from '../services/api';

function AIAssistant() {
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadBusinesses();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const loadRecommendations = async () => {
    if (!selectedBusiness) return;
    
    setLoading(true);
    try {
      const response = await aiAPI.getRecommendations(selectedBusiness.id);
      setRecommendations(response.data);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedBusiness) return;

    const userMessage = { type: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await aiAPI.askQuestion({
        business_id: selectedBusiness.id,
        query: input,
      });
      
      const aiMessage = { type: 'ai', content: response.data.response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { type: 'ai', content: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem' }}>AI Business Assistant</h1>

      {businesses.length === 0 ? (
        <div className="card">
          <h2>No Business Found</h2>
          <p style={{ marginBottom: '1rem' }}>Please set up your business first.</p>
          <a href="/setup" className="button">Set Up Your Business</a>
        </div>
      ) : (
        <>
          <div className="card">
            <h2>Select Business</h2>
            <select 
              className="select"
              value={selectedBusiness?.id || ''}
              onChange={(e) => {
                const business = businesses.find(b => b.id === parseInt(e.target.value));
                setSelectedBusiness(business);
                setMessages([]);
              }}
            >
              {businesses.map(business => (
                <option key={business.id} value={business.id}>
                  {business.name} - {business.industry}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-2">
            <div className="card">
              <h2>Chat with AI Assistant</h2>
              <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
                Ask questions about your business, growth strategies, market insights, and more.
              </p>
              
              <div className="chat-container">
                <div className="chat-messages">
                  {messages.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>
                      <Sparkles size={48} style={{ margin: '0 auto 1rem' }} />
                      <p>Start a conversation with your AI business advisor</p>
                    </div>
                  )}
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.type}`}>
                      {msg.content}
                    </div>
                  ))}
                  {loading && (
                    <div className="message ai">Thinking...</div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                <div className="chat-input-container">
                  <input
                    type="text"
                    className="input"
                    placeholder="Ask a question..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    disabled={loading}
                  />
                  <button 
                    className="button" 
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="card">
              <h2>Growth Recommendations</h2>
              <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
                AI-generated recommendations to help your business grow
              </p>
              <button 
                className="button" 
                onClick={loadRecommendations}
                disabled={loading}
              >
                Get Recommendations
              </button>

              {recommendations.length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                  {recommendations.map((rec, idx) => (
                    <div key={idx} className="recommendation-card">
                      <span className={`priority ${rec.priority}`}>{rec.priority}</span>
                      <h4>{rec.title}</h4>
                      <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        {rec.description}
                      </p>
                      {rec.action_items && rec.action_items.length > 0 && (
                        <ul className="action-items">
                          {rec.action_items.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AIAssistant;
