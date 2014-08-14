var code = function() {
	var ret = null;
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

chrome.browserAction.onClicked.addListener(function(tab) {
	// jqueryの読み込み
	chrome.tabs.executeScript(null, {file: 'jquery.js', allFrames: true}, function() {
		// コードの実行
		chrome.tabs.executeScript(null, {code: '('+code+')()', allFrames: true}, function(res) {
			var url = 'https://twitter.com/intent/tweet?' + 'text=' + encodeURIComponent(tab.title) + '&url=' + encodeURIComponent(tab.url);
			// URLが見つかった場合変更
			if (res[0]) {
				url = res[0];
			}
			var w = 640;
			var h = 360;
			var x = (screen.width - w) / 2;
			var y = (screen.height - h) / 2;
			window.open(url, null, 'left=' + x + ',top=' + y + ',width=' + w + ',height=' + h + ',status=no');
		});
	});
});
