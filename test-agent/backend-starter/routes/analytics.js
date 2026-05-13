const express = require('express');
const router  = express.Router();

// Simple placeholder – return empty metrics structure
router.get('/', (_req, res) => {
  res.json({ conversations: [], agents: [], daily: [] });
});

module.exports = router;
