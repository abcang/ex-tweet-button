'use strict';

const $ = require('jquery');

// iframe
(() => {
  const ele = $('#widget a')[0]
  if (ele) {
    const url = ele.getAttribute('href');
    chrome.runtime.sendMessage({url});
  }
})();

// direct or amazon
(() => {
  const ele = $('[href*="twitter.com"][href*="intent"][href*="tweet"][href*="url"]')[0];
  if (ele) {
    let url = ele.getAttribute('href');
    if (!url.match(/^http/)) {
      url = `${location.protocol}//${location.host}${(url[0] == '/' ? '' : '/')}${url}`;
    }
    chrome.runtime.sendMessage({url});
  }
})();
