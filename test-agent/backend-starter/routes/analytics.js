const express = require('express');
const router = express.Router();
const Conversation = require('../models/conversation');
const Agent = require('../models/agent');

const buildMetrics = async () => {
  const [conversations, agents] = await Promise.all([
    Conversation.find().lean(),
    Agent.find().lean()
  ]);

  const total = conversations.length;
  const resolved = conversations.filter((conversation) => conversation.status === 'resolved').length;
  const escalated = conversations.filter(
    (conversation) => conversation.status === 'escalated' || conversation.alertLevel === 'high'
  ).length;
  const active = conversations.filter((conversation) => ['active', 'waiting', 'escalated'].includes(conversation.status)).length;
  const avgResponseSeconds = total
    ? conversations.reduce((sum, conversation) => sum + (conversation.metrics?.responseTime || 0), 0) / total
    : 0;
  const avgSentiment = total
    ? conversations.reduce((sum, conversation) => sum + (conversation.metrics?.sentiment || 0), 0) / total
    : 0;
  const avgAgentSatisfaction = agents.length
    ? agents.reduce((sum, agent) => sum + (agent.metrics?.satisfaction || 0), 0) / agents.length
    : 0;

  return {
    timestamp: new Date().toISOString(),
    resolutionRate: total ? Math.round((resolved / total) * 100) : 0,
    avgResponseSeconds: Number(avgResponseSeconds.toFixed(1)),
    satisfactionScore: Number(((avgSentiment || avgAgentSatisfaction || 0) * 10).toFixed(1)),
    activeConversations: active,
    escalationRate: total ? Math.round((escalated / total) * 100) : 0,
    totalConversations: total,
    agentPerformance: agents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      satisfaction: agent.metrics?.satisfaction || 0,
      avgResponseTime: agent.metrics?.avgResponseTime || 0,
      escalationRate: agent.metrics?.escalationRate || 0
    }))
  };
};

router.get('/', async (_req, res, next) => {
  try {
    res.json(await buildMetrics());
  } catch (error) {
    next(error);
  }
});

router.get('/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const sendMetrics = async () => {
    try {
      const metrics = await buildMetrics();
      res.write(`event: metrics\n`);
      res.write(`data: ${JSON.stringify(metrics)}\n\n`);
    } catch (error) {
      res.write(`event: error\n`);
      res.write(`data: ${JSON.stringify({ message: error.message })}\n\n`);
    }
  };

  await sendMetrics();
  const intervalId = setInterval(sendMetrics, 2000);

  req.on('close', () => {
    clearInterval(intervalId);
    res.end();
  });
});

module.exports = router;
