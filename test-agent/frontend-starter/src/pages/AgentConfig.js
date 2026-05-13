// src/pages/AgentConfig.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Divider,
  FormControl,
  FormLabel,
  Grid,
  HStack,
  Heading,
  Input,
  NumberInput,
  NumberInputField,
  Select,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  useToast,
} from '@chakra-ui/react';
import { updateAgentConfig } from '../api';
import { useAppData } from '../context/AppDataContext';

const AgentConfig = () => {
  const { agents, updateAgent } = useAppData();
  const toast = useToast();
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [draft, setDraft] = useState(null);
  const [presets, setPresets] = useState([]);
  const [presetName, setPresetName] = useState('');

  const selectedAgent = useMemo(
    () => agents.find((agent) => agent.id === selectedAgentId) || agents[0],
    [agents, selectedAgentId]
  );

  useEffect(() => {
    if (agents.length && !selectedAgentId) setSelectedAgentId(agents[0].id);
  }, [agents, selectedAgentId]);

  useEffect(() => {
    if (!selectedAgent) return;
    setDraft({
      parameters: {
        temperature: selectedAgent.parameters?.temperature ?? 0.7,
        top_p: selectedAgent.parameters?.top_p ?? 1,
        max_tokens: selectedAgent.parameters?.max_tokens ?? 150,
      },
      capabilities: selectedAgent.capabilities || [],
      knowledgeBases: selectedAgent.knowledgeBases || [],
      escalationThresholds: {
        lowConfidence: selectedAgent.escalationThresholds?.lowConfidence ?? 0.4,
        negativeSentiment: selectedAgent.escalationThresholds?.negativeSentiment ?? 0.3,
        responseTime: selectedAgent.escalationThresholds?.responseTime ?? 20,
      },
    });
  }, [selectedAgent]);

  const updateParameter = (key, value) => {
    setDraft((prev) => ({ ...prev, parameters: { ...prev.parameters, [key]: value } }));
  };

  const toggleCapability = (capabilityId) => {
    setDraft((prev) => ({
      ...prev,
      capabilities: prev.capabilities.map((capability) =>
        capability.id === capabilityId ? { ...capability, enabled: !capability.enabled } : capability
      ),
    }));
  };

  const toggleKnowledgeBase = (knowledgeBaseId) => {
    setDraft((prev) => ({
      ...prev,
      knowledgeBases: prev.knowledgeBases.map((knowledgeBase) =>
        knowledgeBase.id === knowledgeBaseId
          ? { ...knowledgeBase, enabled: !knowledgeBase.enabled }
          : knowledgeBase
      ),
    }));
  };

  const updateThreshold = (key, value) => {
    setDraft((prev) => ({
      ...prev,
      escalationThresholds: { ...prev.escalationThresholds, [key]: value },
    }));
  };

  const handleSave = async () => {
    try {
      const result = await updateAgentConfig(selectedAgent.id, draft);
      updateAgent(selectedAgent.id, result.agent || { ...selectedAgent, ...draft });
      toast({ title: 'Agent configuration saved', status: 'success', duration: 2500 });
    } catch (error) {
      updateAgent(selectedAgent.id, { ...selectedAgent, ...draft });
      toast({ title: 'Configuration saved locally', status: 'warning', duration: 3000 });
    }
  };

  const savePreset = () => {
    if (!presetName.trim()) return;
    setPresets((prev) => [{ name: presetName.trim(), config: draft }, ...prev]);
    setPresetName('');
    toast({ title: 'Preset saved', status: 'success', duration: 2000 });
  };

  const loadPreset = (preset) => {
    setDraft(preset.config);
    toast({ title: `Loaded ${preset.name}`, status: 'info', duration: 2000 });
  };

  if (!selectedAgent || !draft) {
    return <Text>Loading agent configuration...</Text>;
  }

  return (
    <Box>
      <HStack justify="space-between" align="start" mb={6}>
        <Box>
          <Heading size="lg">Agent Configuration</Heading>
          <Text color="gray.600" mt={2}>Tune behavior, capabilities, knowledge access, escalation thresholds, and reusable presets.</Text>
        </Box>
        <HStack>
          <Button variant="outline" onClick={() => setDraft({
            parameters: selectedAgent.parameters,
            capabilities: selectedAgent.capabilities,
            knowledgeBases: selectedAgent.knowledgeBases,
            escalationThresholds: selectedAgent.escalationThresholds,
          })}>Reset</Button>
          <Button colorScheme="purple" onClick={handleSave}>Save changes</Button>
        </HStack>
      </HStack>

      <Grid templateColumns={{ base: '1fr', xl: '2fr 1fr' }} gap={6}>
        <Stack spacing={6}>
          <Card>
            <CardHeader>
              <HStack justify="space-between">
                <Box>
                  <Heading size="md">Selected AI agent</Heading>
                  <Text color="gray.500">Choose which production agent to configure.</Text>
                </Box>
                <Badge colorScheme={selectedAgent.status === 'active' ? 'green' : 'gray'}>{selectedAgent.status}</Badge>
              </HStack>
            </CardHeader>
            <CardBody>
              <FormControl maxW="420px">
                <FormLabel>Agent</FormLabel>
                <Select value={selectedAgent.id} onChange={(event) => setSelectedAgentId(event.target.value)}>
                  {agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name} · {agent.model}</option>)}
                </Select>
              </FormControl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><Heading size="md">Model parameters</Heading></CardHeader>
            <CardBody>
              <Stack spacing={6}>
                <FormControl>
                  <FormLabel>Temperature: {draft.parameters.temperature}</FormLabel>
                  <Slider min={0} max={1} step={0.05} value={draft.parameters.temperature} onChange={(value) => updateParameter('temperature', value)}>
                    <SliderTrack><SliderFilledTrack /></SliderTrack><SliderThumb />
                  </Slider>
                </FormControl>
                <FormControl>
                  <FormLabel>Top P: {draft.parameters.top_p}</FormLabel>
                  <Slider min={0} max={1} step={0.05} value={draft.parameters.top_p} onChange={(value) => updateParameter('top_p', value)}>
                    <SliderTrack><SliderFilledTrack /></SliderTrack><SliderThumb />
                  </Slider>
                </FormControl>
                <FormControl maxW="240px">
                  <FormLabel>Max tokens</FormLabel>
                  <NumberInput min={50} max={2000} value={draft.parameters.max_tokens} onChange={(_, value) => updateParameter('max_tokens', value)}>
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
              </Stack>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><Heading size="md">Capabilities and knowledge</Heading></CardHeader>
            <CardBody>
              <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
                <Box>
                  <Text fontWeight="bold" mb={3}>Capabilities</Text>
                  <Stack>
                    {draft.capabilities.map((capability) => (
                      <Checkbox key={capability.id} isChecked={capability.enabled} onChange={() => toggleCapability(capability.id)}>{capability.name}</Checkbox>
                    ))}
                  </Stack>
                </Box>
                <Box>
                  <Text fontWeight="bold" mb={3}>Knowledge bases</Text>
                  <Stack>
                    {draft.knowledgeBases.map((knowledgeBase) => (
                      <Checkbox key={knowledgeBase.id} isChecked={knowledgeBase.enabled} onChange={() => toggleKnowledgeBase(knowledgeBase.id)}>{knowledgeBase.name}</Checkbox>
                    ))}
                  </Stack>
                </Box>
              </Grid>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><Heading size="md">Escalation thresholds</Heading></CardHeader>
            <CardBody>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
                <FormControl>
                  <FormLabel>Low confidence</FormLabel>
                  <Input type="number" step="0.05" value={draft.escalationThresholds.lowConfidence} onChange={(event) => updateThreshold('lowConfidence', Number(event.target.value))} />
                </FormControl>
                <FormControl>
                  <FormLabel>Negative sentiment</FormLabel>
                  <Input type="number" step="0.05" value={draft.escalationThresholds.negativeSentiment} onChange={(event) => updateThreshold('negativeSentiment', Number(event.target.value))} />
                </FormControl>
                <FormControl>
                  <FormLabel>Response time (seconds)</FormLabel>
                  <Input type="number" value={draft.escalationThresholds.responseTime} onChange={(event) => updateThreshold('responseTime', Number(event.target.value))} />
                </FormControl>
              </Grid>
            </CardBody>
          </Card>
        </Stack>

        <Stack spacing={6}>
          <Card>
            <CardHeader><Heading size="md">Performance snapshot</Heading></CardHeader>
            <CardBody>
              <Grid templateColumns="1fr 1fr" gap={4}>
                <Stat><StatLabel>Conversations</StatLabel><StatNumber>{selectedAgent.metrics?.conversations || 0}</StatNumber></Stat>
                <Stat><StatLabel>Avg response</StatLabel><StatNumber>{selectedAgent.metrics?.avgResponseTime || 0}s</StatNumber></Stat>
                <Stat><StatLabel>Satisfaction</StatLabel><StatNumber>{Math.round((selectedAgent.metrics?.satisfaction || 0) * 100)}%</StatNumber></Stat>
                <Stat><StatLabel>Escalation</StatLabel><StatNumber>{Math.round((selectedAgent.metrics?.escalationRate || 0) * 100)}%</StatNumber></Stat>
              </Grid>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><Heading size="md">Configuration presets</Heading></CardHeader>
            <CardBody>
              <HStack mb={4}>
                <Input value={presetName} onChange={(event) => setPresetName(event.target.value)} placeholder="Preset name" />
                <Button onClick={savePreset}>Save</Button>
              </HStack>
              <Divider mb={4} />
              <Stack>
                {presets.length === 0 && <Text color="gray.500">No presets saved in this session.</Text>}
                {presets.map((preset) => (
                  <HStack key={preset.name} justify="space-between">
                    <Text>{preset.name}</Text>
                    <Button size="sm" variant="outline" onClick={() => loadPreset(preset)}>Load</Button>
                  </HStack>
                ))}
              </Stack>
            </CardBody>
          </Card>
        </Stack>
      </Grid>
    </Box>
  );
};

export default AgentConfig;
