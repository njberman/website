document.addEventListener('DOMContentLoaded', () => {
  if (document.referrer != `${window.location.origin}/flappy-bird/index.html` || document.referrer == window.location.href) {
    return window.location.href = 'https://youtube.com/search?search_query=Don\'t try to hack the system.';
  }

  const username = prompt('Please enter your username:');
  const password = prompt('Please enter your password:');
	// const url = 'https://flappy-bird-highscore.herokuapp.com';
	const url = 'http://localhost:3000';

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
});
