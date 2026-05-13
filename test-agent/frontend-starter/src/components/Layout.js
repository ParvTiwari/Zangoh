// src/components/Layout.js
import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  return (
    <Flex minH="100vh" bg="#eeedf4">
      <Sidebar />
      <Box flex="1" ml={{ base: 0, md: '210px' }} minW={0}>
        <Header />
        <Box as="main" px={{ base: 4, md: 5 }} pb={6}>
          {children}
        </Box>
      </Box>
    </Flex>
  );
};

export default Layout;
