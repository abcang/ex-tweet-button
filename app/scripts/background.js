'use strict';

// Enable chromereload by uncommenting this line:
//require('./lib/livereload');

(() => {
  class Background {
    constructor() {
      this.addListener();
      this.tabs = new Map();
    }

    addListener() {
      chrome.browserAction.onClicked.addListener((tab) => this.onClicked(tab));
      chrome.runtime.onMessage.addListener((request, sender) => {
        this.openTweetWindow(request.url, sender.tab);
      });
    }

    onClicked(tab) {
      this.tabs.set(tab.id, true);
      if (!tab.url.startsWith('chrome:')) {
        chrome.tabs.executeScript(null, {file: 'scripts/inject.js', allFrames: true}, () => {
          const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tab.title)}&url=${encodeURIComponent(tab.url)}`;
          this.openTweetWindow(url, tab);
        });
      }
    }

    openTweetWindow(url, tab) {
      if (this.tabs.has(tab.id)) {
        this.tabs.delete(tab.id);
        this.openWindow(url);
      }
    }

    openWindow(url) {
      const w = 640;
      const h = 360;
      const x = (screen.width - w) / 2;
      const y = (screen.height - h) / 2;
      window.open(url, null, `left=${x},top=${y},width=${w},height=${h},status=no`);
    };
  }
  window.bg = new Background();
})();
