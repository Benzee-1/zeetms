import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  HStack,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  SimpleGrid,
  VStack,
  Image,
} from '@chakra-ui/react';
import axios from 'axios';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [vehicleStatuses, setVehicleStatuses] = useState([]);
  const [insurances, setInsurances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isUnassignModalOpen, setIsUnassignModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    license_plate: '',
    make: '',
    model: '',
    color: '',
    type_id: '',
    status_id: '',
    insurance_id: '',
    capacity_kg: '',
    volume_litre: '',
  });
  const [assignFormData, setAssignFormData] = useState({
    employee_id: '',
    vehicle_id: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const toast = useToast();

  // Fetch vehicles, employees, and dropdown options on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [vehiclesRes, typesRes, statusesRes, insurancesRes, employeesRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/vehicles`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/vehicle_types`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/vehicle_statuses`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/insurances`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/employees`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setVehicles(vehiclesRes.data);
        setVehicleTypes(typesRes.data);
        setVehicleStatuses(statusesRes.data);
        setInsurances(insurancesRes.data);
        setEmployees(employeesRes.data);
      } catch (error) {
        toast({
          title: 'Error fetching data',
          description: error.response?.data?.detail || 'An error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };
    fetchData();
  }, [toast]);

  // Reset form data when opening the Add modal
  const openAddModal = () => {
    setFormData({
      license_plate: '',
      make: '',
      model: '',
      color: '',
      type_id: '',
      status_id: '',
      insurance_id: '',
      capacity_kg: '',
      volume_litre: '',
    });
    setPhotoFile(null);
    setIsAddModalOpen(true);
  };

  // Open Details modal with selected vehicle
  const openDetailsModal = async (vehicleId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/vehicles/${vehicleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedVehicle(response.data);
      setIsDetailsModalOpen(true);
    } catch (error) {
      toast({
        title: 'Error fetching vehicle',
        description: error.response?.data?.detail || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Open Edit modal with selected vehicle
  const openEditModal = async (vehicleId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/vehicles/${vehicleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData({
        ...response.data,
        type_id: response.data.type_id || '',
        status_id: response.data.status_id || '',
        insurance_id: response.data.insurance_id || '',
        capacity_kg: response.data.capacity_kg || '',
        volume_litre: response.data.volume_litre || '',
      });
      setPhotoFile(null);
      setIsEditModalOpen(true);
    } catch (error) {
      toast({
        title: 'Error fetching vehicle',
        description: error.response?.data?.detail || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Open Delete modal with selected vehicle
  const openDeleteModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDeleteModalOpen(true);
  };

  // Open Assign modal with selected vehicle
  const openAssignModal = (vehicle) => {
    setAssignFormData({
      employee_id: '',
      vehicle_id: vehicle.id,
    });
    setSelectedVehicle(vehicle);
    setIsAssignModalOpen(true);
  };

  // Open Unassign modal with selected vehicle
  const openUnassignModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsUnassignModalOpen(true);
  };

  // Handle form input changes for vehicle form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form input changes for assign form
  const handleAssignChange = (e) => {
    const { name, value } = e.target;
    setAssignFormData({ ...assignFormData, [name]: value });
  };

  // Handle photo file change
  const handlePhotoChange = (e) => {
    setPhotoFile(e.target.files[0]);
  };

  // Handle Add Vehicle
  const handleAddVehicle = async () => {
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      const fields = ['license_plate', 'make', 'model', 'color'];
      fields.forEach((field) => {
        if (formData[field]) {
          formDataToSend.append(field, formData[field]);
        }
      });
      if (formData.type_id) formDataToSend.append('type_id', parseInt(formData.type_id));
      if (formData.status_id) formDataToSend.append('status_id', parseInt(formData.status_id));
      if (formData.insurance_id) formDataToSend.append('insurance_id', parseInt(formData.insurance_id));
      if (formData.capacity_kg) formDataToSend.append('capacity_kg', parseFloat(formData.capacity_kg));
      if (formData.volume_litre) formDataToSend.append('volume_litre', parseFloat(formData.volume_litre));
      if (photoFile) formDataToSend.append('photo', photoFile);

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/vehicles`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setVehicles([...vehicles, response.data]);
      setIsAddModalOpen(false);
      toast({
        title: 'Vehicle added',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error adding vehicle',
        description: error.response?.data?.detail || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle Edit Vehicle
  const handleEditVehicle = async () => {
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      const fields = ['license_plate', 'make', 'model', 'color'];
      fields.forEach((field) => {
        if (formData[field]) {
          formDataToSend.append(field, formData[field]);
        }
      });
      if (formData.type_id) formDataToSend.append('type_id', parseInt(formData.type_id));
      if (formData.status_id) formDataToSend.append('status_id', parseInt(formData.status_id));
      if (formData.insurance_id) formDataToSend.append('insurance_id', parseInt(formData.insurance_id));
      if (formData.capacity_kg) formDataToSend.append('capacity_kg', parseFloat(formData.capacity_kg));
      if (formData.volume_litre) formDataToSend.append('volume_litre', parseFloat(formData.volume_litre));
      if (photoFile) formDataToSend.append('photo', photoFile);

      const response = await axios.put(`${process.env.REACT_APP_API_URL}/vehicles/${formData.id}`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setVehicles(vehicles.map((veh) => (veh.id === formData.id ? response.data : veh)));
      setIsEditModalOpen(false);
      toast({
        title: 'Vehicle updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error updating vehicle',
        description: error.response?.data?.detail || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle Delete Vehicle
  const handleDeleteVehicle = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/vehicles/${selectedVehicle.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVehicles(vehicles.filter((veh) => veh.id !== selectedVehicle.id));
      setIsDeleteModalOpen(false);
      toast({
        title: 'Vehicle deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error deleting vehicle',
        description: error.response?.data?.detail || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle Assign Vehicle
  const handleAssignVehicle = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/vehicle_assign`,
        {
          employee_id: parseInt(assignFormData.employee_id),
          vehicle_id: parseInt(assignFormData.vehicle_id),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIsAssignModalOpen(false);
      toast({
        title: 'Vehicle assigned',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      // Refresh vehicles list to reflect the assignment
      const vehiclesRes = await axios.get(`${process.env.REACT_APP_API_URL}/vehicles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVehicles(vehiclesRes.data);
    } catch (error) {
      if (error.response?.status === 403) {
        toast({
          title: 'Assignment Not Permitted',
          description: error.response.data.detail,
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error assigning vehicle',
          description: error.response?.data?.detail || 'An error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  // Handle Unassign Vehicle
  const handleUnassignVehicle = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/vehicle_unassign`,
        {
          vehicle_id: selectedVehicle.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIsUnassignModalOpen(false);
      toast({
        title: 'Vehicle unassigned',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      // Refresh vehicles list to reflect the unassignment
      const vehiclesRes = await axios.get(`${process.env.REACT_APP_API_URL}/vehicles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVehicles(vehiclesRes.data);
    } catch (error) {
      toast({
        title: 'Error unassigning vehicle',
        description: error.response?.data?.detail || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Button colorScheme="blue" onClick={openAddModal}>
          Add Vehicle
        </Button>
      </HStack>

      {/* Updated Table with reduced spacing */}
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th py={1}>Make</Th>
            <Th py={1}>Model</Th>
            <Th py={1}>License Plate</Th>
            <Th py={1}>Vehicle Type</Th>
            <Th py={1}>Status</Th>
            <Th py={1}>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {vehicles.map((vehicle) => (
            <Tr key={vehicle.id}>
              <Td py={1}>{vehicle.make}</Td>
              <Td py={1}>{vehicle.model}</Td>
              <Td py={1}>{vehicle.license_plate}</Td>
              <Td py={1}>{vehicle.vehicle_type_name || 'N/A'}</Td>
              <Td py={1}>{vehicle.vehicle_status_name || 'N/A'}</Td>
              <Td py={1}>
                <HStack spacing={2}>
                  <Text
                    color="blue.500"
                    cursor="pointer"
                    onClick={() => openDetailsModal(vehicle.id)}
                  >
                    Details
                  </Text>
                  <Text
                    color="green.500"
                    cursor="pointer"
                    onClick={() => openAssignModal(vehicle)}
                  >
                    Assign
                  </Text>
                  <Text
                    color="purple.500"
                    cursor="pointer"
                    onClick={() => openUnassignModal(vehicle)}
                  >
                    Unassign
                  </Text>
                  <Text
                    color="orange.500"
                    cursor="pointer"
                    onClick={() => openEditModal(vehicle.id)}
                  >
                    Modify
                  </Text>
                  <Text
                    color="red.500"
                    cursor="pointer"
                    onClick={() => openDeleteModal(vehicle)}
                  >
                    Delete
                  </Text>
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Add Vehicle Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Vehicle</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SimpleGrid columns={3} spacing={4}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>License Plate</FormLabel>
                  <Input name="license_plate" value={formData.license_plate} onChange={handleChange} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Make</FormLabel>
                  <Input name="make" value={formData.make} onChange={handleChange} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Model</FormLabel>
                  <Input name="model" value={formData.model} onChange={handleChange} />
                </FormControl>
              </VStack>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Color</FormLabel>
                  <Input name="color" value={formData.color} onChange={handleChange} />
                </FormControl>
                <FormControl>
                  <FormLabel>Vehicle Type</FormLabel>
                  <Select
                    name="type_id"
                    value={formData.type_id}
                    onChange={handleChange}
                    placeholder="Select vehicle type"
                  >
                    {vehicleTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.vehicle_type_name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <Select
                    name="status_id"
                    value={formData.status_id}
                    onChange={handleChange}
                    placeholder="Select status"
                  >
                    {vehicleStatuses.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.vehicle_status_name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </VStack>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Insurance</FormLabel>
                  <Select
                    name="insurance_id"
                    value={formData.insurance_id}
                    onChange={handleChange}
                    placeholder="Select insurance"
                  >
                    {insurances.map((ins) => (
                      <option key={ins.id} value={ins.id}>
                        {ins.insurance_ref}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Capacity (kg)</FormLabel>
                  <Input
                    name="capacity_kg"
                    type="number"
                    value={formData.capacity_kg}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Volume (litres)</FormLabel>
                  <Input
                    name="volume_litre"
                    type="number"
                    value={formData.volume_litre}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Upload Photo</FormLabel>
                  <Input type="file" accept="image/*" onChange={handlePhotoChange} />
                </FormControl>
              </VStack>
            </SimpleGrid>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleAddVehicle}>
              Add
            </Button>
            <Button onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Details Modal */}
      <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Vehicle Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedVehicle && (
              <HStack spacing={4}>
                {selectedVehicle.photo_file ? (
                  <Image
                    src={`http://10.118.1.7/api/uploads/${selectedVehicle.photo_file.split('/').pop()}`}
                    alt={`${selectedVehicle.make} ${selectedVehicle.model}`}
                    boxSize="150px"
                    objectFit="cover"
                    borderRadius="md"
                  />
                ) : (
                  <Text>No photo available</Text>
                )}
                <VStack spacing={2} align="start">
                  <Text><strong>License Plate:</strong> {selectedVehicle.license_plate}</Text>
                  <Text><strong>Make:</strong> {selectedVehicle.make}</Text>
                  <Text><strong>Model:</strong> {selectedVehicle.model}</Text>
                  <Text><strong>Color:</strong> {selectedVehicle.color || 'N/A'}</Text>
                  <Text><strong>Vehicle Type:</strong> {selectedVehicle.vehicle_type_name || 'N/A'}</Text>
                  <Text><strong>Status:</strong> {selectedVehicle.vehicle_status_name || 'N/A'}</Text>
                  <Text><strong>Insurance:</strong> {selectedVehicle.insurance_ref || 'N/A'}</Text>
                  <Text><strong>Capacity (kg):</strong> {selectedVehicle.capacity_kg || 'N/A'}</Text>
                  <Text><strong>Volume (litres):</strong> {selectedVehicle.volume_litre || 'N/A'}</Text>
                </VStack>
              </HStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setIsDetailsModalOpen(false)}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Vehicle Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Vehicle</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SimpleGrid columns={3} spacing={4}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>License Plate</FormLabel>
                  <Input name="license_plate" value={formData.license_plate} onChange={handleChange} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Make</FormLabel>
                  <Input name="make" value={formData.make} onChange={handleChange} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Model</FormLabel>
                  <Input name="model" value={formData.model} onChange={handleChange} />
                </FormControl>
              </VStack>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Color</FormLabel>
                  <Input name="color" value={formData.color} onChange={handleChange} />
                </FormControl>
                <FormControl>
                  <FormLabel>Vehicle Type</FormLabel>
                  <Select
                    name="type_id"
                    value={formData.type_id}
                    onChange={handleChange}
                    placeholder="Select vehicle type"
                  >
                    {vehicleTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.vehicle_type_name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <Select
                    name="status_id"
                    value={formData.status_id}
                    onChange={handleChange}
                    placeholder="Select status"
                  >
                    {vehicleStatuses.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.vehicle_status_name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </VStack>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Insurance</FormLabel>
                  <Select
                    name="insurance_id"
                    value={formData.insurance_id}
                    onChange={handleChange}
                    placeholder="Select insurance"
                  >
                    {insurances.map((ins) => (
                      <option key={ins.id} value={ins.id}>
                        {ins.insurance_ref}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Capacity (kg)</FormLabel>
                  <Input
                    name="capacity_kg"
                    type="number"
                    value={formData.capacity_kg}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Volume (litres)</FormLabel>
                  <Input
                    name="volume_litre"
                    type="number"
                    value={formData.volume_litre}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Upload Photo</FormLabel>
                  <Input type="file" accept="image/*" onChange={handlePhotoChange} />
                  {formData.photo_file && (
                    <Text fontSize="sm" mt={2}>
                      Current photo: {formData.photo_file.split('/').pop()}
                    </Text>
                  )}
                </FormControl>
              </VStack>
            </SimpleGrid>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleEditVehicle}>
              Update
            </Button>
            <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Assign Vehicle Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Assign Vehicle</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Employee</FormLabel>
                <Select
                  name="employee_id"
                  value={assignFormData.employee_id}
                  onChange={handleAssignChange}
                  placeholder="Select employee"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstname} {emp.lastname} ({emp.email})
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Vehicle</FormLabel>
                <Input
                  name="vehicle_id"
                  value={`${selectedVehicle?.make} ${selectedVehicle?.model} (${selectedVehicle?.license_plate})`}
                  isReadOnly
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" mr={3} onClick={handleAssignVehicle}>
              Assign
            </Button>
            <Button onClick={() => setIsAssignModalOpen(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Unassign Vehicle Modal */}
      <Modal isOpen={isUnassignModalOpen} onClose={() => setIsUnassignModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Unassign Vehicle</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Are you sure you want to unassign {selectedVehicle?.make} {selectedVehicle?.model} ({selectedVehicle?.license_plate})?
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="purple" mr={3} onClick={handleUnassignVehicle}>
              Unassign
            </Button>
            <Button onClick={() => setIsUnassignModalOpen(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to delete {selectedVehicle?.make} {selectedVehicle?.model}?</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={handleDeleteVehicle}>
              Delete
            </Button>
            <Button onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Vehicles;