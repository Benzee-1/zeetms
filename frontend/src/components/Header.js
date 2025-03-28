import React from 'react';
import { Box, Flex, Text, Link, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Button, useDisclosure } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure(); // Chakra UI hook for modal state
  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box bg="blue.500" color="white" p="4">
      <Flex justify="space-between" align="center">
        <Text fontSize="lg" fontWeight="bold">
          {currentDate} {currentTime}
        </Text>
        <Flex>
          <Link
            mr="4"
            onClick={onOpen}
            _hover={{ textDecoration: 'underline' }}
          >
            Info
          </Link>
          <Link
            onClick={handleLogout}
            _hover={{ textDecoration: 'underline' }}
          >
            Logout
          </Link>
        </Flex>
      </Flex>

      {/* Info Popup Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>About ZeeTMS</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={2}><strong>Version:</strong> v0.1.23</Text>
            <Text mb={2}><strong>Description:</strong> ZeeTMS is a Transportation Management System designed to streamline vehicle and employee management. It enables administrators to efficiently add, edit, assign, and track vehicles and their assignments.</Text>
            <Text><strong>Information:</strong> Developed by the BenZee Team. For support, contact support@benzee.com. Last updated: March 26, 2025.</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Header;