import React, { useState } from 'react';
import './LoginForm.css'; // Import the CSS file
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

const LoginForm = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      // console.log("Trying to login")
      const response = await fetch(`${process.env.REACT_APP_BACK_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: identifier,  // Ensure these values are defined
          password: password,      // and not undefined
        }),
      });
      // console.log("Sent login request")
      // console.log(identifier,password);
  
      const data = await response.json();
      // console.log('User object from server:', data.user);
  
      if (data.token) {
        // Store the token in local storage
        // localStorage.setItem('token', data.token);
        // Store other user-related information as needed
        localStorage.setItem('username', data.user.username);
        localStorage.setItem('isAdmin', data.user.isAdmin);
        localStorage.setItem('isPremiumUser', data.user.isPremiumUser);
        localStorage.setItem('email', data.user.email);
      }
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);
  
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Successfully logged in!',
      });
      navigate("/");
      window.location.reload();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error during login. Please try again later.',
      });
    }
  };
  
  const handleForgotPassword = () => {
    // Navigate to the forgot password page or open a modal
    navigate("/forgot-password");
  };

  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <div className="login-form-container">
      <form className="login-form">
        <h2>Login</h2>
        <label>
          Username or Email:
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button onClick={handleLogin}>Login</button>
        <br></br>
        <br></br>
        <br></br>
        <button onClick={handleForgotPassword}>Forgot Password</button>
        <br></br>
        <br></br>
        <br></br>
        Don't have an account: <button onClick={handleRegister}>Register</button>
      </form>
    </div>
  );
};

export default LoginForm;