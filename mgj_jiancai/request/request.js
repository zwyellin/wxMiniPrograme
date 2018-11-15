var rootDocment = 'https://prelaunch.horsegj.com/merchant/';
// var rootDocment = 'https://wxapi.horsegj.com/merchant/'; //生产
var header = {
  'Accept': 'application/json',
  'content-type': 'application/json'
}
function getReq(url, cb) {
  wx.showLoading({
    title: '加载中',
  })
  wx.request({
    url: rootDocment + url,
    method: 'get',
    header: header,
    success: function (res) {
      wx.hideLoading();
      return typeof cb == "function" && cb(res.data)
    },
    fail: function () {
      wx.hideLoading();
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      })
      return typeof cb == "function" && cb(false)
    }
  })
}

function postReq(url, data, cb, alert) {

  var params = {
    "app": 'horsegjUserBuilding',
    "imei": wx.getStorageSync('codeWX'),
    "params": data,
    "token": wx.getStorageSync('token') || null
  }
  wx.showLoading({
    title: '加载中',
  })
    //console.log("header=="),
    //console.log(header),
    //console.log(url, data)
    wx.request({
      url: rootDocment + url,
      header: header,
      data: params,
      method: 'post',
      success: function (res) {
        if (res.data.code === 100010) {
          wx.showToast({
            title: '没有绑定手机号，去绑定！',
            icon: 'none'
          })
          wx.navigateTo({
            url: '../bindPhone/bindPhone'
          });
          return false;
        }
        if (res.data.code === 100000 && res.data.value === 'token错误或已失效') {
          wx.showToast({
            title: '抱歉您没有登录，去登录！',
            icon: 'none'
          })
          wx.navigateTo({
            url: '../accredit/accredit'
          });
        }
        //console.log(res)
        wx.hideLoading();
        if (!alert){
          if (!res.data.success){
            wx.showToast({
              title: res.data.value || '出错了，请联系客服',
              icon: 'none'
            })
          }
        }
        return typeof cb == "function" && cb(res.data)
      },
      fail: function () {
        wx.hideLoading();
        wx.showToast({
          title: '网络出错，请刷新重试',
          icon: 'none'
        })
        return typeof cb == "function" && cb(false)
      }
    })

}
module.exports = {
  getReq: getReq,
  postReq: postReq,
  header: header,
} 