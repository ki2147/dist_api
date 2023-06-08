const express = require('express');
const router = express.Router();
const { checkSentiment, censorSwearWords } = require('../controllers/textprocessor');

// Welcome page route
router.get('/', (req, res) => {
  res.send('Welcome to the TextEval API!');
});

/**
 * @swagger
 * /api/check-text:
 *   post:
 *     summary: Check text for sentiment and hide profanities
 *     description: Check text for sentiment and hide profanities
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: The input text to process
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sentiment:
 *                   type: object
 *                   properties:
 *                     sentiment:
 *                       type: string
 *                       description: The sentiment of the text (positive, negative, or neutral)
 *                     score:
 *                       type: number
 *                       description: The sentiment score of the text
 *                     comparative:
 *                       type: number
 *                       description: The comparative sentiment score of the text
 *                 censoredText:
 *                   type: string
 *                   description: The text with profanities censored
 */
router.post('/api/check-text', async (req, res) => {
    const text = req.body.text;
  
    try {
      // Run checkSentiment and censorSwearWords concurrently
      const [sentimentResult, censoredText] = await Promise.all([
        checkSentiment(text),
        censorSwearWords(text)
      ]);
  
      res.json({ sentiment: sentimentResult, censoredText: censoredText });
    } catch (error) {
      console.error('Error processing text:', error);
      res.status(500).json({ error: 'Error processing text' });
    }
  });
  

module.exports = router;
