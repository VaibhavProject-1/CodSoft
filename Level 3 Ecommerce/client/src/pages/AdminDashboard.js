// AdminDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';
import UserCard from '../components/UserCard';
import EditUserModal from '../components/EditUserModal';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Retrieve the username from localStorage
        const username = localStorage.getItem('username');

        // Add the username to the headers
        const headers = {
          username: username,
        };
        const response = await axios.get(`${process.env.REACT_APP_BACK_URL}/api/admin/users`, { headers });
        // console.log(users);
        setUsers(response.data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };


  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
    //reload window after closing modal
    window.location.href = '/dashboard';
  };



  const handleDelete = async (user) => {
    try {
      // Retrieve the username from localStorage
      const username = localStorage.getItem('username');

      // Add the username to the headers
      const headers = {
        username: username,
      };
      // Send a DELETE request to delete the user
      await axios.delete(`${process.env.REACT_APP_BACK_URL}/api/admin/users/${user.username}`, { headers });
      // Update the users state after successful deletion
      setUsers((prevUsers) => prevUsers.filter((u) => u._id !== user._id));
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'User deleted successfully',
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete user. Please try again later.',
      });
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedUser(null);
    setIsEditModalOpen(false);
  };

  

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <Link to="/add-song">
        <button>Add Song</button>
      </Link>
      {/* Button to go to "/edit-song" route */}
      <Link to="/edit-song">
        <button>Edit Song</button>
      </Link>
      {/* Button to go to "/dashboard" route */}
      <Link to="/dashboard">
        <button>Dashboard</button>
      </Link>


      <div className="user-cards">
        {users.map((user) => (
          <UserCard
            key={user._id}
            user={user}
            handleEdit={() => handleEdit(user)}
            handleDelete={() => handleDelete(user)} 
          />
        ))}
      </div>
      <EditUserModal
        isOpen={isEditModalOpen}
        onRequestClose={handleEditModalClose}
        user={selectedUser}
        handleEdit={handleEdit}
      />
    </div>
  );
};

export default AdminDashboard;