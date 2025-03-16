import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      purple: '#6B46C1', // Dark purple for edges
      gray: '#E2E8F0',   // Light gray for inside
    },
  },
  styles: {
    global: {
      body: {
        bg: 'brand.gray',
        color: 'gray.800',
      },
    },
  },
});

export default theme;