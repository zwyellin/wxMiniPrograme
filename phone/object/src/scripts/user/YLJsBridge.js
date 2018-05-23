(function() {
    if (window.YLJsBridge) {
        return;
    }

    var CUSTOM_PROTOCOL_SCHEME = 'ylsdk://';
    var QUEUE_HAS_MESSAGE = '__QUEUE_MESSAGE__/';
    var JS_FETCH_QUEUE = 'return/_fetchQueue/';

    var aIframe;
    var sendMessageQueue = [];
    var receiveMessageQueue = [];
    var jsMessageHandlers = {};
    var jsCallbacks = {};
    var uniqueId = 1;

    function setDefaultHandler(defaultHandler) {
        console.log(1)
        if (YLJsBridge._defaultHandler) {
            throw new Error('YLJsBridge.init called twice');
        }
        YLJsBridge._defaultHandler = defaultHandler;
        var receivedMessages = receiveMessageQueue;
        receiveMessageQueue = null;
        for (var i = 0; i < receivedMessages.length; i++) {
            dispatchMsgFromNative(receivedMessages[i]);
        }
    }

    function registerJsHandler(handlerName, handler) {
        console.log(2)
        jsMessageHandlers[handlerName] = handler;
    }

    function sendMessage(data, responseCallback) {
        console.log(3)
        doSendMessage({
            data: data
        }, responseCallback);
    }

    function callNativeHandler(handlerName, data, callback) {
        console.log({handlerName, data, callback})
        doSendMessage({
            handlerName: handlerName,
            data: data
        }, callback);
    }

    function doSendMessage(message, callback) {
        console.log(5)
        if (callback) {
            var callbackId = 'JS_CB_' + (uniqueId++) + '_' + new Date().getTime();
            jsCallbacks[callbackId] = callback;
            message.callbackId = callbackId;
        }
        sendMessageQueue.push(message);
        aIframe.src = CUSTOM_PROTOCOL_SCHEME + QUEUE_HAS_MESSAGE;
    }

    function fetchQueue() {
        console.log(6)
        var messageQueueString = JSON.stringify(sendMessageQueue);
        sendMessageQueue = [];
        aIframe.src = CUSTOM_PROTOCOL_SCHEME + JS_FETCH_QUEUE + encodeURIComponent(messageQueueString);
    }

    function handleMsgFromNative(messageJSON) {
        console.log(messageJSON);
        if (receiveMessageQueue && receiveMessageQueue.length > 0) {
            receiveMessageQueue.push(messageJSON);
        } else {
            dispatchMsgFromNative(messageJSON);
        }
    }

    function dispatchMsgFromNative(messageJSON) {
        console.log(7)
        setTimeout(function() {
            var message = messageJSON;
            if (typeof messageJSON == 'string') {
                message = JSON.parse(messageJSON);
            }
            var callback;
            if (message.responseId) {
                callback = jsCallbacks[message.responseId];
                if (!callback) {
                    return;
                }
                var result = message.result;
                if (typeof result == 'string' && result.indexOf('{') > -1) {
                    try {
                        result = JSON.parse(result);
                    } catch(e) {
                        console.log(e);
                    }
                }
                callback(result);
                delete jsCallbacks[message.responseId];
            } else {
                if (message.callbackId) {
                    var callbackResponseId = message.callbackId;
                    callback = function(result) {
                        doSendMessage({
                            responseId: callbackResponseId,
                            result: result
                        });
                    };
                }
                var handler = YLJsBridge._defaultHandler;
                if (message.handlerName && jsMessageHandlers[message.handlerName]) {
                    handler = jsMessageHandlers[message.handlerName];
                }
                try {
                    var data = message.data;
                    if (typeof data == 'string' && data.indexOf('{') > -1) {
                        try {
                            data = JSON.parse(data);
                        } catch(e) {
                            console.log(e);
                        }
                    }
                    handler(data, callback);
                } catch (exception) {
                    if (typeof console != 'undefined') {
                        console.log("YLJsBridge: WARNING: javascript handler threw.", message, exception);
                    }
                }
            }
        });
    }

    function sendEventFromNative(eventStr) {
        console.log(8)
        var nativeEvent = document.createEvent('Events');
        nativeEvent.initEvent(eventStr);
        document.dispatchEvent(nativeEvent);
    }

    var YLJsBridge = window.YLJsBridge = {
        init: setDefaultHandler,
        registerHandler: registerJsHandler,
        sendMessage: sendMessage,
        call: callNativeHandler,
        _fetchQueue: fetchQueue,
        _handleMsgFromNative: handleMsgFromNative,
        _sendEventFromNative: sendEventFromNative
    };

    function createQueueReadyIframe(doc) {
        aIframe = doc.createElement('iframe');
        aIframe.style.display = 'none';
        doc.documentElement.appendChild(aIframe);
    }

    createQueueReadyIframe(document);

    var readyEvent = document.createEvent('Events');
    readyEvent.initEvent('YLJsBridgeReady');
    document.dispatchEvent(readyEvent);
})();
