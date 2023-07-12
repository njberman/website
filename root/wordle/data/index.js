const fs = require('fs');

const possible_words = String(fs.readFileSync('./possible_words.txt')).split(
  '\n'
);
const possible_words_freq = String(
  fs.readFileSync('./possible_words_freq.txt')
).split('\n');

const out = [];
for (const wordandfreq of possible_words_freq) {
  const [word, freq] = wordandfreq.split(' ');
  if (possible_words.includes(word)) {
    out.push(wordandfreq);
  }
}

fs.writeFileSync('./possible_words_freq.txt', out.join('\n'));
