// src/components/Header.js
import React from 'react';
import {
  Box,
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Avatar,
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
  const { colorMode, toggleColorMode } = useColorMode();
  
  const bgColor = colorMode === 'dark' ? 'gray.800' : 'white';
  const borderColor = colorMode === 'dark' ? 'gray.700' : 'gray.200';
  
  return (
    <Box
      as="header"
      position="sticky"
      top={0}
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      px={4}
      py={2}
      zIndex={10}
      ml={{ base: 0, md: '250px' }}
    >
      <Flex justify="space-between" align="center">
        <Flex align="center">
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            aria-label="Open menu"
            icon={<FiMenu />}
            variant="ghost"
            mr={2}
          />
          <InputGroup maxW="400px">
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.400" />
            </InputLeftElement>
            <Input placeholder="Search conversations or agents..." />
          </InputGroup>
        </Flex>
        
        <Flex align="center">
          <Tooltip label="Toggle color mode">
            <IconButton
              aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
              icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
              variant="ghost"
              onClick={toggleColorMode}
              mr={2}
            />
          </Tooltip>
          
          <Menu>
            <Tooltip label="Notifications">
              <Box position="relative">
                <MenuButton
                  as={IconButton}
                  aria-label="Notifications"
                  icon={<FiBell />}
                  variant="ghost"
                  mr={2}
                />
                <Badge
                  position="absolute"
                  top="-5px"
                  right="-5px"
                  borderRadius="full"
                  bg="red.500"
                  color="white"
                  fontSize="xs"
                  w={4}
                  h={4}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  3
                </Badge>
              </Box>
            </Tooltip>
            <MenuList>
              <MenuItem>New alert: High priority conversation</MenuItem>
              <MenuItem>Agent configuration updated</MenuItem>
              <MenuItem>System maintenance scheduled</MenuItem>
            </MenuList>
          </Menu>
          
          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              rightIcon={<FiUser />}
              borderRadius="md"
              px={3}
              py={2}
            >
              Supervisor
            </MenuButton>
            <MenuList>
              <MenuItem icon={<FiUser />}>Profile</MenuItem>
              <MenuItem icon={<FiSettings />}>Settings</MenuItem>
              <MenuItem icon={<FiHelpCircle />}>Help</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Header;
