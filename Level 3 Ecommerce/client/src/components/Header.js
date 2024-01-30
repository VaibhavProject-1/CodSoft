// Header.js
import React, { useState, useEffect } from 'react';
import './Header.css'; // Import your styles
import axios from 'axios';
import Swal from 'sweetalert2';


const Header = () => {
  const [user, setUser] = useState({});
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const username = localStorage.getItem('username');
        const response = await axios.get(`${process.env.REACT_APP_BACK_URL}/auth/profile/${username}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const userWithImage = response.data.user;

        if (userWithImage.avatar && userWithImage.avatar.data) {
          const base64String = userWithImage.avatar.data.toString('base64');
          userWithImage.avatar = { ...userWithImage.avatar, base64String };
        }

        setUser(userWithImage);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while fetching user data. Please try again later.',
        });
      }
    };

    fetchUserData();
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.clear();
    // Redirect to login page

    // Show sweet alert
    Swal.fire({
      icon: 'success',
      title: 'Logged out successfully!',
      showConfirmButton: false,
      timer: 1500,
    });
    // Redirect to login page
    window.location.href = '/login';
  };

  return (
    <div className="header">
      <div className="header__left">
        <img
          className="header__logo"
          src="https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg"
          alt="spotify-logo"
        />
      </div>

      <div className="header__right">
        {/* <div className="header__searchIcon" onClick={toggleDropdown}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div> */}

        <div className="header__profile" onClick={toggleDropdown}>
          {user && user.avatar && user.avatar.base64String ? (
            <img className="header__avatar" src={`data:image/png;base64,${user.avatar.base64String}`} alt={user.name} />
          ) : (
            <img className="header__avatar" src="https://example.com/default-avatar.jpg" alt="Default Avatar" />
          )}

          {isDropdownOpen && (
            <div className="header__dropdown">
              {user ? (
                <button onClick={handleLogout}>Logout</button>
              ) : (
                <>
                  <button onClick={() => console.log('Login')}>Login</button>
                  <button onClick={() => console.log('Register')}>Register</button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;