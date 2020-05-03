'use strict';

(() => {
  class Background {
    constructor() {
      this.addListener();
      this.tabs = new Map();
    }

    addListener() {
      chrome.browserAction.onClicked.addListener((tab) => this.onClicked(tab));
      chrome.runtime.onMessage.addListener((request, sender) => {
        this.openTweetWindow(request, sender.tab);
      });
    }

    onClicked(tab) {
      if (!tab.url.startsWith('chrome:')) {
        const parsed = new URL(tab.url);
        this.tabs.set(tab.id, parsed.href.replace((parsed.search || '') + (parsed.hash || ''), ''));
        chrome.tabs.executeScript(null, {file: 'inject.js', allFrames: true}, () => {
          const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tab.title)}&url=${encodeURIComponent(tab.url)}`;
          this.openTweetWindow({type: 'default', url}, tab);
        });
      }
    }

    openTweetWindow(request, tab) {
      if (this.checkIdAndURL(tab.id, request)) {
        this.openWindow(request.url);
      }
    }

    checkIdAndURL(id, request) {
      if (this.tabs.has(id)) {
        console.log(request)
        const parsed = new URL(request.url);
        console.log(parsed)

        if (['default', 'new', 'old'].includes(request.type)) {
          // 開いているページのURLから始まる or URLの最後が一致(for niconico)
          const url = parsed.searchParams.get('url')
          if (url && (url.startsWith(this.tabs.get(id)) ||
              url.match(/([^/]+)\/?$/)[1] === this.tabs.get(id).match(/([^/]+)\/?$/)[1])) {
            this.tabs.delete(id);
            return true;
          }
        }

        //amazonとjetpackはとりあえず許可
        if (['amazon', 'jetpack'].includes(request.type)) {
          this.tabs.delete(id);
          return true;
        }
      }
      return false
    }

    openWindow(url) {
      const w = 640;
      const h = 360;
      const x = (screen.width - w) / 2;
      const y = (screen.height - h) / 2;
      window.open(url, null, `left=${x},top=${y},width=${w},height=${h},status=no`);
    }
  }
  window.bg = new Background();
})();
