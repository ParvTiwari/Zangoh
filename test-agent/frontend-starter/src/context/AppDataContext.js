// src/context/AppDataContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  getConversations,
  getAgents,
  getKnowledgeBases,
  getTemplates,
} from '../api';
import { useWebSocket } from './WebSocketContext';

const AppDataContext = createContext(null);

const fallbackTemplates = [
  {
    id: 'tmpl-shipping-delay',
    name: 'Shipping delay empathy',
    category: 'Shipping',
    content: 'Hello {{customerName}}, I understand how important order {{orderNumber}} is. I am checking the latest carrier scan now and will share the exact next step before we end this chat.',
    variables: [
      { name: 'customerName', description: 'Customer name' },
      { name: 'orderNumber', description: 'Order ID' },
    ],
    isShared: true,
  },
  {
    id: 'tmpl-human-handoff',
    name: 'Human handoff',
    category: 'Escalation',
    content: 'Thanks for your patience, {{customerName}}. I am bringing in a supervisor now because this needs extra attention.',
    variables: [{ name: 'customerName', description: 'Customer name' }],
    isShared: true,
  },
];

export const useAppData = () => useContext(AppDataContext);

const normalizeCollection = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const AppDataProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [agents, setAgents] = useState([]);
  const [knowledgeBases, setKnowledgeBases] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState({
    conversations: true,
    agents: true,
    knowledgeBases: true,
    templates: true,
  });
  const [error, setError] = useState({
    conversations: null,
    agents: null,
    knowledgeBases: null,
    templates: null,
  });

  const { lastMessage } = useWebSocket();

  const refreshTemplates = async () => {
    try {
      const templatesData = await getTemplates();
      setTemplates(normalizeCollection(templatesData));
      setLoading((prev) => ({ ...prev, templates: false }));
    } catch (err) {
      console.error('Error loading templates:', err);
      setTemplates(fallbackTemplates);
      setError((prev) => ({ ...prev, templates: err.message }));
      setLoading((prev) => ({ ...prev, templates: false }));
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const conversationsData = await getConversations();
        setConversations(normalizeCollection(conversationsData));
        setLoading((prev) => ({ ...prev, conversations: false }));
      } catch (err) {
        console.error('Error loading conversations:', err);
        setError((prev) => ({ ...prev, conversations: err.message }));
        setLoading((prev) => ({ ...prev, conversations: false }));
      }

      try {
        const agentsData = await getAgents();
        setAgents(normalizeCollection(agentsData));
        setLoading((prev) => ({ ...prev, agents: false }));
      } catch (err) {
        console.error('Error loading agents:', err);
        setError((prev) => ({ ...prev, agents: err.message }));
        setLoading((prev) => ({ ...prev, agents: false }));
      }

      try {
        const knowledgeBasesData = await getKnowledgeBases();
        setKnowledgeBases(normalizeCollection(knowledgeBasesData));
        setLoading((prev) => ({ ...prev, knowledgeBases: false }));
      } catch (err) {
        console.error('Error loading knowledge bases:', err);
        setError((prev) => ({ ...prev, knowledgeBases: err.message }));
        setLoading((prev) => ({ ...prev, knowledgeBases: false }));
      }

      await refreshTemplates();
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!lastMessage) return;

    try {
      switch (lastMessage.type) {
        case 'conversations_update':
          setConversations(normalizeCollection(lastMessage.data));
          break;
        case 'new_conversation':
          setConversations((prev) => [lastMessage.data, ...prev]);
          break;
        case 'message_update':
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === lastMessage.conversationId
                ? {
                    ...conv,
                    hasNewMessage: true,
                    lastMessage: lastMessage.message,
                    messages: [...(conv.messages || []), lastMessage.message],
                  }
                : conv
            )
          );
          break;
        case 'metrics_update':
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === lastMessage.conversationId
                ? { ...conv, metrics: { ...conv.metrics, ...lastMessage.metrics } }
                : conv
            )
          );
          break;
        case 'agent_update':
          setAgents((prev) =>
            prev.map((agent) =>
              agent.id === lastMessage.agentId ? { ...agent, ...lastMessage.data } : agent
            )
          );
          break;
        default:
          break;
      }
    } catch (socketError) {
      console.error('Error processing WebSocket message:', socketError);
    }
  }, [lastMessage]);

  const updateConversation = (id, data) => {
    setConversations((prev) =>
      prev.map((conv) => (conv.id === id || conv._id === id ? { ...conv, ...data } : conv))
    );
  };

  const appendConversationMessage = (id, message) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === id || conv._id === id
          ? { ...conv, messages: [...(conv.messages || []), message] }
          : conv
      )
    );
  };

  const updateAgent = (id, data) => {
    setAgents((prev) =>
      prev.map((agent) => (agent.id === id || agent._id === id ? { ...agent, ...data } : agent))
    );
  };

  return (
    <AppDataContext.Provider
      value={{
        conversations,
        agents,
        knowledgeBases,
        templates,
        loading,
        error,
        setTemplates,
        refreshTemplates,
        updateConversation,
        appendConversationMessage,
        updateAgent,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};
