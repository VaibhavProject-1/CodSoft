import React from 'react';
import './About.css'; // Import your About page styles

const About = () => {
  return (
    <div className="about">
      <h1>About Spotify Clone</h1>

      <p>
        Welcome to the Spotify Clone, a project created to showcase the skills and capabilities of our development team.
      </p>

      <h2>Features</h2>

      <ul>
        <li>Search and play your favorite songs</li>
        <li>Create and manage playlists</li>
        <li>Discover new music based on your preferences</li>
        <li>User-friendly interface inspired by Spotify</li>
      </ul>

      <h2>Development Team</h2>

      <p>
        This project was developed by Vaibhav Patel who is passionate about creating exceptional user experiences.
      </p>

      <h2>Contact Me by my mail: <br></br>
        vaibhavpatel003@gmail.com <br></br>
        or explore my github @  <br></br>
         <a>www.github.com/VaibhavProject-1</a></h2>

      <p>
        If you have any questions, feedback, or inquiries, feel free to contact/mail us at <a href="www.vaibhavpatel003@gmail.com">Mail link</a>.
      </p>
    </div>
  );
};

export default About;