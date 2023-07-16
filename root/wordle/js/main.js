const ABC = 'abcdefghijklmnopqrstuvwxyz';

async function getFile(fileURL) {
  let fileContent = await fetch(fileURL);
  fileContent = await fileContent.text();
  return fileContent;
}

document.addEventListener('DOMContentLoaded', async () => {
  let allow = true;
  const gameEl = document.body.querySelector('.game');
  function showAlert(string) {
    if (
      document.body.children[
        document.body.children.length - 1
      ].classList.contains('alert') &&
      document.body.children[document.body.children.length - 1].nodeName ===
        'DIV'
    ) {
      document.body.children[document.body.children.length - 1].remove();
      return showAlert(string);
    }
    const newAlert = document.createElement('div');
    newAlert.classList.add('alert');
    newAlert.innerText = string;
    document.body.appendChild(newAlert);
    setTimeout(() => {
      newAlert.classList.add('fade');
      setTimeout(() => {
        document.body.lastChild.remove();
      }, 1000);
    }, 1500);
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

  const statsEl = document.querySelector('.stats');
  const gamesPlayedEl = document.getElementById('played');
  const winRateEl = document.getElementById('win-rate');
  // const avgGuessesEl = document.getElementById('avg-guesses');
  const graphEl = document.querySelector('.graph');
  const closeStatsEl = document.getElementById('close');

  const overlayEl = document.querySelector('.overlay');
  overlayEl.addEventListener('click', () => {
    closeStats();
    closeHelp();
  });

  closeStatsEl.addEventListener('click', () => closeStats());

  const statsButton = document.querySelector('#stats-button');
  statsButton.addEventListener('click', () => showStats());

  const helpButton = document.querySelector('#help-button');
  const helpEl = document.querySelector('.help');
  const closeHelpButton = helpEl.children[0].children[1];
  helpButton.addEventListener('click', () => {
    helpEl.style.display = 'grid';
    gameEl.classList.add('blur');
    overlayEl.style.display = 'block';
  });

  closeHelpButton.addEventListener('click', () => closeHelp());

  function closeHelp() {
    helpEl.style.display = 'none';
    gameEl.classList.remove('blur');
    overlayEl.style.display = 'none';
  }

  function closeStats() {
    statsEl.style.display = 'none';
    gameEl.classList.remove('blur');
    overlayEl.style.display = 'none';
  }

  function showStats() {
    statsEl.style.display = 'grid';
    gameEl.classList.add('blur');
    overlayEl.style.display = 'block';
  }

  function updateStats() {
    const gamesPlayed = getLocalStorageItem('games');
    gamesPlayedEl.innerText = gamesPlayed.length;

    let guessCount = Array.from({ length: 6 }, () => 0);

    let sum1 = 0;
    let sum2 = 0;
    for (const game of gamesPlayed) {
      guessCount[game.guesses - 1]++;
      sum2 += game.won ? 1 : 0;
    }

    let highestGuess = 0;
    for (let i = 0; i < guessCount.length; i++) {
      const guess_ = guessCount[i];
      highestGuess = guess_ > highestGuess ? guess_ : highestGuess;
    }

    for (let i = 0; i < graphEl.children.length; i++) {
      const [_, dist] = graphEl.children[i].children;
      dist.innerText = guessCount[i];
      dist.style.width = `${
        guessCount[i] !== 0 ? (100 / highestGuess) * guessCount[i] : 7.5
      }%`;
      if (
        gamesPlayed.length > 0 &&
        gamesPlayed[gamesPlayed.length - 1].guesses === i + 1
      )
        dist.classList.add('green');
      else dist.classList.remove('green');
    }

    winRateEl.innerText = Math.floor((sum2 / gamesPlayed.length) * 100);

    const avg = Math.round(sum1 / gamesPlayed.length);
    // avgGuessesEl.innerText = avg > 0 ? avg : 0;
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
    if (getUsedWords().includes('hasmo')) {
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
    addUsedWord('hasmo');
    return 'hasmo';
    return 'onono';
  }

  let word = getRandomWord();
  console.log(word);

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

  function lastCol() {
    let last = 0;
    for (let i = 0; i < grid.length; i++) {
      if (grid[i][0].letter !== '') last = i;
    }
    return last;
  }

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
    if (row < 5 && col < 6 && ABC.includes(key.toLowerCase()) && allow) {
      grid[col][row].changeLetter(key);
      grid[col][row].element.classList.remove('nozoom');
      grid[col][row].element.classList.add('zoom');
      const storedRow = row;
      const storedCol = col;
      setTimeout(() => {
        grid[storedCol][storedRow].element.classList.remove('zoom');
        grid[storedCol][storedRow].element.classList.add('nozoom');
      }, 100);
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
          // showAlert('Word not found');
          for (let i = 0; i < 5; i++) {
            grid[col][i].element.classList.add('shake');
            setTimeout(() => {
              grid[col][i].element.classList.remove('shake');
            }, 100);
          }
          return;
        }

        // Give information about word guessed
        const included = [];
        const gridCp = grid.slice();
        for (const row_ of gridCp) {
          for (const cell of row_) {
            cell.cp = true;
          }
        }

        for (let i = 0; i < 5; i++) {
          const letter = guess[i];
          gridCp[col][i].changeColour('grey');
          if (word.includes(letter)) {
            included.push(letter);
          }
        }

        for (let i = 0; i < 5; i++) {
          const letter = included[i];
          const idxsGuess = find(letter, guess);
          const idxsWord = find(letter, word);
          let gridTem = [undefined, undefined, undefined, undefined];
          for (let j = 0; j < idxsGuess.length; j++) {
            if (idxsWord.includes(idxsGuess[j])) {
              gridCp[col][idxsGuess[j]].changeColour('green');
              gridTem[idxsGuess[j]] = 'green';
            }
          }

          if (
            numOccurences('green', gridTem) < idxsWord.length &&
            idxsGuess.length > 0
          ) {
            const left = idxsWord.length - numOccurences('green', gridTem);
            for (
              let j = 0;
              // j < idxsGuess.length >= idxsWord.length
              //   ? idxsWord.length
              //   : idxsGuess.length;
              j <
              (idxsGuess.length >= idxsWord.length
                ? idxsWord.length
                : idxsGuess.length);
              j++
            ) {
              if (gridTem[idxsGuess[j]] !== 'green') {
                gridCp[col][idxsGuess[j]].changeColour('yellow');
              } else {
                // j--;
                continue;
              }
            }
          }
        }

        let offset = 0;
        for (let i = 0; i < 5; i++) {
          grid[col][i].element.classList.remove('reveal2');
          setTimeout(() => {
            allow = false;
            grid[lastCol()][i].element.classList.add('reveal1');
          }, offset);
          setTimeout(() => {
            grid[lastCol()][i].element.classList.remove('reveal1');
            grid[lastCol()][i].element.classList.add('reveal2');
            grid[lastCol()][i].element.classList.add(
              gridCp[lastCol()][i].colour
            );
            setTimeout(() => {
              grid[lastCol()][i].element.classList.remove('reveal2');
              if (i === 4) {
                allow = true;
                if (guess.join('') === word) {
                  let jumpOffset = 0;
                  for (let j = 0; j < 5; j++) {
                    console.log(lastCol());
                    setTimeout(() => {
                      grid[lastCol()][j].element.classList.add('jump1');
                      setTimeout(() => {
                        grid[lastCol()][j].element.classList.remove('jump1');
                        grid[lastCol()][j].element.classList.add('jump2');
                        setTimeout(() => {
                          grid[lastCol()][j].element.classList.remove('jump2');
                          if (j === 4) {
                            let text = '';
                            if (lastCol() === 0) text = 'Amazing!';
                            if (lastCol() === 1) text = 'Fantastic!';
                            if (lastCol() === 2) text = 'Impressive!';
                            if (lastCol() === 3) text = 'Well done!';
                            if (lastCol() === 4) text = 'Not bad!';
                            if (lastCol() === 5) text = 'Not great';
                            showAlert(text);

                            const gamesPlayed = getLocalStorageItem('games');
                            gamesPlayed.push({
                              date: Date(),
                              guesses: col + 1,
                              won: true,
                              word,
                            });
                            updateLocalStorageItem('games', gamesPlayed);
                            updateStats();
                            showStats();
                          }
                        }, 100);
                      }, 100);
                    }, jumpOffset);
                    jumpOffset += 100;
                  }
                }

                for (let j = 0; j < 5; j++) {
                  findKey(grid[lastCol()][j].letter).classList.remove('grey');
                  findKey(grid[lastCol()][j].letter).classList.add(
                    grid[lastCol()][j].colour
                  );
                }
              }
            }, 200);
          }, 200 + offset);
          offset += 300;
        }

        row = 0;
        col++;
        if (col === 6 && guess.join('') !== word) {
          showAlert(word.toUpperCase());

          const gamesPlayed = getLocalStorageItem('games');
          gamesPlayed.push({
            date: Date(),
            guesses: 6,
            won: false,
            word,
          });
          updateLocalStorageItem('games', gamesPlayed);
          showStats();
        }
        updateStats();
      }
    }
  }

  function restart() {
    grid = Array.from({ length: 6 }, (_, i) =>
      Array.from({ length: 5 }, (__, j) => {
        return new Square(i, j, gridEl.children[j + i * 5]);
      })
    );
    for (let i = 1; i < 99999; i++) {
      window.clearInterval(i);
      window.clearTimeout(i);
    }
    word = col !== 0 || row !== 0 ? getRandomWord() : word;
    console.log(word);
    col = 0;
    row = 0;

    for (const keyEl of keyEls) {
      keyEl.classList.remove('grey', 'yellow', 'green');
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
  constructor(i, j, element, cp) {
    this.i = i;
    this.j = j;
    this.element = element;
    this.element.innerText = '';
    this.letter = '';
    this.colour = 'empty';
    this.cp = cp || false;
    this.changeColour('empty');
    this.element.classList.remove('reveal1', 'reveal2', 'zoom', 'nozoom');
  }

  changeColour(colour) {
    this.element.classList.remove('letter');
    if (colour !== 'empty') {
      if (!this.cp) {
        this.element.classList.replace(this.colour, colour);
      }
      this.colour = colour;
    } else {
      this.element.classList.remove('grey', 'yellow', 'green');
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
