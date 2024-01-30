// EditUserModal.js
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import Swal from 'sweetalert2';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: '500px',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

const EditUserModal = ({ isOpen, onRequestClose, user, handleEdit }) => {
  const [editedUser, setEditedUser] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [avatarData, setAvatarData] = useState(null);
  const [avatarContentType, setAvatarContentType] = useState('image/png');



  useEffect(() => {
    setEditedUser(user || {});
  }, [user]);


const handleAvatarChange = (file) => {
  if (file.type.startsWith('image/')) {
    setSelectedFile(file);

    // Read the file extension from the file name
    const fileExtension = file.name.split('.').pop().toLowerCase();

    // Map common file extensions to content types (you can extend this mapping)
    const extensionToContentType = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      // Add more extensions and content types as needed
    };

    // Get content type based on the file extension
    const contentType = extensionToContentType[fileExtension] || 'image/png';

    // Set the content type in state
    setAvatarContentType(contentType);
    // console.log("Content Type: ",contentType);

    // Read the file as a data URL and convert it to a base64 string
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarData(reader.result.split(',')[1]); // Use only the base64 part
      // console.log("Set Avatar Data: ",reader.result.split(',')[1]);
    };
    reader.readAsDataURL(file);
  } else {
    console.error('Invalid file type for avatar. Please select an image.');
  }
};

// Function to extract content type from base64 string
const getContentTypeFromBase64 = (base64String) => {
  const matches = base64String.match(/^data:(.+?);base64,/);
  return matches ? matches[1] : null;
};


const handleSave = async (e) => {
  e.preventDefault();

  try {
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('token');

    const headers = {
      'Content-Type':'application/json',
      username: username,
    };

    const formData = new FormData();

    // Clear the FormData to ensure a clean start
    formData.delete('avatar');
    formData.delete('name');
    formData.delete('email');
    formData.delete('phone');

    // Check and append name if changed
    if (editedUser.name !== user.name) {
      formData.append('name', editedUser.name || '');
    }

    // Check and append email if changed
    if (editedUser.email !== user.email) {
      formData.append('email', editedUser.email || '');
    }

    // Check and append phone if changed
    if (editedUser.phone !== user.phone) {
      formData.append('phone', editedUser.phone || '');
    }
    for (const pair of formData.entries()) {
      // console.log(pair[0] + ', ' + pair[1]);
  }
    // console.log('Avatar Data from handleSave:', avatarData);

    /// Append the avatar data as an object with contentType and data properties
    formData.append('avatar', avatarData);
    // console.log("Appended avatar: ",avatarData);
    const decodedAvatarData = atob(avatarData);
    // console.log("Decoded Avatar Data: " ,decodedAvatarData);

    formData.append('avatarContentType', avatarContentType); // Add content type separately if needed



    // Add the user's ID to the API endpoint
    const userId = editedUser._id;
    // console.log("User Id edited for: ",userId)
    const apiUrl = `${process.env.REACT_APP_BACK_URL}/api/admin/users/${userId}`;

    const response = await axios.put(apiUrl, formData, { headers });

    // console.log('Response from Server:', response);
    // console.log('Updated user:', response.data.user);

    onRequestClose();
    handleEdit(response.data.user);
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'An error occurred while updating user data. Please try again later.',
    });
  }
};



// Function to convert base64 to ArrayBuffer
const base64ToArrayBuffer = (base64) => {
  const binaryString = window.atob(base64);
  const length = binaryString.length;
  const bytes = new Uint8Array(length);

  for (let i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes.buffer;
};


const handleInputChange = (e) => {
  const { name, value } = e.target;
  setEditedUser((prevUser) => ({
    ...prevUser,
    [name]: value,
  }));
};

  

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Edit User Modal"
      style={customStyles}
    >
      <h2>Edit User</h2>
      <form onSubmit={handleSave}>
        <label htmlFor="name">Name:</label>
        <input type="text" id="name" name="name" value={editedUser.name || ''} onChange={handleInputChange} />

        <label htmlFor="email">Email:</label>
        <input type="text" id="email" name="email" value={editedUser.email || ''} onChange={handleInputChange} />

        <label htmlFor="username">Username:</label>
        <input type="text" id="username" name="username" value={editedUser.username || ''} onChange={handleInputChange} />

        <label htmlFor="phone">Phone:</label>
        <input type="text" id="phone" name="phone" value={editedUser.phone || ''} onChange={handleInputChange} />

        <label htmlFor="avatar">Avatar:</label>
        <input
          type="file"
          id="avatar"
          name="avatar"
          accept="image/*"
          onChange={(e) => handleAvatarChange(e.target.files[0])}
        />

        {selectedFile && (
          <div>
            <p>Selected File: {selectedFile.name}</p>
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="Avatar Preview"
              style={{ maxWidth: '100px', maxHeight: '100px' }}
            />
          </div>
        )}

        <button type="submit">Save Changes</button>
        <button type="button" onClick={onRequestClose}>Cancel</button>
      </form>
    </Modal>
  );
};

export default EditUserModal;