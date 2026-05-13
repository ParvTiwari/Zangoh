// src/pages/Templates.js
import React, { useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
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
  Stack,
  Switch,
  Tag,
  Text,
  Textarea,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { FiCopy, FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import { createTemplate, deleteTemplate, updateTemplate } from '../api';
import { useAppData } from '../context/AppDataContext';

const emptyTemplate = {
  name: '',
  category: 'General',
  content: '',
  variablesText: '',
  isShared: true,
};

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
  const { templates, setTemplates, refreshTemplates } = useAppData();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [draft, setDraft] = useState(emptyTemplate);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const categories = useMemo(
    () => ['all', ...new Set(templates.map((template) => template.category).filter(Boolean))],
    [templates]
  );

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesQuery = `${template.name} ${template.category} ${template.content}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesCategory = category === 'all' || template.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [templates, query, category]);

  const variablePreview = extractVariables(draft.content);

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
      toast({
        title: 'Saved locally',
        description: 'The API was unavailable, so this template is available in the current session only.',
        status: 'warning',
        duration: 4000,
      });
      const localTemplate = { ...payload, id: editingTemplate?.id || `local-${Date.now()}` };
      setTemplates((prev) =>
        editingTemplate
          ? prev.map((template) => (template.id === editingTemplate.id ? localTemplate : template))
          : [localTemplate, ...prev]
      );
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
    <Box>
      <HStack justify="space-between" align="start" mb={6}>
        <Box>
          <Heading size="lg">Template Management</Heading>
          <Text color="gray.600" mt={2}>
            Create reusable supervisor responses. Variables use double braces and are clearly
            highlighted before use, for example {'{{customerName}}'}.
          </Text>
        </Box>
        <Button leftIcon={<FiPlus />} colorScheme="purple" onClick={openCreateModal}>
          New Template
        </Button>
      </HStack>

      <Card mb={6}>
        <CardBody>
          <HStack spacing={4} align="end" flexWrap="wrap">
            <FormControl maxW="420px">
              <FormLabel>Search templates</FormLabel>
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, category, or content" />
            </FormControl>
            <FormControl maxW="240px">
              <FormLabel>Category</FormLabel>
              <Select value={category} onChange={(event) => setCategory(event.target.value)}>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item === 'all' ? 'All categories' : item}
                  </option>
                ))}
              </Select>
            </FormControl>
            <Button variant="outline" onClick={refreshTemplates}>Refresh</Button>
          </HStack>
        </CardBody>
      </Card>

      <Grid templateColumns={{ base: '1fr', lg: 'repeat(3, 1fr)' }} gap={5}>
        {filteredTemplates.map((template) => {
          const variables = template.variables?.length ? template.variables : buildVariableObjects(template.content, '');
          return (
            <Card key={template.id} borderTop="4px solid" borderTopColor="purple.400">
              <CardHeader pb={2}>
                <HStack justify="space-between" align="start">
                  <Box>
                    <Heading size="md">{template.name}</Heading>
                    <HStack mt={2}>
                      <Badge colorScheme="purple">{template.category}</Badge>
                      {template.isShared && <Badge colorScheme="green">Shared</Badge>}
                    </HStack>
                  </Box>
                  <HStack>
                    <IconButton aria-label="Edit template" icon={<FiEdit2 />} size="sm" onClick={() => openEditModal(template)} />
                    <IconButton aria-label="Delete template" icon={<FiTrash2 />} size="sm" onClick={() => handleDelete(template.id)} />
                  </HStack>
                </HStack>
              </CardHeader>
              <CardBody pt={0}>
                <Text color="gray.700" whiteSpace="pre-wrap" minH="112px">
                  {template.content}
                </Text>
                <HStack mt={4} spacing={2} flexWrap="wrap">
                  {variables.map((variable) => (
                    <Tag key={variable.name} colorScheme="orange">{'{{'}{variable.name}{'}}'}</Tag>
                  ))}
                </HStack>
                <Button mt={4} leftIcon={<FiCopy />} variant="outline" size="sm" onClick={() => handleCopy(template.content)}>
                  Copy for conversation
                </Button>
              </CardBody>
            </Card>
          );
        })}
      </Grid>

      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingTemplate ? 'Edit Template' : 'Create Template'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="e.g. Damaged item apology" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Category</FormLabel>
                <Input value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} placeholder="Shipping, Returns, Billing..." />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Message content</FormLabel>
                <Textarea minH="180px" value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })} placeholder="Hi {{customerName}}, I can help with order {{orderNumber}}." />
                <FormHelperText>
                  Variable substitution is indicated with double braces. Detected:{' '}
                  {variablePreview.length ? variablePreview.map((item) => `{{${item}}}`).join(', ') : 'none'}
                </FormHelperText>
              </FormControl>
              <FormControl>
                <FormLabel>Variable descriptions</FormLabel>
                <Textarea value={draft.variablesText} onChange={(event) => setDraft({ ...draft, variablesText: event.target.value })} placeholder="customerName: Customer first name\norderNumber: Order ID from CRM" />
              </FormControl>
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Share with all supervisors</FormLabel>
                <Switch isChecked={draft.isShared} onChange={(event) => setDraft({ ...draft, isShared: event.target.checked })} />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
            <Button colorScheme="purple" onClick={handleSave} isDisabled={!draft.name || !draft.category || !draft.content}>
              Save Template
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Templates;
