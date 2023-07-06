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

  // Get allowed words
  const file = await getFile('../data/possible_words.txt');
  const possibleWords = file.split('\n');

  const word = possibleWords[Math.floor(Math.random() * possibleWords.length)];

  // Set up grid
  const gridEl = document.querySelector('.grid');

  for (let i = 0; i < 30; i++) {
    const squareEl = document.createElement('div');
    squareEl.classList.add('square', 'empty');
    squareEl.id = `cell${i}`;
    gridEl.appendChild(squareEl);
  }

  const grid = Array.from({ length: 6 }, (_, i) =>
    Array.from(
      { length: 5 },
      (__, j) => new Square(i, j, gridEl.children[j + i * 5])
    )
  );

  let row = 0;
  let col = 0;

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace') {
      if (row !== 0) {
        row--;
        grid[col][row].changeLetter('');
      }
    } else if (e.key === 'Enter') {
      if (row === 5) {
        if (col !== 6) {
          const guess = Array.from({ length: 5 }, (_, i) =>
            grid[col][i].letter.toLowerCase()
          );
          // Check if word is in given databse of words
          if (!possibleWords.includes(guess.join(''))) {
            showAlert('Word not allowed');
            return;
          }

          // Give information about word guessed
          const included = [];
          for (let i = 0; i < 5; i++) {
            const letter = guess[i];
            grid[col][i].changeColour('grey');
            if (word.includes(letter)) {
              grid[col][i].changeColour('yellow');
              included.push(letter);
            }
            if (letter === word[i]) {
              grid[col][i].changeColour('green');
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
    } else {
      if (row <= 4 && ABC.includes(e.key.toLowerCase())) {
        grid[col][row].changeLetter(e.key);
        row++;
      }
    }
  });
});

class Square {
  constructor(i, j, element) {
    this.i = i;
    this.j = j;
    this.element = element;
    this.letter = '';
    this.colour = 'empty';
  }

  changeColour(colour) {
    this.element.classList.remove('letter');
    this.element.classList.replace(this.colour, colour);
    this.colour = colour;
  }

  changeLetter(letter) {
    letter = letter.toUpperCase();
    this.letter = letter;
    this.element.innerText = letter;
    if (letter !== '') {
      this.element.classList.add('letter');
    }
  }
}
