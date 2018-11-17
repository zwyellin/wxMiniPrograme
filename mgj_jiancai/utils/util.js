const Promise = require('./es6-promise.min.js');
const FILE_BASE_NAME = 'tmp_base64src';
// 深拷贝，仅适用于 json 数据
const deepClone = function (src) {
    return JSON.parse(
        JSON.stringify(src)
    );
};
const base64src = function(arraybuffer) {
    return new Promise((resolve, reject) => {
        // const [, format, bodyData] = /data:image\/(\w+);base64,(.*)/.exec(base64data) || [];
        // console.log(format);
        // if (!format) {
        //     reject(new Error('ERROR_BASE64SRC_PARSE'));
        // }
        const filePath = `${wx.env.USER_DATA_PATH}/${FILE_BASE_NAME}.png`;
        // const buffer = wx.base64ToArrayBuffer(bodyData);
        wx.getFileSystemManager().writeFile({
            filePath,
            data: arraybuffer,
            encoding: 'binary',
            success() {
                resolve(filePath);
            },
            fail(err) {
                reject(err);
            },
        });
    });
};
module.exports = {
    deepClone,
    Promise,
    base64src,
};