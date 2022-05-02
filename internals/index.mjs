export const stringCloseness = (str, q) => {
  if (q.length > str.length) return -Infinity;

  let score = 0;
  let index = 0;
  for (let i = 0; i < q.length; i++) {
    while (index < str.length && str[index] !== q[i]) {
      index++;
    }

    if (index === 0) score += 2;
    if (index === str.length - 1) score += 1;
    score++;
    index++;
    if (index > str.length) return -Infinity;
  }

  return score;
};
