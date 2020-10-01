let db;

function createDatabase(successCallBack, upgradeCallBack) {
    const request = window.indexedDB.open("search_switcher", 1)

    request.onerror = function (event) {
        console.error("open db error ~", event)
    }
    request.onupgradeneeded = function (event) {
        db = event.target.result;
        const objectStore = db.createObjectStore("search_data", {keyPath: 'id', autoIncrement: true});
        objectStore.transaction.oncomplete = function (event) {
            console.log("Object Store create success");
            upgradeCallBack && upgradeCallBack()
        }
    }

    request.onsuccess = function (event) {
        db = event.target.result;
        console.log("open db success");
        db.onerror = function (event) {
            console.error("db error", event)
        }
        successCallBack && successCallBack();
    }
}

function insertData(records) {
    if (db) {
        let transaction = db.transaction("search_data", "readwrite");
        let objectStore = transaction.objectStore("search_data");

        return new Promise(((resolve, reject) => {

            transaction.onerror = function (event) {
                console.error("insert data error", event);
                resolve(false);
            }
            records.forEach(item => {
                let request = objectStore.add(item);
                request.onsuccess = function () {
                    resolve(true);
                }
            })
        }))
    }
}

function updateData(records) {
    let transaction = db.transaction("search_data", "readwrite");
    let objectStore = transaction.objectStore("search_data");

    return new Promise(((resolve, reject) => {

        transaction.onerror = function (event) {
            console.error("update data error", event);
            resolve(false);
        }
        records.forEach(item => {
            let request = objectStore.put(item);
            request.onsuccess = function () {
                resolve(true);
            }
        })
    }))
}

function getData(id) {
    let transaction = db.transaction("search_data", "readonly");
    let objectStore = transaction.objectStore("search_data");

    return new Promise(((resolve, reject) => {
        transaction.onerror = function (event) {
            console.error("get data error", event);
            resolve(null);
        }

        let request = objectStore.get(id);
        request.onsuccess = function (event) {
            resolve(event.target.result);
        }
    }))
}

function loadAllData() {
    let transaction = db.transaction(['search_data'], "readonly");
    let objectStore = transaction.objectStore("search_data");

    return new Promise(((resolve, reject) => {
        transaction.onerror = function (event) {
            console.error("load data error", event);
            resolve(null);
        }

        let request = objectStore.getAll();
        request.onsuccess = function (event) {
            resolve(event.target.result);
        }
    }))
}

function deleteData(id) {
    let transaction = db.transaction("search_data", "readwrite");
    let objectStore = transaction.objectStore("search_data");

    return new Promise(((resolve, reject) => {
        transaction.onerror = function (event) {
            console.error("delete data error", event);
            resolve(false);
        }

        let request = objectStore.delete(id);
        request.onsuccess = function (event) {
            resolve(true);
        }
    }))
}

function execDBFunction(func) {
    if (!db) {
        createDatabase(func, null);
    } else {
        func();
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "insert_data") {
        execDBFunction(function () {
            insertData(request.payload).then(res => {
                chrome.runtime.sendMessage({
                    message: "insert_data_complete",
                    payload: res
                })
                sendResponse(res);
            })
        })
    } else if (request.message === "update_data") {
        execDBFunction(function () {
            updateData(request.payload).then(res => {
                chrome.runtime.sendMessage({
                    message: "update_data_complete",
                    payload: res
                })
                sendResponse(res);
            })
        })
    } else if (request.message === "get_data") {
        execDBFunction(function () {
            getData(request.payload).then(res => {
                chrome.runtime.sendMessage({
                    message: "get_data_complete",
                    payload: res
                })
                sendResponse(res)
            })
        })
    } else if (request.message === "load_all_data") {
        execDBFunction(function () {
            loadAllData().then(res => {
                chrome.runtime.sendMessage({
                    message: "load_all_data_complete",
                    payload: res
                })
                sendResponse(res);
            })
        })
    } else if (request.message === "delete_data") {
        execDBFunction(function () {
            deleteData(request.payload).then(res => {
                chrome.runtime.sendMessage({
                    message: "delete_data_complete",
                    payload: res
                })
                sendResponse(res);
            })
        })
    }
    return true;
})

chrome.runtime.onInstalled.addListener(function () {
    createDatabase(null, () => {
        insertData([
                {
                    "name": "Baidu",
                    "link": "https://www.baidu.com/s?ie=UTF-8&wd=%s",
                    "enableStatus":true
                },
                {
                    "name": "Google",
                    "link": "https://www.google.com/search?q=%s",
                    "enableStatus":true
                },
                {
                    "name": "Bing",
                    "link": "https://cn.bing.com/search?q=%s",
                    "enableStatus":true
                },
                {
                    "name": "DuckDuckGo",
                    "link": "https://duckduckgo.com/?q=%s",
                    "enableStatus":true
                },
                {
                    "name": "JD.com",
                    "link": "https://search.jd.com/Search?keyword=%s&enc=utf-8",
                    "enableStatus":true
                }
            ]
        )
    });
});


