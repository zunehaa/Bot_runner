import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { authAPI } from '../../api';
import './AuthOverlay.css';

export function AuthOverlay() {
  const showAuth = useGameStore((s) => s.showAuth);
  const setAuthModal = useGameStore((s) => s.setAuthModal);
  const setUser = useGameStore((s) => s.setUser);

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!showAuth) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const resp = isLogin 
        ? await authAPI.login({ email: formData.email, password: formData.password })
        : await authAPI.register(formData);
      
      localStorage.setItem('token', resp.data.token);
      setUser(resp.data.user);
      setAuthModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-card">
        <button className="close-btn" onClick={() => setAuthModal(false)}>✕</button>
        
        <h2>{isLogin ? 'Welcome Back' : 'Join the Run'}</h2>
        <p className="auth-subtitle">
          {isLogin ? 'Login to save your scores' : 'Create an account to track progress'}
        </p>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="input-group">
              <label>Username</label>
              <input 
                type="text" 
                required 
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="SkyRunner99"
              />
            </div>
          )}
          <div className="input-group">
            <label>Email</label>
            <input 
              type="email" 
              required 
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="runner@cosmos.com"
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              required 
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button className="auth-submit-btn" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <p className="auth-toggle">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign Up' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
}
