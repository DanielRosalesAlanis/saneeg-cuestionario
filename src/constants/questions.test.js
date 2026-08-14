import { describe, expect, it } from 'vitest';
import { DASS_KEYS, OPTS_DASS, scoreDASS } from './questions';

function distribute(score) {
  const values = Array(7).fill(0);
  let remaining = score;
  for (let index = 0; index < values.length; index += 1) {
    values[index] = Math.min(3, remaining);
    remaining -= values[index];
  }
  return values;
}

function answersFor(depression, anxiety, stress) {
  const answers = {};
  for (const [keys, score] of [
    [DASS_KEYS.depression, depression],
    [DASS_KEYS.anxiety, anxiety],
    [DASS_KEYS.stress, stress],
  ]) {
    distribute(score).forEach((value, index) => { answers[keys[index]] = OPTS_DASS[value]; });
  }
  return answers;
}

describe('scoreDASS', () => {
  it.each([
    [0, 'Normal'], [4, 'Normal'], [5, 'Leve'], [6, 'Leve'], [7, 'Moderado'],
    [10, 'Moderado'], [11, 'Severo'], [13, 'Severo'], [14, 'Extremadamente severo'],
    [21, 'Extremadamente severo'],
  ])('clasifica la frontera de depresión %i como %s', (score, severity) => {
    const result = scoreDASS(answersFor(score, 0, 0));
    expect([result.d, result.sevD]).toEqual([score, severity]);
  });

  it.each([
    [0, 'Normal'], [3, 'Normal'], [4, 'Leve'], [5, 'Moderado'], [7, 'Moderado'],
    [8, 'Severo'], [9, 'Severo'], [10, 'Extremadamente severo'], [21, 'Extremadamente severo'],
  ])('clasifica la frontera de ansiedad %i como %s', (score, severity) => {
    const result = scoreDASS(answersFor(0, score, 0));
    expect([result.a, result.sevA]).toEqual([score, severity]);
  });

  it.each([
    [0, 'Normal'], [7, 'Normal'], [8, 'Leve'], [9, 'Leve'], [10, 'Moderado'],
    [12, 'Moderado'], [13, 'Severo'], [16, 'Severo'], [17, 'Extremadamente severo'],
    [21, 'Extremadamente severo'],
  ])('clasifica la frontera de estrés %i como %s', (score, severity) => {
    const result = scoreDASS(answersFor(0, 0, score));
    expect([result.s, result.sevS]).toEqual([score, severity]);
  });

  it('trata una respuesta ausente o desconocida como cero en el respaldo local', () => {
    expect(scoreDASS({ dass_3: 'opción manipulada' })).toEqual({
      d: 0, sevD: 'Normal', a: 0, sevA: 'Normal', s: 0, sevS: 'Normal',
    });
  });
});
