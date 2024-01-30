import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Body from "./components/Body";
import Footer from "./components/Footer";
import About from "../src/pages/About";
import LoginForm from "../src/pages/LoginForm";
import RegistrationForm from "../src/pages/RegistrationForm";
import ProfilePage from '../src/pages/ProfilePage';
import SongForm from '../src/pages/SongForm'; // Import the SongForm component
import SongPlaybackPage from '../src/pages/SongPlaybackPage'; // Import the SongPlaybackPage component
import EditSongForm from '../src/pages/EditSongForm';
import AdminDashboard from '../src/pages/AdminDashboard';
import { PlayerProvider } from "./contexts/PlayerContext";
import ForgotPasswordForm from "./pages/ForgotPasswordForm";


import "./App.css"; // Import your styles
import PremiumSubscriptionPage from "./pages/PremiumSubscriptionPage";

const App = () => {
  const username = localStorage.getItem('username');
  return (
    <>
    {/* Wrap the content in PlayerProvider */}
    <PlayerProvider>
    <Router>
      <div className="app">
        {/* Header */}
        <Header />
{/* Sidebar */}
<Sidebar />

        
        <div className="app__body">
          
          <div className="app__content">
            
            <Routes>
            <Route exact path="/" element={username ? <SongPlaybackPage /> : <Navigate to="/login" />} />
              <Route exact path="/about" element={<About />} />
              <Route path="/profile" element={<ProfilePage/>} />
              <Route exact path="/login" element={
                <div className="login-form-container">
              <LoginForm />
              </div>
              } />
              <Route exact path="/register" element={
                <div className="registration-form-container">
              <RegistrationForm />
              </div>
              } />
              <Route exact path="/song-playback" element={<SongPlaybackPage />} /> {/* Add this route for song playback */}
              <Route exact path="/add-song" element={<SongForm />} /> {/* Add this route for adding a new song */}
              <Route exact path="/edit-song" element={<EditSongForm />}></Route>
              <Route exact path="/dashboard" element={<AdminDashboard />}></Route>
              <Route exact path="/forgot-password" element={<ForgotPasswordForm />}></Route>
              <Route exact path="/payment" element={<PremiumSubscriptionPage />}></Route>
              
            
            </Routes>
          </div>
        </div>
        {/* Footer */}
        <Footer />
        
      </div>
    </Router>
    </PlayerProvider>
    </>
  );
  
};

export default App;