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

  function updateLocalStorageItem(item, value) {
    window.localStorage.setItem(item, JSON.stringify(value));
  }

  function getLocalStorageItem(item) {
    const value = JSON.parse(window.localStorage.getItem(item));
    if (!value) {
      updateLocalStorageItem(item, []);
      return getLocalStorageItem();
    } else return value;
  }

  function getUsedWords() {
    const words = JSON.parse(window.localStorage.getItem('words'));
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

  function numOccurences(val, arr) {
    let sum = 0;
    for (const v of arr) {
      if (v === val) sum++;
    }
    return sum;
  }

  keyEls.forEach((key) => {
    key.addEventListener('click', (e) => {
      pressKey(key.innerText);
      e.target.blur();
    });
  });

  const backspaceEl = document.querySelector('#backspace');
  backspaceEl.addEventListener('click', (e) => {
    backspace();
    e.target.blur();
  });

  const enterEl = document.querySelector('#enter');
  enterEl.addEventListener('click', (e) => {
    enter();
    e.target.blur();
  });

  const restartEl = document.querySelector('#restart');
  restartEl.addEventListener('click', (e) => {
    restart();
    e.target.blur();
  });

  const gamesPlayedEl = document.getElementById('played');
  const gamesWonEl = document.getElementById('won');
  const avgGuessesEl = document.getElementById('avg-guesses');

  function updateStats() {
    const gamesPlayed = getLocalStorageItem('games');
    gamesPlayedEl.innerText = gamesPlayed.length;

    let sum1 = 0;
    let sum2 = 0;
    for (const game of gamesPlayed) {
      sum1 += game.guesses;
      sum2 += game.won ? 1 : 0;
    }

    gamesWonEl.innerText = sum2;

    const avg = Math.round(sum1 / gamesPlayed.length);
    avgGuessesEl.innerText = avg > 0 ? avg : 0;
  }

  updateStats();

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
      console.log(selectedWord);
      return selectedWord;
    } else return getRandomWord();
    // return 'photo';
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
          showAlert('Word not found');
          return;
        }

        // Give information about word guessed
        const included = [];
        for (let i = 0; i < 5; i++) {
          const letter = guess[i];
          grid[col][i].changeColour('grey');
          findKey(letter).classList.add('grey');
          if (word.includes(letter)) {
            included.push(letter);
          }
        }

        for (let i = 0; i < 5; i++) {
          const letter = included[i];
          const idxsGuess = find(letter, guess);
          const idxsWord = find(letter, word);
          let gridTem = [undefined, undefined, undefined, undefined];
          let n = 0;
          for (let j = 0; j < idxsGuess.length; j++) {
            if (idxsWord.includes(idxsGuess[j])) {
              grid[col][idxsGuess[j]].changeColour('green');
              findKey(letter).classList.remove('grey');
              findKey(letter).classList.add('green');
              gridTem[idxsGuess[j]] = 'green';
            }
          }

          if (
            numOccurences('green', gridTem) < idxsWord.length &&
            idxsGuess.length >= idxsWord.length
          ) {
            for (let j = 0; j < idxsWord.length; j++) {
              if (gridTem[idxsGuess[j]] !== 'green') {
                grid[col][idxsGuess[j]].changeColour('yellow');
              }
            }
          }
        }

        if (guess.join('') === word) {
          showAlert('You won!');

          const gamesPlayed = getLocalStorageItem('games');
          gamesPlayed.push({
            date: Date(),
            guesses: col + 1,
            won: true,
            word,
          });
          updateLocalStorageItem('games', gamesPlayed);
          updateStats();
          return;
        }

        row = 0;
        col++;
        if (col === 6) {
          showAlert(`Word was: ${word}`);

          const gamesPlayed = getLocalStorageItem('games');
          gamesPlayed.push({
            date: Date(),
            guesses: 6,
            won: false,
            word,
          });
          updateLocalStorageItem('games', gamesPlayed);
        }
        updateStats();
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

    updateStats();
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
