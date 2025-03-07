// src/components/Home.js
import React from 'react';

function Home() {
  const player = JSON.parse(localStorage.getItem('player'));
  
  return (
    <div className="home">
      <h2>Welcome to Player Authentication System</h2>
      {player ? (
        <div>
          <p>You are logged in as: <strong>{player.username}</strong></p>
          <p>Your email: {player.email}</p>
        </div>
      ) : (
        <p>Please register or login to access your account.</p>
      )}
    </div>
  );
}

export default Home;