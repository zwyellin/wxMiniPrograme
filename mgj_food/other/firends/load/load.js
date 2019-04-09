Page({
	data:{
		
	},
	// 点击图片事件
	imageTap(e){
		let {index=0,images}=e.currentTarget.dataset;
		console.log(index,images)
		wx.previewImage({
			current: images[index], // 当前显示图片的http链接
			urls:images // 需要预览的图片http链接列表
		})
	},
})