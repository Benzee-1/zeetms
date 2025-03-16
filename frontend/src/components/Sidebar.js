// ZeeTMS/frontend/src/components/Sidebar.js
import { Box, VStack, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <Box bg="#472361" w="150px" h="100vh" p={4} color="white">
      <VStack spacing={4} align="start">
        <Text as={Link} to="/">Dashboard</Text>
        <Text as={Link} to="/employees">Employee</Text>
        <Text as={Link} to="/vehicles" ml={4}>Vehicle</Text> {/* Added under Employee */}
        <Text>Settings</Text>
      </VStack>
    </Box>
  );
};

export default Sidebar;