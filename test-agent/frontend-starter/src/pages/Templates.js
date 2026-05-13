// src/pages/Templates.js
import React, { useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Heading,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Tag,
  Text,
  Textarea,
  VStack,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { FiArrowRight, FiEdit2, FiPlus, FiSliders, FiTrash2 } from 'react-icons/fi';
import { createTemplate, deleteTemplate, updateTemplate } from '../api';
import { useAppData } from '../context/AppDataContext';

const emptyTemplate = {
  name: '',
  category: 'Onboarding',
  content: '',
  variablesText: '',
  isShared: true,
};

const useCases = ['All', 'Popular', 'Onboarding', 'Return', 'Engagement', 'Transaction'];
const channels = ['Website', 'Mobile', 'Messenger'];

const extractVariables = (content) => {
  const matches = content.match(/{{\s*([a-zA-Z0-9_]+)\s*}}/g) || [];
  return [...new Set(matches.map((match) => match.replace(/[{}\s]/g, '')))];
};

const buildVariableObjects = (content, variablesText) => {
  const declaredVariables = extractVariables(content);
  const describedVariables = variablesText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, ...descriptionParts] = line.split(':');
      return { name: name.trim(), description: descriptionParts.join(':').trim() };
    });

  return declaredVariables.map((name) => ({
    name,
    description:
      describedVariables.find((variable) => variable.name === name)?.description ||
      'Replace this variable before sending the response',
  }));
};

const Templates = () => {
  const { templates, setTemplates } = useAppData();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [draft, setDraft] = useState(emptyTemplate);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesQuery = `${template.name} ${template.category} ${template.content}`.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === 'All' || template.category === category || (category === 'Popular' && template.isShared);
      return matchesQuery && matchesCategory;
    });
  }, [templates, query, category]);

  const variablePreview = extractVariables(draft.content);
  const previewContent = draft.content || 'Hi {{userName}}! Welcome to {{companyName}}. How may I be of help today?';

  const openCreateModal = () => {
    setEditingTemplate(null);
    setDraft(emptyTemplate);
    onOpen();
  };

  const openEditModal = (template) => {
    setEditingTemplate(template);
    setDraft({
      name: template.name,
      category: template.category,
      content: template.content,
      variablesText: (template.variables || [])
        .map((variable) => `${variable.name}: ${variable.description || ''}`)
        .join('\n'),
      isShared: Boolean(template.isShared),
    });
    onOpen();
  };

  const handleSave = async () => {
    const payload = {
      name: draft.name,
      category: draft.category,
      content: draft.content,
      variables: buildVariableObjects(draft.content, draft.variablesText),
      isShared: draft.isShared,
      createdBy: 'supervisor-1',
    };

    try {
      const savedTemplate = editingTemplate
        ? await updateTemplate(editingTemplate.id, payload)
        : await createTemplate(payload);

      setTemplates((prev) =>
        editingTemplate
          ? prev.map((template) => (template.id === editingTemplate.id ? savedTemplate : template))
          : [savedTemplate, ...prev]
      );
      toast({ title: 'Template saved', status: 'success', duration: 2500 });
      onClose();
    } catch (error) {
      const localTemplate = { ...payload, id: editingTemplate?.id || `local-${Date.now()}` };
      setTemplates((prev) =>
        editingTemplate
          ? prev.map((template) => (template.id === editingTemplate.id ? localTemplate : template))
          : [localTemplate, ...prev]
      );
      toast({ title: 'Saved locally', status: 'warning', duration: 3000 });
      onClose();
    }
  };

  const handleDelete = async (templateId) => {
    setTemplates((prev) => prev.filter((template) => template.id !== templateId));
    try {
      await deleteTemplate(templateId);
      toast({ title: 'Template deleted', status: 'success', duration: 2000 });
    } catch (error) {
      toast({ title: 'Deleted locally', status: 'warning', duration: 2500 });
    }
  };

  const handleCopy = async (content) => {
    await navigator.clipboard?.writeText(content);
    toast({ title: 'Template copied', status: 'success', duration: 2000 });
  };

  return (
    <Flex gap={5} align="stretch">
      <Box bg="white" borderRadius="20px" p={5} w={{ base: '100%', lg: '220px' }} display={{ base: 'none', lg: 'block' }}>
        <HStack mb={5}>
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" size="sm" borderRadius="full" />
          <IconButton aria-label="Filter templates" icon={<FiSliders />} size="sm" borderRadius="full" />
        </HStack>
        <VStack align="stretch" spacing={1} color="#5f596d">
          {useCases.map((item) => (
            <Button key={item} size="sm" justifyContent="flex-start" variant="ghost" bg={category === item ? '#d9d5e6' : 'transparent'} onClick={() => setCategory(item)}>{item}</Button>
          ))}
          <Text fontSize="xs" color="#b1abbc" pt={3}>Channels</Text>
          {channels.map((item) => (
            <Button key={item} size="sm" justifyContent="flex-start" variant="ghost" bg={category === item ? '#d9d5e6' : 'transparent'} onClick={() => setCategory(item)}>{item}</Button>
          ))}
        </VStack>
      </Box>

      <Box flex="1" bg="white" borderRadius="22px" p={{ base: 5, md: 8 }}>
        <HStack justify="space-between" mb={7}>
          <Heading size="md">Response Templates</Heading>
          <Button leftIcon={<FiPlus />} bg="#4b3b83" color="white" borderRadius="full" onClick={openCreateModal}>Create Template</Button>
        </HStack>
        <HStack mb={6}>
          <Button size="sm" borderRadius="full" bg="#4b3b83" color="white">My Templates</Button>
          <Button size="sm" borderRadius="full" bg="#efedf4">Shared Templates</Button>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={7} maxW="850px">
          {filteredTemplates.map((template) => {
            const variables = template.variables?.length ? template.variables : buildVariableObjects(template.content, '');
            return (
              <Card key={template.id} border="1px solid" borderColor="#d9d5e6" borderRadius="16px" boxShadow="none" _hover={{ borderColor: '#4b3b83' }}>
                <CardBody p={3}>
                  <Box bg="#efedf4" borderRadius="10px" p={3} mb={3} h="74px" fontSize="xs" color="#5f596d" noOfLines={3}>{template.content}</Box>
                  <Text fontWeight="800" fontSize="sm" noOfLines={2}>{template.name}</Text>
                  <HStack mt={3} spacing={2} flexWrap="wrap">
                    <Tag size="sm">#Chat</Tag>
                    {variables.slice(0, 1).map((variable) => <Tag key={variable.name} size="sm">{'{{'}{variable.name}{'}}'}</Tag>)}
                    <Badge>{template.category}</Badge>
                  </HStack>
                  <HStack justify="center" mt={4} spacing={4}>
                    <IconButton aria-label="Delete template" icon={<FiTrash2 />} size="sm" borderRadius="full" colorScheme="red" variant="ghost" onClick={() => handleDelete(template.id)} />
                    <IconButton aria-label="Edit template" icon={<FiEdit2 />} size="sm" borderRadius="full" colorScheme="blue" variant="ghost" onClick={() => openEditModal(template)} />
                    <IconButton aria-label="Copy template" icon={<FiArrowRight />} size="sm" borderRadius="full" colorScheme="green" variant="ghost" onClick={() => handleCopy(template.content)} />
                  </HStack>
                </CardBody>
              </Card>
            );
          })}
        </SimpleGrid>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="5xl" isCentered>
        <ModalOverlay bg="blackAlpha.500" backdropFilter="blur(2px)" />
        <ModalContent borderRadius="20px" bg="#f5f3fa" p={4}>
          <ModalCloseButton />
          <ModalBody>
            <Flex gap={6} direction={{ base: 'column', lg: 'row' }}>
              <Box flex="1">
                <ModalHeader px={0}>{editingTemplate ? 'Edit Template' : 'Create Template'}</ModalHeader>
                <Stack bg="white" borderRadius="16px" p={5} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Name</FormLabel>
                    <Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Template name" />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Title</FormLabel>
                    <Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Say Hi to welcome new visitors!" />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Category</FormLabel>
                    <Select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}>
                      {[...useCases.slice(2), ...channels].map((item) => <option key={item}>{item}</option>)}
                    </Select>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Content</FormLabel>
                    <Textarea minH="130px" value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })} placeholder="Hi {{userName}}! Welcome to {{companyName}}. How may I be of help today?" />
                    <FormHelperText>Variables are shown with double braces. Detected: {variablePreview.length ? variablePreview.map((item) => `{{${item}}}`).join(', ') : 'none'}</FormHelperText>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Variable descriptions</FormLabel>
                    <Textarea value={draft.variablesText} onChange={(event) => setDraft({ ...draft, variablesText: event.target.value })} placeholder="userName: Customer name\ncompanyName: Brand name" />
                  </FormControl>
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Share with Team</FormLabel>
                    <Switch isChecked={draft.isShared} onChange={(event) => setDraft({ ...draft, isShared: event.target.checked })} />
                  </FormControl>
                </Stack>
              </Box>
              <Box w={{ base: '100%', lg: '330px' }}>
                <Heading size="md" mt={4} mb={4}>Preview</Heading>
                <Box bg="white" borderRadius="16px" p={5} minH="420px">
                  <Box border="1px solid" borderColor="#edeaf4" borderRadius="14px" p={4} fontSize="sm">
                    <Tag size="sm" mb={2}># Chat</Tag>
                    <Text>{previewContent}</Text>
                  </Box>
                </Box>
              </Box>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
            <Button bg="#4b3b83" color="white" onClick={handleSave} isDisabled={!draft.name || !draft.category || !draft.content}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default Templates;
