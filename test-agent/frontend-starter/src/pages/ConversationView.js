// src/pages/ConversationView.js
import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  VStack,
  HStack,
  Avatar,
  Divider,
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';

const ConversationView = () => {
  const { id } = useParams();
  const { conversations, interveneInConversation } = useAppData();
  const [conversation, setConversation] = useState(null);

  useEffect(() => {
    const conv = conversations.find(conv => conv.id === id || conv._id === id);
    setConversation(conv);
  }, [conversations, id]);

  if (!conversation) {
    return <Text p={4}>Loading conversation...</Text>;
  }

  const handleIntervene = () => {
    interveneInConversation(conversation.id || conversation._id);
  };

  return (
    <Flex p={4} gap={4}>
      {/* Chat Area */}
      <Box flex="2" bg="white" borderRadius="xl" boxShadow="md" p={4}>
        <Text fontSize="xl" mb={2} fontWeight="bold">
          Conversation
        </Text>
        <VStack align="start" spacing={3} maxHeight="70vh" overflowY="auto">
          {conversation.messages.map((msg, index) => (
            <Box
              key={index}
              alignSelf={msg.sender === 'agent' ? 'flex-end' : 'flex-start'}
              bg={msg.sender === 'agent' ? 'blue.100' : 'gray.100'}
              p={3}
              borderRadius="md"
              maxWidth="75%"
            >
              <Text fontWeight="medium">{msg.sender.toUpperCase()}</Text>
              <Text>{msg.text}</Text>
            </Box>
          ))}
        </VStack>
        <Button mt={4} colorScheme="red" onClick={handleIntervene}>
          Intervene
        </Button>
      </Box>

      {/* Sidebar */}
      <Box flex="1" bg="gray.50" borderRadius="xl" boxShadow="md" p={4}>
        <Text fontSize="lg" fontWeight="bold">
          Customer Info
        </Text>
        <HStack mt={3} mb={3}>
          <Avatar name={conversation.customer} />
          <Box>
            <Text>{conversation.customer.name}</Text>
            <Text fontSize="sm" color="gray.600">
              {conversation.customer.email}
            </Text>
          </Box>
        </HStack>
        <Divider my={2} />
        <Text fontSize="lg" fontWeight="bold">
          Performance Metrics
        </Text>
        <VStack align="start" mt={2}>
          <Text>Response Time: {conversation.metrics.responseTime} sec</Text>
          <Text>Resolution Rate: {conversation.metrics.resolutionRate}%</Text>
          <Text>
            Customer Satisfaction: {conversation.metrics.csatScore}/5
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
};

export default ConversationView;
