function chgdivimgwh(obj,width,height,flag){
 	var image=new Image();
	image.src=obj.src; //获取图像路径
	var width1=image.width; //获取图像宽度
	var height1=image.height; //获取图像高度
	var a1=height1/width1;
	var a2=height/width;
	if(a1>a2){
	    obj.width=width;
	    obj.height=height1*width/width1;
	    if(flag==true){
	   		obj.style.marginTop='-' + Math.round(((obj.height-height)/2)/75)+ 'rem';
	    }else{
			obj.style.marginTop='-' + Math.round((obj.height-height)/2)+ 'px';			
		}
	   
	}else{
	    obj.height=height;
	    obj.width=width1*height/height1;
	    if(flag==true){
	   	    obj.style.marginLeft='-' + Math.round(((obj.width-width)/2)/75)+ 'rem';
	    }else{
	    	obj.style.marginTop='-' + Math.round((obj.height-height)/2)+ 'px';
	    }
	  
	}

}