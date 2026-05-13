// src/components/Sidebar.js
import React from 'react';
import {
  Box,
  Button,
  Flex,
  Icon,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiSettings, 
  FiMessageCircle, 
  FiBarChart2, 
  FiFileText,
  FiHelpCircle,
  FiLogOut 
} from 'react-icons/fi';

const Sidebar = () => {
  const location = useLocation();
  const isActive = (path) =>
    location.pathname === path ||
    (path === '/conversationView' && location.pathname.startsWith('/conversation/'));

  const navItems = [
    { name: 'Dashboard', icon: FiHome, path: '/' },
    { name: 'Conversations', icon: FiMessageCircle, path: '/conversationView' },
    { name: 'AI Agent', icon: FiSettings, path: '/agent-config' },
    { name: 'Analytics', icon: FiBarChart2, path: '/analysis' },
    { name: 'Templates', icon: FiFileText, path: '/templates' },
  ];

  return (
    <Box
      position="fixed"
      left={5}
      top="92px"
      bottom={5}
      w="170px"
      bg="white"
      borderRadius="20px"
      display={{ base: 'none', md: 'flex' }}
      flexDirection="column"
      justifyContent="space-between"
      py={5}
      px={4}
      boxShadow="0 18px 45px rgba(41, 35, 74, 0.08)"
    >
      <VStack spacing={2} align="stretch">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Button
              key={item.path}
              as={Link}
              to={item.path}
              variant="ghost"
              justifyContent="flex-start"
              h="38px"
              px={3}
              leftIcon={<Icon as={item.icon} boxSize={4} />}
              bg={active ? '#d9d5e6' : 'transparent'}
              color={active ? '#2f2943' : '#5f596d'}
              fontWeight={active ? '700' : '500'}
              borderRadius="8px"
              _hover={{ bg: '#e5e2ee' }}
            >
              {item.name}
            </Button>
          );
        })}
      </VStack>

      <Flex align="center" gap={3} color="#2f2943" px={3} py={2}>
        <Icon as={FiSettings} />
        <Text fontWeight="600">Settings</Text>
      </Flex>
    </Box>
  );
};

export default Sidebar;
