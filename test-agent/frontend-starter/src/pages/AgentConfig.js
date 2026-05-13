import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Text,
  VStack,
  Checkbox,
  HStack,
  Input,
  Tag,
  TagLabel,
  TagCloseButton,
  useColorModeValue,
} from '@chakra-ui/react';

const capabilitiesList = ['Decision Making', 'Autonomy', 'Learning', 'Perception'];

const AgentConfig = () => {
  const [selectedAgent, setSelectedAgent] = useState('CSR AI Agent');
  const [topP, setTopP] = useState(0.7);
  const [speed, setSpeed] = useState(0.5);
  const [personality, setPersonality] = useState(0.5);
  const [stability, setStability] = useState(0.5);
  const [maxTokens, setMaxTokens] = useState(10);
  const [capabilities, setCapabilities] = useState(['Decision Making', 'Perception']);
  const [kbAccess, setKbAccess] = useState({
    permissions: false,
    internal: true,
    public: true,
  });
  const [escalationMinutes, setEscalationMinutes] = useState(10);

  const toggleCapability = (capability) => {
    setCapabilities((prev) =>
      prev.includes(capability)
        ? prev.filter((c) => c !== capability)
        : [...prev, capability]
    );
  };

  const handleReset = () => {
    setTopP(0.7);
    setSpeed(0.5);
    setPersonality(0.5);
    setStability(0.5);
    setMaxTokens(10);
    setCapabilities(['Decision Making', 'Perception']);
    setKbAccess({ permissions: false, internal: true, public: true });
    setEscalationMinutes(10);
  };

  const handleSave = () => {
    console.log('Saved configuration:', {
      selectedAgent,
      topP,
      speed,
      personality,
      stability,
      maxTokens,
      capabilities,
      kbAccess,
      escalationMinutes,
    });
  };

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box p={10} maxW="1000px" mx="auto">
      <Flex justify="space-between" align="center" mb={8}>
        <Heading fontSize="2xl">Configure your AI Agent</Heading>
        <HStack>
          <Button variant="outline" onClick={handleReset}>Reset</Button>
          <Button colorScheme="purple" onClick={handleSave}>Save Changes</Button>
        </HStack>
      </Flex>

      <Box
        bg={cardBg}
        p={8}
        borderRadius="xl"
        boxShadow="lg"
        border={`1px solid ${borderColor}`}
      >
        <Box mb={8}>
          <Text fontSize="lg" fontWeight="semibold" mb={2}>Agent</Text>
          <Select size="lg" value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)} maxW="300px">
            <option>CSR AI Agent</option>
            <option>Sales AI Agent</option>
            <option>Support AI Agent</option>
          </Select>
        </Box>

        <Flex flexWrap="wrap" gap={8} mb={8}>
          {[
            { label: 'Top-p', value: topP, setter: setTopP },
            { label: 'Speed', value: speed, setter: setSpeed },
            { label: 'Personality', value: personality, setter: setPersonality },
            { label: 'Stability', value: stability, setter: setStability },
          ].map(({ label, value, setter }) => (
            <Box key={label} flex="1" minW="220px">
              <Text fontSize="md" mb={2}>{label}</Text>
              <Slider value={value} onChange={setter} min={0} max={1} step={0.01}>
                <SliderTrack>
                  <SliderFilledTrack bg="purple.500" />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <Text fontSize="sm" color="gray.600" mt={1}>{value.toFixed(2)}</Text>
            </Box>
          ))}

          <Box>
            <Text fontSize="md" mb={2}>Max Tokens</Text>
            <Input
              type="number"
              value={maxTokens}
              size="lg"
              onChange={(e) => setMaxTokens(Number(e.target.value))}
              w="100px"
            />
          </Box>
        </Flex>

        <Box mb={8}>
          <Text fontSize="lg" fontWeight="semibold" mb={2}>Capabilities</Text>
          <HStack spacing={4} wrap="wrap">
            {capabilitiesList.map((cap) => {
              const isActive = capabilities.includes(cap);
              return (
                <Tag
                  size="lg"
                  variant={isActive ? 'solid' : 'outline'}
                  colorScheme="purple"
                  cursor="pointer"
                  onClick={() => toggleCapability(cap)}
                  key={cap}
                >
                  <TagLabel>{cap}</TagLabel>
                  {isActive && <TagCloseButton />}
                </Tag>
              );
            })}
          </HStack>
        </Box>

        <Box mb={8}>
          <Text fontSize="lg" fontWeight="semibold" mb={2}>Knowledge Base Access</Text>
          <VStack align="start" spacing={3}>
            <Checkbox
              isChecked={kbAccess.permissions}
              onChange={() => setKbAccess({ ...kbAccess, permissions: !kbAccess.permissions })}
            >
              Permissions
            </Checkbox>
            <Checkbox
              isChecked={kbAccess.internal}
              onChange={() => setKbAccess({ ...kbAccess, internal: !kbAccess.internal })}
            >
              Internal Articles
            </Checkbox>
            <Checkbox
              isChecked={kbAccess.public}
              onChange={() => setKbAccess({ ...kbAccess, public: !kbAccess.public })}
            >
              Public Articles
            </Checkbox>
          </VStack>
        </Box>

        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={2}>Escalation Threshold</Text>
          <Flex align="center" gap={2}>
            <Text>Escalate if Agent hasn’t responded in</Text>
            <Input
              type="number"
              size="lg"
              value={escalationMinutes}
              onChange={(e) => setEscalationMinutes(Number(e.target.value))}
              width="80px"
            />
            <Text>minutes</Text>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};

export default AgentConfig;
