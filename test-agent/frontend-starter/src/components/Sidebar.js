// src/components/Sidebar.js
import React from 'react';
import {
  Box,
  Flex,
  Text,
  VStack,
  Icon,
  useColorMode,
  Divider,
  Button,
} from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiSettings, 
  FiMessageCircle, 
  FiBarChart2, 
  FiUsers,
  FiHelpCircle,
  FiLogOut 
} from 'react-icons/fi';
import { useAppData } from '../context/AppDataContext';

const Sidebar = () => {
  const { colorMode } = useColorMode();
  const location = useLocation();
  const { agents } = useAppData();
  
  const bgColor = colorMode === 'dark' ? 'gray.900' : 'white';
  const borderColor = colorMode === 'dark' ? 'gray.700' : 'gray.200';
  
  const isActive = (path) => location.pathname === path;
  
  const navItems = [
    { name: 'Dashboard', icon: FiHome, path: '/' },
    { name: 'Conversations', icon: FiMessageCircle, path: '/conversationView' },
    { name: 'AI Agent', icon: FiSettings, path: '/agent-config' },
    { name: 'Templates', icon: FiBarChart2, path: '/analysis' },
  ];
  
  return (
    <Box
      position="fixed"
      left={0}
      w={'250px'}
      top={0}
      h="100%"
      bg={bgColor}
      borderRight="1px"
      borderColor={borderColor}
      display={{ base: 'none', md: 'block' }}
      py={5}
      px={3}
      overflow="auto"
    >
      <Flex justify="center" align="center" mb={8}>
        <Text fontSize="xl" fontWeight="bold" color="brand.500">
          Zangoh AI Supervisor
        </Text>
      </Flex>
      
      <VStack spacing={1} align="stretch" mb={6}>
        {navItems.map((item) => (
          <Button
            key={item.path}
            as={Link}
            to={item.path}
            variant="ghost"
            justifyContent="flex-start"
            py={3}
            pl={4}
            leftIcon={<Icon as={item.icon} boxSize={5} />}
            bg={isActive(item.path) ? 'brand.50' : 'transparent'}
            color={isActive(item.path) ? 'brand.500' : 'gray.600'}
            borderRadius="md"
            _hover={{
              bg: 'brand.50',
              color: 'brand.500',
            }}
          >
            {item.name}
          </Button>
        ))}
      </VStack>
      
      <Text
        px={4}
        fontSize="sm"
        fontWeight="bold"
        color="gray.500"
        mb={2}
        textTransform="uppercase"
      >
        Active Agents
      </Text>
      
      <VStack spacing={1} align="stretch" mb={6}>
        {agents.slice(0, 3).map((agent) => (
          <Flex
            key={agent.id}
            py={2}
            px={4}
            align="center"
            borderRadius="md"
            cursor="pointer"
            _hover={{ bg: 'gray.100' }}
          >
            <Box
              w={2}
              h={2}
              borderRadius="full"
              bg={agent.status === 'active' ? 'green.400' : 'gray.400'}
              mr={3}
            />
            <Text fontSize="sm" noOfLines={1}>
              {agent.name}
            </Text>
          </Flex>
        ))}
      </VStack>
      
      <Divider mb={6} />
      
      <VStack spacing={1} align="stretch">
        <Button
          variant="ghost"
          justifyContent="flex-start"
          py={3}
          pl={4}
          leftIcon={<Icon as={FiHelpCircle} boxSize={5} />}
          color="gray.600"
          borderRadius="md"
          _hover={{
            bg: 'gray.100',
          }}
        >
          Help & Resources
        </Button>
        <Button
          variant="ghost"
          justifyContent="flex-start"
          py={3}
          pl={4}
          leftIcon={<Icon as={FiLogOut} boxSize={5} />}
          color="gray.600"
          borderRadius="md"
          _hover={{
            bg: 'gray.100',
          }}
        >
          Log Out
        </Button>
      </VStack>
    </Box>
  );
};

export default Sidebar;