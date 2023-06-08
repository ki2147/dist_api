const natural = require('natural');
const Sentiment = require('sentiment');
const Filter = require('bad-words');

function censorSwearWords(text) {
    const filter = new Filter();
    const words = text.split(/\b/); // Split the text on word boundaries
  
    for (let i = 0; i < words.length; i++) {
        if (filter.isProfane(words[i])) {
            const word = words[i];
            const censored = word.replace(/[a-zA-Z]/g, '*'); // Replace each letter with an asterisk
      
            words[i] = censored + word.slice(censored.length);
        }
    }
  
    return words.join('');
  }


function checkSentiment(text) {
  // Tokenize the text
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(text);

  // Calculate sentiment using the Sentiment library
  const sentiment = new Sentiment();
  const result = sentiment.analyze(text);

  // Determine sentiment polarity (positive, negative, neutral)
  let sentimentLabel;
  if (result.score > 0) {
    sentimentLabel = 'positive';
  } else if (result.score < 0) {
    sentimentLabel = 'negative';
  } else {
    sentimentLabel = 'neutral';
  }

  return {
    sentiment: sentimentLabel,
    score: result.score,
    comparative: result.comparative,
  };
}

module.exports = {
  checkSentiment,
  censorSwearWords,
};
