import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState({});
  const [stats, setStats] = useState({
    level: Math.floor(Math.random() * 50) + 1,
    xp: Math.floor(Math.random() * 10000),
    wins: Math.floor(Math.random() * 100),
    losses: Math.floor(Math.random() * 50),
    rank: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'][Math.floor(Math.random() * 5)],
    coins: Math.floor(Math.random() * 5000) + 500
  });
  
  const [achievements, setAchievements] = useState([
    { id: 1, name: 'First Victory', description: 'Win your first match', unlocked: true },
    { id: 2, name: 'Sharpshooter', description: 'Achieve 90% accuracy in a match', unlocked: true },
    { id: 3, name: 'Unstoppable', description: 'Win 10 matches in a row', unlocked: false },
    { id: 4, name: 'Strategist', description: 'Complete all campaign missions', unlocked: false },
    { id: 5, name: 'Legend', description: 'Reach max level', unlocked: false },
  ]);
  
  const [activities, setActivities] = useState([
    { id: 1, type: 'match', result: 'Victory', points: '+25 XP', time: '2 hours ago' },
    { id: 2, type: 'achievement', result: 'Sharpshooter Unlocked', points: '+100 XP', time: '1 day ago' },
    { id: 3, type: 'level', result: 'Reached Level ' + (stats.level - 1), points: '+50 XP', time: '3 days ago' },
  ]);
  
  // Game state
  const [gameActive, setGameActive] = useState(false);
  const [gameType, setGameType] = useState(null);
  const [gameStatus, setGameStatus] = useState('idle');
  const [gameResult, setGameResult] = useState(null);
  const [gameStats, setGameStats] = useState({});
  const [currentOpponent, setCurrentOpponent] = useState(null);
  const [matchHistory, setMatchHistory] = useState([]);
  const [winStreak, setWinStreak] = useState(0);
  
  // Available opponents
  const opponents = [
    { id: 1, name: 'ShadowBlade', level: Math.floor(Math.random() * 50) + 1, rank: 'Silver', winRate: 48 },
    { id: 2, name: 'ProGamer99', level: Math.floor(Math.random() * 50) + 1, rank: 'Gold', winRate: 62 },
    { id: 3, name: 'NinjaWarrior', level: Math.floor(Math.random() * 50) + 1, rank: 'Platinum', winRate: 75 },
    { id: 4, name: 'MagicMaster', level: Math.floor(Math.random() * 50) + 1, rank: 'Bronze', winRate: 36 },
    { id: 5, name: 'CyberQueen', level: Math.floor(Math.random() * 50) + 1, rank: 'Diamond', winRate: 89 }
  ];
  
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    } else {
      navigate('/login');
    }
    
    // Load saved stats if they exist
    const savedStats = localStorage.getItem('playerStats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
    
    const savedHistory = localStorage.getItem('matchHistory');
    if (savedHistory) {
      setMatchHistory(JSON.parse(savedHistory));
    }
    
  }, [navigate]);
  
  // Save stats whenever they change
  useEffect(() => {
    localStorage.setItem('playerStats', JSON.stringify(stats));
  }, [stats]);
  
  useEffect(() => {
    localStorage.setItem('matchHistory', JSON.stringify(matchHistory));
  }, [matchHistory]);
  
  // Check for achievements after each game
  useEffect(() => {
    if (gameResult === 'win') {
      // Check for first win achievement
      if (!achievements.find(a => a.id === 1).unlocked) {
        unlockAchievement(1);
      }
      
      // Check for win streak achievement
      if (winStreak >= 10 && !achievements.find(a => a.id === 3).unlocked) {
        unlockAchievement(3);
      }
    }
    
    // Check for max level achievement
    if (stats.level >= 50 && !achievements.find(a => a.id === 5).unlocked) {
      unlockAchievement(5);
    }
  }, [gameResult, winStreak, stats.level, achievements]);

  const unlockAchievement = (id) => {
    setAchievements(prevAchievements => 
      prevAchievements.map(achievement => 
        achievement.id === id ? {...achievement, unlocked: true} : achievement
      )
    );
    
    // Add to activity feed
    const achievement = achievements.find(a => a.id === id);
    if (achievement) {
      addActivity({
        type: 'achievement',
        result: `${achievement.name} Unlocked`,
        points: '+100 XP',
        time: 'just now'
      });
      
      // Award XP for achievement
      updatePlayerStats({ xp: stats.xp + 100 });
    }
  };
  
  const addActivity = (activity) => {
    const newActivity = {
      id: Date.now(),
      ...activity
    };
    
    setActivities(prevActivities => [newActivity, ...prevActivities.slice(0, 9)]);
  };
  
  const updatePlayerStats = (newStats) => {
    setStats(prevStats => {
      const updatedStats = { ...prevStats, ...newStats };
      
      // Level up logic
      const xpPerLevel = 1000;
      const currentLevel = prevStats.level;
      const newLevel = Math.floor(updatedStats.xp / xpPerLevel) + 1;
      
      if (newLevel > currentLevel) {
        updatedStats.level = newLevel;
        addActivity({
          type: 'level',
          result: `Reached Level ${newLevel}`,
          points: '+50 XP',
          time: 'just now'
        });
      }
      
      return updatedStats;
    });
  };

  const startGame = (type) => {
    setGameActive(true);
    setGameType(type);
    setGameStatus('finding');
    setGameResult(null);
    
    // Simulate matchmaking
    setTimeout(() => {
      setGameStatus('matched');
      // Select random opponent
      const opponent = opponents[Math.floor(Math.random() * opponents.length)];
      setCurrentOpponent(opponent);
      
      // Start game after 2 seconds
      setTimeout(() => {
        setGameStatus('playing');
        
        // Simulate game duration (5-15 seconds)
        const gameDuration = Math.floor(Math.random() * 10000) + 5000;
        setTimeout(() => {
          finishGame();
        }, gameDuration);
      }, 2000);
    }, 3000);
  };
  
  const finishGame = () => {
    // Determine win/loss based on various factors
    let winChance = 0.5; // Base 50% chance
    
    // Adjust based on game type
    if (gameType === 'practice') {
      winChance += 0.2; // Easier in practice mode
    } else if (gameType === 'ranked') {
      // Ranked is more challenging and depends on opponent rank
      const rankValues = { 'Bronze': 1, 'Silver': 2, 'Gold': 3, 'Platinum': 4, 'Diamond': 5 };
      const playerRankValue = rankValues[stats.rank] || 3;
      const opponentRankValue = rankValues[currentOpponent.rank] || 3;
      
      winChance += (playerRankValue - opponentRankValue) * 0.1;
    }
    
    // Clamp win chance between 0.1 and 0.9
    winChance = Math.max(0.1, Math.min(0.9, winChance));
    
    // Determine result
    const isWin = Math.random() < winChance;
    const result = isWin ? 'win' : 'loss';
    
    // Generate random game stats
    const gameStats = {
      score: isWin ? Math.floor(Math.random() * 50) + 50 : Math.floor(Math.random() * 30) + 20,
      accuracy: Math.floor(Math.random() * 30) + 70,
      timeElapsed: Math.floor(Math.random() * 300) + 180, // 3-8 minutes in seconds
      xpEarned: isWin ? Math.floor(Math.random() * 30) + 20 : Math.floor(Math.random() * 15) + 5,
      coinsEarned: isWin ? Math.floor(Math.random() * 50) + 10 : Math.floor(Math.random() * 10) + 5
    };
    
    // Set game results
    setGameResult(result);
    setGameStats(gameStats);
    setGameStatus('completed');
    
    // Update match history
    const matchEntry = {
      id: Date.now(),
      opponent: currentOpponent.name,
      type: gameType,
      result: result,
      stats: gameStats,
      date: new Date().toISOString()
    };
    
    setMatchHistory(prev => [matchEntry, ...prev]);
    
    // Update player stats
    updatePlayerStats({
      wins: result === 'win' ? stats.wins + 1 : stats.wins,
      losses: result === 'loss' ? stats.losses + 1 : stats.losses,
      xp: stats.xp + gameStats.xpEarned,
      coins: stats.coins + gameStats.coinsEarned
    });
    
    // Handle win streak
    if (result === 'win') {
      setWinStreak(prev => prev + 1);
      
      // Check for sharpshooter achievement
      if (gameStats.accuracy >= 90 && !achievements.find(a => a.id === 2).unlocked) {
        unlockAchievement(2);
      }
    } else {
      setWinStreak(0);
    }
    
    // Add to activity feed
    addActivity({
      type: 'match',
      result: result === 'win' ? 'Victory' : 'Defeat',
      points: `+${gameStats.xpEarned} XP`,
      time: 'just now'
    });
  };
  
  const exitGame = () => {
    setGameActive(false);
    setGameStatus('idle');
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="player-info">
          <div className="avatar">
            {user.username && user.username.charAt(0).toUpperCase()}
          </div>
          <div className="player-details">
            <h2>{user.username}</h2>
            <p className="player-rank">{stats.rank} Player</p>
          </div>
        </div>
        <div className="player-currency">
          <span className="coin-display">
            <span className="coin-icon">🪙</span>
            {stats.coins}
          </span>
        </div>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      {!gameActive ? (
        <div className="dashboard-grid">
          <div className="dashboard-card stats-card">
            <h3>Player Stats</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Level</span>
                <span className="stat-value">{stats.level}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">XP</span>
                <span className="stat-value">{stats.xp} / {stats.level * 1000}</span>
                <div className="xp-bar">
                  <div 
                    className="xp-progress" 
                    style={{ width: `${(stats.xp % 1000) / 10}%` }}
                  ></div>
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-label">Wins</span>
                <span className="stat-value">{stats.wins}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Losses</span>
                <span className="stat-value">{stats.losses}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Win Rate</span>
                <span className="stat-value">
                  {stats.wins + stats.losses > 0 
                    ? Math.round((stats.wins / (stats.wins + stats.losses)) * 100)
                    : 0}%
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Win Streak</span>
                <span className="stat-value">{winStreak}</span>
              </div>
            </div>
          </div>

          <div className="dashboard-card activity-card">
            <h3>Recent Activity</h3>
            {activities.length > 0 ? (
              <ul className="activity-list">
                {activities.map(activity => (
                  <li key={activity.id} className="activity-item">
                    <div className="activity-icon">
                      {activity.type === 'match' ? '🎮' : activity.type === 'achievement' ? '🏆' : '⬆️'}
                    </div>
                    <div className="activity-details">
                      <span className="activity-result">{activity.result}</span>
                      <span className="activity-points">{activity.points}</span>
                    </div>
                    <span className="activity-time">{activity.time}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-activity">No recent activity</p>
            )}
          </div>

          <div className="dashboard-card achievements-card">
            <h3>Achievements</h3>
            <div className="achievements-list">
              {achievements.map(achievement => (
                <div 
                  key={achievement.id} 
                  className={`achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                >
                  <div className="achievement-icon">
                    {achievement.unlocked ? '🌟' : '🔒'}
                  </div>
                  <div className="achievement-details">
                    <span className="achievement-name">{achievement.name}</span>
                    <span className="achievement-desc">{achievement.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-card play-card">
            <h3>Ready to Play?</h3>
            <div className="play-options">
              <button className="play-btn quick" onClick={() => startGame('quick')}>Quick Match</button>
              <button className="play-btn ranked" onClick={() => startGame('ranked')}>Ranked Game</button>
              <button className="play-btn practice" onClick={() => startGame('practice')}>Practice Mode</button>
            </div>
          </div>
          
          {matchHistory.length > 0 && (
            <div className="dashboard-card match-history-card">
              <h3>Match History</h3>
              <div className="match-history-list">
                {matchHistory.slice(0, 5).map(match => (
                  <div key={match.id} className={`match-item ${match.result}`}>
                    <div className="match-result-icon">
                      {match.result === 'win' ? '🏆' : '❌'}
                    </div>
                    <div className="match-details">
                      <span className="match-opponent">vs. {match.opponent}</span>
                      <span className="match-type">{match.type}</span>
                    </div>
                    <div className="match-stats">
                      <span className="match-score">Score: {match.stats.score}</span>
                      <span className="match-xp">XP: +{match.stats.xpEarned}</span>
                    </div>
                    <span className="match-date">{new Date(match.date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="game-screen">
          {gameStatus === 'finding' && (
            <div className="game-finding">
              <h2>Finding Opponent</h2>
              <div className="loader"></div>
              <p>Searching for a {gameType} match...</p>
              <button className="cancel-btn" onClick={exitGame}>Cancel</button>
            </div>
          )}
          
          {gameStatus === 'matched' && (
            <div className="game-matched">
              <h2>Opponent Found!</h2>
              <div className="versus-container">
                <div className="player-side">
                  <div className="player-avatar">{user.username && user.username.charAt(0).toUpperCase()}</div>
                  <p className="player-name">{user.username}</p>
                  <p className="player-level">Level {stats.level}</p>
                </div>
                <div className="versus-text">VS</div>
                <div className="opponent-side">
                  <div className="opponent-avatar">{currentOpponent.name.charAt(0)}</div>
                  <p className="opponent-name">{currentOpponent.name}</p>
                  <p className="opponent-level">Level {currentOpponent.level}</p>
                </div>
              </div>
              <p className="match-starting">Match starting soon...</p>
            </div>
          )}
          
          {gameStatus === 'playing' && (
            <div className="game-playing">
              <h2>Game in Progress</h2>
              <div className="game-simulation">
                <div className="game-animation"></div>
                <p>Playing against {currentOpponent.name}...</p>
                <p className="game-tip">Tip: {[
                  "Use power-ups strategically for maximum effect.",
                  "Accuracy is often more important than speed.",
                  "Study your opponent's patterns to predict their next move.",
                  "Don't forget to use your special abilities when available.",
                  "Conserve resources early in the match for a strong finish."
                ][Math.floor(Math.random() * 5)]}</p>
              </div>
            </div>
          )}
          
          {gameStatus === 'completed' && (
            <div className={`game-result ${gameResult}`}>
              <h2 className="result-title">
                {gameResult === 'win' ? 'Victory!' : 'Defeat'}
              </h2>
              <div className="result-details">
                <div className="result-stats">
                  <div className="result-stat">
                    <span className="stat-label">Score</span>
                    <span className="stat-value">{gameStats.score}</span>
                  </div>
                  <div className="result-stat">
                    <span className="stat-label">Accuracy</span>
                    <span className="stat-value">{gameStats.accuracy}%</span>
                  </div>
                  <div className="result-stat">
                    <span className="stat-label">Time</span>
                    <span className="stat-value">{Math.floor(gameStats.timeElapsed / 60)}:{(gameStats.timeElapsed % 60).toString().padStart(2, '0')}</span>
                  </div>
                </div>
                <div className="result-rewards">
                  <div className="reward">
                    <span className="reward-icon">✨</span>
                    <span className="reward-value">+{gameStats.xpEarned} XP</span>
                  </div>
                  <div className="reward">
                    <span className="reward-icon">🪙</span>
                    <span className="reward-value">+{gameStats.coinsEarned} Coins</span>
                  </div>
                </div>
              </div>
              <button className="return-btn" onClick={exitGame}>Return to Dashboard</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;