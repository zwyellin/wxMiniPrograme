const app = getApp();
const { wxRequest, getBMapLocation, wxGetLocation, qqMap, gcj02tobd09 } = require('../../../utils/util.js');
Page({
	data:{
		resetAddress:false,
		region:'',
		istimeSearch:false,
		address:'',     //输入框地址
		nearby:[],      //附近地址
		nowAdress:'',
		switch:''
	},
	onLoad(options){
		this.setData({
			switch:options.switch
		})
		qqMap.search({
			keyword: '产业园区',
		    location:{
			  latitude: app.globalData.latitude,
			  longitude: app.globalData.longitude
			},
			address_format:'short',
		    success: function(res) {
		        console.log(res);    
		    },
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
				console.log(res);
				let address
				if (res.status === 0) {
					address = res.result.address_component.street_number;
					this.data.region = res.result.address_component.city;
					console.log(address);
					let pois = res.result.pois;
					let nearby = [];
					for (var i = 0; i < 4; i++) {
						nearby.push(pois[i]);
					}
					this.setData({
			      		nowAdress:address,
			      		nearby:nearby
			    	});
				}
		    }).catch(err=>{

		    })
		})
	},
	address(e){
		var that = this
		let address = e.detail.value;
		if (!this.data.istimeSearch) {
			this.data.istimeSearch = true;
			qqMap.geocoder({
			    address: address,
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
					} 
			        getBMapLocation(obj).then(res=>{
			        	if (res.status === 0) {
			        		let poi = res.result.pois
				        	that.setData({
				        		nearby:poi
				        	})
				        	that.data.istimeSearch = false;
			        	} else {
							that.getSuggestion()
			        	}
						console.log(res)
			        }).catch(err=>{
			        	console.log(err)
			        	that.data.istimeSearch = false;
			        })
			    },
			    fail: function(res) {
			        console.log(res);
			        that.getSuggestion(address);
			    },
			    complete: function() {
			    	setTimeout(()=>{
			    		that.data.istimeSearch = false;
			    	},1000)	
    			}
			});
		}	
	},
	//关键字查询
	getSuggestion(address){
		var that = this;
		console.log(123456);
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
		wx.showToast({
	        title: '正在重新定位',
	        icon: 'loading',
	        duration: 200000,
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
					app.globalData.longitude = latitude;
					app.globalData.latitude = longitude;
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
	}
});