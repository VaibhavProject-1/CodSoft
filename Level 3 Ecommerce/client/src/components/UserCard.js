// UserCard.js
import React from 'react';

const UserCard = ({ user, handleEdit, handleDelete }) => {
  const decodeBase64Image = () => {
    const base64String = user.avatar.base64String;
    const binaryData = atob(base64String);
    const uint8Array = new Uint8Array(binaryData.length);
    
    for (let i = 0; i < binaryData.length; i++) {
      uint8Array[i] = binaryData.charCodeAt(i);
    }

    const blob = new Blob([uint8Array], { type: user.avatar.contentType });
    const imageUrl = URL.createObjectURL(blob);

    return imageUrl;
  };

  const getImageUrl = () => {
    console.log('User avatar:', user.avatar);

    if (user.avatar && user.avatar.contentType && user.avatar.base64String) {
      return decodeBase64Image();
    }

    return '';
  };

  return (
    <div className="user-card">
      {user.avatar && user.avatar.contentType && user.avatar.base64String && (
        <img src={getImageUrl()} alt={user.name} />
      )}
      <h3>{user.name}</h3>
      <p>@{user.username}</p>

      <div className="user-actions">
        <button onClick={() => handleEdit(user)}>Edit</button>
        <button onClick={() => handleDelete(user)}>Delete</button>
      </div>
    </div>
  );
};

export default UserCard;