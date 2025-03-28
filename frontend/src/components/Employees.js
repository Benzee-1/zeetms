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

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [functions, setFunctions] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    birth_date: '',
    hire_date: '',
    function_id: '',
    status_id: '',
    line1: '',
    line2: '',
    line3: '',
    postalcode: '',
    town: '',
    state: '',
    country: '',
    license_id: '',
  });
  const [photoFile, setPhotoFile] = useState(null); // State for photo file
  const toast = useToast();

  // Fetch employees and dropdown options on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [employeesRes, functionsRes, statusesRes, licensesRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/employees`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/employee_functions`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/employee_statuses`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/driving_licenses`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setEmployees(employeesRes.data);
        setFunctions(functionsRes.data);
        setStatuses(statusesRes.data);
        setLicenses(licensesRes.data);
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
      firstname: '',
      lastname: '',
      email: '',
      birth_date: '',
      hire_date: '',
      function_id: '',
      status_id: '',
      line1: '',
      line2: '',
      line3: '',
      postalcode: '',
      town: '',
      state: '',
      country: '',
      license_id: '',
    });
    setPhotoFile(null);
    setIsAddModalOpen(true);
  };

  // Open Details modal with selected employee
  const openDetailsModal = async (employeeId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/employees/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedEmployee(response.data);
      setIsDetailsModalOpen(true);
    } catch (error) {
      toast({
        title: 'Error fetching employee',
        description: error.response?.data?.detail || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Open Edit modal with selected employee
  const openEditModal = async (employeeId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/employees/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData({
        ...response.data,
        birth_date: response.data.birth_date || '',
        hire_date: response.data.hire_date || '',
        function_id: response.data.function_id || '',
        status_id: response.data.status_id || '',
        license_id: response.data.license_id || '',
        line1: response.data.line1 || '',
        line2: response.data.line2 || '',
        line3: response.data.line3 || '',
        postalcode: response.data.postalcode || '',
        town: response.data.town || '',
        state: response.data.state || '',
        country: response.data.country || '',
      });
      setPhotoFile(null);
      setIsEditModalOpen(true);
    } catch (error) {
      toast({
        title: 'Error fetching employee',
        description: error.response?.data?.detail || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Open Delete modal with selected employee
  const openDeleteModal = (employee) => {
    setSelectedEmployee(employee);
    setIsDeleteModalOpen(true);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle photo file change
  const handlePhotoChange = (e) => {
    setPhotoFile(e.target.files[0]);
  };

  // Handle Add Employee
  const handleAddEmployee = async () => {
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      // Append all form fields, excluding empty strings for optional fields
      const fields = [
        'firstname',
        'lastname',
        'email',
        'birth_date',
        'hire_date',
        'line1',
        'line2',
        'line3',
        'postalcode',
        'town',
        'state',
        'country',
      ];
      fields.forEach((field) => {
        if (formData[field]) {
          formDataToSend.append(field, formData[field]);
        }
      });

      // Append numeric fields only if they have a value
      if (formData.function_id) {
        formDataToSend.append('function_id', parseInt(formData.function_id));
      }
      if (formData.status_id) {
        formDataToSend.append('status_id', parseInt(formData.status_id));
      }
      if (formData.license_id) {
        formDataToSend.append('license_id', parseInt(formData.license_id));
      }

      // Append photo file if exists
      if (photoFile) {
        formDataToSend.append('photo', photoFile);
      }

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/employees`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setEmployees([...employees, response.data]);
      setIsAddModalOpen(false);
      toast({
        title: 'Employee added',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error adding employee',
        description: error.response?.data?.detail || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle Edit Employee
  const handleEditEmployee = async () => {
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      // Append all form fields, excluding empty strings for optional fields
      const fields = [
        'firstname',
        'lastname',
        'email',
        'birth_date',
        'hire_date',
        'line1',
        'line2',
        'line3',
        'postalcode',
        'town',
        'state',
        'country',
      ];
      fields.forEach((field) => {
        if (formData[field]) {
          formDataToSend.append(field, formData[field]);
        }
      });

      // Append numeric fields only if they have a value
      if (formData.function_id) {
        formDataToSend.append('function_id', parseInt(formData.function_id));
      }
      if (formData.status_id) {
        formDataToSend.append('status_id', parseInt(formData.status_id));
      }
      if (formData.license_id) {
        formDataToSend.append('license_id', parseInt(formData.license_id));
      }

      // Append photo file if exists
      if (photoFile) {
        formDataToSend.append('photo', photoFile);
      }

      const response = await axios.put(`${process.env.REACT_APP_API_URL}/employees/${formData.id}`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setEmployees(employees.map((emp) => (emp.id === formData.id ? response.data : emp)));
      setIsEditModalOpen(false);
      toast({
        title: 'Employee updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error updating employee',
        description: error.response?.data?.detail || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle Delete Employee
  const handleDeleteEmployee = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/employees/${selectedEmployee.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(employees.filter((emp) => emp.id !== selectedEmployee.id));
      setIsDeleteModalOpen(false);
      toast({
        title: 'Employee deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error deleting employee',
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
          Add Employee
        </Button>
      </HStack>

      {/* Updated Table with reduced spacing */}
      <Table variant="simple" size="sm"> {/* Use size="sm" for a more compact table */}
        <Thead>
          <Tr>
            <Th py={1}>First Name</Th> {/* Reduce padding */}
            <Th py={1}>Last Name</Th>
            <Th py={1}>Email</Th>
            <Th py={1}>Function</Th>
            <Th py={1}>Status</Th>
            <Th py={1}>Assigned Vehicle</Th>
            <Th py={1}>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {employees.map((employee) => (
            <Tr key={employee.id}>
              <Td py={1}>{employee.firstname}</Td> {/* Reduce padding */}
              <Td py={1}>{employee.lastname}</Td>
              <Td py={1}>{employee.email}</Td>
              <Td py={1}>{employee.function_name || 'N/A'}</Td>
              <Td py={1}>{employee.status_name || 'N/A'}</Td>
              <Td py={1}>{employee.assigned_vehicle || 'None'}</Td>
              <Td py={1}>
                <HStack spacing={2}>
                  <Text
                    color="blue.500"
                    cursor="pointer"
                    onClick={() => openDetailsModal(employee.id)}
                  >
                    Details
                  </Text>
                  <Text
                    color="orange.500"
                    cursor="pointer"
                    onClick={() => openEditModal(employee.id)}
                  >
                    Modify
                  </Text>
                  <Text
                    color="red.500"
                    cursor="pointer"
                    onClick={() => openDeleteModal(employee)}
                  >
                    Delete
                  </Text>
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Add Employee Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Employee</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SimpleGrid columns={3} spacing={4}>
              {/* Column 1: Personal Info */}
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>First Name</FormLabel>
                  <Input
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Last Name</FormLabel>
                  <Input
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </FormControl>
              </VStack>

              {/* Column 2: Employment Info */}
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Birth Date</FormLabel>
                  <Input
                    name="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Hire Date</FormLabel>
                  <Input
                    name="hire_date"
                    type="date"
                    value={formData.hire_date}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Function</FormLabel>
                  <Select
                    name="function_id"
                    value={formData.function_id}
                    onChange={handleChange}
                    placeholder="Select function"
                  >
                    {functions.map((func) => (
                      <option key={func.id} value={func.id}>
                        {func.name}
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
                    {statuses.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </VStack>

              {/* Column 3: Address, License, and Photo */}
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Line 1</FormLabel>
                  <Input
                    name="line1"
                    value={formData.line1}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Town</FormLabel>
                  <Input
                    name="town"
                    value={formData.town}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Country</FormLabel>
                  <Input
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Driving License</FormLabel>
                  <Select
                    name="license_id"
                    value={formData.license_id}
                    onChange={handleChange}
                    placeholder="Select license"
                  >
                    {licenses.map((lic) => (
                      <option key={lic.id} value={lic.id}>
                        {lic.driving_license_ame}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Upload Photo</FormLabel>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                </FormControl>
              </VStack>
            </SimpleGrid>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleAddEmployee}>
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
          <ModalHeader>Employee Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedEmployee && (
              <HStack spacing={4}>
                {/* Display Employee Photo */}
                {selectedEmployee.photo_file ? (
                  <Image
                    src={`http://10.118.1.7/api/uploads/${selectedEmployee.photo_file.split('/').pop()}`}
                    alt={`${selectedEmployee.firstname} ${selectedEmployee.lastname}`}
                    boxSize="150px"
                    objectFit="cover"
                    borderRadius="md"
                  />
                ) : (
                  <Text>No photo available</Text>
                )}
                <VStack spacing={2} align="start">
                  <Text><strong>First Name:</strong> {selectedEmployee.firstname}</Text>
                  <Text><strong>Last Name:</strong> {selectedEmployee.lastname}</Text>
                  <Text><strong>Email:</strong> {selectedEmployee.email}</Text>
                  <Text><strong>Function:</strong> {selectedEmployee.function_name || 'N/A'}</Text>
                  <Text><strong>Status:</strong> {selectedEmployee.status_name || 'N/A'}</Text>
                  <Text><strong>Birth Date:</strong> {selectedEmployee.birth_date || 'N/A'}</Text>
                  <Text><strong>Hire Date:</strong> {selectedEmployee.hire_date || 'N/A'}</Text>
                  <Text><strong>Address:</strong> {selectedEmployee.line1 || ''} {selectedEmployee.line2 || ''} {selectedEmployee.line3 || ''}, {selectedEmployee.town || ''}, {selectedEmployee.state || ''}, {selectedEmployee.postalcode || ''}, {selectedEmployee.country || 'N/A'}</Text>
                  <Text><strong>Driving License:</strong> {selectedEmployee.license_name || 'N/A'}</Text>
                  <Text><strong>Assigned Vehicle:</strong> {selectedEmployee.assigned_vehicle || 'None'}</Text> {/* Added field */}
                </VStack>
              </HStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setIsDetailsModalOpen(false)}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Employee</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SimpleGrid columns={3} spacing={4}>
              {/* Column 1: Personal Info */}
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>First Name</FormLabel>
                  <Input
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Last Name</FormLabel>
                  <Input
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </FormControl>
              </VStack>

              {/* Column 2: Employment Info */}
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Birth Date</FormLabel>
                  <Input
                    name="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Hire Date</FormLabel>
                  <Input
                    name="hire_date"
                    type="date"
                    value={formData.hire_date}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Function</FormLabel>
                  <Select
                    name="function_id"
                    value={formData.function_id}
                    onChange={handleChange}
                    placeholder="Select function"
                  >
                    {functions.map((func) => (
                      <option key={func.id} value={func.id}>
                        {func.name}
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
                    {statuses.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </VStack>

              {/* Column 3: Address, License, and Photo */}
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Line 1</FormLabel>
                  <Input
                    name="line1"
                    value={formData.line1}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Town</FormLabel>
                  <Input
                    name="town"
                    value={formData.town}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Country</FormLabel>
                  <Input
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Driving License</FormLabel>
                  <Select
                    name="license_id"
                    value={formData.license_id}
                    onChange={handleChange}
                    placeholder="Select license"
                  >
                    {licenses.map((lic) => (
                      <option key={lic.id} value={lic.id}>
                        {lic.driving_license_ame}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Upload Photo</FormLabel>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
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
            <Button colorScheme="blue" mr={3} onClick={handleEditEmployee}>
              Update
            </Button>
            <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
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
            <Text>Are you sure you want to delete {selectedEmployee?.firstname} {selectedEmployee?.lastname}?</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={handleDeleteEmployee}>
              Delete
            </Button>
            <Button onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Employees;