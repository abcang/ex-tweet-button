'use strict';

(() => {
  const patterns = {
    new: 'a[href*="//twitter.com/intent/tweet"][href*="url="]',
    old: 'a[href*="//twitter.com/share"][href*="url="]',
    amazon: 'a[href*="twitter.com"][href*="intent"][href*="url"]',
    jetpack: 'a.share-twitter[href*="share=twitter"]'
  };
  const {type, element} = (() => {
    for (const [type, selector] of Object.entries(patterns)) {
      const element = document.querySelector(selector);
      if (element) {
        return {type, element};
      }
    }
    return {};
  })();

  if (!element) {
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
  })(element.getAttribute('href'));

  if (url) {
    chrome.runtime.sendMessage({type, url});
  }
})();
