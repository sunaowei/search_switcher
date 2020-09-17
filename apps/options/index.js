new Vue({
    el: "#pageContainer",
    data: {
        dialogTitle: "编辑",
        searchList: [],
        searchData: {},
        dialog: null
    },
    created: function () {
        let _this = this;
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.message === "load_all_data_complete") {
                _this.searchList = request.payload;
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
        }
    }
});
