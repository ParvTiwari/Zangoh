// src/pages/ConversationView.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  Input,
  Select,
  SimpleGrid,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Tag,
  Text,
  Textarea,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  addMessage,
  getConversation,
  interveneInConversation,
  releaseIntervention,
} from '../api';
import { useAppData } from '../context/AppDataContext';
import { formatDate } from '../utils/dateUtils';

const extractVariables = (content) => {
  const matches = content.match(/{{\s*([a-zA-Z0-9_]+)\s*}}/g) || [];
  return [...new Set(matches.map((match) => match.replace(/[{}\s]/g, '')))];
};

const applyVariables = (content, values) =>
  content.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, key) => values[key] || `{{${key}}}`);

const ConversationView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { conversations, templates, updateConversation, appendConversationMessage } = useAppData();
  const [conversation, setConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [takeoverNotes, setTakeoverNotes] = useState('');
  const [releaseNotes, setReleaseNotes] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [variableValues, setVariableValues] = useState({});

  useEffect(() => {
    const cachedConversation = conversations.find((conv) => conv.id === id || conv._id === id);
    if (cachedConversation) setConversation(cachedConversation);
  }, [conversations, id]);

  useEffect(() => {
    if (!id) return;

    getConversation(id)
      .then(setConversation)
      .catch(() => {
        // Keep rendering cached context data when the API is unavailable.
      });
  }, [id]);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId),
    [templates, selectedTemplateId]
  );

  const selectedTemplateVariables = useMemo(
    () => (selectedTemplate ? extractVariables(selectedTemplate.content) : []),
    [selectedTemplate]
  );

  const conversationId = conversation?.id || conversation?._id;
  const hasHumanControl = conversation?.status === 'escalated' || conversation?.humanIntervention?.occurred;

  const handleTakeOver = async () => {
    try {
      await interveneInConversation(conversationId, 'supervisor-1', takeoverNotes);
      updateConversation(conversationId, {
        status: 'escalated',
        humanIntervention: { occurred: true, supervisorId: 'supervisor-1', notes: takeoverNotes, timestamp: new Date() },
      });
      setConversation((prev) => ({
        ...prev,
        status: 'escalated',
        humanIntervention: { occurred: true, supervisorId: 'supervisor-1', notes: takeoverNotes, timestamp: new Date() },
      }));
      toast({ title: 'Supervisor control enabled', status: 'success', duration: 2500 });
    } catch (error) {
      toast({ title: 'Takeover failed', description: error.response?.data?.message || error.message, status: 'error' });
    }
  };

  const handleRelease = async () => {
    try {
      await releaseIntervention(conversationId, releaseNotes);
      updateConversation(conversationId, { status: 'active', supervisorNotes: releaseNotes });
      setConversation((prev) => ({ ...prev, status: 'active', supervisorNotes: releaseNotes }));
      toast({ title: 'Control returned to AI', status: 'success', duration: 2500 });
    } catch (error) {
      toast({ title: 'Release failed', description: error.response?.data?.message || error.message, status: 'error' });
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const optimisticMessage = {
      sender: 'supervisor',
      text: message.trim(),
      timestamp: new Date(),
    };

    appendConversationMessage(conversationId, optimisticMessage);
    setConversation((prev) => ({ ...prev, messages: [...(prev.messages || []), optimisticMessage] }));
    setMessage('');

    try {
      await addMessage(conversationId, optimisticMessage);
      toast({ title: 'Message sent as supervisor', status: 'success', duration: 2000 });
    } catch (error) {
      toast({ title: 'Message saved locally only', status: 'warning', duration: 2500 });
    }
  };

  const handleTemplateSelection = (templateId) => {
    setSelectedTemplateId(templateId);
    const template = templates.find((item) => item.id === templateId);
    if (!template) return;

    const variables = extractVariables(template.content);
    const defaults = variables.reduce((acc, variable) => {
      acc[variable] = variable.toLowerCase().includes('customer') ? conversation?.customer?.name || '' : '';
      return acc;
    }, {});
    setVariableValues(defaults);
    setMessage(applyVariables(template.content, defaults));
  };

  const handleVariableChange = (variable, value) => {
    const nextValues = { ...variableValues, [variable]: value };
    setVariableValues(nextValues);
    setMessage(applyVariables(selectedTemplate.content, nextValues));
  };

  if (!conversation) {
    return (
      <Box p={6}>
        <Button variant="ghost" mb={4} onClick={() => navigate('/')}>Back to dashboard</Button>
        <Text>Loading conversation...</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Button variant="ghost" mb={4} onClick={() => navigate('/')}>← Back to dashboard</Button>
      <Flex gap={5} align="stretch" direction={{ base: 'column', xl: 'row' }}>
        <Box flex="2" bg="white" borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
          <Flex p={5} justify="space-between" align="center" borderBottom="1px solid" borderColor="gray.100">
            <Box>
              <Heading size="md">{conversation.customer?.name}</Heading>
              <HStack mt={2}>
                <Badge colorScheme={conversation.alertLevel === 'high' ? 'red' : conversation.alertLevel === 'medium' ? 'orange' : 'green'}>
                  {conversation.alertLevel} alert
                </Badge>
                <Badge colorScheme={hasHumanControl ? 'purple' : 'blue'}>{conversation.status}</Badge>
                {(conversation.tags || []).map((tag) => <Tag key={tag}>{tag}</Tag>)}
              </HStack>
            </Box>
            <Text color="gray.500" fontSize="sm">Started {formatDate(conversation.startTime)}</Text>
          </Flex>

          <VStack align="stretch" spacing={4} p={5} h="56vh" overflowY="auto" bg="gray.50">
            {(conversation.messages || []).map((msg, index) => {
              const isAgentSide = msg.sender === 'agent' || msg.sender === 'supervisor';
              return (
                <Flex key={`${msg.timestamp}-${index}`} justify={isAgentSide ? 'flex-end' : 'flex-start'}>
                  <Box maxW="76%" bg={msg.sender === 'supervisor' ? 'purple.500' : msg.sender === 'agent' ? 'blue.100' : 'white'} color={msg.sender === 'supervisor' ? 'white' : 'gray.800'} p={4} borderRadius="2xl" boxShadow="xs">
                    <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" opacity={0.75}>{msg.sender}</Text>
                    <Text mt={1}>{msg.text}</Text>
                    <Text fontSize="xs" mt={2} opacity={0.7}>{msg.timestamp ? formatDate(msg.timestamp) : ''}</Text>
                  </Box>
                </Flex>
              );
            })}
          </VStack>

          <Stack p={5} spacing={4} borderTop="1px solid" borderColor="gray.100">
            <FormControl>
              <FormLabel>Use response template</FormLabel>
              <Select placeholder="Select a template" value={selectedTemplateId} onChange={(event) => handleTemplateSelection(event.target.value)}>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>{template.name} · {template.category}</option>
                ))}
              </Select>
            </FormControl>
            {selectedTemplateVariables.length > 0 && (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} p={3} bg="orange.50" borderRadius="lg">
                {selectedTemplateVariables.map((variable) => (
                  <FormControl key={variable}>
                    <FormLabel>{'{{'}{variable}{'}}'}</FormLabel>
                    <Input value={variableValues[variable] || ''} onChange={(event) => handleVariableChange(variable, event.target.value)} placeholder={`Value for {{${variable}}}`} bg="white" />
                  </FormControl>
                ))}
              </SimpleGrid>
            )}
            <Textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Send a message as the supervisor..." />
            <HStack justify="space-between">
              <Text color="gray.500" fontSize="sm">Messages are sent with sender=supervisor.</Text>
              <Button colorScheme="purple" onClick={handleSendMessage} isDisabled={!hasHumanControl || !message.trim()}>
                Send as supervisor
              </Button>
            </HStack>
          </Stack>
        </Box>

        <Stack flex="1" spacing={5}>
          <Box bg="white" borderRadius="2xl" boxShadow="sm" p={5} border="1px solid" borderColor="gray.100">
            <Heading size="sm" mb={4}>Customer & agent</Heading>
            <HStack mb={4}>
              <Avatar name={conversation.customer?.name} />
              <Box>
                <Text fontWeight="bold">{conversation.customer?.name}</Text>
                <Text color="gray.500" fontSize="sm">Customer ID: {conversation.customer?.id || 'N/A'}</Text>
              </Box>
            </HStack>
            <Divider my={3} />
            <Text><b>Assigned AI:</b> {conversation.agent?.name}</Text>
            <Text><b>Conversation ID:</b> {conversationId}</Text>
          </Box>

          <Box bg="white" borderRadius="2xl" boxShadow="sm" p={5} border="1px solid" borderColor="gray.100">
            <Heading size="sm" mb={4}>Live quality signals</Heading>
            <SimpleGrid columns={3} spacing={3}>
              <Stat>
                <StatLabel>Sentiment</StatLabel>
                <StatNumber>{Math.round((conversation.metrics?.sentiment || 0) * 100)}%</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Response</StatLabel>
                <StatNumber>{conversation.metrics?.responseTime || 0}s</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Confidence</StatLabel>
                <StatNumber>{Math.round((conversation.metrics?.confidenceScore || 0) * 100)}%</StatNumber>
              </Stat>
            </SimpleGrid>
          </Box>

          <Box bg="white" borderRadius="2xl" boxShadow="sm" p={5} border="1px solid" borderColor="gray.100">
            <Heading size="sm" mb={4}>Intervention controls</Heading>
            <Textarea value={takeoverNotes} onChange={(event) => setTakeoverNotes(event.target.value)} placeholder="Reason for takeover / guidance for audit trail" mb={3} />
            <Button w="full" colorScheme="red" onClick={handleTakeOver} isDisabled={hasHumanControl} mb={4}>Take over from AI</Button>
            <Textarea value={releaseNotes} onChange={(event) => setReleaseNotes(event.target.value)} placeholder="Notes for AI before returning control" mb={3} />
            <Button w="full" colorScheme="green" onClick={handleRelease} isDisabled={!hasHumanControl}>Return control to AI</Button>
          </Box>
        </Stack>
      </Flex>
    </Box>
  );
};

export default ConversationView;
