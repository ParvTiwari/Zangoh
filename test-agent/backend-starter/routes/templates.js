// routes/templates.js
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const ResponseTemplate = require('../models/responseTemplate');
const { simulateDelay } = require('../utils/helpers');

const router = express.Router();

const defaultTemplates = [
  {
    id: 'tmpl-shipping-delay',
    name: 'Shipping delay empathy',
    category: 'Shipping',
    content: 'Hello {{customerName}}, I understand how important order {{orderNumber}} is. I am checking the latest carrier scan now and will share the exact next step before we end this chat.',
    variables: [
      { name: 'customerName', description: 'Customer first or full name' },
      { name: 'orderNumber', description: 'Order identifier from the conversation' }
    ],
    createdBy: 'system',
    isShared: true
  },
  {
    id: 'tmpl-return-next-steps',
    name: 'Return next steps',
    category: 'Returns',
    content: 'I can help with that return, {{customerName}}. I will verify the purchase, confirm the refund method, and send a prepaid label if this qualifies under our policy.',
    variables: [{ name: 'customerName', description: 'Customer first or full name' }],
    createdBy: 'system',
    isShared: true
  },
  {
    id: 'tmpl-human-handoff',
    name: 'Human handoff',
    category: 'Escalation',
    content: 'Thanks for your patience, {{customerName}}. I am bringing in a supervisor now because this needs extra attention. They will review the full conversation before responding.',
    variables: [{ name: 'customerName', description: 'Customer first or full name' }],
    createdBy: 'system',
    isShared: true
  }
];

async function ensureDefaults() {
  const count = await ResponseTemplate.countDocuments();
  if (count === 0) {
    await ResponseTemplate.insertMany(defaultTemplates);
  }
}

router.get('/', async (req, res, next) => {
  try {
    await ensureDefaults();
    const { category, search } = req.query;
    const query = {};

    if (category && category !== 'all') query.category = category;
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') },
        { content: new RegExp(search, 'i') }
      ];
    }

    const templates = await ResponseTemplate.find(query).sort({ updatedAt: -1 });
    await simulateDelay(150);
    res.json(templates);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, category, content, variables = [], createdBy = 'supervisor', isShared = false } = req.body;

    if (!name || !category || !content) {
      return res.status(400).json({ message: 'Name, category, and content are required' });
    }

    const template = await ResponseTemplate.create({
      id: `tmpl-${uuidv4()}`,
      name,
      category,
      content,
      variables,
      createdBy,
      isShared
    });

    await simulateDelay(150);
    res.status(201).json(template);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const template = await ResponseTemplate.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    await simulateDelay(150);
    res.json(template);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const template = await ResponseTemplate.findOneAndDelete({ id: req.params.id });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    await simulateDelay(100);
    res.json({ message: 'Template deleted', id: req.params.id });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
