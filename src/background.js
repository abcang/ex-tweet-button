'use strict';

(() => {
  async function sleep(ms) {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, ms);
    });
  }

  function extractUrl(baseUrl) {
    const patterns = {
      new: 'a[href*="//twitter.com/intent/tweet"][href*="url="]',
      old: 'a[href*="//twitter.com/share"][href*="url="]',
      amazon: 'a[href*="twitter.com"][href*="intent"][href*="url"]',
      jetpack: 'a.share-twitter[href*="share=twitter"]'
    };

    for (const [type, selector] of Object.entries(patterns)) {
      const element = document.querySelector(selector);
      if (!element) {
        continue;
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

      if (!url) {
        continue;
      }

      //amazonとjetpackはとりあえず許可
      if (['amazon', 'jetpack'].includes(type)) {
        chrome.runtime.sendMessage({type, url})
        return;
      }

      const parsed = new URL(url);
      const linkUrl = parsed.searchParams.get('url');
      if (linkUrl && linkUrl.startsWith(baseUrl)) {
        chrome.runtime.sendMessage({type, url});
      }
    }
  }

  function openWindow(url) {
    const w = 640;
    const h = 360;
    const x = (window.screen.width - w) / 2;
    const y = (window.screen.height - h) / 2;
    window.open(url, null, `left=${x},top=${y},width=${w},height=${h},status=no`);
  }

  class Background {
    constructor() {
      this.tabs = new Map();
      chrome.action.onClicked.addListener((tab) => this.onClicked(tab));
      chrome.runtime.onMessage.addListener(({type, url}, sender) => {
        console.log({type, url});
        const candidates = this.tabs.get(sender.tab.id);
        if (candidates) {
          candidates.push(url);
        }
        return true;
      });
    }

    async onClicked(tab) {
      if (tab.url.startsWith('chrome:')) {
        return;
      }

      const candidates = [];
      this.tabs.set(tab.id, candidates);

      const parsed = new URL(tab.url);
      const baseUrl = parsed.href.replace((parsed.search || '') + (parsed.hash || ''), '');

      // promiseが返ってこないiframeが存在するのでonMessage経由で処理をする
      chrome.scripting.executeScript({
        target: {tabId: tab.id, allFrames: true},
        func: extractUrl,
        args: [baseUrl]
      });

      await sleep(500)

      this.tabs.delete(tab.id);

      if (candidates.length === 0) {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tab.title)}&url=${encodeURIComponent(tab.url)}`;
        this.openWindow(tab, url);
        return;
      }

      // 詳細な情報を含んでいるのはURLが長い方と判断
      candidates.sort((a, b) => b.length - a.length)
      this.openWindow(tab, candidates[0]);
    }

    openWindow(tab, url) {
      void chrome.scripting.executeScript({
        target: {tabId: tab.id},
        args: [url],
        func: openWindow
      });
    }
  }
  new Background();
})();
