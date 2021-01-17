(function () {
    //注册与content交互事件
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.cmd) {
            switch (request.cmd) {
                case "clear":
                    chrome.cookies.getAll({
                        domain: 'alipay.com'
                    }, function (cs) {
                        for (c of cs) {
                            var url = "http" + (c.secure ? "s" : "") + "://" + c.domain +
                                c.path;
                            chrome.cookies.remove({
                                "url": url,
                                "name": c.name
                            });
                        }
                    });
                    break;
            }
        }

        return true;
    });

})();