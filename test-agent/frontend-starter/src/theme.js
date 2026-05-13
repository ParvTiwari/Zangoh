// src/theme.js
import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#f0e4ff',
      100: '#d1beff',
      200: '#b397ff',
      300: '#946fff',
      400: '#7547ff',
      500: '#5a24ff',
      600: '#4a1cd5',
      700: '#3915ac',
      800: '#290e83',
      900: '#19075a',
    },
  },
  fonts: {
    heading: `'Inter', sans-serif`,
    body: `'Inter', sans-serif`,
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'bold',
        borderRadius: 'md',
      },
      variants: {
        solid: {
          bg: 'brand.500',
          color: 'white',
          _hover: {
            bg: 'brand.600',
          },
          _active: {
            bg: 'brand.700',
          },
        },
        outline: {
          borderColor: 'brand.500',
          color: 'brand.500',
          _hover: {
            bg: 'brand.50',
          },
        },
      },
    },
    Card: {
      baseStyle: {
        p: '4',
        borderRadius: 'lg',
        boxShadow: 'sm',
        bg: 'white',
      },
    },
  },
});

export default theme;