'use strict';

// Enable chromereload by uncommenting this line:
//require('./lib/livereload');

const URL = require('url');

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
      if (!tab.url.startsWith('chrome:')) {
        const parsed = URL.parse(tab.url);
        this.tabs.set(tab.id, parsed.href.replace((parsed.search || '') + (parsed.hash || ''), ''));
        chrome.tabs.executeScript(null, {file: 'scripts/inject.js', allFrames: true}, () => {
          const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tab.title)}&url=${encodeURIComponent(tab.url)}`;
          this.openTweetWindow(url, tab);
        });
      }
    }

    openTweetWindow(url, tab) {
      if (this.checkIdAndURL(tab.id, url)) {
        this.openWindow(url);
      }
    }

    checkIdAndURL(id, url) {
      if (this.tabs.has(id)) {
        const parsed = URL.parse(url, true);

        if (parsed.query.url && parsed.query.url.startsWith(this.tabs.get(id))) {
          this.tabs.delete(id);
          return true;
        }

        //amazonはとりあえず許可
        if (parsed.query.location) {
          this.tabs.delete(id);
          return true;
        }
      } else {
        return false
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
