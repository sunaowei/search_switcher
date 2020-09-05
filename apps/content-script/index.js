/**
 * FeHelper Content Scripts Manager
 * @author zhaoxianlie
 */

// Tarp.require.config初始化
(() => {
    let absPath = (() => {
        let stack;
        try {
            a.b();
        }
        catch (e) {
            stack = e.fileName || e.sourceURL || e.stack || e.stacktrace;
        }
        if (stack) {
            return /((?:http|https|file|chrome-extension):\/\/.*?\/[^:]+)(?::\d+)?:\d+/.exec(stack)[1];
        }
    })();
    Tarp.require.config = {
        paths: [absPath],
        uri: absPath
    };
})();

// 在tab创建或者更新时候，监听事件，看看是否有参数传递过来
chrome.runtime.onMessage.addListener(function (request, sender, callback) {

    switch (request.type) {
        // // JSON页面自动格式化
        // case MSG_TYPE.JSON_PAGE_FORMAT:
        //     Tarp1.require('../json-format/automatic').format(request.options);
        //     break;
        //
        // // js、css页面自动检测，提示格式化
        // case MSG_TYPE.JS_CSS_PAGE_BEAUTIFY:
        //     Tarp1.require('../code-beautify/automatic', true).then(beautifier => beautifier.detect(request.content));
        //     break;
        //
        // // 二维码解码
        // case MSG_TYPE.QR_DECODE:
        //     Tarp1.require('../qr-code/decode', true).then(qrcode => qrcode.show(request.result));
        //     break;
        //
        // // 全屏截图
        // case MSG_TYPE.PAGE_CAPTURE_SCROLL:
        //     Tarp1.require('../page-capture/inject', true).then(page => page.scroll(callback));
        //     break;
        //
        // // 页面性能检测
        // case MSG_TYPE.GET_PAGE_WPO_INFO:
        //     Tarp1.require('../wpo/inject', true).then(wpo => {
        //         (function check() {
        //             (document.readyState === "complete") ? wpo.getWpoInfo() : setTimeout(check, 500);
        //         })()
        //     });
        //     break;
        //
        // // 页面取色工具 color picker
        // case MSG_TYPE.SHOW_COLOR_PICKER:
        //     Tarp1.require('../color-picker/index', true).then(picker => picker.handler(request, sender, callback));
        //     break;
        //
        // // 编码规范检测
        // case MSG_TYPE.CODE_STANDARDS:
        //     Tarp1.require('../code-standards/index', true).then(cs => {
        //         if (request.event === MSG_TYPE.FCP_HELPER_INIT) {
        //             cs.init();
        //         } else if (MSG_TYPE.FCP_HELPER_DETECT) {
        //             cs.detect();
        //         }
        //     });
        //     break;
        //
        // // 屏幕栅格标尺
        // case MSG_TYPE.GRID_RULER:
        //     Tarp1.require('../ruler/index',true).then(ruler => ruler.detect(callback));
        //     break;
    }

});
