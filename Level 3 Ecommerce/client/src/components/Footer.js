import React from 'react';
import './Footer.css';
import { usePlayer } from '../contexts/PlayerContext';
import FooterPlayer from './FooterPlayer';

const Footer = () => {
  const { selectedSong } = usePlayer();

  return (
    <div className="footer">
<FooterPlayer />
    </div>
    
  );
};

export default Footer;