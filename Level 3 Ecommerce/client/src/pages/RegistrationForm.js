//Registration.js
import React, { useState } from 'react';
import './RegistrationForm.css';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';


const RegistrationForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState(null);
  const navigate = useNavigate();

  const handleAvatarChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      // console.log("Avatar exists:", file);
      resizeAndSetAvatar(file);
    } else {
      // console.log("No Avatar");
      setAvatar(null);
    }
  };

  const resizeAndSetAvatar = (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 100; // Set the desired width
        canvas.height = 100; // Set the desired height

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          const resizedFile = new File([blob], file.name, {
            type: 'image/*', // Change the type if needed
            lastModified: Date.now(),
          });

          setAvatar(resizedFile);
        }, 'image/*'); // Change the format if needed
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  };

  const handleRegistration = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append('username', username);
      formData.append('password', password);
      formData.append('name', name);
      formData.append('phone', phone);
      formData.append('email', email);

      // console.log("Before avatar: ",formData)

      if (avatar) {
        formData.append('avatar', avatar);
      }

      for (var key of formData.entries()) {
        // console.log(key[0] + ', ' + key[1]);
    }

      const response = await axios.post(`${process.env.REACT_APP_BACK_URL}/auth/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // console.log('Response:', response.data);

      if (response.data.success) {
        // Handle successful registration (redirect, show success message, etc.)
        Swal.fire({
          icon: 'success',
          title: 'Registration Successful',
          text: 'You have successfully registered.',
        });
      } else {
        // Handle registration failure
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: response.data.message,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: 'An error occurred during registration. Please try again later.',
      });
    }
  };

  return (
    <div className="registration-form-container">
      <form className="registration-form">
        <h2>Register</h2>
        <label>
          Username:
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <label>
          Password:
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <label>
          Name:
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Phone:
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <label>
          Email:
          <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Avatar:
          <input type="file" accept="image/*" onChange={handleAvatarChange} />
        </label>
        <button onClick={handleRegistration}>Register</button>
        <br></br>
        <br></br>
        <br></br>
        Already have an account: <button onClick={() => navigate("/login")}>Login</button> {/* Button to navigate to login page */}
      </form>
    </div>
  );
};

export default RegistrationForm;