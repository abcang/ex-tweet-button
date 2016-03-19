(() => {
  'use strict';
  const pattern = [
    'a[href*="//twitter.com/intent/tweet"][href*="url="]', // now
    'a[href*="//twitter.com/share"][href*="url="]', // old
    'a[href*="twitter.com"][href*="intent"][href*="url"]' // amazon
  ];
  const ele = pattern.reduce((element, pat) => {
    return element || document.querySelector(pat);
  }, null);

  if (!ele) {
    return;
  }

  const url = ((href) => {
    if (href.startsWith('//')) {
      return `${location.protocol}${href}`;
    } else if (href.startsWith('/')) {
      return `${location.protocol}//${location.host}${href}`;
    } else {
      return href;
    }
  })(ele.getAttribute('href'));

  if (url) {
    chrome.runtime.sendMessage({url});
  }
})();
