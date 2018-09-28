const app = getApp();
const { wxRequest, getBMapLocation, wxGetLocation, getBMapCityList, getDistrictByCityId, qqMap, gcj02tobd09 } = require('../../../utils/util.js');
Page({
	data:{
		resetAddress:false,
		region:'',
		istimeSearch:false,
		searchArea:'',     //输入框地址
		nearby:[],      //附近地址
		nowAdress:'',
		switch:'',
		index:'请选择',
		selectCityList:[{id:0,fullname:'请选择'}],
		cityList:[],
		repeatCityList:[]
	},
	onLoad(options){
		this.setData({
			switch:options.switch
		});
	},
	onShow(){
		wxGetLocation({type:'gcj02'}).then(res=>{
			console.log(res)
			let latitude = res.latitude;
			let longitude = res.longitude;
			let obj = {
				location:{
					longitude:longitude,
					latitude:latitude
				},
				get_poi:1,
				poi_options:'policy=2&radius=1000'
			};
			getBMapLocation(obj).then(res=>{
				let address;
				if (res.status === 0) {
					address = res.result.address_component.street_number;
					if (!address) {
						address = res.result.address;
					}
					let region = res.result.address_component.city;
					console.log(address);
					let pois = res.result.pois;
					let nearby = [];
					for (var i = 0; i < 4; i++) {
						nearby.push(pois[i]);
					}
					this.setData({
			      		nowAdress:address,
			      		nearby:nearby,
			      		region:region
			    	});
				}
		    }).catch(err=>{
				console.log(err);
		    });
		});
		getBMapCityList().then(res=>{
			if (res.status === 0) {
				this.setData({
					cityList:res.result[0],
					repeatCityList:res.result[0]
				});
			}
		});
	},
	address(e){
		let address = e.detail.value;
		let searchArea = '';
		this.data.selectCityList.map(item=>{
			if (item.id != 0) {
				searchArea += item.fullname;
			}
		});
		if (!this.data.istimeSearch) {
			this.data.istimeSearch = true;
			searchArea = searchArea + address;
			this.getgeocoder(searchArea);
		}	
	},
	getgeocoder(searchArea){
		var that = this;
		qqMap.geocoder({
		    address: searchArea,
		    success: function(res) {
		        console.log(res);
		        let lng = res.result.location.lng;
		        let lat = res.result.location.lat;
		        let obj = {
					location:{
						longitude:lng,
						latitude:lat
					},
					get_poi:1,
					poi_options:'policy=2'
				}; 
		        getBMapLocation(obj).then(res=>{
		        	if (res.status === 0) {
		        		let poi = res.result.pois;
			        	that.setData({
			        		nearby:poi
			        	})
			        	that.data.istimeSearch = false;
		        	} else {
						that.getSuggestion();
		        	}
		        }).catch(err=>{
		        	console.log(err);
		        	that.data.istimeSearch = false;
		        });
		    },
		    fail: function(res) {
		        console.log(res);
		        that.getSuggestion(searchArea);
		    },
		    complete: function() {
		    	setTimeout(()=>{
		    		that.data.istimeSearch = false;
		    	},1000);	
			}
		});
	},
	//关键字查询
	getSuggestion(address){
		var that = this;
		qqMap.getSuggestion({
			keyword:address,
			region:this.data.region,
			region_fix:1,
			policy:1,
			success: function(res) {
		        if (res.status === 0) {
	        		let poi = res.data;
		        	that.setData({
		        		nearby:poi
		        	});
	        	}   
		    },
		    complete: function(res) {
    			that.data.istimeSearch = false;
			}
		});
	},
	selectAdress(e){
		let { item } = e.currentTarget.dataset;
		console.log(item)
		let addressName = item.title;
		let address = item.address+addressName;
		let {lat, lng} = item.location
		let { longitude, latitude } = gcj02tobd09(lng,lat)
		let pages = getCurrentPages();
	    let prevPage = pages[pages.length - 2];
	    if (this.data.switch === 'index') {
			app.globalData.longitude = longitude;
			app.globalData.latitude = latitude;
	    	prevPage.setData({
	    		city:Object.assign({}, prevPage.data.city,{cityName:addressName}),
	    		refreshData:true
	    	})
	    	wx.navigateBack({
		  		delta: 1	
			});
	    } else {
			prevPage.setData({
	    		address:address,
	    		editAddress:item
	    	})
	    	wx.navigateBack({
		  		delta: 1	
			});
	    }
	},
	reset(){
		wx.showLoading({
	        title: '正在重新定位',
	        mask: true
	    });
		this.setData({
      		resetAddress:true
    	});
		wxGetLocation({type:'gcj02'}).then(res=>{
			let lat = res.latitude;
			let lng = res.longitude;
			let obj = {
				location:{
					longitude:lng,
					latitude:lat
				},
				get_poi:1,
				poi_options:'policy=2&radius=1000'
			};
			let { longitude, latitude } = gcj02tobd09(lng,lat);
			getBMapLocation(obj).then(res=>{
				let addressName = res.result.address;
				let pages = getCurrentPages();
	    		let prevPage = pages[pages.length - 2];
				if (this.data.switch === 'index') {
					app.globalData.longitude = longitude;
					app.globalData.latitude = latitude;
			    	prevPage.setData({
			    		city:Object.assign({}, prevPage.data.city,{cityName:addressName}),
			    		refreshData:true
			    	});
			    	setTimeout(()=>{
			    		wx.navigateBack({
				  		delta: 1	
						});
						wx.hideLoading();
			    	},1000);	
			    } else {
			    	console.log(13);
					prevPage.setData({
			    		address:address,
			    		editAddress:item
			    	});
			    	wx.navigateBack({
				  		delta: 1	
					});
			    }
		    }).catch(err=>{
				wx.hideLoading();
		    });
		});
	},
	againSelectCity(e) {
		let { item, index } = e.currentTarget.dataset;
		let selectCityList = this.data.selectCityList;
		if (index == 0) {
			this.setData({
				cityList:this.data.repeatCityList,
				index:index
			})
		}
		if (index == 1) {
			let id = selectCityList[0].id;
			this.getDistrictByCityId({id:id});
			this.data.index = index;
		}
		if (index == 2) {
			let id = selectCityList[1].id
			this.getDistrictByCityId({id:id})
			this.data.index = index;
		}
	},
	getDistrictByCityId(obj){
		getDistrictByCityId(obj).then(res=>{
			if (res.status === 0 && res.result[0].length != 0) {
				this.setData({
					cityList:res.result[0],
				});
			} 
		}).catch(err=>{
			console.log(err)
		})
	},
	// 选择的城市
	selectCity(e){
		let { item, index } = e.currentTarget.dataset;
		let selectCityList = this.data.selectCityList;
		let len = selectCityList.length
		if (this.data.index == 0 ||this.data.index == '请选择') {
			if (len == 1) {
				selectCityList = []
				selectCityList.push({id:0,fullname:'请选择'})
				selectCityList.unshift(item)
			}
			if (len == 2) {
				if (this.data.index == '请选择') {
					selectCityList.splice(1,0,item)
				} else {
					if (item.id == 110000) {
						selectCityList = []
						selectCityList.push({id:0,fullname:'请选择'})
						selectCityList.unshift(item)
					} else {
						selectCityList.splice(1,0,item)
					}	
				}	
			}
			if (len == 3) {
				selectCityList = []
				selectCityList.push({id:0,fullname:'请选择'})
				selectCityList.unshift(item)
			}	
		}
		if (this.data.index == 1) {
			if (len === 3) {
				selectCityList.splice(1,1,item)
			} else {
				selectCityList.splice(1,0,item)
			}
		}
		// if (true) {}
		// if (len === 3) return
		// if (selectCityList.length === 3) {}
		getDistrictByCityId({id:item.id}).then(res=>{
			if (res.status === 0 && res.result[0].length != 0) {
				this.setData({
					cityList:res.result[0],
					selectCityList:selectCityList
				});
			} 
		}).catch(err=>{
			let searchArea = '';
			let value = item.fullname;
			this.setData({
				searchArea:value
			})
			this.data.selectCityList.map(item=>{
				if (item.id != 0) {
					searchArea += item.fullname;
				}
			});
			searchArea = searchArea + value;
			this.getgeocoder(searchArea);
		})
	}
});