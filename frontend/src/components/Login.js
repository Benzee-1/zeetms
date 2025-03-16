// frontend/src/components/Login.js
import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Flex,
} from '@chakra-ui/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { login } from '../auth';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/token`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      login(response.data.access_token);
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
    }
  };

  return (
    <Flex
      minH="100vh"          // Full viewport height
      bg="gray.200"         // Changed to a light gray background
      align="center"        // Center vertically
      justify="center"      // Center horizontally
    >
      <Box
        bg="white"           // White form background
        p={6}                // Padding
        borderRadius="md"    // Rounded corners
        boxShadow="md"       // Light shadow
        maxW="sm"            // Small width
        w="full"             // Full width up to maxW
      >
        <VStack spacing={4}>
          <FormControl>
            <FormLabel>Username</FormLabel>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              bg="gray.100"    // Light input background
            />
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              bg="gray.100"    // Light input background
            />
          </FormControl>
          <Button
            w="full"          // Full-width button
            colorScheme="teal" // Teal button
            onClick={handleLogin}
          >
            Login
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
}

export default Login;