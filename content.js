(function () {
	var respQueen = {};
	var reqQueen = {};

	//注册与页面交互事件
	var respEvent = document.createEvent('Event');
	respEvent.initEvent('authCookieResponseEvent', true, true);
	var _dom = document.getElementById('_authCookieReqDiv');

	var snd = function (cmd, en, resp) {
		var issend = false;
		if (_dom.isres == false) {
			var respmsg = {
				eventno: en,
				ret: true,
				code: '',
				result: resp
			};
			_dom.innerText = JSON.stringify(respmsg);
			_dom.dispatchEvent(respEvent);
			delete reqQueen[cmd][en];
			issend = true;
		} else {
			//加入处理队列
			respQueen[en] = resp;
		}

		return issend;
	};

	var timer = function () {
		for (var name in respQueen) {
			var issnd = snd();
			if (issnd) {
				delete respQueen[name];
			} else {
				break;
			}
		}

		window.setTimeout(function () {
			timer();
		}, 1000);
	}

	var oMeta = document.createElement('meta');
	oMeta.name = 'oauthCookieExtension';
	oMeta.content= chrome.runtime.getManifest().version;
	document.getElementsByTagName('head')[0].appendChild(oMeta);

	var init = function () {
		_dom = document.getElementById('_authCookieReqDiv');
		if (_dom) {
			oMeta.setAttribute('isready',true);
			_dom.isres = false;
			_dom.addEventListener('authCookieRequestEvent', function (event) {
				event.preventDefault();
				var msg = _dom.innerText;
				if (msg) {
					var resp = JSON.parse(msg);
					if (resp && resp.cmd) {
						if (!reqQueen[resp.cmd])
							reqQueen[resp.cmd] = {};
						reqQueen[resp.cmd][resp.eventno] = {};

						switch (resp.cmd) {
							case "heart":
								snd(resp.cmd, resp.eventno, 'ok');
								break;
							case "clear":
								chrome.extension.sendMessage({
									cmd: 'clear',
									data: {
										eventno: resp.eventno
									}
								}, function (response) {});
								break;
						}
					}
				}
			});

			chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
				switch (request.cmd) {
					default:
						sendResponse({});
						break;
				}
			});
		} else {
			window.setTimeout(function () {
				init();
			}, 1000);
		}
	};

	timer();

	init();

})();