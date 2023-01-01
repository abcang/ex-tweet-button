"use strict";

(() => {
  async function sleep(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  function extractUrl(baseOrigin: string) {
    const patterns = {
      new: 'a[href*="//twitter.com/intent/tweet"][href*="url="]',
      old: 'a[href*="//twitter.com/share"][href*="url="]',
      amazon: 'a[href^="/"][href*="twitter.com"][href*="intent"][href*="url"]',
      jetpack: 'a.share-twitter[href*="share=twitter"]',
    };

    for (const [type, selector] of Object.entries(patterns)) {
      const element = document.querySelector(selector);
      if (!element) {
        continue;
      }

      const url = ((href: string | null) => {
        if (!href) {
          return null;
        }

        if (href.startsWith("//")) {
          return `${location.protocol}${href}`;
        } else if (href.startsWith("/")) {
          return `${location.protocol}//${location.host}${href}`;
        } else {
          return href;
        }
      })(element.getAttribute("href"));

      if (!url) {
        continue;
      }

      //amazonとjetpackはとりあえず許可
      if (["amazon", "jetpack"].includes(type)) {
        void chrome.runtime.sendMessage({ type, url });
        return;
      }

      const parsed = new URL(url);
      const linkUrl = parsed.searchParams.get("url");
      if (linkUrl && linkUrl.startsWith(baseOrigin)) {
        void chrome.runtime.sendMessage({ type, url });
      }
    }
  }

  function openWindow(url: string) {
    const w = 640;
    const h = 360;
    const x = (window.screen.width - w) / 2;
    const y = (window.screen.height - h) / 2;
    window.open(
      url,
      undefined,
      `left=${x},top=${y},width=${w},height=${h},status=no`
    );
  }

  class Background {
    tabs: Map<number, string[]>;

    constructor() {
      this.tabs = new Map();
      chrome.action.onClicked.addListener((tab) => void this.onClicked(tab));
      chrome.runtime.onMessage.addListener(
        ({ url }: { type: string; url: string }, sender) => {
          const tabId = sender.tab?.id;
          if (tabId !== undefined) {
            const candidates = this.tabs.get(tabId);
            if (candidates) {
              candidates.push(url);
            }
          }

          return true;
        }
      );
    }

    async onClicked(tab: chrome.tabs.Tab) {
      const tabId = tab.id;
      if (tabId === undefined) {
        return;
      }
      if (!tab.url || tab.url.startsWith("chrome:")) {
        return;
      }

      const candidates: string[] = [];
      this.tabs.set(tabId, candidates);

      const parsed = new URL(tab.url);
      const baseOrigin = parsed.origin;

      // promiseが返ってこないiframeが存在するのでonMessage経由で処理をする
      void chrome.scripting.executeScript({
        target: { tabId, allFrames: true },
        func: extractUrl,
        args: [baseOrigin],
      });

      await sleep(500);

      this.tabs.delete(tabId);

      if (candidates.length === 0) {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          tab.title || ""
        )}&url=${encodeURIComponent(tab.url)}`;
        this.openWindow(tabId, url);
        return;
      }

      // 詳細な情報を含んでいるのはURLが長い方と判断
      candidates.sort((a, b) => b.length - a.length);
      this.openWindow(tabId, candidates[0]);
    }

    openWindow(tabId: number, url: string) {
      void chrome.scripting.executeScript({
        target: { tabId },
        args: [url],
        func: openWindow,
      });
    }
  }
  new Background();
})();
