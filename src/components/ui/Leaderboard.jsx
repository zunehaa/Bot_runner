import { useState, useEffect } from 'react';
import { scoreAPI } from '../../api';
import './Leaderboard.css';

export function Leaderboard() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const resp = await scoreAPI.getLeaderboard();
        setScores(resp.data);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="leaderboard-container">
      <h3>🏆 GLOBAL TOP 10</h3>
      {loading ? (
        <div className="lb-loading">Loading...</div>
      ) : (
        <div className="lb-list">
          <div className="lb-header">
            <span>RANK</span>
            <span>PLAYER</span>
            <span>SCORE</span>
          </div>
          {scores.map((s, i) => (
            <div key={i} className="lb-row">
              <span className="lb-rank">#{i + 1}</span>
              <span className="lb-name">{s.username}</span>
              <span className="lb-score">{Math.floor(s.score).toLocaleString()}</span>
            </div>
          ))}
          {scores.length === 0 && <div className="lb-empty">No scores yet.</div>}
        </div>
      )}
    </div>
  );
}
