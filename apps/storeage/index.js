var db;

function createDatabase(callback) {
    const request = window.indexedDB.open("search_switcher", 1)

    request.onerror = function (event) {
        console.error("open db error ~", event)
    }
    request.onupgradeneeded = function (event) {
        db = event.target.result;
        const objectStore = db.createObjectStore("search_data", {keyPath: 'id', autoIncrement: true});
        objectStore.transaction.oncomplete = function (event) {
            console.log("Object Store create success");
            callback();
        }
    }

    request.onsuccess = function (event) {
        db = event.target.result;
        console.log("open db success");
        db.onerror = function (event) {
            console.error("db error", event)
        }
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
    if (db) {
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
}

function getData(id) {
    if (db) {
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
}

function loadAllData() {
    if (db) {
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
    }else{
        alert("插件bug" + db)
    }
}

function deleteData(id) {
    if (db) {
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
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "insert_data") {
        insertData(request.payload).then(res => {
            chrome.runtime.sendMessage({
                message: "insert_data_complete",
                payload: res
            })
            sendResponse(res);
        })
    }else if (request.message === "update_data") {
        updateData(request.payload).then(res => {
            chrome.runtime.sendMessage({
                message: "update_data_complete",
                payload: res
            })
            sendResponse(res);
        })
    } else if (request.message === "get_data") {
        getData(request.payload).then(res => {
            chrome.runtime.sendMessage({
                message: "get_data_complete",
                payload: res
            })
            console.log(new Date().getTime())
            sendResponse(res)
        })
    } else if (request.message === "load_all_data") {
        loadAllData().then(res => {
            chrome.runtime.sendMessage({
                message: "load_all_data_complete",
                payload: res
            })
            sendResponse(res);
        })
    } else if (request.message === "delete_data") {
        deleteData(request.payload).then(res => {
            chrome.runtime.sendMessage({
                message: "delete_data_complete",
                payload: res
            })
            sendResponse(res);
        })
    }
    return true;
})


chrome.runtime.onInstalled.addListener(function () {
    createDatabase(()=> {
        insertData([
                {
                    "name": "Baidu",
                    "link": "https://www.baidu.com/s?ie=UTF-8&wd=%s",
                    "favicon":"https://www.baidu.com/favicon.ico"
                },
                {
                    "name": "Google",
                    "link": "https://www.google.com/search?q=%s",
                    "favicon":"https://www.google.com/favicon.ico"
                },
                {
                    "name": "Bing",
                    "link": "https://cn.bing.com/search?q=%s",
                    "favicon": "https://cn.bing.com//favicon.ico",
                },
                {
                    "name": "DuckDuckGo",
                    "link": "https://duckduckgo.com/?q=%s",
                    "favicon":"https://duckduckgo.com/favicon.ico"
                }
            ]
        )
    });
});


