module.exports = (() => {
    let _init = async function () {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            const scriptToExec = `(${showPassword})()`;
            chrome.tabs.executeScript(tabs[0].id, {code: scriptToExec}, function (result) {

            });
        });

        function showPassword() {

            Array.from(document.querySelectorAll('input[type=password]')).forEach(item => {
                item.setAttribute("type", "text")
            })
            Array.from(document.getElementsByTagName("iframe")).forEach(iframe => {
                if (iframe.contentDocument) {
                    Array.from(iframe.contentDocument.querySelectorAll('input[type=password]')).forEach(item => {
                        item.setAttribute("type", "text")
                    })
                }
            })

        }
    }

    return {
        init: _init
    }
})()


