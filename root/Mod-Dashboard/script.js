document.addEventListener('DOMContentLoaded', () => {
  if (document.referrer != `${window.location.origin}/flappy-bird/index.html` || document.referrer == window.location.href) {
    return window.location.href = 'https://youtube.com/search?search_query=Don\'t try to hack the system.';
  }

  const username = prompt('Please enter your username:');
  const password = prompt('Please enter your password:');
	const url = 'https://flappy-bird-highscore.herokuapp.com';
// // 	const url = 'http://localhost:3000';

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

    const deleteButton1 = document.getElementById('#delete-1');
    const deleteButton2 = document.getElementById('#delete-2');
    const deleteButton3 = document.getElementById('#delete-3');
    // deleteButton1.addEventListener('click', () => {
        
    // });
    
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
});
