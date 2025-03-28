import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Employees from './components/Employees';
import Vehicles from './components/Vehicles';  // Add Vehicles
import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();

  return (
    <Box>
      {user ? (
        <>
          <Header />
          <Box display="flex">
            <Sidebar />
            <Box flex="1" p="4">
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/employees" element={<Employees />} />
                <Route path="/vehicles" element={<Vehicles />} />  {/* Add this line */}
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </Box>
          </Box>
        </>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </Box>
  );
}

export default App;