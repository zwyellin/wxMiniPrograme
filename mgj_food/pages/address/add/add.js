const { wxRequest, gcj02tobd09 } = require('../../../utils/util.js');
const feedbackApi=require('../../../components/showToast/showToast.js');  //引入消息提醒暴露的接口 
const app = getApp();
Page({
	data:{
		editAddress:{},
		userName:'',        //收货姓名
		mobile:null,        //收货手机号码 
		address:'小区/写字楼/学校等',         //收货地址 
		houseNumber:'',      //收货门牌号
		sexmen:true,        //radio按钮状态
		sexwomen:false,
		gender:'先生',           //默认选中性别
		latitude: '',
        longitude:'',
        id:null,
        submitStatus:false,
        isDelateShow:false,
	},
	onLoad(options){
		let editAddress
		if (options.item) {
			editAddress = JSON.parse(options.item);
		}
		if (options.isdelate) {
			this.setData({
				isDelateShow:true
			});
		}
		if (editAddress) {
			let userName = editAddress.name;
			let mobile = editAddress.mobile;
			let address = editAddress.address;
			let houseNumber = editAddress.houseNumber;
			let latitude = editAddress.latitude;
        	let	longitude = editAddress.longitude;
			let sex = editAddress.gender;
			let id = editAddress.id;
			if (sex === '女士') {
				this.setData({
					sexmen:false,
					sexwomen:true,
					gender:sex
				});	
			}
			this.setData({
				id:id,
				userName: userName,
				mobile:mobile,
				address:address,
				houseNumber:houseNumber || '',
				latitude: latitude || '',
        		longitude:longitude || ''
			});
		}
	},
	onShow(){
		console.log(this.data.latitude);
		if (this.data.address != '小区/写字楼/学校等') {
			if (this.data.editAddress.location) {
				this.setData({
					latitude: '',
	        		longitude:''
				});
				if (!this.data.latitude && !this.data.longitude) {
					let {lat, lng } = this.data.editAddress.location;
					let { longitude, latitude } = gcj02tobd09(lng,lat);
					this.setData({
						latitude: latitude,
		        		longitude:longitude
					});
				} 
			}	
		}
	},
	radioChange(e){
		let gender = e.detail.value;
		this.setData({
			gender:gender
		});
	},

	//提交用户姓名
	getUserName(e){
		let userName = e.detail.value;
		this.setData({
			userName: userName,
		});
	},
	getUserMobile(e){
		let mobile = e.detail.value;
		this.setData({
			mobile:mobile,
		});
	},
	getUseraddress(e){
		wx.navigateTo({
			'url':'/pages/address/address/address'
		});
	},
	getUserdetatil(e){
		let houseNumber = e.detail.value;
		this.setData({
			houseNumber:houseNumber,
		});
	},
	//提交收货地址
	sendAddress(e){
		if (!this.data.userName) {
			feedbackApi.showToast({title:'用户姓名不能为空'});
			return;
		}
		if(this.data.mobile === ''){
			feedbackApi.showToast({title: '手机号不能为空'});
			return;
		}
		if (!(/^1(3|4|5|7|8)\d{9}$/.test(this.data.mobile))) {
			feedbackApi.showToast({title: '请输入正确的手机号'});
			return;
		}
		if (this.data.address == '小区/写字楼/学校等' || this.data.address === '') {
			feedbackApi.showToast({title:'收货地址不能为空'});
			return;
		}
		if (!this.data.submitStatus) {
			this.data.submitStatus = true;
			wx.showLoading({
		        title: '正在提交',
		        mask: true
		    });
		}
		wxRequest({
        	url:'/merchant/userClient?m=editUserAddress',
        	method:'POST',
        	data:{
        		params:{
        			id:this.data.id,
        			gender:this.data.gender,
        			mobile:this.data.mobile,
        			name:this.data.userName,
        			address:this.data.address,
        			houseNumber:this.data.houseNumber,
        			latitude: this.data.latitude,
        			longitude: this.data.longitude
        		},
        		token:app.globalData.token	
        	},
        }).then(res=>{
        	if (res.data.code === 0) {
        		let valueObject = res.data.value;
        		let pages = getCurrentPages();
	    		let prevPage = pages[pages.length - 2];
        		setTimeout(()=>{
        			wx.navigateBack({
				  		delta: 1,
				  		success:function(){
					  	 	prevPage.setData({
				      			addressInfo:valueObject
				   		 	});
					  	}
					});
        		},1000);
				feedbackApi.showToast({title:'添加成功'});
        	}
        }).finally(()=>{
			wx.hideLoading();
			this.data.submitStatus = false;
        });
	},
	//删除收货地址
	deleteAddress(){
		let that = this
		wx.showModal({
	        title: '删除地址',
	        content: '确定删除该收货地址吗？',
	        success: function (res) {
	          if (res.confirm) {
	          	wxRequest({
		        	url:'/merchant/userClient?m=delUserAddress',
		        	method:'POST',
		        	data:{
		        		params:{
		        			id:that.data.id
		        		},
		        		token:app.globalData.token	
		        	},
		        }).then(res=>{
		        	if (res.data.code === 0) {
		        		setTimeout(()=>{
		        			wx.navigateBack({
						  		delta:1
							});
		        		},1000)
						feedbackApi.showToast({title:'删除成功'});
		        	} else {
		        		let msg = res.data.value;
		        		feedbackApi.showToast({title:msg});
		        	}
		        });
	          } else if (res.cancel) {
	            console.log('用户点击取消')
	          }
	        }
	    });
	}
});