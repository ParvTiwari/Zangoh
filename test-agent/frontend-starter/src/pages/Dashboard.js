// src/pages/Dashboard.js
import React, { useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useColorModeValue,
  SimpleGrid,
  Button,
  Badge,
} from '@chakra-ui/react';
import { FiMessageCircle, FiClock, FiThumbsUp, FiAlertCircle } from 'react-icons/fi';
import { useAppData } from '../context/AppDataContext';
import ConversationList from '../components/ConversationList';
import MetricsCard from '../components/MetricsCard';

const Dashboard = () => {
  const { conversations, agents, loading, error } = useAppData();
  const [timeRange, setTimeRange] = useState('today');

  const cardBg = useColorModeValue('white', 'gray.800');

  // Calculate metrics based on conversations data
  const activeConversations = conversations.filter(conv => conv.status === 'active').length;
  const escalatedConversations = conversations.filter(conv => conv.status === 'escalated').length;
  const highAlertConversations = conversations.filter(conv => conv.alertLevel === 'high').length;
  
  // Get average sentiment across all conversations
  const avgSentiment = conversations.length > 0
    ? conversations.reduce((sum, conv) => sum + (conv.metrics?.sentiment || 0), 0) / conversations.length
    : 0;
  
  // Format as percentage
  const sentimentPercentage = `${Math.round(avgSentiment * 100)}%`;

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Heading size="lg">Agent Supervisor Dashboard</Heading>
          <Text color="gray.500">Monitor and manage AI agent interactions</Text>
        </Box>
        
        <Flex gap={2}>
          <Button
            size="sm"
            variant={timeRange === 'today' ? 'solid' : 'outline'}
            onClick={() => setTimeRange('today')}
          >
            Today
          </Button>
          <Button
            size="sm"
            variant={timeRange === 'week' ? 'solid' : 'outline'}
            onClick={() => setTimeRange('week')}
          >
            This Week
          </Button>
          <Button
            size="sm"
            variant={timeRange === 'month' ? 'solid' : 'outline'}
            onClick={() => setTimeRange('month')}
          >
            This Month
          </Button>
        </Flex>
      </Flex>
      
      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4} mb={6}>
        <MetricsCard
          title="Active Conversations"
          value={activeConversations}
          icon={FiMessageCircle}
          change="23%"
          changeType="increase"
          color="blue"
        />
        <MetricsCard
          title="Escalations"
          value={escalatedConversations}
          icon={FiAlertCircle}
          change="5%"
          changeType="decrease"
          color="orange"
        />
        <MetricsCard
          title="Avg Response Time"
          value="12.4s"
          icon={FiClock}
          change="30%"
          changeType="decrease"
          color="green"
        />
        <MetricsCard
          title="Customer Satisfaction"
          value={sentimentPercentage}
          icon={FiThumbsUp}
          change="7%"
          changeType="increase"
          color="purple"
        />
      </SimpleGrid>
      
      <Tabs variant="enclosed" colorScheme="brand" isLazy>
        <TabList>
          <Tab>All Conversations</Tab>
          <Tab>
            Needs Attention{' '}
            {highAlertConversations > 0 && (
              <Badge ml={2} colorScheme="red" borderRadius="full">
                {highAlertConversations}
              </Badge>
            )}
          </Tab>
          <Tab>Agent Performance</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel px={0}>
            <ConversationList 
              conversations={conversations}
              loading={loading.conversations}
              error={error.conversations}
            />
          </TabPanel>
          
          <TabPanel px={0}>
            <ConversationList 
              conversations={conversations.filter(conv => conv.alertLevel === 'high')}
              loading={loading.conversations}
              error={error.conversations}
            />
          </TabPanel>
          
          <TabPanel px={0}>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              {agents.map(agent => (
                <Box
                  key={agent.id}
                  bg={cardBg}
                  p={4}
                  borderRadius="lg"
                  boxShadow="sm"
                >
                  <Flex justify="space-between" align="center" mb={4}>
                    <Flex align="center">
                      <Box
                        w={3}
                        h={3}
                        borderRadius="full"
                        bg={agent.status === 'active' ? 'green.400' : 'gray.400'}
                        mr={3}
                      />
                      <Heading size="md">{agent.name}</Heading>
                    </Flex>
                    <Text fontSize="sm" color="gray.500">
                      {agent.model}
                    </Text>
                  </Flex>
                  
                  <SimpleGrid columns={2} spacing={4}>
                    <Box>
                      <Text color="gray.500" fontSize="sm">
                        Conversations
                      </Text>
                      <Text fontWeight="bold" fontSize="xl">
                        {agent.metrics?.conversations || 0}
                      </Text>
                    </Box>
                    <Box>
                      <Text color="gray.500" fontSize="sm">
                        Avg Response Time
                      </Text>
                      <Text fontWeight="bold" fontSize="xl">
                        {agent.metrics?.avgResponseTime || 0}s
                      </Text>
                    </Box>
                    <Box>
                      <Text color="gray.500" fontSize="sm">
                        Satisfaction
                      </Text>
                      <Text fontWeight="bold" fontSize="xl">
                        {agent.metrics?.satisfaction ? `${Math.round(agent.metrics.satisfaction * 100)}%` : 'N/A'}
                      </Text>
                    </Box>
                    <Box>
                      <Text color="gray.500" fontSize="sm">
                        Escalation Rate
                      </Text>
                      <Text fontWeight="bold" fontSize="xl">
                        {agent.metrics?.escalationRate ? `${Math.round(agent.metrics.escalationRate * 100)}%` : 'N/A'}
                      </Text>
                    </Box>
                  </SimpleGrid>
                </Box>
              ))}
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Dashboard;