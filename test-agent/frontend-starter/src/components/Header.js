// src/components/Header.js
import React from 'react';
import {
  Box,
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorMode,
  Button,
  Badge,
  Tooltip,
} from '@chakra-ui/react';
import { 
  FiSearch, 
  FiMenu, 
  FiBell, 
  FiMoon, 
  FiSun,
  FiUser,
  FiSettings,
  FiHelpCircle,
} from 'react-icons/fi';

const Header = () => {
  const purple = useColorModeValue('#4b3b83', 'brand.700');

  return (
    <Box
      as="header"
      position="sticky"
      top={5}
      zIndex={10}
      mx={{ base: 4, md: 5 }}
      mt={5}
      mb={4}
      bg={purple}
      color="white"
      borderRadius="22px"
      px={7}
      py={3}
      boxShadow="0 12px 30px rgba(75, 59, 131, 0.18)"
    >
      <Flex align="center" justify="space-between">
        <Text fontSize="sm" fontWeight="600">ABC Company</Text>
        <Avatar size="sm" name="Supervisor" src="https://i.pravatar.cc/80?img=47" />
      </Flex>
    </Box>
  );
};

export default Header;
