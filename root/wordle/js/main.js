const ABC = 'abcdefghijklmnopqrstuvwxyz';

async function getFile(fileURL) {
  let fileContent = await fetch(fileURL);
  fileContent = await fileContent.text();
  return fileContent;
}

document.addEventListener('DOMContentLoaded', async () => {
  function showAlert(string) {
    const newAlert = document.createElement('div');
    newAlert.classList.add('alert');
    newAlert.innerText = string;
    document.body.querySelector('.game').appendChild(newAlert);
    setTimeout(() => {
      newAlert.classList.add('fade');
      setTimeout(() => {
        document.body.querySelector('.game').lastChild.remove();
      }, 1000);
    }, 3000);
  }

  function getUsedWords() {
    const words = JSON.parse(window.localStorage.getItem('words'));
    console.log(words);
    if (!words) {
      window.localStorage.setItem('words', JSON.stringify([]));
      return getUsedWords();
    } else return words;
  }

  function addUsedWord(word) {
    const words = getUsedWords();
    words.push(word);
    window.localStorage.setItem('words', JSON.stringify(words));
  }

  const keyEls = document.querySelectorAll('.key');

  function findKey(letter) {
    let key = undefined;
    for (const key_ of keyEls) {
      if (key_.innerText === letter.toUpperCase()) {
        key = key_;
        break;
      }
    }
    return key;
  }

  keyEls.forEach((key) => {
    key.addEventListener('click', () => pressKey(key.innerText));
  });

  const backspaceEl = document.querySelector('#backspace');
  backspaceEl.addEventListener('click', () => backspace());

  const enterEl = document.querySelector('#enter');
  enterEl.addEventListener('click', () => enter());

  const restartEl = document.querySelector('#restart');
  restartEl.addEventListener('click', (e) => {
    restart();
    e.target.blur();
  });

  // Get allowed words (prod)
  const file = await getFile('/wordle/data/possible_words.txt');
  const file2 = await getFile('/wordle/data/allowed_words.txt');
  const file3 = await getFile('/wordle/data/possible_words_freq.txt');

  // Get allowed words (dev)
  // const file = await getFile('/data/possible_words.txt');
  // const file2 = await getFile('/data/allowed_words.txt');
  // const file3 = await getFile('/data/possible_words_freq.txt');

  const possibleWords = file.split('\n');

  const possibleWordsFreqs = file3
    .split('\n')
    .map((v) => Number(v.split(' ')[1]));

  const allowedWords = file2.split('\n');

  // Pick random word, based on word freq
  function getRandomWord() {
    const totalWeight = possibleWordsFreqs.reduce((sum, freq) => sum + freq);
    let randomNum = Math.random() * totalWeight;

    let selectedWord;
    for (let i = 0; i < possibleWords.length; i++) {
      const word = possibleWords[i];
      randomNum -= possibleWordsFreqs[i];
      if (randomNum <= 0) {
        selectedWord = word;
        break;
      }
    }

    if (!getUsedWords().includes(selectedWord)) {
      addUsedWord(selectedWord);
      return selectedWord;
    } else return getRandomWord();
  }

  let word = getRandomWord();

  // Set up grid
  const gridEl = document.querySelector('.grid');

  for (let i = 0; i < 30; i++) {
    const squareEl = document.createElement('div');
    squareEl.classList.add('square', 'empty');
    squareEl.id = `cell${i}`;
    gridEl.appendChild(squareEl);
  }

  let grid = Array.from({ length: 6 }, (_, i) =>
    Array.from(
      { length: 5 },
      (__, j) => new Square(i, j, gridEl.children[j + i * 5])
    )
  );

  let row = 0;
  let col = 0;

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace') {
      backspace();
    } else if (e.key === 'Enter') {
      enter();
    } else {
      pressKey(e.key);
    }
  });

  function backspace() {
    if (row !== 0) {
      row--;
      grid[col][row].changeLetter('');
    }
  }

  function pressKey(key) {
    if (row <= 4 && ABC.includes(key.toLowerCase())) {
      grid[col][row].changeLetter(key);
      row++;
    }
  }

  function enter() {
    if (row === 5) {
      if (col !== 6) {
        const guess = Array.from({ length: 5 }, (_, i) =>
          grid[col][i].letter.toLowerCase()
        );
        // Check if word is in given databse of words
        if (!allowedWords.includes(guess.join(''))) {
          showAlert('Word not allowed');
          return;
        }

        // Give information about word guessed
        const included = [];
        for (let i = 0; i < 5; i++) {
          const letter = guess[i];
          grid[col][i].changeColour('grey');
          findKey(letter).classList.add('grey');
          if (word.includes(letter)) {
            // grid[col][i].changeColour('yellow');
            included.push(letter);
          }
          if (letter === word[i]) {
            grid[col][i].changeColour('green');
            findKey(letter).classList.remove('grey');
            findKey(letter).classList.add('green');
          }
        }

        for (let i = 0; i < 5; i++) {
          const letter = included[i];
          const idxsGuess = find(letter, guess);
          const idxsWord = find(letter, word);
          for (let j = 0; j < idxsWord.length; j++) {
            if (guess[idxsGuess[j]] !== word[idxsGuess[j]]) {
              if (idxsGuess.length <= idxsWord.length) {
                for (let k = 0; k < idxsGuess.length; k++) {
                  if (guess[idxsGuess[k]] !== word[idxsGuess[k]]) {
                    grid[col][idxsGuess[k]].changeColour('yellow');
                    findKey(letter).classList.remove('grey');
                    findKey(letter).classList.add('yellow');
                  }
                }
              }
            }
          }
        }

        if (guess.join('') === word) {
          showAlert('You won!');
          return;
        }

        row = 0;
        col++;
        if (col === 6) {
          showAlert(`Word was: ${word}`);
        }
      }
    }
  }

  function restart() {
    grid = Array.from({ length: 6 }, (_, i) =>
      Array.from(
        { length: 5 },
        (__, j) => new Square(i, j, gridEl.children[j + i * 5])
      )
    );
    col = 0;
    row = 0;
    word = getRandomWord();

    for (const keyEl of keyEls) {
      keyEl.classList.remove(...Object.values(['grey', 'yellow', 'green']));
      keyEl.classList.add('empty');
    }
  }

  function find(letter, arr) {
    const indexes = [];
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === letter) indexes.push(i);
    }
    return indexes;
  }
});

class Square {
  constructor(i, j, element) {
    this.i = i;
    this.j = j;
    this.element = element;
    this.element.innerText = '';
    this.letter = '';
    this.colour = 'empty';
    this.changeColour('empty');
  }

  changeColour(colour) {
    if (colour !== 'empty') {
      this.element.classList.remove('letter');
      this.element.classList.replace(this.colour, colour);
      this.colour = colour;
    } else {
      this.element.classList.remove(
        ...Object.values(['grey', 'yellow', 'green'])
      );
      this.element.classList.add('empty');
    }
  }

  changeLetter(letter) {
    letter = letter.toUpperCase();
    this.letter = letter;
    this.element.innerText = letter;
    if (letter !== '') {
      this.element.classList.add('letter');
    } else {
      this.element.classList.remove('letter');
    }
  }
}
