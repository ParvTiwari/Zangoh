// websocket/socketHandler.js
// WebSocket handler for real-time updates

const { conversations } = require('../routes/conversations');

/**
 * Handles WebSocket connections
 * @param {WebSocket} ws - WebSocket connection
 * @param {http.IncomingMessage} req - HTTP request
 */
module.exports = (ws, req) => {
  console.log('WebSocket client connected');

  ws.send(JSON.stringify({
    type: 'connection',
    message: 'Connected to Agent Supervisor WebSocket server',
    timestamp: new Date()
  }));

  const pingInterval = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type: 'ping', timestamp: new Date() }));
    }
  }, 30000);

  startConversationSimulation(ws);

  ws.on('message', (message) => {
    try {
      const parsedMessage = JSON.parse(message);

      switch (parsedMessage.type) {
        case 'subscribe':
          handleSubscription(ws, parsedMessage);
          break;
        case 'pong':
          break;
        default:
          console.log('Received message:', parsedMessage);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    clearInterval(pingInterval);
  });
};

function handleSubscription(ws, message) {
  const { channel } = message;

  ws.send(JSON.stringify({
    type: 'subscription_confirmation',
    channel,
    message: `Subscribed to ${channel}`,
    timestamp: new Date()
  }));
}

function startConversationSimulation(ws) {
  let convos = Array.isArray(conversations) ? conversations : (conversations?.conversations || []);

  // Fallback to dummy conversation if needed
  if (!Array.isArray(convos) || convos.length === 0) {
    convos = [
      {
        id: 'conv-001',
        customer: { id: 'cust-001', name: 'John Doe' },
        agent: { id: 'agent-001', name: 'Agent Smith' },
        status: 'active',
        alertLevel: 'low',
        startTime: new Date(),
        metrics: {
          sentiment: 0.8,
          responseTime: 5,
          confidenceScore: 0.9
        }
      }
    ];
  }

  setTimeout(() => {
    ws.send(JSON.stringify({
      type: 'conversations_update',
      data: convos.map(c => ({
        id: c.id,
        customer: c.customer,
        agent: c.agent,
        status: c.status,
        alertLevel: c.alertLevel,
        startTime: c.startTime,
        metrics: c.metrics
      })),
      timestamp: new Date()
    }));
  }, 1000);

  setInterval(() => {
    if (ws.readyState !== ws.OPEN) return;

    const conversation = convos[Math.floor(Math.random() * convos.length)];

    if (!conversation || !conversation.metrics) return;

    const messageUpdate = {
      type: 'message_update',
      conversationId: conversation.id,
      message: {
        sender: Math.random() > 0.5 ? 'customer' : 'agent',
        text: getRandomMessage(),
        timestamp: new Date()
      },
      timestamp: new Date()
    };

    ws.send(JSON.stringify(messageUpdate));

    if (Math.random() > 0.7) {
      const metricsUpdate = {
        type: 'metrics_update',
        conversationId: conversation.id,
        metrics: {
          sentiment: Math.max(0.1, Math.min(1.0, conversation.metrics.sentiment - 0.1 + Math.random() * 0.2)),
          responseTime: Math.max(1, conversation.metrics.responseTime - 1 + Math.random() * 2),
          confidenceScore: Math.max(0.2, Math.min(1.0, conversation.metrics.confidenceScore - 0.05 + Math.random() * 0.1))
        },
        timestamp: new Date()
      };

      ws.send(JSON.stringify(metricsUpdate));
    }
  }, 5000);

  setInterval(() => {
    if (ws.readyState !== ws.OPEN || Math.random() <= 0.8) return;

    const newConversation = {
      id: `conv-${Date.now()}`,
      customer: {
        id: `cust-${1000 + Math.floor(Math.random() * 9000)}`,
        name: getRandomName()
      },
      agent: {
        id: `agent-cs-${1 + Math.floor(Math.random() * 3)}`,
        name: 'Customer Service Agent'
      },
      status: 'active',
      alertLevel: 'low',
      startTime: new Date(),
      metrics: {
        sentiment: 0.7 + Math.random() * 0.3,
        responseTime: 5 + Math.random() * 5,
        confidenceScore: 0.8 + Math.random() * 0.2
      }
    };

    convos.push(newConversation);

    ws.send(JSON.stringify({
      type: 'new_conversation',
      data: newConversation,
      timestamp: new Date()
    }));
  }, 15000);
}

function getRandomMessage() {
  const customerMessages = [
    "Can you tell me more about my order status?",
    "I'm still waiting for a response about my return.",
    "Thank you for your help!",
    "This isn't what I was expecting.",
    "How long will the shipping take?",
    "I need to change my delivery address.",
    "Is there a way to expedite this process?"
  ];

  const agentMessages = [
    "I'm checking your order status now.",
    "Let me look into that for you.",
    "Is there anything else I can help you with?",
    "I've updated your information in our system.",
    "Your order will arrive in 2-3 business days.",
    "I apologize for the inconvenience.",
    "Thank you for your patience."
  ];

  return Math.random() > 0.5
    ? customerMessages[Math.floor(Math.random() * customerMessages.length)]
    : agentMessages[Math.floor(Math.random() * agentMessages.length)];
}

function getRandomName() {
  const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor'];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}
