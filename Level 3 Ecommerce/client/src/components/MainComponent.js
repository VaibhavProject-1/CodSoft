// MainComponent.js
import React, { useState } from 'react';
import PlaylistSidebar from './PlaylistSidebar';
import FooterPlayer from './FooterPlayer';

const MainComponent = () => {
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [selectedPlaylistSongs, setSelectedPlaylistSongs] = useState([]);

  return (
    <div>
      <PlaylistSidebar 
        setSelectedPlaylist={setSelectedPlaylist}
        setSelectedPlaylistSongs={setSelectedPlaylistSongs}
      />
      <FooterPlayer 
        selectedPlaylist={selectedPlaylist}
        selectedPlaylistSongs={selectedPlaylistSongs}
      />
    </div>
  );
};

export default MainComponent;
