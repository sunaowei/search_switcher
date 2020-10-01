new Vue({
    el: "#pageContainer",
    data: {
        dialogTitle: "编辑",
        searchList: [],
        searchData: {
            name:" ",
            link:" "
        },
        dialog: null
    },
    created: function () {
        let _this = this;
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.message === "load_all_data_complete") {
                _this.searchList = request.payload;
                if (request.payload && request.payload.length > 0){
                    request.payload.forEach(item=>{
                        _this.buildFaviconUrl(item)
                    });
                }
            }
        })
        chrome.runtime.sendMessage({message: "load_all_data"});
    },
    methods: {
        add: function () {
            this.dialogTitle = "新增"
            this.searchData = {}
            new mdui.Dialog("#editDialog").open();
        },
        edit: function (item) {
            let _this = this;
            this.dialogTitle = "修改"
            chrome.runtime.sendMessage({message: "get_data", payload: item.id}, null, function (data) {
                _this.searchData = data;
                new mdui.Dialog("#editDialog").open();
            });
        },
        deleteData: function (item) {
            // TODO: 需要加一个确认删除 By:🍄 2020/9/14 21:17
            chrome.runtime.sendMessage({message: "delete_data", payload: item.id}, null, function (data) {
                if (data) {
                    alert("删除成功")
                    chrome.runtime.sendMessage({message: "load_all_data"});
                } else {
                    alert("删除失败")
                }
            });
        },
        openedDialog: function () {
            mdui.updateTextFields();
        },
        save: function () {
            if (this.searchData.id) {
                chrome.runtime.sendMessage({message: "update_data", payload: [this.searchData]}, null, function () {
                    alert("更新成功");
                    chrome.runtime.sendMessage({message: "load_all_data"});
                });
            } else {
                this.searchData.enableStatus = true;
                chrome.runtime.sendMessage({message: "insert_data", payload: [this.searchData]}, null, function () {
                    alert("保存成功");
                    chrome.runtime.sendMessage({message: "load_all_data"});
                });
            }
        },
        changeStatus: function (item) {
            chrome.runtime.sendMessage({message: "update_data", payload: [item]}, null);
        },
        buildFaviconUrl:function (item){
            try {
                let url = new URL(item.link);
                item.faviconUrl = url.protocol + "//" + url.host + "/favicon.ico";
            } catch (e) {
                item.faviconUrl = "/static/img/icon-48.png"
                console.error(e);
            }
        },
        githubClick:function (){
            window.open("https://github.com/sunaowei/search_switcher",'_blank');
        }
    }
});
