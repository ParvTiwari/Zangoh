import React, { useState } from 'react';
import {
  Box,
  Heading,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Text,
  IconButton,
  HStack,
  Tag,
  Flex,
  Spacer,
} from '@chakra-ui/react';
import { FiEdit, FiTrash2, FiArrowRight } from 'react-icons/fi';

const analysisCards = [
  {
    id: 1,
    title: 'Weekly Trend Overview',
    type: 'Trend',
    description: 'Track conversation volume and peak times.',
    category: 'Chat',
    audience: 1234,
    date: 'Apr 12',
  },
  {
    id: 2,
    title: 'Top 10 Common Issues',
    type: 'Issues',
    description: 'List of frequent customer problems.',
    category: 'Website',
    audience: 456,
    date: 'Apr 10',
  },
  {
    id: 3,
    title: 'Conversation Search Report',
    type: 'Search',
    description: 'Analyze filtered conversations by keyword.',
    category: 'Messenger',
    audience: 987,
    date: 'Apr 8',
  },
  {
    id: 4,
    title: 'Agent Performance Summary',
    type: 'Performance',
    description: 'Compare agent responsiveness and satisfaction.',
    category: 'Mobile',
    audience: 654,
    date: 'Apr 5',
  },
];

const typeIcons = {
  Trend: '📈',
  Issues: '🧠',
  Search: '🔍',
  Performance: '⭐',
};

const Analysis = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box p={10} maxW="1200px" mx="auto">
      <Flex justify="space-between" align="center" mb={8}>
        <Heading fontSize="2xl">Analysis Dashboard</Heading>
        <Button colorScheme="purple">Create Report</Button>
      </Flex>

      <Tabs index={activeTab} onChange={setActiveTab} colorScheme="purple" variant="enclosed">
        <TabList mb={4}>
          <Tab fontWeight="semibold">My Reports</Tab>
          <Tab fontWeight="semibold">Shared Reports</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {analysisCards.map((report) => (
                <Box
                  key={report.id}
                  borderWidth="1px"
                  borderRadius="lg"
                  p={6}
                  boxShadow="sm"
                  bg="white"
                  transition="0.2s ease"
                  _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
                >
                  <Text fontSize="xl" mb={1}>
                    {typeIcons[report.type]} {report.title}
                  </Text>
                  <Text color="gray.600" fontSize="sm" mb={3}>
                    {report.description}
                  </Text>
                  <HStack spacing={3} mb={4}>
                    <Tag>{report.category}</Tag>
                    <Tag>{report.audience} users</Tag>
                    <Tag>{report.date}</Tag>
                  </HStack>
                  <Flex justify="space-between">
                    <HStack spacing={2}>
                      <IconButton icon={<FiTrash2 />} size="sm" aria-label="Delete" />
                      <IconButton icon={<FiEdit />} size="sm" aria-label="Edit" />
                    </HStack>
                    <IconButton icon={<FiArrowRight />} size="sm" aria-label="View" />
                  </Flex>
                </Box>
              ))}
            </SimpleGrid>
            <Flex justify="center" mt={10}>
              <Button variant="ghost">←</Button>
              <Text px={4}>5 / 6</Text>
              <Button variant="ghost">→</Button>
            </Flex>
          </TabPanel>
          <TabPanel>
            <Text fontSize="md">Shared reports will appear here. (Coming soon!)</Text>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Analysis;
