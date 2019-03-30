let modify={
    // 商家信息修改
  GrouopMerchantModify:function(value){
    //修改代金券的文字为6.0折
    if(value.discountRatio){
      value.discountRatioText= (value.discountRatio/10).toFixed(1)
    }
    // 修改imgs,字符串转换为数组
    if(value.imgs){
        value.imgs=value.imgs.split(";");
      if(value.imgs.length >= 4){
        value.showImgs=value.imgs.slice(0,3)
      }else{
        value.showImgs=value.imgs;
      }
    }else{
      value.showImgs=[];
      value.imgs=[];
    }
    // 联系方式处理，字符串转换为数组
    if(value.contacts){
      value.contacts=value.contacts.split(";");
    }else{
      value.contacts=[];
      }
    //把商家服务，属性放到一个数组里面去
    value.merchantServe=[];
    if(value.hasWifi)  value.merchantServe= value.merchantServe.concat({type:"wifi",text:"无线"});
    if(value.hasPOSPayment)  value.merchantServe= value.merchantServe.concat({type:"posPayment",text:"刷卡"});
    if(value.hasRooms)  value.merchantServe= value.merchantServe.concat({type:"rooms",text:"包厢"});
    if(value.hasDepot)  value.merchantServe= value.merchantServe.concat({type:"depot",text:"停车"});
    if(value.hasScenerySeat)  value.merchantServe= value.merchantServe.concat({type:"scenerySeat",text:"景观位"});
    if(value.hasAlfrescoSeat)  value.merchantServe= value.merchantServe.concat({type:"alfrescoSeat",text:"露天位"});
    if(value.hasNoSmokIngArea)  value.merchantServe= value.merchantServe.concat({type:"noSmokIngArea",text:"无烟区"});
    // 把评论分类整理到一个数组里面(未做)
    // 提取出来代金券和团购套餐对象=>对应数组
    value.voucher=[];//代金券
    value.groupSetMeal=[];//团购套餐
    if(value.groupPurchaseCouponList){
        value.groupPurchaseCouponList.forEach((item,index,arr) => {
            // 处理是否叠加
            if(item.isCumulate){//是否叠加 0:否,1:是 
              item.isCumulateText="可叠加"
            }else{
            item.isCumulateText="不可叠加"
            }
            //处理是否预约  
            if(item.isBespeak){//0:否,1:是 
              item.isBespeakText="需预约"
            }else{
              item.isBespeakText="免预约"
            }
          //提取出来代金券和团购套餐对象=>对应数组
          if(item.type==1){//代金券
            value.voucher=value.voucher.concat(item);
          }else if(item.type==2){//团购套餐
            // 处理images
            let images=item.images;
            if(images==null){
              images=[];
            }else if(images.indexOf(";")==-1){
              images=[images];
            }else{
              images=images.split(";");
            }
            item.images=images;
            value.groupSetMeal= value.groupSetMeal.concat(item);
          }
        });
    }
    return value;
  },
}




module.exports = {
    modify
 };