new Vue({
    el: "#page",
    data: {
        linkData: [],
        currentLinkData: {},
        keyword: "",
        currentTabUrl: ""
    },
    created: function () {
        let _this = this;

        _this.getCurrentTab().then(tab => {
            _this.currentTabUrl = tab.url
        }).then(() => {
            chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
                if (request.message === "load_all_data_complete") {
                    request.payload.forEach(item => {
                        if (!item.favicon) {
                            item.favicon = "/static/img/icon-48.png"
                        }
                        item.hostname = _this.getHostName(item.link)
                        if (item.hostname === _this.getHostName(_this.currentTabUrl)) {
                            _this.currentLinkData = item;
                        } else {
                            _this.linkData.push(item);
                        }
                    })
                }
            })
        }).then(() => {
            chrome.runtime.sendMessage({message: "load_all_data"});
        })

    },
    methods: {

        /**
         * 变更搜索
         *
         * @param item
         */
        changeSearch: function (item) {
            let keywordKey = this.getKeywordKey();
            let keyword = ""
            if (keywordKey) {
                keyword = this.getKeywordFromUrl(keywordKey) || "";
            }
            // 更新tab页面
            chrome.tabs.update({url: item.link.replace("%s", keyword)})
        },

        /**
         * 从链接中获取关键词
         *
         * @param keywordKey
         * @returns {string}
         */
        getKeywordFromUrl: function (keywordKey) {
            return new URL(this.currentTabUrl).searchParams.get(keywordKey)
        },

        /**
         * 获取关键词所在的key
         *
         * @returns {null}
         */
        getKeywordKey: function () {
            let keywordKey = null;
            new URL(this.currentLinkData.link).searchParams.forEach((value, key) => {
                if (value === "%s") {
                    keywordKey = key;
                }
            })
            return keywordKey;
        },

        /**
         * 解析URL中的host name
         * @param urlStr
         * @returns {string}
         */
        getHostName: function (urlStr) {
            let url = new URL(urlStr);
            return url.hostname.replace("www.", "");
        },

        /**
         * 获取当前Window 激活的Tab页面
         *
         * @returns {Promise<unknown>}
         */
        getCurrentTab: function () {
            return new Promise(((resolve, reject) => {
                try {
                    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                        if (tabs[0] && tabs[0].url) {
                            // 获取hostname
                            resolve(tabs[0])
                        }
                    })
                } catch (e) {
                    reject(e)
                }
            }))
        }
    }
})
