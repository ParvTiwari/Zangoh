// src/pages/Dashboard.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Badge,
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

const statusColor = {
  active: 'red',
  waiting: 'yellow',
  resolved: 'green',
  escalated: 'cyan',
};

const formatDuration = (seconds) => {
  const safeSeconds = Math.max(0, Math.round(seconds || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

const MetricTile = ({ title, value, trend = 'up', compact }) => (
  <Box
    bg="white"
    borderRadius="22px"
    p={{ base: 4, md: 6 }}
    minH={{ base: compact ? '104px' : '170px', md: compact ? '118px' : '250px' }}
    boxShadow="0 16px 35px rgba(45, 40, 72, 0.06)"
  >
    <Text fontWeight="700" color="#332b43" fontSize={{ base: 'md', md: 'lg' }}>{title}</Text>
    <Flex align="end" justify="space-between" h={{ base: compact ? '52px' : '96px', md: compact ? '62px' : '170px' }} mt={2}>
      <Text fontSize={{ base: compact ? '3xl' : '4xl', md: compact ? '5xl' : '4xl' }} fontWeight="800" color="#2d273d" lineHeight="1">{value}</Text>
      <Flex w="28px" h="28px" borderRadius="full" align="center" justify="center" bg={trend === 'up' ? '#d7ffc9' : '#ffd1d5'} color={trend === 'up' ? 'green.500' : 'red.500'}>
        <Icon as={trend === 'up' ? FiArrowUp : FiArrowDown} />
      </Flex>
    </Flex>
  </Box>
);

const CsATTile = ({ score }) => (
  <Box bg="white" borderRadius="22px" p={{ base: 4, md: 6 }} minH={{ base: '190px', md: '250px' }} boxShadow="0 16px 35px rgba(45, 40, 72, 0.06)">
    <Text fontWeight="700" color="#332b43" fontSize={{ base: 'md', md: 'lg' }}>Customer Satisfaction Score (CSAT)</Text>
    <Flex align="end" gap={{ base: 3, md: 5 }} h={{ base: '110px', md: '160px' }} mt={5} borderBottom="1px dashed #d8d4e2" position="relative">
      {[58, 112, 86, Math.max(34, Math.round((score || 7.9) * 14))].map((height, index) => (
        <Box key={`${height}-${index}`} w={{ base: '26px', md: '34px' }} h={`${height}px`} maxH="145px" borderRadius="13px" bg={index === 0 ? '#dedce8' : index === 3 ? '#6d609b' : '#8c82ad'} />
      ))}
      <Text position="absolute" right="4px" bottom="6px" color="white" fontSize="xs" fontWeight="700">{score || 7.9}</Text>
    </Flex>
  </Box>
);

const MobileConversationCard = ({ conversation, onOpen }) => {
  const latest = conversation.messages?.[conversation.messages.length - 1];

  return (
    <Box border="1px solid" borderColor="#eeeaf5" borderRadius="18px" p={4} onClick={onOpen} cursor="pointer">
      <Flex justify="space-between" align="start" gap={3}>
        <HStack>
          <Avatar size="sm" name={conversation.customer?.name} src={`https://i.pravatar.cc/80?u=${conversation.customer?.id}`} />
          <Box>
            <Text fontWeight="800">{conversation.customer?.name}</Text>
            <Text fontSize="xs" color="#8e879a">{conversation.agent?.name}</Text>
          </Box>
        </HStack>
        <Badge borderRadius="full" colorScheme={statusColor[conversation.status] || 'gray'}>{conversation.status}</Badge>
      </Flex>
      <Text mt={3} color="#6c6578" noOfLines={2}>{latest?.text || 'No messages yet'}</Text>
      <Text mt={2} fontSize="xs" color="#8e879a">
        {new Date(latest?.timestamp || conversation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </Box>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { conversations, agents, loading } = useAppData();
  const [tab, setTab] = useState('all');
  const [liveMetrics, setLiveMetrics] = useState(null);
  const [metricsConnected, setMetricsConnected] = useState(false);

  const fallbackMetrics = useMemo(() => {
    const total = conversations.length;
    const resolved = conversations.filter((conv) => conv.status === 'resolved').length;
    const escalated = conversations.filter((conv) => conv.status === 'escalated' || conv.alertLevel === 'high').length;
    const active = conversations.filter((conv) => ['active', 'waiting', 'escalated'].includes(conv.status)).length;
    const avgResponseSeconds = total
      ? conversations.reduce((sum, conv) => sum + (conv.metrics?.responseTime || 0), 0) / total
      : 84;

    return {
      resolutionRate: total ? Math.round((resolved / total) * 100) : 82,
      avgResponseSeconds,
      satisfactionScore: 7.9,
      activeConversations: active || 421,
      escalationRate: total ? Math.round((escalated / total) * 100) : 46,
      agentPerformance: agents,
    };
  }, [conversations, agents]);

  useEffect(() => {
    const source = new EventSource('/api/analytics/stream');

    source.addEventListener('metrics', (event) => {
      setLiveMetrics(JSON.parse(event.data));
      setMetricsConnected(true);
    });

    source.onerror = () => {
      setMetricsConnected(false);
    };

    return () => source.close();
  }, []);

  const metrics = liveMetrics || fallbackMetrics;

  const rows = useMemo(() => {
    if (tab === 'needs') return conversations.filter((conv) => conv.alertLevel === 'high' || conv.status === 'escalated');
    if (tab === 'performance') return conversations.filter((conv) => conv.metrics?.confidenceScore >= 0.85);
    return conversations;
  }, [conversations, tab]);

  return (
    <Box>
      <Flex justify="flex-end" mb={3} display={{ base: 'flex', md: 'none' }}>
        <Badge colorScheme={metricsConnected ? 'green' : 'orange'} borderRadius="full">
          {metricsConnected ? 'Live metrics: SSE' : 'Fallback metrics'}
        </Badge>
      </Flex>

      <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} spacing={4} mb={4}>
        <CsATTile score={metrics.satisfactionScore} />
        <MetricTile title="Avg. Response Time" value={formatDuration(metrics.avgResponseSeconds)} trend="down" />
        <VStack spacing={4} align="stretch">
          <MetricTile title="Active Conversations" value={metrics.activeConversations} trend="up" compact />
          <MetricTile title="Escalation Rate" value={`${metrics.escalationRate}%`} trend="down" compact />
        </VStack>
        <Box display={{ base: 'block', sm: 'grid', xl: 'block' }} gridColumn={{ sm: '1 / span 2', xl: 'auto' }}>
          <MetricTile title="Resolution Rate" value={`${metrics.resolutionRate}%`} trend="up" compact />
          <Box mt={4} bg="white" borderRadius="22px" p={5}>
            <Flex justify="space-between" align="center" mb={3}>
              <Text fontWeight="700">Agent Performance</Text>
              <Badge colorScheme={metricsConnected ? 'green' : 'gray'}>{metricsConnected ? 'SSE 2s' : 'local'}</Badge>
            </Flex>
            {(metrics.agentPerformance || agents).slice(0, 2).map((agent) => (
              <Flex key={agent.id} justify="space-between" py={2} gap={3}>
                <Text fontSize="sm" noOfLines={1}>{agent.name}</Text>
                <Badge colorScheme="purple">{Math.round((agent.satisfaction || agent.metrics?.satisfaction || 0.86) * 100)}%</Badge>
              </Flex>
            ))}
          </Box>
        </Box>
      </SimpleGrid>

      <Box bg="white" borderRadius="22px" p={{ base: 4, md: 6 }} boxShadow="0 16px 35px rgba(45, 40, 72, 0.06)">
        <Flex justify="space-between" align={{ base: 'stretch', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={3} mb={5}>
          <HStack spacing={3} overflowX="auto" pb={{ base: 2, md: 0 }}>
            <Button flexShrink={0} size="sm" borderRadius="full" bg={tab === 'all' ? '#4b3b83' : '#efedf4'} color={tab === 'all' ? 'white' : '#5f596d'} onClick={() => setTab('all')}>All Conversations</Button>
            <Button flexShrink={0} size="sm" borderRadius="full" bg={tab === 'needs' ? '#4b3b83' : '#efedf4'} color={tab === 'needs' ? 'white' : '#5f596d'} onClick={() => setTab('needs')}>• Needs Attention</Button>
            <Button flexShrink={0} size="sm" borderRadius="full" bg={tab === 'performance' ? '#4b3b83' : '#efedf4'} color={tab === 'performance' ? 'white' : '#5f596d'} onClick={() => setTab('performance')}>Agent Performance</Button>
          </HStack>
          <HStack>
            <Button size="sm" borderRadius="full" leftIcon={<FiSliders />}>Filter</Button>
            <Button size="sm" borderRadius="full" leftIcon={<FiExternalLink />}>Open</Button>
          </HStack>
        </Flex>

        <VStack display={{ base: 'flex', md: 'none' }} align="stretch" spacing={3}>
          {loading.conversations && <Text>Loading conversations...</Text>}
          {rows.map((conversation) => (
            <MobileConversationCard key={conversation.id} conversation={conversation} onOpen={() => navigate(`/conversation/${conversation.id}`)} />
          ))}
        </VStack>

        <Box display={{ base: 'none', md: 'block' }} overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th color="#9a94a8">Name</Th>
                <Th color="#9a94a8">Message</Th>
                <Th color="#9a94a8">Status</Th>
                <Th color="#9a94a8">Time</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading.conversations && (
                <Tr><Td colSpan={4}>Loading conversations...</Td></Tr>
              )}
              {rows.map((conversation) => {
                const latest = conversation.messages?.[conversation.messages.length - 1];
                return (
                  <Tr key={conversation.id} cursor="pointer" _hover={{ bg: '#f7f5fb' }} onClick={() => navigate(`/conversation/${conversation.id}`)}>
                    <Td>
                      <HStack>
                        <Avatar size="xs" name={conversation.customer?.name} src={`https://i.pravatar.cc/80?u=${conversation.customer?.id}`} />
                        <Text fontWeight="700">{conversation.customer?.name}</Text>
                      </HStack>
                    </Td>
                    <Td maxW="360px"><Text noOfLines={1} color="#6c6578">{latest?.text || 'No messages yet'}</Text></Td>
                    <Td><Badge minW="110px" textAlign="center" borderRadius="full" colorScheme={statusColor[conversation.status] || 'gray'}>{conversation.status}</Badge></Td>
                    <Td color="#5f596d">{new Date(latest?.timestamp || conversation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
