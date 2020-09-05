new Vue({
    el: "#pageContainer",
    data: {
        "searchList": {}
    },
    created: function () {
        // 加载工具类
        Tarp.require({main: "init_search.json", paths: ['/static/js/']}).then(result => {
            this.searchList = result;
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                if (tabs && tabs[0] && tabs[0].url) {
                    let hostName = new URL(tabs[0].url).hostname.replace("www.", "");
                    document.getElementById(hostName) ? document.getElementById(hostName).style.display = 'none' : ''
                }
            });
        });
    },
    methods: {
        runHelper: function (mType, useFile) {
            // 获取后台页面，返回window对象
            let bgPage = chrome.extension.getBackgroundPage();
            Tarp.require({main: 'msg_type', paths: ['/static/js/']}).then(MSG_TYPE => {
                bgPage.BgPageInstance.runHelper({
                    msgType: useFile === 1 ? MSG_TYPE[mType] : mType,
                    useFile: useFile
                });
            });

            // window.close();
        },
        openOptionsPage: () => chrome.runtime.openOptionsPage()
    },

});
