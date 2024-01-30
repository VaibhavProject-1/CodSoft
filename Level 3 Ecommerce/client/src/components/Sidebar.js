// Sidebar.js

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';
import LoginForm from '../pages/LoginForm';
import RegistrationForm from '../pages/RegistrationForm';
import PlaylistSidebar from './PlaylistSidebar';

const Sidebar = () => {
  const [showPlaylistSidebar, setShowPlaylistSidebar] = useState(false);
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  const handlePlaylistButtonClick = () => {
    setShowPlaylistSidebar(!showPlaylistSidebar);
  };

  return (
    <>
      <div className="sidebar">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/payment">Premium Packs</Link>
        <Link to="/profile">Profile</Link>
        {isAdmin && <Link to="/dashboard">Dashboard</Link>}
        <button onClick={handlePlaylistButtonClick}>Playlists</button>
      </div>

      {/* Conditionally render PlaylistSidebar based on showPlaylistSidebar state */}
      {showPlaylistSidebar && <PlaylistSidebar />}
    </>
  );
};

export default Sidebar;