const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

function setLocalStorageItem(item, value) {
  window.localStorage.setItem(item, JSON.stringify(value));
}

function getLocalStorageItem(item, reset = true) {
  const value = JSON.parse(window.localStorage.getItem(item));
  if (!value && reset) {
    setLocalStorageItem(item, undefined);
    return getLocalStorageItem();
  } else return value;
}

if (
  urlParams.get('code') === '3141592653589' &&
  getLocalStorageItem('admin', false)
) {
  urlParams.set('code', 'haha-u-tried-to-steal-it');
  window.history.replaceState(null, null, `?${urlParams.toString()}`);
} else {
  // window.location.href = '/wordle/index.html' // prod
  window.location.href = '/index.html'; // dev
}
