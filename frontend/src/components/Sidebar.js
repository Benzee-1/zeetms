import { Box, VStack, Text, Link } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <Box w="250px" h="100vh" bg="gray.800" color="white" p={4}>
      <VStack spacing={4} align="start">
        <Text fontSize="md" fontWeight="normal">
          <Link as={RouterLink} to="/dashboard">
            Dashboard
          </Link>
        </Text>
        <Text fontSize="md" fontWeight="normal">
          <Link as={RouterLink} to="/employees">
            Employees
          </Link>
        </Text>
        <Text fontSize="md" fontWeight="normal">
          <Link as={RouterLink} to="/vehicles">
            Vehicles
          </Link>
        </Text>
      </VStack>
    </Box>
  );
};

export default Sidebar;