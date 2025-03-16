// ZeeTMS/frontend/src/components/Header.js
import React, { useState, useEffect } from 'react';
import { Box, Flex, Text, Link } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { logout, getToken } from '../auth';
import axios from 'axios';

function Header() {
  const navigate = useNavigate();
  const date = new Date().toLocaleString();
  const [currentUser, setCurrentUser] = useState('');

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = getToken();
      if (token) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setCurrentUser(response.data.username);
        } catch (error) {
          console.error('Failed to fetch current user:', error.response?.data || error.message);
          setCurrentUser(''); // Clear user on error (e.g., invalid token)
          logout(); // Clear token
          navigate('/login');
        }
      } else {
        setCurrentUser(''); // No token, no user
      }
    };

    fetchCurrentUser();
  }, [navigate]); // Re-run if navigate changes (e.g., after logout redirect)

  const handleLogout = () => {
    logout(); // Remove token from localStorage
    setCurrentUser(''); // Clear username immediately
    navigate('/login');
  };

  return (
    <Box
      bg="gray.100"
      p={4}
      boxShadow="md"
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={10}
      color="gray.800"
    >
      <Flex justify="space-between" align="center" maxW="container.xl" mx="auto">
        <Text>{date}</Text>
        <Flex>
          <Link href="#" mr={4}>Info</Link>
          <Text
            as="span"
            mr={4}
            cursor="pointer"
            onClick={handleLogout} // Use the new handler
            _hover={{ textDecoration: 'underline' }}
          >
            Logout {currentUser && `(${currentUser})`}
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
}

export default Header;