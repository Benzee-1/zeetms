import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    blue: {
      500: '#00A3C4', // Cyan blue for header
    },
    gray: {
      800: '#1A202C', // Dark gray for sidebar
      100: '#E2E8F0', // Light gray for background
    },
  },
  styles: {
    global: {
      body: {
        bg: 'gray.100',
        color: 'gray.800',
      },
    },
  },
});

export default theme;