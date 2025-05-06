import {
  validateNumericInput,
  validateState,
  validateScore,
  sanitizeInput,
  formatErrorMessage
} from '../js/core/validation';

describe('Validation Utilities', () => {
  describe('validateNumericInput', () => {
    it('should validate numeric input within range', () => {
      expect(validateNumericInput(5, 0, 10)).toBe(true);
      expect(validateNumericInput(0, 0, 10)).toBe(true);
      expect(validateNumericInput(10, 0, 10)).toBe(true);
    });

    it('should reject numeric input outside range', () => {
      expect(validateNumericInput(-1, 0, 10)).toBe(false);
      expect(validateNumericInput(11, 0, 10)).toBe(false);
    });

    it('should handle non-numeric input', () => {
      expect(validateNumericInput('abc', 0, 10)).toBe(false);
      expect(validateNumericInput(null, 0, 10)).toBe(false);
      expect(validateNumericInput(undefined, 0, 10)).toBe(false);
    });
  });

  describe('validateState', () => {
    it('should validate Nassau game state', () => {
      const validNassauState = {
        gameType: 'nassau',
        players: ['Player 1', 'Player 2'],
        pointValue: 1,
        settlement: { front: 0, back: 0, total: 0 }
      };
      expect(validateState(validNassauState)).toBe(true);
    });

    it('should validate Wolf game state', () => {
      const validWolfState = {
        gameType: 'wolf',
        players: ['Player 1', 'Player 2', 'Player 3', 'Player 4'],
        pointValue: 1,
        loneMultiplier: 2,
        settlement: { total: 0 }
      };
      expect(validateState(validWolfState)).toBe(true);
    });

    it('should reject invalid game state', () => {
      const invalidState = {
        gameType: 'invalid',
        players: []
      };
      expect(validateState(invalidState)).toBe(false);
    });
  });

  describe('validateScore', () => {
    it('should validate valid scores', () => {
      expect(validateScore(3, 3)).toBe(true);  // Par
      expect(validateScore(2, 3)).toBe(true);  // Birdie
      expect(validateScore(4, 3)).toBe(true);  // Bogey
      expect(validateScore(13, 3)).toBe(true); // Max allowed (10 over par)
    });

    it('should reject invalid scores', () => {
      expect(validateScore(14, 3)).toBe(false); // More than 10 over par
      expect(validateScore(-1, 3)).toBe(false); // Negative score
      expect(validateScore('abc', 3)).toBe(false); // Non-numeric score
    });
  });

  describe('sanitizeInput', () => {
    it('should sanitize input strings', () => {
      expect(sanitizeInput('  test  ')).toBe('test');
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
      expect(sanitizeInput('test\n\r\t')).toBe('test');
    });

    it('should handle non-string input', () => {
      expect(sanitizeInput(null)).toBe('');
      expect(sanitizeInput(undefined)).toBe('');
      expect(sanitizeInput(123)).toBe('123');
    });
  });

  describe('formatErrorMessage', () => {
    it('should format error messages', () => {
      const error = new Error('Test error');
      expect(formatErrorMessage(error)).toBe('Test error');
    });

    it('should handle non-Error objects', () => {
      expect(formatErrorMessage('Test error')).toBe('Test error');
      expect(formatErrorMessage({ message: 'Test error' })).toBe('Test error');
      expect(formatErrorMessage(null)).toBe('An unknown error occurred');
    });
  });
}); 