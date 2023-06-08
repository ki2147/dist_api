const { checkSentiment, censorSwearWords } = require('../../src/controllers/textprocessor');

describe('checkSentiment', () => {
  it('should analyze sentiment correctly', () => {
    const text = 'This is a positive sentence.';
    const result = checkSentiment(text);

    expect(result.sentiment).toMatch(/positive|negative|neutral/);
    expect(result.score).toEqual(expect.any(Number));
    expect(result.comparative).toEqual(expect.any(Number));
  });
});


describe('censorSwearWords', () => {

  it('should replace swear words with ellipsis', () => {
    const text = 'I hate those damn swear words!';
    const expected = 'I hate those **** swear words!';

    const result = censorSwearWords(text);

    expect(result).toBe(expected);
  });

  it('should handle case-insensitive swear words', () => {
    const text = 'I can\'t believe they said Damn!';
    const expected = 'I can\'t believe they said ****!';

    const result = censorSwearWords(text);

    expect(result).toBe(expected);
  });

  it('should not modify the text if no swear words are present', () => {
    const text = 'This is a clean text without any profanity.';
    const expected = 'This is a clean text without any profanity.';

    const result = censorSwearWords(text);

    expect(result).toBe(expected);
  });
});


