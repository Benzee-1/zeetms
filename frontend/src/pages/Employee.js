// ZeeTMS/frontend/src/pages/Employee.js
import React, { useState, useEffect } from 'react';
import {
  Box, Button, Table, Thead, Tbody, Tr, Th, Td, IconButton, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalFooter, ModalBody, ModalCloseButton, FormControl, FormLabel, Input, Select, FormErrorMessage,
  SimpleGrid, useDisclosure, useToast, Image  // Added Image
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, ViewIcon, AddIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { getToken } from '../auth';

const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [functions, setFunctions] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [newEmployee, setNewEmployee] = useState({
    firstname: '', lastname: '', email: '', birthDate: '', hireDate: '',
    function_id: '', status_id: '', line1: '', line2: '', line3: '',
    postalcode: '', town: '', state: '', country: '', license_id: ''
  });
  const [editEmployee, setEditEmployee] = useState(null);
  const [viewEmployee, setViewEmployee] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null); // New state for photo data URL
  const [photoFile, setPhotoFile] = useState(null);
  const [errors, setErrors] = useState({});
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchEmployees();
    fetchFunctions();
    fetchStatuses();
    fetchLicenses();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(response.data);
    } catch (error) {
      if (error.response?.status === 401) window.location.href = '/login';
      console.error('Failed to fetch employees:', error);
    }
  };

  const fetchFunctions = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/employee_functions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFunctions(response.data);
    } catch (error) {
      console.error('Failed to fetch functions:', error);
    }
  };

  const fetchStatuses = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/employee_statuses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatuses(response.data);
    } catch (error) {
      console.error('Failed to fetch statuses:', error);
    }
  };

  const fetchLicenses = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/driving_licenses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLicenses(response.data);
    } catch (error) {
      console.error('Failed to fetch licenses:', error);
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
    setFunction(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e) => {
    setPhotoFile(e.target.files[0]);
  };

  const validateForm = (employee) => {
    const newErrors = {};
    if (!employee.firstname) newErrors.firstname = 'First Name is required';
    if (!employee.lastname) newErrors.lastname = 'Last Name is required';
    if (!employee.email) newErrors.email = 'Email is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm(newEmployee)) return;

    const formData = new FormData();
    formData.append('firstname', newEmployee.firstname);
    formData.append('lastname', newEmployee.lastname);
    formData.append('email', newEmployee.email);
    formData.append('birthDate', newEmployee.birthDate || '');
    formData.append('hireDate', newEmployee.hireDate || '');
    formData.append('function_id', newEmployee.function_id || '');
    formData.append('status_id', newEmployee.status_id || '');
    formData.append('line1', newEmployee.line1 || '');
    formData.append('line2', newEmployee.line2 || '');
    formData.append('line3', newEmployee.line3 || '');
    formData.append('postalcode', newEmployee.postalcode || '');
    formData.append('town', newEmployee.town || '');
    formData.append('state', newEmployee.state || '');
    formData.append('country', newEmployee.country || '');
    formData.append('license_id', newEmployee.license_id || '');
    if (photoFile) formData.append('photo', photoFile);

    try {
      const token = getToken();
      await axios.post(`${process.env.REACT_APP_API_URL}/employees`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      fetchEmployees();
      onAddClose();
      setNewEmployee({
        firstname: '', lastname: '', email: '', birthDate: '', hireDate: '',
        function_id: '', status_id: '', line1: '', line2: '', line3: '',
        postalcode: '', town: '', state: '', country: '', license_id: ''
      });
      setPhotoFile(null);
      toast({ title: "Employee added", status: "success", duration: 3000, isClosable: true });
    } catch (error) {
      if (error.response?.status === 401) window.location.href = '/login';
      console.error('Failed to add employee:', error);
    }
  };

  const handleEditSubmit = async () => {
    if (!validateForm(editEmployee)) return;

    const formData = new FormData();
    formData.append('firstname', editEmployee.firstname);
    formData.append('lastname', editEmployee.lastname);
    formData.append('email', editEmployee.email);
    formData.append('birthDate', editEmployee.birthDate || '');
    formData.append('hireDate', editEmployee.hireDate || '');
    formData.append('function_id', editEmployee.function_id || '');
    formData.append('status_id', editEmployee.status_id || '');
    formData.append('line1', editEmployee.line1 || '');
    formData.append('line2', editEmployee.line2 || '');
    formData.append('line3', editEmployee.line3 || '');
    formData.append('postalcode', editEmployee.postalcode || '');
    formData.append('town', editEmployee.town || '');
    formData.append('state', editEmployee.state || '');
    formData.append('country', editEmployee.country || '');
    formData.append('license_id', editEmployee.license_id || '');
    if (photoFile) formData.append('photo', photoFile);

    try {
      const token = getToken();
      await axios.put(`${process.env.REACT_APP_API_URL}/employees/${editEmployee.id}`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      fetchEmployees();
      onEditClose();
      toast({ title: "Employee updated", status: "success", duration: 3000, isClosable: true });
    } catch (error) {
      if (error.response?.status === 401) window.location.href = '/login';
      console.error('Failed to update employee:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = getToken();
      await axios.delete(`${process.env.REACT_APP_API_URL}/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(employees.filter(e => e.id !== id));
      toast({ title: "Employee deleted", status: "success", duration: 3000, isClosable: true });
    } catch (error) {
      if (error.response?.status === 401) window.location.href = '/login';
      console.error('Failed to delete employee:', error);
    }
  };

  // Modified View handler to fetch photo
  const handleViewOpen = (employee) => {
    setViewEmployee(employee);
    if (employee.photoFile) {
      const filename = employee.photoFile.split('/').pop();
      fetchPhoto(filename);
    } else {
      setPhotoUrl(null);
    }
    onViewOpen();
  };

  return (
    <Box p={5}>
      <Button leftIcon={<AddIcon />} colorScheme="teal" mb={4} onClick={onAddOpen}>
        Add Employee
      </Button>
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>First Name</Th>
            <Th>Last Name</Th>
            <Th>Email</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {employees.map((employee) => (
            <Tr key={employee.id} py={1}>
              <Td py={1} fontSize="sm">{employee.id}</Td>
              <Td py={1} fontSize="sm">{employee.firstname}</Td>
              <Td py={1} fontSize="sm">{employee.lastname}</Td>
              <Td py={1} fontSize="sm">{employee.email}</Td>
              <Td py={1}>
                <IconButton aria-label="View" icon={<ViewIcon />} mr={2} size="sm" onClick={() => handleViewOpen(employee)} />
                <IconButton aria-label="Edit" icon={<EditIcon />} mr={2} size="sm" onClick={() => { setEditEmployee(employee); onEditOpen(); }} />
                <IconButton aria-label="Delete" icon={<DeleteIcon />} size="sm" onClick={() => handleDelete(employee.id)} />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Add Employee Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Employee</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl mb={3} isInvalid={!!errors.firstname}>
                <FormLabel>First Name</FormLabel>
                <Input name="firstname" value={newEmployee.firstname} onChange={(e) => handleInputChange(e, setNewEmployee)} />
                <FormErrorMessage>{errors.firstname}</FormErrorMessage>
              </FormControl>
              <FormControl mb={3} isInvalid={!!errors.lastname}>
                <FormLabel>Last Name</FormLabel>
                <Input name="lastname" value={newEmployee.lastname} onChange={(e) => handleInputChange(e, setNewEmployee)} />
                <FormErrorMessage>{errors.lastname}</FormErrorMessage>
              </FormControl>
              <FormControl mb={3} isInvalid={!!errors.email}>
                <FormLabel>Email</FormLabel>
                <Input name="email" value={newEmployee.email} onChange={(e) => handleInputChange(e, setNewEmployee)} />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Birth Date</FormLabel>
                <Input type="date" name="birthDate" value={newEmployee.birthDate} onChange={(e) => handleInputChange(e, setNewEmployee)} />
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Hire Date</FormLabel>
                <Input type="date" name="hireDate" value={newEmployee.hireDate} onChange={(e) => handleInputChange(e, setNewEmployee)} />
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Function</FormLabel>
                <Select name="function_id" value={newEmployee.function_id} onChange={(e) => handleInputChange(e, setNewEmployee)} placeholder="Select function">
                  {functions.map((func) => (
                    <option key={func.id} value={func.id}>{func.name}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Status</FormLabel>
                <Select name="status_id" value={newEmployee.status_id} onChange={(e) => handleInputChange(e, setNewEmployee)} placeholder="Select status">
                  {statuses.map((status) => (
                    <option key={status.id} value={status.id}>{status.name}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Address Line 1</FormLabel>
                <Input name="line1" value={newEmployee.line1} onChange={(e) => handleInputChange(e, setNewEmployee)} />
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Address Line 2</FormLabel>
                <Input name="line2" value={newEmployee.line2} onChange={(e) => handleInputChange(e, setNewEmployee)} />
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Address Line 3</FormLabel>
                <Input name="line3" value={newEmployee.line3} onChange={(e) => handleInputChange(e, setNewEmployee)} />
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Postal Code</FormLabel>
                <Input name="postalcode" value={newEmployee.postalcode} onChange={(e) => handleInputChange(e, setNewEmployee)} />
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Town</FormLabel>
                <Input name="town" value={newEmployee.town} onChange={(e) => handleInputChange(e, setNewEmployee)} />
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>State</FormLabel>
                <Input name="state" value={newEmployee.state} onChange={(e) => handleInputChange(e, setNewEmployee)} />
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Country</FormLabel>
                <Input name="country" value={newEmployee.country} onChange={(e) => handleInputChange(e, setNewEmployee)} />
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Driving License</FormLabel>
                <Select name="license_id" value={newEmployee.license_id} onChange={(e) => handleInputChange(e, setNewEmployee)} placeholder="Select license">
                  {licenses.map((license) => (
                    <option key={license.id} value={license.id}>{license.name}</option>
                  ))}
                </Select>
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

      {/* Edit Employee Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Employee</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editEmployee && (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl mb={3} isInvalid={!!errors.firstname}>
                  <FormLabel>First Name</FormLabel>
                  <Input name="firstname" value={editEmployee.firstname} onChange={(e) => handleInputChange(e, setEditEmployee)} />
                  <FormErrorMessage>{errors.firstname}</FormErrorMessage>
                </FormControl>
                <FormControl mb={3} isInvalid={!!errors.lastname}>
                  <FormLabel>Last Name</FormLabel>
                  <Input name="lastname" value={editEmployee.lastname} onChange={(e) => handleInputChange(e, setEditEmployee)} />
                  <FormErrorMessage>{errors.lastname}</FormErrorMessage>
                </FormControl>
                <FormControl mb={3} isInvalid={!!errors.email}>
                  <FormLabel>Email</FormLabel>
                  <Input name="email" value={editEmployee.email} onChange={(e) => handleInputChange(e, setEditEmployee)} />
                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                </FormControl>
                <FormControl mb={3}>
                  <FormLabel>Birth Date</FormLabel>
                  <Input type="date" name="birthDate" value={editEmployee.birthDate} onChange={(e) => handleInputChange(e, setEditEmployee)} />
                </FormControl>
                <FormControl mb={3}>
                  <FormLabel>Hire Date</FormLabel>
                  <Input type="date" name="hireDate" value={editEmployee.hireDate} onChange={(e) => handleInputChange(e, setEditEmployee)} />
                </FormControl>
                <FormControl mb={3}>
                  <FormLabel>Function</FormLabel>
                  <Select name="function_id" value={editEmployee.function_id} onChange={(e) => handleInputChange(e, setEditEmployee)} placeholder="Select function">
                    {functions.map((func) => (
                      <option key={func.id} value={func.id}>{func.name}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl mb={3}>
                  <FormLabel>Status</FormLabel>
                  <Select name="status_id" value={editEmployee.status_id} onChange={(e) => handleInputChange(e, setEditEmployee)} placeholder="Select status">
                    {statuses.map((status) => (
                      <option key={status.id} value={status.id}>{status.name}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl mb={3}>
                  <FormLabel>Address Line 1</FormLabel>
                  <Input name="line1" value={editEmployee.line1} onChange={(e) => handleInputChange(e, setEditEmployee)} />
                </FormControl>
                <FormControl mb={3}>
                  <FormLabel>Address Line 2</FormLabel>
                  <Input name="line2" value={editEmployee.line2} onChange={(e) => handleInputChange(e, setEditEmployee)} />
                </FormControl>
                <FormControl mb={3}>
                  <FormLabel>Address Line 3</FormLabel>
                  <Input name="line3" value={editEmployee.line3} onChange={(e) => handleInputChange(e, setEditEmployee)} />
                </FormControl>
                <FormControl mb={3}>
                  <FormLabel>Postal Code</FormLabel>
                  <Input name="postalcode" value={editEmployee.postalcode} onChange={(e) => handleInputChange(e, setEditEmployee)} />
                </FormControl>
                <FormControl mb={3}>
                  <FormLabel>Town</FormLabel>
                  <Input name="town" value={editEmployee.town} onChange={(e) => handleInputChange(e, setEditEmployee)} />
                </FormControl>
                <FormControl mb={3}>
                  <FormLabel>State</FormLabel>
                  <Input name="state" value={editEmployee.state} onChange={(e) => handleInputChange(e, setEditEmployee)} />
                </FormControl>
                <FormControl mb={3}>
                  <FormLabel>Country</FormLabel>
                  <Input name="country" value={editEmployee.country} onChange={(e) => handleInputChange(e, setEditEmployee)} />
                </FormControl>
                <FormControl mb={3}>
                  <FormLabel>Driving License</FormLabel>
                  <Select name="license_id" value={editEmployee.license_id} onChange={(e) => handleInputChange(e, setEditEmployee)} placeholder="Select license">
                    {licenses.map((license) => (
                      <option key={license.id} value={license.id}>{license.name}</option>
                    ))}
                  </Select>
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

      {/* View Employee Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Employee Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {viewEmployee && (
              <Box>
                <p><strong>ID:</strong> {viewEmployee.id}</p>
                <p><strong>First Name:</strong> {viewEmployee.firstname}</p>
                <p><strong>Last Name:</strong> {viewEmployee.lastname}</p>
                <p><strong>Email:</strong> {viewEmployee.email}</p>
                <p><strong>Birth Date:</strong> {viewEmployee.birthDate || 'N/A'}</p>
                <p><strong>Hire Date:</strong> {viewEmployee.hireDate || 'N/A'}</p>
                <p><strong>Function:</strong> {functions.find(f => f.id === viewEmployee.function_id)?.name || 'N/A'}</p>
                <p><strong>Status:</strong> {statuses.find(s => s.id === viewEmployee.status_id)?.name || 'N/A'}</p>
                <p><strong>Address:</strong> {viewEmployee.line1 || 'N/A'} {viewEmployee.line2} {viewEmployee.line3}</p>
                <p><strong>Postal Code:</strong> {viewEmployee.postalcode || 'N/A'}</p>
                <p><strong>Town:</strong> {viewEmployee.town || 'N/A'}</p>
                <p><strong>State:</strong> {viewEmployee.state || 'N/A'}</p>
                <p><strong>Country:</strong> {viewEmployee.country || 'N/A'}</p>
                <p><strong>Driving License:</strong> {licenses.find(l => l.id === viewEmployee.license_id)?.name || 'N/A'}</p>
                <p>
                  <strong>Photo:</strong>{' '}
                  {viewEmployee.photoFile && photoUrl ? (
                    <Image
                      src={photoUrl}
                      alt="Employee Photo"
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

export default Employee;