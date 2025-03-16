// ZeeTMS/frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Box, Flex } from '@chakra-ui/react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './components/Login';
import Employee from './pages/Employee';
import Vehicle from './pages/Vehicle'; // New import

function App() {
  return (
    <Router>
      <Flex direction="column" minH="100vh">
        <Header />
        <Flex flex="1" pt="70px">
          <Sidebar />
          <Box flex="1" p={4} bg="gray.100">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/employees" element={<Employee />} />
              <Route path="/vehicles" element={<Vehicle />} /> {/* New route */}
            </Routes>
          </Box>
        </Flex>
      </Flex>
    </Router>
  );
}

export default App;