var code = function() {
	var ret = null;
	// amazon
	var ele = $('[href*="twitter.com"][href*="intent"][href*="tweet"][href*="url"]');
	if (ele) {
		var url = ele.attr('href');
		if (url) {
			ret = url;
			if (!ret.match(/^http/)) {
				ret = location.protocol + '//' + location.host + (ret[0] == '/' ? '' : '/') + ret;
			}
			return ret;
		}
	}

/*
	// youtube
	// 共有ボタンクリック後にTweetButtonのリンクが生成されるため、現状難しい
	if (location.href.match(/^http:\/\/www.youtube.com\/watch\?v=/)) {
		$('[data-trigger-for="action-panel-share"]').click();
		ele = $('[onclick*="twitter.com"][onclick*="intent"][onclick*="tweet"][onclick*="url"]');
		if (ele && ele.attr('onclick')) {
			ele.click();
			return null;
		}
	}
*/

	$('iframe').each(function() {
		var body = this.contentWindow.document.body;
		// iframe内から該当URLを探す
		var url = body.innerHTML.match(/https:\/\/twitter.com\/intent\/tweet\?[^\"]+/g);
		// url= を含むもののみ許可
		if (url && url.toString().match(/url=/)) {
			// マッチしたら文字列に変換して、&を元に戻す
			ret = url.toString().split('&amp;').join('&');
			return false;
		}
	});
	// retrunすることでcallbackで値を受け取れる
	return ret;
};

var openWindow = function(url) {
	var w = 640;
	var h = 360;
	var x = (screen.width - w) / 2;
	var y = (screen.height - h) / 2;
	window.open(url, null, 'left=' + x + ',top=' + y + ',width=' + w + ',height=' + h + ',status=no');
};

chrome.browserAction.onClicked.addListener(function(tab) {
	var url = 'https://twitter.com/intent/tweet?' + 'text=' + encodeURIComponent(tab.title) + '&url=' + encodeURIComponent(tab.url);
	if (tab.url.match(/^https:\/\/chrome.google.com\/webstore\//)) {
		openWindow(url);
	} else {
		// jqueryの読み込み
		chrome.tabs.executeScript(null, {file: 'jquery.js', allFrames: true}, function() {
			// コードの実行
			chrome.tabs.executeScript(null, {code: '('+code+')()', allFrames: true}, function(res) {
				// URLが見つかった場合変更
				if (res[0]) {
					url = res[0];
				}
				openWindow(url);
			});
		});
	}
});
