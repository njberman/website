document.addEventListener('DOMContentLoaded', () => {
  if (document.referrer != `${window.location.origin}/flappy-bird/index.html` || document.referrer == window.location.href) {
    return window.location.href = 'https://youtube.com/search?search_query=Don\'t try to hack the system.';
  }

  const username = prompt('Please enter your username:');
  const password = prompt('Please enter your password:');
	const url = 'https://flappy-bird-highscore.herokuapp.com';
	// const url = 'http://localhost:3000';

  fetch(url + '/login-dashboard', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password }),
  })
    .then((res) => {
      if (res.status == 400) window.location.href = window.location.origin;
      else return;
    })
    .catch(console.error);

    const deleteButtons = ['1', '2', '3'].map((n) => document.getElementById('delete-' + n));
    deleteButtons.forEach((button, i) => {
      button.addEventListener('click', () => {
        const name = button.parentElement.parentElement.children[0].innerText;
	const score = button.parentElement.parentElement.children[1].innerText;
        fetch(url + '/mods/delete-name', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name, score }),
        })
          .then(() => getLeaderboard())
          .catch(console.error);
      });
    });

    const newUserNameInput = document.getElementById('new-user');
    const newUserScoreInput = document.getElementById('new-user-score');
    const addUserButton = document.getElementById('add-new-user');

    addUserButton.addEventListener('click', () => {
      if (newUserNameInput.value != null && newUserNameInput.value.length >= 3 && newUserNameInput.value.length <= 30) {
        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: newUserNameInput.value, score: newUserScoreInput.value, createdBy: username }),
        })
          .then(() => getLeaderboard())
          .catch(console.error);
      }
    });

    getLeaderboard();
    setInterval(getLeaderboard, 2500);
    
    function getLeaderboard() {
      fetch(url)
          .then((res) => res.json())
          .then((json) => {
              const tings = [
                  [document.getElementById('score-score-1'), document.getElementById('score-name-1')],
                  [document.getElementById('score-score-2'), document.getElementById('score-name-2')],
                  [document.getElementById('score-score-3'), document.getElementById('score-name-3')]
              ];

              json.forEach((score, i) => {
                  tings[i][0].innerText = score.score;
                  tings[i][1].innerText = score.name;
              });
          })
          .catch(console.error);
    }
});
