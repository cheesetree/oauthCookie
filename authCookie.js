;
(function () {

	var whenReady = function (fn) { // 这个函数返回whenReady()函数
		var funcs = []; // 当获得事件时，要运行的函数
		var ready = false; // 当触发事件处理程序时,切换为true

		// 当文档就绪时,调用事件处理程序
		function handler(e) {
			if (ready)
				return; // 确保事件处理程序只完整运行一次

			// 如果发生onreadystatechange事件，但其状态不是complete的话,那么文档尚未准备好
			if (e.type === 'onreadystatechange' &&
				document.readyState !== 'complete') {
				return;
			}

			// 运行所有注册函数
			// 注意每次都要计算funcs.length
			// 以防这些函数的调用可能会导致注册更多的函数
			for (var i = 0; i < funcs.length; i++) {
				funcs[i].call(document);
			}
			// 事件处理函数完整执行,切换ready状态, 并移除所有函数
			ready = true;
			funcs = null;
		}
		// 为接收到的任何事件注册处理程序
		if (document.addEventListener) {
			document.addEventListener('DOMContentLoaded', handler, false);
			document.addEventListener('readystatechange', handler, false); // IE9+
			window.addEventListener('load', handler, false);
		} else if (document.attachEvent) {
			document.attachEvent('onreadystatechange', handler);
			window.attachEvent('onload', handler);
		}

		if (ready) {
			fn.call(document);
		} else {
			funcs.push(fn);
		}
	};

	// 截屏通讯代码
	var _oauth = function () {
		var that = this;
		this.reqEvent = '';
		this._dom = '';
		this.eventQueen = {};
		this.evnetNo = 1;

		var snd = function (msg, callback) {
			var en = that.evnetNo;
			msg["eventno"] = en;
			that.eventQueen["event" + en] = callback;
			that._dom.innerText = JSON.stringify(msg);
			that._dom.dispatchEvent(that.reqEvent);
			that.evnetNo++;
		};

		var check = function (callback) {
			if (that._dom) {
				snd({
					cmd: "heart"
				}, function (msg) {
					callback(msg);
				});
			} else {
				callback({
					ret: false,
					code: '1001'
				});
			}
		};

		this.cnt = 0;

		this.init = function () {
			var tag = document.getElementsByTagName("meta");
			if (tag && tag['oauthCookieExtension']) {
				// 生成通道
				var _domId = "_authCookieReqDiv";
				that._dom = document.createElement('div');
				that._dom.id = _domId;
				that._dom.style.display = 'none';
				document.body.appendChild(that._dom);

				// 初始化发送事件
				that.reqEvent = document.createEvent('Event');
				that.reqEvent.initEvent('authCookieRequestEvent', true, true);
				// 注册回调事件
				that._dom.addEventListener(
					'authCookieResponseEvent',
					function (event) {
						event.preventDefault();
						var res = that._dom.innerText;
						that._dom.isres = false;
						that._dom.innerText = '';
						if (res) {
							var msg = JSON.parse(res);
							if (msg.eventno) {
								var cb = that.eventQueen["event" + msg.eventno];
								delete that.eventQueen["event" + msg.eventno];
								if (cb) {
									delete msg.eventno;
									cb(msg);
								}
							}
						}
					});
			} else if (that.cnt++ < 10) {
				window.setTimeout(function () {
					_c.init();
				}, 100);
			}else{
				console.error('oauthCookie plugin is not installed');
			}
		};

		this.clear = function (callback) {
			if (that._dom) {
				snd({
					cmd: "clear"
				}, function (msg) {
					callback(msg);
				});
			} else {
				callback({
					ret: false,
					code: '1001'
				});
			}
		};

		return this;
	};

	var _c = new _oauth();

	// dom 加载完后初始化通讯
	whenReady(function () {
		_c.init();
	});

	// 注入对外调用口
	if (!window.nbwd) {
		window.nbwd = {};
	}
	window.nbwd.oauth = {};
	window.nbwd.oauth.clear = function (callback) {
		new _c.clear(callback);
	};
})();