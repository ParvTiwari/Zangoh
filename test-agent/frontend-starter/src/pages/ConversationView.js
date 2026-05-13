// src/pages/ConversationView.js
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Tag,
  Text,
  Textarea,
  VStack,
  useDisclosure,
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
import { FiMic, FiMicOff, FiSend, FiZap } from 'react-icons/fi';

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
  const { isOpen: isTemplateOpen, onOpen: openTemplateModal, onClose: closeTemplateModal } = useDisclosure();
  const { conversations, templates, updateConversation, appendConversationMessage } = useAppData();
  const [conversation, setConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [takeoverNotes, setTakeoverNotes] = useState('');
  const [releaseNotes, setReleaseNotes] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [variableValues, setVariableValues] = useState({});
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

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

  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

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

  const supportsVoiceInput = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

  const toggleVoiceInput = () => {
    if (!supportsVoiceInput) {
      toast({ title: 'Voice input is not supported in this browser', status: 'warning', duration: 3000 });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => {
      setIsListening(false);
      toast({ title: 'Voice capture stopped', status: 'warning', duration: 2500 });
    };
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .slice(event.resultIndex)
        .filter((result) => result.isFinal)
        .map((result) => result[0]?.transcript || '')
        .join(' ')
        .trim();

      if (transcript) {
        setMessage((current) => `${current}${current ? ' ' : ''}${transcript}`.trim());
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

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
    closeTemplateModal();
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
            {selectedTemplateVariables.length > 0 && (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} p={3} bg="#fff1b8" borderRadius="16px">
                {selectedTemplateVariables.map((variable) => (
                  <FormControl key={variable}>
                    <FormLabel fontSize="xs" fontWeight="800">{'{{'}{variable}{'}}'}</FormLabel>
                    <Input value={variableValues[variable] || ''} onChange={(event) => handleVariableChange(variable, event.target.value)} placeholder={`Value for {{${variable}}}`} bg="white" borderRadius="12px" />
                  </FormControl>
                ))}
              </SimpleGrid>
            )}
            {selectedTemplate && (
              <Box bg="#f7f5fb" border="1px solid" borderColor="#dedbe8" borderRadius="16px" p={4}>
                <Text fontSize="xs" fontWeight="800" color="#6d609b" mb={2}>Completed message preview</Text>
                <Text fontSize="sm" color="#332b43" whiteSpace="pre-wrap">{message || selectedTemplate.content}</Text>
              </Box>
            )}
            <Box position="relative">
              <Textarea minH="104px" borderRadius="24px" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Respond by typing or voice..." pr="172px" />
              <Button position="absolute" right="96px" top="12px" size="xs" borderRadius="full" leftIcon={<FiZap />} onClick={openTemplateModal}>
                Template
              </Button>
              <IconButton position="absolute" right="54px" top="10px" aria-label={isListening ? 'Stop voice input' : 'Start voice input'} icon={isListening ? <FiMicOff /> : <FiMic />} variant={isListening ? 'solid' : 'ghost'} colorScheme={isListening ? 'red' : 'purple'} onClick={toggleVoiceInput} />
              <IconButton position="absolute" right="14px" top="10px" aria-label="Send supervisor message" icon={<FiSend />} variant="ghost" colorScheme="purple" onClick={handleSendMessage} isDisabled={!hasHumanControl || !message.trim()} />
            </Box>
            <Text color="gray.500" fontSize="sm">Take over first, then send responses as the supervisor. Use the microphone to dictate a reply; recognized speech is added to the message box.</Text>
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

      <Modal isOpen={isTemplateOpen} onClose={closeTemplateModal} size="5xl" isCentered>
        <ModalOverlay bg="blackAlpha.500" backdropFilter="blur(2px)" />
        <ModalContent borderRadius="22px" p={2}>
          <ModalHeader>Response Templates</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex gap={6} direction={{ base: 'column', lg: 'row' }}>
              <VStack align="stretch" minW="170px" color="#5f596d" fontSize="sm">
                <Input size="sm" borderRadius="full" placeholder="Search" />
                {['All', 'Popular', 'Onboarding', 'Return', 'Engagement', 'Transaction', 'Website', 'Mobile', 'Messenger'].map((item) => (
                  <Button key={item} justifyContent="flex-start" size="sm" variant="ghost" bg={item === 'Onboarding' ? '#d9d5e6' : 'transparent'}>{item}</Button>
                ))}
              </VStack>
              <Box flex="1">
                <HStack mb={4}>
                  <Button size="sm" borderRadius="full" bg="#4b3b83" color="white">My Templates</Button>
                  <Button size="sm" borderRadius="full">Shared Templates</Button>
                </HStack>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {templates.map((template) => (
                    <Box key={template.id} p={3} border="1px solid" borderColor={selectedTemplateId === template.id ? '#4b3b83' : '#dedbe8'} borderRadius="16px" cursor="pointer" onClick={() => handleTemplateSelection(template.id)} _hover={{ borderColor: '#4b3b83' }}>
                      <Box bg="#f0eef6" borderRadius="10px" p={3} mb={3} fontSize="xs" noOfLines={2}>{template.content}</Box>
                      <Text fontWeight="800" fontSize="sm" noOfLines={1}>{template.name}</Text>
                      <HStack mt={2}><Tag size="sm">#Chat</Tag><Tag size="sm">{template.category}</Tag></HStack>
                    </Box>
                  ))}
                </SimpleGrid>
              </Box>
              <Box minW={{ base: 'auto', lg: '260px' }} borderLeft={{ base: 'none', lg: '1px solid' }} borderColor="#edeaf4" pl={{ base: 0, lg: 6 }}>
                <Heading size="sm" mb={4}>Preview</Heading>
                <Box border="1px solid" borderColor="#edeaf4" borderRadius="14px" p={4} fontSize="sm">
                  {selectedTemplate ? applyVariables(selectedTemplate.content, variableValues) : 'Select a template to preview it here.'}
                </Box>
              </Box>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={closeTemplateModal}>Cancel</Button>
            <Button ml={3} bg="#4b3b83" color="white" onClick={closeTemplateModal}>Insert</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ConversationView;
