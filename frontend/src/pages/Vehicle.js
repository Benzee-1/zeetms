// ZeeTMS/frontend/src/pages/Vehicle.js
import React, { useState, useEffect } from 'react';
import {
  Box, Button, Table, Thead, Tbody, Tr, Th, Td, IconButton, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalFooter, ModalBody, ModalCloseButton, FormControl, FormLabel, Input, Select, FormErrorMessage,
  SimpleGrid, useDisclosure, useToast, Image
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, ViewIcon, AddIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { getToken } from '../auth';

const Vehicle = () => {
  const [vehicles, setVehicles] = useState([]);
  const [types, setTypes] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [insurances, setInsurances] = useState([]);
  const [newVehicle, setNewVehicle] = useState({
    licensePlate: '', make: '', model: '', color: '', typeID: '', statusID: '',
    insuranceID: '', capacity_kg: '', volume_litre: ''
  });
  const [editVehicle, setEditVehicle] = useState(null);
  const [viewVehicle, setViewVehicle] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null); // New state for photo data URL
  const [photoFile, setPhotoFile] = useState(null);
  const [errors, setErrors] = useState({});
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchVehicles();
    fetchTypes();
    fetchStatuses();
    fetchInsurances();
  }, []);

  const fetchVehicles = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/vehicles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVehicles(response.data);
    } catch (error) {
      if (error.response?.status === 401) window.location.href = '/login';
      console.error('Failed to fetch vehicles:', error);
    }
  };

  const fetchTypes = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/vehicle_types`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTypes(response.data);
    } catch (error) {
      console.error('Failed to fetch vehicle types:', error);
    }
  };

  const fetchStatuses = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/vehicle_statuses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatuses(response.data);
    } catch (error) {
      console.error('Failed to fetch vehicle statuses:', error);
    }
  };

  const fetchInsurances = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/insurances`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInsurances(response.data);
    } catch (error) {
      console.error('Failed to fetch insurances:', error);
    }
  };

  // New function to fetch photo
  const fetchPhoto = async (filename) => {
    try {
      const token = getToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/photos/${filename}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob' // Get image as binary data
      });
      const url = URL.createObjectURL(response.data);
      setPhotoUrl(url);
    } catch (error) {
      console.error('Failed to fetch photo:', error);
      setPhotoUrl(null); // Reset on error
    }
  };

  const handleInputChange = (e, setFunction) => {
    const { name, value } = e.target;
    setFunction((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e) => {
    setPhotoFile(e.target.files[0]);
  };

  const validateForm = (vehicle) => {
    const newErrors = {};
    if (!vehicle.licensePlate) newErrors.licensePlate = 'License Plate is required';
    if (!vehicle.make) newErrors.make = 'Make is required';
    if (!vehicle.model) newErrors.model = 'Model is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm(newVehicle)) return;
    const formData = new FormData();
    formData.append('licensePlate', newVehicle.licensePlate);
    formData.append('make', newVehicle.make);
    formData.append('model', newVehicle.model);
    formData.append('color', newVehicle.color || '');
    formData.append('typeID', newVehicle.typeID || '');
    formData.append('statusID', newVehicle.statusID || '');
    formData.append('insuranceID', newVehicle.insuranceID || '');
    formData.append('capacity_kg', newVehicle.capacity_kg || '');
    formData.append('volume_litre', newVehicle.volume_litre || '');
    if (photoFile) formData.append('photo', photoFile);

    try {
      const token = getToken();
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/vehicles`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setVehicles([...vehicles, response.data]);
      onAddClose();
      setNewVehicle({
        licensePlate: '', make: '', model: '', color: '', typeID: '', statusID: '',
        insuranceID: '', capacity_kg: '', volume_litre: ''
      });
      setPhotoFile(null);
      toast({ title: "Vehicle added", status: "success", duration: 3000, isClosable: true });
    } catch (error) {
      if (error.response?.status === 401) window.location.href = '/login';
      console.error('Failed to add vehicle:', error);
    }
  };

  const handleEditSubmit = async () => {
    if (!validateForm(editVehicle)) return;
    const formData = new FormData();
    formData.append('licensePlate', editVehicle.licensePlate);
    formData.append('make', editVehicle.make);
    formData.append('model', editVehicle.model);
    formData.append('color', editVehicle.color || '');
    formData.append('typeID', editVehicle.typeID || '');
    formData.append('statusID', editVehicle.statusID || '');
    formData.append('insuranceID', editVehicle.insuranceID || '');
    formData.append('capacity_kg', editVehicle.capacity_kg || '');
    formData.append('volume_litre', editVehicle.volume_litre || '');
    if (photoFile) formData.append('photo', photoFile);

    try {
      const token = getToken();
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/vehicles/${editVehicle.id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );
      setVehicles(vehicles.map(v => v.id === editVehicle.id ? response.data : v));
      onEditClose();
      toast({ title: "Vehicle updated", status: "success", duration: 3000, isClosable: true });
    } catch (error) {
      if (error.response?.status === 401) window.location.href = '/login';
      console.error('Failed to update vehicle:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = getToken();
      await axios.delete(`${process.env.REACT_APP_API_URL}/vehicles/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVehicles(vehicles.filter(v => v.id !== id));
      toast({ title: "Vehicle deleted", status: "success", duration: 3000, isClosable: true });
    } catch (error) {
      if (error.response?.status === 401) window.location.href = '/login';
      console.error('Failed to delete vehicle:', error);
    }
  };

  // Modified View handler to fetch photo
  const handleViewOpen = (vehicle) => {
    setViewVehicle(vehicle);
    if (vehicle.photoFile) {
      const filename = vehicle.photoFile.split('/').pop();
      fetchPhoto(filename);
    } else {
      setPhotoUrl(null);
    }
    onViewOpen();
  };

  return (
    <Box p={5}>
      <Button leftIcon={<AddIcon />} colorScheme="teal" mb={4} onClick={onAddOpen}>
        Add Vehicle
      </Button>
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>License Plate</Th>
            <Th>Make</Th>
            <Th>Model</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {vehicles.map((vehicle) => (
            <Tr key={vehicle.id} py={1}>
              <Td py={1} fontSize="sm">{vehicle.id}</Td>
              <Td py={1} fontSize="sm">{vehicle.licensePlate}</Td>
              <Td py={1} fontSize="sm">{vehicle.make}</Td>
              <Td py={1} fontSize="sm">{vehicle.model}</Td>
              <Td py={1}>
                <IconButton aria-label="View" icon={<ViewIcon />} mr={2} size="sm" onClick={() => handleViewOpen(vehicle)} />
                <IconButton aria-label="Edit" icon={<EditIcon />} mr={2} size="sm" onClick={() => { setEditVehicle(vehicle); onEditOpen(); }} />
                <IconButton aria-label="Delete" icon={<DeleteIcon />} size="sm" onClick={() => handleDelete(vehicle.id)} />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Add Vehicle Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Vehicle</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl mb={3} isInvalid={!!errors.licensePlate}>
                <FormLabel>License Plate</FormLabel>
                <Input name="licensePlate" value={newVehicle.licensePlate} onChange={(e) => handleInputChange(e, setNewVehicle)} />
                <FormErrorMessage>{errors.licensePlate}</FormErrorMessage>
              </FormControl>
              <FormControl mb={3} isInvalid={!!errors.make}>
                <FormLabel>Make</FormLabel>
                <Input name="make" value={newVehicle.make} onChange={(e) => handleInputChange(e, setNewVehicle)} />
                <FormErrorMessage>{errors.make}</FormErrorMessage>
              </FormControl>
              <FormControl mb={3} isInvalid={!!errors.model}>
                <FormLabel>Model</FormLabel>
                <Input name="model" value={newVehicle.model} onChange={(e) => handleInputChange(e, setNewVehicle)} />
                <FormErrorMessage>{errors.model}</FormErrorMessage>
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Color</FormLabel>
                <Input name="color" value={newVehicle.color} onChange={(e) => handleInputChange(e, setNewVehicle)} />
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Type</FormLabel>
                <Select name="typeID" value={newVehicle.typeID} onChange={(e) => handleInputChange(e, setNewVehicle)} placeholder="Select type">
                  {types.map((type) => (
                    <option key={type.id} value={type.id}>{type.type}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Status</FormLabel>
                <Select name="statusID" value={newVehicle.statusID} onChange={(e) => handleInputChange(e, setNewVehicle)} placeholder="Select status">
                  {statuses.map((status) => (
                    <option key={status.id} value={status.id}>{status.name}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Insurance</FormLabel>
                <Select name="insuranceID" value={newVehicle.insuranceID} onChange={(e) => handleInputChange(e, setNewVehicle)} placeholder="Select insurance">
                  {insurances.map((ins) => (
                    <option key={ins.id} value={ins.id}>{ins.number}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Capacity (kg)</FormLabel>
                <Input name="capacity_kg" type="number" value={newVehicle.capacity_kg} onChange={(e) => handleInputChange(e, setNewVehicle)} />
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Volume (litre)</FormLabel>
                <Input name="volume_litre" type="number" value={newVehicle.volume_litre} onChange={(e) => handleInputChange(e, setNewVehicle)} />
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Photo</FormLabel>
                <Input type="file" accept="image/*" onChange={handleFileChange} />
              </FormControl>
            </SimpleGrid>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={handleSubmit}>Save</Button>
            <Button variant="ghost" onClick={onAddClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Vehicle Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Vehicle</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editVehicle && (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl mb={3} isInvalid={!!errors.licensePlate}>
                  <FormLabel>License Plate</FormLabel>
                  <Input name="licensePlate" value={editVehicle.licensePlate} onChange={(e) => handleInputChange(e, setEditVehicle)} />
                  <FormErrorMessage>{errors.licensePlate}</FormErrorMessage>
                </FormControl>
                <FormControl mb={3} isInvalid={!!errors.make}>
                  <FormLabel>Make</FormLabel>
                  <Input name="make" value={editVehicle.make} onChange={(e) => handleInputChange(e, setEditVehicle)} />
                  <FormErrorMessage>{errors.make}</FormErrorMessage>
                </FormControl>
                <FormControl mb={3} isInvalid={!!errors.model}>
                  <FormLabel>Model</FormLabel>
                  <Input name="model" value={editVehicle.model} onChange={(e) => handleInputChange(e, setEditVehicle)} />
                  <FormErrorMessage>{errors.model}</FormErrorMessage>
                </FormControl>
                <FormControl mb={3}>
                  <FormLabel>Color</FormLabel>
                  <Input name="color" value={editVehicle.color} onChange={(e) => handleInputChange(e, setEditVehicle)} />
                </FormControl>
                <FormControl mb={3}>
                  <FormLabel>Type</FormLabel>
                  <Select name="typeID" value={editVehicle.typeID} onChange={(e) => handleInputChange(e, setEditVehicle)} placeholder="Select type">
                    {types.map((type) => (
                      <option key={type.id} value={type.id}>{type.type}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl mb={3}>
                  <FormLabel>Status</FormLabel>
                  <Select name="statusID" value={editVehicle.statusID} onChange={(e) => handleInputChange(e, setEditVehicle)} placeholder="Select status">
                    {statuses.map((status) => (
                      <option key={status.id} value={status.id}>{status.name}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl mb={3}>
                  <FormLabel>Insurance</FormLabel>
                  <Select name="insuranceID" value={editVehicle.insuranceID} onChange={(e) => handleInputChange(e, setEditVehicle)} placeholder="Select insurance">
                    {insurances.map((ins) => (
                      <option key={ins.id} value={ins.id}>{ins.number}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl mb={3}>
                  <FormLabel>Capacity (kg)</FormLabel>
                  <Input name="capacity_kg" type="number" value={editVehicle.capacity_kg} onChange={(e) => handleInputChange(e, setEditVehicle)} />
                </FormControl>
                <FormControl mb={3}>
                  <FormLabel>Volume (litre)</FormLabel>
                  <Input name="volume_litre" type="number" value={editVehicle.volume_litre} onChange={(e) => handleInputChange(e, setEditVehicle)} />
                </FormControl>
                <FormControl mb={3}>
                  <FormLabel>Photo</FormLabel>
                  <Input type="file" accept="image/*" onChange={handleFileChange} />
                </FormControl>
              </SimpleGrid>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={handleEditSubmit}>Save</Button>
            <Button variant="ghost" onClick={onEditClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Vehicle Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Vehicle Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {viewVehicle && (
              <Box>
                <p><strong>ID:</strong> {viewVehicle.id}</p>
                <p><strong>License Plate:</strong> {viewVehicle.licensePlate}</p>
                <p><strong>Make:</strong> {viewVehicle.make}</p>
                <p><strong>Model:</strong> {viewVehicle.model}</p>
                <p><strong>Color:</strong> {viewVehicle.color || 'N/A'}</p>
                <p><strong>Type:</strong> {types.find(t => t.id === viewVehicle.typeID)?.type || 'N/A'}</p>
                <p><strong>Status:</strong> {statuses.find(s => s.id === viewVehicle.statusID)?.name || 'N/A'}</p>
                <p><strong>Insurance:</strong> {insurances.find(i => i.id === viewVehicle.insuranceID)?.number || 'N/A'}</p>
                <p><strong>Capacity (kg):</strong> {viewVehicle.capacity_kg || 'N/A'}</p>
                <p><strong>Volume (litre):</strong> {viewVehicle.volume_litre || 'N/A'}</p>
                <p>
                  <strong>Photo:</strong>{' '}
                  {viewVehicle.photoFile && photoUrl ? (
                    <Image
                      src={photoUrl}
                      alt="Vehicle Photo"
                      maxW="200px"
                      mt={2}
                    />
                  ) : (
                    'N/A'
                  )}
                </p>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onViewClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Vehicle;