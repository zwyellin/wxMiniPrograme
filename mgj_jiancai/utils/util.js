const Promise = require('./es6-promise.min.js');
const FILE_BASE_NAME = 'tmp_base64src';
// 深拷贝，仅适用于 json 数据
const deepClone = function (src) {
    return JSON.parse(
        JSON.stringify(src)
    );
};
const base64src = function(base64data) {
    return new Promise((resolve, reject) => {
        const [, format, bodyData] = /data:image\/(\w+);base64,(.*)/.exec(base64data) || [];
        if (!format) {
            reject(new Error('ERROR_BASE64SRC_PARSE'));
        }
        const filePath = `${wx.env.USER_DATA_PATH}/${FILE_BASE_NAME}.${format}`;
        const buffer = wx.base64ToArrayBuffer(bodyData);
        wx.getFileSystemManager().writeFile({
            filePath,
            data: buffer,
            encoding: 'binary',
            success() {
                resolve(filePath);
            },
            fail() {
                reject(new Error('ERROR_BASE64SRC_WRITE'));
            },
        });
    });
};
module.exports = {
    deepClone,
    Promise,
    base64src,
};