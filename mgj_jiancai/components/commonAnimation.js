const commonAnimations = {
    maskShowAnimation(){//遮罩层显示动画
		let animation = wx.createAnimation({  
		    transformOrigin: "50% 50%",
			duration: 1000,
			timingFunction: "ease",
		});
		setTimeout(()=> {
	      	animation.opacity(0.3).step();
	      	this.setData({
	        	maskAnimation: animation.export(),
	      	});
	    }, 200);
		animation.opacity(0).step();//修改透明度,放大  
		this.setData({  
		   maskAnimation: animation.export()  
		}); 
	},
	maskHideAnimation(){//遮罩层隐藏动画
		let animation = wx.createAnimation({  
		    duration: 500,  
		});
		setTimeout(()=> {
	      	animation.opacity(0).step();
	      	setTimeout(()=>{
	      		this.setData({
	      			maskimgShow:false,
	      		});
	      	},500);
	      	this.setData({
	        	maskAnimation: animation.export(),	
	      	});	
	    }, 20);
		animation.opacity(0.3).step();//修改透明度,放大  
		this.setData({  
		   maskAnimation: animation.export()  
		}); 
	},
	qrCodeShowAnimation(){
		// let redBagLeft = (app.globalData.windowWidth-290)/2;
		let animation = wx.createAnimation({ 
			transformOrigin: "50% 50%", 
			duration: 500,
			timingFunction: "ease",
		});
		setTimeout(()=> {
	      	animation.scale(1).translate('-50%','-50%').step();
	      	this.setData({
	        	qrCodeAnimation: animation.export(),
	      	});
	    }, 200);
		animation.scale(0).step();
		this.setData({  
			qrCodeAnimation: animation.export()  
		}); 
	},
	qrCodeHideAnimation(){
		// let redBagLeft = (app.globalData.windowWidth-290)/2;
		let animation = wx.createAnimation({ 
			transformOrigin: "100% 100%", 
			duration: 500,
			timingFunction: "ease",
		});
		setTimeout(()=> {
	      	animation.scale(0).translate('-50%','-50%').step();
	      	setTimeout(()=>{
	      		this.setData({
	        		qrcodeShow:false
	      		});
	      	},1000);
	      	this.setData({
	        	qrCodeAnimation: animation.export(),
	      	});
	    }, 200);
		animation.scale(1).translate('-50%','-50%').step(); 
		this.setData({  
		   qrCodeAnimation: animation.export()  
		}); 
	}
}

module.exports = {
    commonAnimations
}