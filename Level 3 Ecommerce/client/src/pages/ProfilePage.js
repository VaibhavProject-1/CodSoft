// ProfilePage.js
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

import axios from 'axios';
import './ProfilePage.css';

// ImageComponent.js
const ImageComponent = ({ base64String, contentType }) => {
  const imageUrl = `data:${contentType};base64,${base64String}`;
  return <img width='100' height='100' className="profile-picture" src={imageUrl} alt="Profile" />;
};


const ProfilePage = () => {
  
  const [user, setUser] = useState({});
  const [editMode, setEditMode] = useState(false);
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const [updatedUser, setUpdatedUser] = useState({
    name: '',
    phone: '',
    email: '',
    newPassword: '',  // Add all other fields you want to make editable
    confirmNewPassword: '',  // Add all other fields you want to make editable
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        const response = await axios.get(`${process.env.REACT_APP_BACK_URL}/auth/profile/${username}`, {
          headers: {
            Authorization: `Bearer ${token}`,
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
          title: 'Fetch User Data Error',
          text: 'There was an error fetching user data. Please try again later.',
        });
      }
    };

    fetchUserData();
  }, []);

  const handleEditClick = () => {
    setEditMode(true);
    setUpdatedUser({
      name: user.name,
      phone: user.phone || '',
      email: user.email,
      newPassword: '',  // Add all other fields you want to make editable
      confirmNewPassword: '',  // Add all other fields you want to make editable
    });
  };

  const handleCancelEdit = () => {
    setEditMode(false);
  };

  
  // Updated handleAvatarChange function
  const handleAvatarChange = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (file.type.startsWith('image/')) {
        const base64String = reader.result.split(',')[1];
        const formData = new FormData();
        formData.append('avatar', file); // Use 'avatar' as the key
        setUpdatedUser((prevUser) => ({
          ...prevUser,
          avatar: formData,
        }));
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File Type',
          text: 'Please select an image file for the avatar.',
        });
      }
    };
    reader.readAsDataURL(file);
  };

  
  const handleSaveEdit = async () => {
    try {
      
      const formData = new FormData();
      formData.append('name', updatedUser.name);
      formData.append('phone', updatedUser.phone);
      formData.append('email', updatedUser.email);
      formData.append('newPassword', updatedUser.newPassword);
      formData.append('confirmNewPassword', updatedUser.confirmNewPassword);
  
      // Check if there's a file (avatar) to update
      if (updatedUser.avatar) {
        // Append the avatar data with the key 'avatar'
        formData.append('avatar', updatedUser.avatar.get('avatar'));
      }
  
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_BACK_URL}/auth/profile/${username}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data', // Set content type to multipart/form-data
          },
        }
      );
  
      // Set user data and exit edit mode after a successful update
      setUser(response.data.user);
      setEditMode(false);

      // Reload the entire page
      window.location.reload();
  
      // Any other actions after a successful update can be added here
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error Updating User Data',
        text: 'An error occurred while updating user data. Please try again later.',
      });
      // Handle the error appropriately (e.g., show an error message to the user)
    }
  };
  
  
  

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');

      const response = await axios.delete(`${process.env.REACT_APP_BACK_URL}/auth/profile/${username}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      localStorage.clear();
      window.location.href = '/login';
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error Deleting User Account',
        text: 'An error occurred while deleting the user account. Please try again later.',
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  if (!user || Object.keys(user).length === 0) {
    return <p>Loading...</p>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <ImageComponent base64String={user && user.avatar && user.avatar.base64String} />
        <h2>{user.name}</h2>
        <p>@{user.username}</p>
        {!editMode && <button className="edit-profile-button" onClick={handleEditClick}>Edit Profile</button>}
      </div>
  
      <div className="profile-details">
        {/* Editable Fields */}
        {editMode && (
          <>
            <div>
              <strong>Name:</strong>
              <input
                type="text"
                name="name"
                value={updatedUser.name}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <strong>Email:</strong>
              <input
                type="text"
                name="email"
                value={updatedUser.email}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <strong>Phone:</strong>
              <input
                type="text"
                name="phone"
                value={updatedUser.phone}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <strong>Password:</strong>
              <input
                type="password"
                name="newPassword"
                value={updatedUser.newPassword}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <strong>Confirm Password:</strong>
              <input
                type="password"
                name="confirmNewPassword"
                value={updatedUser.confirmNewPassword}
                onChange={handleInputChange}
              />
            </div>
          </>
        )}
  
        {/* Non-Editable Fields */}
        {!editMode && (
          <>
            <div>
              <strong>Username:</strong> {user.username}
            </div>
            <div>
              <strong>Password:</strong> {'********'}
            </div>
          </>
        )}

        {editMode && (
          <>
            {/* ... (other editable fields) */}

            <div>
              <strong>Avatar:</strong>
              <input
                type="file"
                name="avatar"
                accept="image/*"
                onChange={(e) => handleAvatarChange(e.target.files[0])}
              />
            </div>
          </>
        )}
  
        {/* Action Buttons */}
        {editMode && (
          <div>
            <button className="save-button" onClick={handleSaveEdit}>Save</button>
            <button className="cancel-button" onClick={handleCancelEdit}>Cancel</button>
          </div>
        )}
  
        {!editMode && (
          <div>
            <button className="delete-button" onClick={handleDeleteAccount}>Delete Account</button>
          </div>
        )}
      </div>
    </div>
  );
  
};

export default ProfilePage;