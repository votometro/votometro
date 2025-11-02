import { describe, it, expect } from 'vitest';
import { scoreAnswer, calculateMatch } from './algorithm';
import type { Answer } from '../types/answer';
import type { PartyAnswer } from '../types/party';

describe('scoreAnswer', () => {
  describe('basic scoring (unweighted)', () => {
    it('should return 2 for perfect match: Agree + Agree', () => {
      expect(scoreAnswer(1, 1, 1)).toBe(2);
    });

    it('should return 2 for perfect match: Neutral + Neutral', () => {
      expect(scoreAnswer(0, 0, 1)).toBe(2);
    });

    it('should return 2 for perfect match: Disagree + Disagree', () => {
      expect(scoreAnswer(-1, -1, 1)).toBe(2);
    });

    it('should return 1 for partial match: Agree + Neutral', () => {
      expect(scoreAnswer(1, 0, 1)).toBe(1);
    });

    it('should return 1 for partial match: Neutral + Agree', () => {
      expect(scoreAnswer(0, 1, 1)).toBe(1);
    });

    it('should return 1 for partial match: Disagree + Neutral', () => {
      expect(scoreAnswer(-1, 0, 1)).toBe(1);
    });

    it('should return 1 for partial match: Neutral + Disagree', () => {
      expect(scoreAnswer(0, -1, 1)).toBe(1);
    });

    it('should return 0 for opposite: Agree + Disagree', () => {
      expect(scoreAnswer(1, -1, 1)).toBe(0);
    });

    it('should return 0 for opposite: Disagree + Agree', () => {
      expect(scoreAnswer(-1, 1, 1)).toBe(0);
    });

    it('should return 0 when user skips (null + Agree)', () => {
      expect(scoreAnswer(null, 1, 1)).toBe(0);
    });

    it('should return 0 when user skips (null + Neutral)', () => {
      expect(scoreAnswer(null, 0, 1)).toBe(0);
    });

    it('should return 0 when user skips (null + Disagree)', () => {
      expect(scoreAnswer(null, -1, 1)).toBe(0);
    });
  });

  describe('weighted scoring', () => {
    it('should return 4 for perfect match weighted: Agree + Agree', () => {
      expect(scoreAnswer(1, 1, 2)).toBe(4);
    });

    it('should return 4 for perfect match weighted: Neutral + Neutral', () => {
      expect(scoreAnswer(0, 0, 2)).toBe(4);
    });

    it('should return 4 for perfect match weighted: Disagree + Disagree', () => {
      expect(scoreAnswer(-1, -1, 2)).toBe(4);
    });

    it('should return 2 for partial match weighted: Agree + Neutral', () => {
      expect(scoreAnswer(1, 0, 2)).toBe(2);
    });

    it('should return 2 for partial match weighted: Neutral + Agree', () => {
      expect(scoreAnswer(0, 1, 2)).toBe(2);
    });

    it('should return 2 for partial match weighted: Disagree + Neutral', () => {
      expect(scoreAnswer(-1, 0, 2)).toBe(2);
    });

    it('should return 2 for partial match weighted: Neutral + Disagree', () => {
      expect(scoreAnswer(0, -1, 2)).toBe(2);
    });

    it('should return 0 for opposite weighted: Agree + Disagree', () => {
      expect(scoreAnswer(1, -1, 2)).toBe(0);
    });

    it('should return 0 for opposite weighted: Disagree + Agree', () => {
      expect(scoreAnswer(-1, 1, 2)).toBe(0);
    });

    it('should return 0 when user skips even if weighted', () => {
      expect(scoreAnswer(null, 1, 2)).toBe(0);
    });
  });
});

describe('calculateMatch', () => {
  describe('core scenarios', () => {
    it('should return 100% for perfect match (all identical)', () => {
      const userAnswers: Answer[] = [
        { thesisKey: '0', value: 1 },
        { thesisKey: '1', value: 0 },
        { thesisKey: '2', value: -1 },
      ];
      const partyAnswers: PartyAnswer[] = [
        { thesisKey: '0', value: 1, justification: 'yes' },
        { thesisKey: '1', value: 0, justification: 'maybe' },
        { thesisKey: '2', value: -1, justification: 'no' },
      ];

      const result = calculateMatch(userAnswers, partyAnswers);

      expect(result.matchPercentage).toBe(100);
      expect(result.earnedScore).toBe(result.totalPossibleScore);
      expect(result.earnedScore).toBe(6); // 2+2+2
      expect(result.totalPossibleScore).toBe(6);
    });

    it('should return 0% for complete opposite', () => {
      const userAnswers: Answer[] = [
        { thesisKey: '0', value: 1 },
        { thesisKey: '1', value: 1 },
      ];
      const partyAnswers: PartyAnswer[] = [
        { thesisKey: '0', value: -1, justification: 'no' },
        { thesisKey: '1', value: -1, justification: 'no' },
      ];

      const result = calculateMatch(userAnswers, partyAnswers);

      expect(result.matchPercentage).toBe(0);
      expect(result.earnedScore).toBe(0);
      expect(result.totalPossibleScore).toBe(4); // 2+2
    });

    it('should calculate mixed answers correctly', () => {
      const userAnswers: Answer[] = [
        { thesisKey: '0', value: 1 },   // perfect match: 2
        { thesisKey: '1', value: 1 },   // partial match: 1
        { thesisKey: '2', value: -1 },  // opposite: 0
      ];
      const partyAnswers: PartyAnswer[] = [
        { thesisKey: '0', value: 1, justification: 'yes' },
        { thesisKey: '1', value: 0, justification: 'neutral' },
        { thesisKey: '2', value: 1, justification: 'yes' },
      ];

      const result = calculateMatch(userAnswers, partyAnswers);

      expect(result.earnedScore).toBe(3); // 2+1+0
      expect(result.totalPossibleScore).toBe(6); // 2+2+2
      expect(result.matchPercentage).toBe(50); // 3/6 * 100
    });

    it('should handle weighted answers in totalPossibleScore', () => {
      const userAnswers: Answer[] = [
        { thesisKey: '0', value: 1 },    // 2 max
        { thesisKey: '1', value: 1 },    // 4 max (weighted)
      ];
      const partyAnswers: PartyAnswer[] = [
        { thesisKey: '0', value: 1, justification: 'yes' },
        { thesisKey: '1', value: 1, justification: 'yes' },
      ];
      const weights = {
        '1': 2,  // double weight for thesis 1
      };

      const result = calculateMatch(userAnswers, partyAnswers, weights);

      expect(result.earnedScore).toBe(6); // 2+4
      expect(result.totalPossibleScore).toBe(6); // 2+4
      expect(result.matchPercentage).toBe(100);
    });

    it('should handle skipped answers (not in totalPossibleScore)', () => {
      const userAnswers: Answer[] = [
        { thesisKey: '0', value: 1 },     // 2 points, 2 max
        { thesisKey: '1', value: null },  // 0 points, 0 max
        { thesisKey: '2', value: 1 },     // 2 points, 2 max
      ];
      const partyAnswers: PartyAnswer[] = [
        { thesisKey: '0', value: 1, justification: 'yes' },
        { thesisKey: '1', value: 1, justification: 'yes' },
        { thesisKey: '2', value: 1, justification: 'yes' },
      ];

      const result = calculateMatch(userAnswers, partyAnswers);

      expect(result.earnedScore).toBe(4); // 2+0+2
      expect(result.totalPossibleScore).toBe(4); // 2+0+2 (skipped doesn't count)
      expect(result.matchPercentage).toBe(100);
    });

    it('should handle mixed: weighted + skipped + normal', () => {
      const userAnswers: Answer[] = [
        { thesisKey: '0', value: 1 },     // perfect: 2/2
        { thesisKey: '1', value: 1 },     // perfect weighted: 4/4
        { thesisKey: '2', value: null },  // skipped: 0/0
        { thesisKey: '3', value: 1 },     // partial: 1/2
      ];
      const partyAnswers: PartyAnswer[] = [
        { thesisKey: '0', value: 1, justification: 'yes' },
        { thesisKey: '1', value: 1, justification: 'yes' },
        { thesisKey: '2', value: -1, justification: 'no' },
        { thesisKey: '3', value: 0, justification: 'neutral' },
      ];
      const weights = {
        '1': 2,  // double weight for thesis 1
      };

      const result = calculateMatch(userAnswers, partyAnswers, weights);

      expect(result.earnedScore).toBe(7); // 2+4+0+1
      expect(result.totalPossibleScore).toBe(8); // 2+4+0+2
      expect(result.matchPercentage).toBe(87.5); // 7/8 * 100
    });

    it('should handle single thesis', () => {
      const userAnswers: Answer[] = [
        { thesisKey: '0', value: 1 },
      ];
      const partyAnswers: PartyAnswer[] = [
        { thesisKey: '0', value: 0, justification: 'neutral' },
      ];

      const result = calculateMatch(userAnswers, partyAnswers);

      expect(result.earnedScore).toBe(1);
      expect(result.totalPossibleScore).toBe(2);
      expect(result.matchPercentage).toBe(50);
    });
  });

  describe('ThesisScore breakdown', () => {
    it('should include correct ThesisScore for each thesis', () => {
      const userAnswers: Answer[] = [
        { thesisKey: '0', value: 1 },
        { thesisKey: '1', value: 0 },
      ];
      const partyAnswers: PartyAnswer[] = [
        { thesisKey: '0', value: 1, justification: 'yes' },
        { thesisKey: '1', value: -1, justification: 'no' },
      ];

      const result = calculateMatch(userAnswers, partyAnswers);

      expect(result.thesisScores).toHaveLength(2);

      expect(result.thesisScores[0]).toEqual({
        thesisKey: '0',
        score: 2,
        userAnswer: 1,
        partyAnswer: 1,
      });

      expect(result.thesisScores[1]).toEqual({
        thesisKey: '1',
        score: 1,
        userAnswer: 0,
        partyAnswer: -1,
      });
    });
  });

  describe('validation', () => {
    it('should throw error when array lengths do not match', () => {
      const userAnswers: Answer[] = [
        { thesisKey: '0', value: 1 },
      ];
      const partyAnswers: PartyAnswer[] = [
        { thesisKey: '0', value: 1, justification: 'yes' },
        { thesisKey: '1', value: 1, justification: 'yes' },
      ];

      expect(() => calculateMatch(userAnswers, partyAnswers))
        .toThrow('Array lengths must match');
    });

    it('should throw error when thesisKey values do not match', () => {
      const userAnswers: Answer[] = [
        { thesisKey: '0', value: 1 },
        { thesisKey: '1', value: 1 },
      ];
      const partyAnswers: PartyAnswer[] = [
        { thesisKey: '0', value: 1, justification: 'yes' },
        { thesisKey: '2', value: 1, justification: 'yes' }, // wrong key
      ];

      expect(() => calculateMatch(userAnswers, partyAnswers))
        .toThrow('No party answer found for thesis key');
    });
  });
});
