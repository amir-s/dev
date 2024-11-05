export const stringCloseness = (str: string, q: string) => {
  if (q.length > str.length) return -Infinity;

  let score = 0;
  let index = 0;

  let continuesScore = -0.5;

  for (let i = 0; i < q.length; i++) {
    while (index < str.length && str[index] !== q[i]) {
      index++;
      continuesScore = -0.5;
    }

    continuesScore += 0.5;
    score += continuesScore;

    if (index === 0) score += 2;
    if (index === str.length - 1) score += 1;
    score++;
    index++;
    if (index > str.length) return -Infinity;
  }

  return score;
};
