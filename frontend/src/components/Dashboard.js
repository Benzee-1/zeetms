import React, { useState, useEffect } from 'react';
import { Box, Heading, Grid, GridItem, useToast } from '@chakra-ui/react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const toast = useToast();
  const [employeeStatusData, setEmployeeStatusData] = useState({ labels: [], datasets: [] });
  const [vehicleStatusData, setVehicleStatusData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const fetchEmployeeStatusDistribution = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/employee_status_distribution`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = response.data;
        const labels = data.map(item => item.status_name);
        const counts = data.map(item => item.count);

        setEmployeeStatusData({
          labels,
          datasets: [
            {
              label: 'Employees by Status',
              data: counts,
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF'],
              hoverOffset: 4,
            },
          ],
        });
      } catch (error) {
        toast({
          title: 'Error fetching employee status distribution',
          description: error.response?.data?.detail || 'An error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    const fetchVehicleStatusDistribution = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/vehicle_status_distribution`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = response.data;
        const labels = data.map(item => item.status_name);
        const counts = data.map(item => item.count);

        setVehicleStatusData({
          labels,
          datasets: [
            {
              label: 'Vehicles by Status',
              data: counts,
              backgroundColor: ['#36A2EB', '#FFCE56', '#FF6384'], // Blue: Available, Yellow: Maintenance, Red: Assigned
              hoverOffset: 4,
            },
          ],
        });
      } catch (error) {
        toast({
          title: 'Error fetching vehicle status distribution',
          description: error.response?.data?.detail || 'An error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchEmployeeStatusDistribution();
    fetchVehicleStatusDistribution();
  }, [toast]);

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 10, font: { size: 12 } },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.raw} vehicles`,
        },
      },
    },
  };

  return (
    <Box p={6}>
      <Heading as="h1" mb={6}>
        Dashboard
      </Heading>
      <Grid templateColumns="repeat(3, 1fr)" gap={6}>
        {/* Top-left cell: Employee Status Pie Chart */}
        <GridItem colSpan={1} rowSpan={1}>
          <Box
            borderWidth="1px"
            borderRadius="lg"
            p={4}
            h="250px"
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
          >
            <Heading as="h3" size="sm" mb={2}>
              Employee Status
            </Heading>
            {employeeStatusData.labels.length > 0 ? (
              <Box h="100%">
                <Pie data={employeeStatusData} options={pieOptions} />
              </Box>
            ) : (
              <Box textAlign="center" mt={4}>
                No data available
              </Box>
            )}
          </Box>
        </GridItem>

        {/* Top-middle cell: Vehicle Status Pie Chart */}
        <GridItem colSpan={1} rowSpan={1}>
          <Box
            borderWidth="1px"
            borderRadius="lg"
            p={4}
            h="250px"
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
          >
            <Heading as="h3" size="sm" mb={2}>
              Vehicle Status
            </Heading>
            {vehicleStatusData.labels.length > 0 ? (
              <Box h="100%">
                <Pie data={vehicleStatusData} options={pieOptions} />
              </Box>
            ) : (
              <Box textAlign="center" mt={4}>
                No data available
              </Box>
            )}
          </Box>
        </GridItem>

        {/* Top-right cell: Placeholder 2 */}
        <GridItem colSpan={1} rowSpan={1}>
          <Box borderWidth="1px" borderRadius="lg" p={4} h="250px">
            <Heading as="h3" size="sm" mb={2}>
              Placeholder 2
            </Heading>
            <Box textAlign="center" mt={4}>
              Coming soon
            </Box>
          </Box>
        </GridItem>

        {/* Bottom row placeholders */}
        <GridItem colSpan={1} rowSpan={1}>
          <Box borderWidth="1px" borderRadius="lg" p={4} h="250px">
            <Heading as="h3" size="sm" mb={2}>
              Placeholder 3
            </Heading>
            <Box textAlign="center" mt={4}>
              Coming soon
            </Box>
          </Box>
        </GridItem>
        <GridItem colSpan={1} rowSpan={1}>
          <Box borderWidth="1px" borderRadius="lg" p={4} h="250px">
            <Heading as="h3" size="sm" mb={2}>
              Placeholder 4
            </Heading>
            <Box textAlign="center" mt={4}>
              Coming soon
            </Box>
          </Box>
        </GridItem>
        <GridItem colSpan={1} rowSpan={1}>
          <Box borderWidth="1px" borderRadius="lg" p={4} h="250px">
            <Heading as="h3" size="sm" mb={2}>
              Placeholder 5
            </Heading>
            <Box textAlign="center" mt={4}>
              Coming soon
            </Box>
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default Dashboard;