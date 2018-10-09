const app = getApp();
const { wxRequest, bd09togcj02 } = require('../../utils/util.js');
Page({
  data: {
    latitude:'0',
    longitude:'0',
    markers: [{
      iconPath: "/images/images/shop.png",
      id: 0,
      latitude: 23.099994,
      longitude: 113.324520,
      width: 26,
      height: 26
    }],
    polyline: [{
      points: [{
        longitude: 113.3245211,
        latitude: 23.10229
      }, {
        longitude: 113.324520,
        latitude: 23.21229
      }],
      color:"#FF0000DD",
      width: 2,
      dottedLine: true
    }],
    controls: [{
      id: 1,
      iconPath: '/resources/location.png',
      position: {
        left: 0,
        top: 300 - 50,
        width: 50,
        height: 50
      },
      clickable: true
    }]
  },
  onLoad(options){
    let { longitude, latitude, name } = options;
    let markers = this.data.markers;
    let location = bd09togcj02(longitude,latitude);
    longitude = location.longitude;
    latitude = location.latitude;
    markers[0].longitude = longitude;
    markers[0].latitude = latitude;
    wx.setNavigationBarTitle({
        title: name
    });
    this.setData({
      markers:markers,
      latitude:latitude,
      longitude:longitude,
    });
  },
  regionchange(e) {
    console.log(e.type);
  },
  markertap(e) {
    console.log(e.markerId);
  },
  controltap(e) {
    console.log(e.controlId);
  }
});