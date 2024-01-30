// ForgotPasswordForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const ForgotPasswordForm = () => {
  const [identifier, setIdentifier] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${process.env.REACT_APP_BACK_URL}/auth/password/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailOrPhone: identifier }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
      } else {
        // Handle error responses from the server
        setMessage(data.error);
      }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to request password reset. Please try again later.',
          });
    }
  };

  return (
    <div>
      <h2>Forgot Password</h2>
      <form onSubmit={handleForgotPassword}>
        <label>
          Enter your email:
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
        </label>
        <button type="submit">Reset Password</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ForgotPasswordForm;