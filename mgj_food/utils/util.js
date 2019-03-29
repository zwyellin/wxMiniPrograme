const Promise = require('./es6-promise.min.js');
const app = getApp();
const host = app.globalData.domain;
const token=app.globalData.token;
const qqmap = require('./qqmap-wx-jssdk.js');
const qqMap = new qqmap({ 
  key:'OLNBZ-ZH73K-LIWJI-A3DA6-GIWLZ-ONFL4' 
});
// 拓展 finally 方法，用于替代 wx 的 complete 方法
Promise.prototype.finally = function (callback) {
  let P = this.constructor;
  return this.then(
    value => P.resolve(callback()).then(() => value),
    reason => P.resolve(callback()).then(() => {
      throw reason;
    })
  );
};

// 将 wx 方法封装成 Promise, 如 wxPromisify(wx.request)
const wxPromisify = function (fn) {
  return function (obj = {}) {
    return new Promise((resolve, reject) => {
      obj.success = function (res) {
        resolve(res);
      };
      obj.fail = function (res) {
        reject(res);
      };
      fn(obj);
    });
  };
};

const wxRequest = function (obj = {}) {
  return new Promise((resolve, reject) => {
    try {
      const sessionId = wx.getStorageSync('sessionId');
      // const token = wx.getStorageSync('loginMessage').token;
      const defaultConfig = {
        header: {
          'Content-Type': 'application/json',
          'JSESSIONID': sessionId,
          'X-Requested-With': 'XMLHttpRequest'
        },
        success: function (res) {
          if (res.statusCode === 200) {
            resolve(res);
          } else {
            if (res.statusCode === 401) {
              wx.clearStorage();
              wx.hideToast();
              wx.showModal({
                title: '提示',
                content: '您还未登录，请先登录。',
                success: function (res) {
                  if (res.confirm) {
                    wx.navigateTo({
                      url: '/pages/login/login/'
                    });
                  } else if (res.cancel) {
                    console.log('用户点击取消');
                  }
                }
              });
            } else {
              reject(res);
            }
          }
        },
        fail: function (res) {
          reject(res);
        }
      };
     
      //请求的参数 这边固定要发的数据
      var data={
        client:app.globalData.client,
        clientVersion:app.globalData.clientVersion,
        token:app.globalData.token
      }
      var config = Object.assign({}, defaultConfig, obj);
      config.data=Object.assign({},data,config.data);
      
      config.url = host + config.url;
    } catch (e) {
      // throw e  无效？
      console.error(e);
    }
    wx.request(config);
  });
};

// 深拷贝，仅适用于 json 数据
const deepClone = function (src) {
  return JSON.parse(
    JSON.stringify(src)
  );
};
const getBMapLocation = function(obj){
  return new Promise((resolve,reject)=>{
    const defaultConfig = {
      success:  (res)=> {
        resolve(res);  
      },
      fail: (err)=> {
        reject(err);
      },
    };
    var config = Object.assign({}, defaultConfig, obj);
    qqMap.reverseGeocoder(config);
  });
};
const getBMapCityList = function(){
  return new Promise((resolve,reject)=>{
    const defaultConfig = {
      success:  (res)=> {
        resolve(res);  
      },
      fail: (err)=> {
        reject(err);
      },
    };
    var config = Object.assign({}, defaultConfig);
    qqMap.getCityList(config);
  });
};
const getDistrictByCityId = function(obj){
  return new Promise((resolve,reject)=>{
    const defaultConfig = {
      success:  (res)=> {
        resolve(res);  
      },
      fail: (err)=> {
        reject(err);
      },
    };
    var config = Object.assign({}, defaultConfig, obj);
    qqMap.getDistrictByCityId(config);
  });
};
const wxGetLocation = function(obj){
  return new Promise((resolve,reject)=>{
    const defaultConfig = {
      success:  (res)=> {
        resolve(res);  
      },
      fail: (err)=> {
        reject(err);
      },
    };
    var config = Object.assign({}, defaultConfig, obj);
    wx.getLocation(config);
  });
};
const getNetworkType = function(){
    return new Promise((resolve,reject)=>{
    const defaultConfig = {
      success:  (res)=> {
        resolve(res);  
      },
      fail: (err)=> {
        reject(err);
      },
    };
    var config = Object.assign({}, defaultConfig);
    wx.getNetworkType(config);
  });
};
const catchHandle = function (e) {
  let message;  
  if (e.statusCode === 400 && e.data.code == 0) {
    message = e.data.content;
  } else {
    message = "请求异常";
  }
  
  wxPromisify(wx.showModal)({
    title: "提示",
    content: message,
    showCancel: false
  });
};

const formatNumber = function (n) {
  n = n.toString();
  return n[1] ? n : '0' + n;
};

const format = function (date,a) {
  let year = new Date(date).getFullYear();
  let month = new Date(date).getMonth() + 1;
  let day = new Date(date).getDate();

  return [year, month, day].map(formatNumber).join(a);
};

const formatTime = function (date) {//获取到当前时间
  let year = new Date(date).getFullYear();
  let month =new Date(date).getMonth() + 1;
  let day = new Date(date).getDate();

  let hour = new Date(date).getHours();
  let minute = new Date(date).getMinutes();
  let second = new Date(date).getSeconds();


  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':');
};

const trackTime = function(date){//得到当前时间
  let {month, day, hour, minute } = getTime(date)

  return month + '月' + day +'日' + ' ' + hour + ':' + minute
}
const getTime = function (date) {
  let month = formatNumber(new Date(date).getMonth() + 1);
  let day = formatNumber(new Date(date).getDate());

  let hour = formatNumber(new Date(date).getHours());
  let minute = formatNumber(new Date(date).getMinutes());
  return {month, day, hour, minute }
}
const refundTime = function(date){
  let {month, day, hour, minute } = getTime(date)

  return month + '-' + day + ' ' + hour + ':' + minute
}

const gcj02tobd09 = function (lng, lat) {//经纬度坐标
  let x_PI = 3.14159265358979324 * 3000.0 / 180.0;
  let PI = 3.1415926535897932384626;
  let a = 6378245.0;
  let ee = 0.00669342162296594323;
  let z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * x_PI);
  let theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * x_PI);
  let longitude = z * Math.cos(theta) + 0.0065;
  let latitude = z * Math.sin(theta) + 0.006;
  return {longitude, latitude}
}
const bd09togcj02 = function (lng, lat){
  let x_pi = 3.14159265358979324 * 3000.0 / 180.0;
  let x = lng - 0.0065;
  let y = lat - 0.006;
  let z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
  let theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
  let longitude = z * Math.cos(theta);
  let latitude = z * Math.sin(theta);
  return {longitude, latitude}
}
const base64src = function(arraybuffer) {
  
  return new Promise((resolve, reject) => {
      console.log("base64src")
      console.log(wx.env.USER_DATA_PATH)
      console.log(FILE_BASE_NAME)
      const FILE_BASE_NAME = 'tmp_base64src';
      const filePath = `D://1.png`;
      console.log("filePath",filePath)
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

// 数字动画
class NumberAnimate {
  constructor(opt) {
      let def = {
          from:50,//开始时的数字
          speed:2000,// 总时间
          refreshTime:100,// 刷新一次的时间
          decimals:2,// 小数点后的位数，小数做四舍五入
          onUpdate:function(){}, // 更新时回调函数
          onComplete:function(){} // 完成时回调函数
      }
      this.tempValue = 0;//累加变量值
      this.opt = Object.assign(def,opt);//assign传入配置参数
      this.loopCount = 0;//循环次数计数
      this.loops = Math.ceil(this.opt.speed/this.opt.refreshTime);//数字累加次数
      this.increment = (this.opt.from/this.loops);//每次累加的值
      this.interval = null;//计时器对象
      this.init();
  }
  init(){
      this.interval = setInterval(()=>{this.updateTimer()},this.opt.refreshTime);
  }

  updateTimer(){
      
      this.loopCount++;
      this.tempValue = this.formatFloat(this.tempValue,this.increment).toFixed(this.opt.decimals);
      if(this.loopCount >= this.loops){
          clearInterval(this.interval);
          this.tempValue = this.opt.from;
          this.opt.onComplete();
      }
      this.opt.onUpdate();
  }
  //解决0.1+0.2不等于0.3的小数累加精度问题
  formatFloat(num1, num2) {
      let baseNum, baseNum1, baseNum2;
      try {
          baseNum1 = num1.toString().split(".")[1].length;
      } catch (e) {
          baseNum1 = 0;
      }
      try {
          baseNum2 = num2.toString().split(".")[1].length;
      } catch (e) {
          baseNum2 = 0;
      }
      baseNum = Math.pow(10, Math.max(baseNum1, baseNum2));
      return (num1 * baseNum + num2 * baseNum) / baseNum;
  };
}
module.exports = {
  format,
  formatNumber,
  formatTime,
  deepClone,
  wxRequest,
  wxPromisify,
  Promise,
  catchHandle,
  getBMapLocation,
  getBMapCityList,
  getDistrictByCityId,
  getNetworkType,
  gcj02tobd09,
  bd09togcj02,
  qqMap,
  wxGetLocation,
  trackTime,
  refundTime,
  base64src,
  NumberAnimate
};
