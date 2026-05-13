// src/components/Layout.js
import React from 'react';
import { Box, Flex, useColorMode } from '@chakra-ui/react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  const { colorMode } = useColorMode();
  
  return (
    <Flex direction="row" minHeight="100vh">
      <Sidebar />
      <Box
        flex="1"
        bg={colorMode === 'dark' ? 'gray.800' : 'gray.50'}
        minH="100vh"
      >
        <Header />
        <Box as="main" p={4} ml={{ base: 0, md: '250px' }}>
          {children}
        </Box>
      </Box>
    </Flex>
  );
};

export default Layout;