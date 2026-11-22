/* 图片工具模块：压缩、转换、尺寸、旋转、裁剪、取色、水印、Base64、Favicon */
reg("comp","img","图片压缩","压缩 JPG/PNG/WebP，可调质量");
reg("conv","img","格式转换","PNG / JPG / WebP 互转");
reg("resize","img","图片改尺寸","按宽度或高度等比缩放");
reg("rotate","img","旋转 / 翻转","旋转 90°、180° 或镜像");
reg("crop","img","图片裁剪","按坐标区域裁剪图片");
reg("picker","img","图片取色器","点击图片获取任意位置颜色");
reg("watermark","img","文字水印","给图片加文字水印");
reg("b64img","img","图片 Base64","图片与 Base64 编码互转");
reg("favicon","img","Favicon 生成","一张图生成网站图标多尺寸");

panelHTML("comp","图片压缩","在浏览器本地压缩图片，文件不上传服务器。",
 '<div class="row"><input type="file" id="compFile" accept="image/*"></div>'
+'<div class="row"><label>压缩质量 <input type="range" id="compQ" min="10" max="95" value="70"> <b id="compQv">70%</b></label>'
+'<label>最长边 <input type="number" id="compMax" style="width:90px" placeholder="不限"> px</label></div>'
+'<div class="row"><button class="btn" id="compGo">开始压缩</button></div><div id="compOut" class="result"></div><img id="compPrev" class="preview" style="display:none">');

panelHTML("conv","图片格式转换","PNG / JPG / WebP 互转，本地完成。",
 '<div class="row"><input type="file" id="convFile" accept="image/*"></div>'
+'<div class="row"><label>目标格式 <select id="convFmt"><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select></label>'
+'<button class="btn" id="convGo">开始转换</button></div><div id="convOut" class="result"></div><img id="convPrev" class="preview" style="display:none">');

panelHTML("resize","图片改尺寸","输入目标宽度或高度（填一个即可），等比缩放。",
 '<div class="row"><input type="file" id="rsFile" accept="image/*"></div>'
+'<div class="row"><label>宽度 <input type="number" id="rsW" style="width:100px" placeholder="自动"> px</label>'
+'<label>或高度 <input type="number" id="rsH" style="width:100px" placeholder="自动"> px</label>'
+'<button class="btn" id="rsGo">生成</button></div><div id="rsOut" class="result"></div><img id="rsPrev" class="preview" style="display:none">');

panelHTML("rotate","图片旋转 / 翻转","旋转或镜像图片。",
 '<div class="row"><input type="file" id="roFile" accept="image/*"></div>'
+'<div class="row"><label>方式 <select id="roMode"><option value="90">顺时针 90°</option><option value="180">旋转 180°</option><option value="270">逆时针 90°</option><option value="h">水平镜像</option><option value="v">垂直镜像</option></select></label>'
+'<button class="btn" id="roGo">执行</button></div><div id="roOut" class="result"></div><img id="roPrev" class="preview" style="display:none">');

panelHTML("crop","图片裁剪","输入裁剪区域坐标（从左上角 0,0 开始），超出部分自动截断。",
 '<div class="row"><input type="file" id="crFile" accept="image/*"></div>'
+'<div class="row"><label>X <input type="number" id="crX" style="width:80px" value="0"></label><label>Y <input type="number" id="crY" style="width:80px" value="0"></label>'
+'<label>宽 <input type="number" id="crW" style="width:80px"></label><label>高 <input type="number" id="crH" style="width:80px"></label>'
+'<button class="btn" id="crGo">裁剪</button></div><div id="crOut" class="result"></div><img id="crPrev" class="preview" style="display:none">');

panelHTML("picker","图片取色器","选择图片后点击任意位置取色，点击色块复制颜色值。",
 '<div class="row"><input type="file" id="pkFile" accept="image/*"></div>'
+'<canvas id="pkCanvas" class="preview" style="cursor:crosshair;max-width:100%;display:none"></canvas>'
+'<div id="pkOut" class="result"></div><div class="swatches" id="pkHist"></div>');

panelHTML("watermark","文字水印","给图片添加文字水印。",
 '<div class="row"><input type="file" id="wmFile" accept="image/*"></div>'
+'<div class="row"><label>水印文字 <input type="text" id="wmText" value="© 工具吧"></label>'
+'<label>字号 <input type="number" id="wmSize" value="28" style="width:70px"></label>'
+'<label>透明度 <input type="number" id="wmOp" value="0.4" step="0.1" min="0.1" max="1" style="width:70px"></label>'
+'<label>位置 <select id="wmPos"><option value="br">右下</option><option value="bl">左下</option><option value="tr">右上</option><option value="tl">左上</option><option value="c">居中</option></select></label>'
+'<button class="btn" id="wmGo">添加水印</button></div><div id="wmOut" class="result"></div><img id="wmPrev" class="preview" style="display:none">');

panelHTML("b64img","图片 Base64 互转","图片转 Base64 编码，或 Base64 还原为图片。",
 '<div class="row"><input type="file" id="b6File" accept="image/*"><button class="btn" id="b6Go">转 Base64</button></div>'
+'<div class="out-box" id="b6Out" style="max-height:150px;overflow:auto;font-size:12px"></div>'
+'<div class="row" style="margin-top:14px"><textarea id="b6In" placeholder="粘贴 data:image/... 开头的 Base64 字符串" style="min-height:80px"></textarea></div>'
+'<div class="row"><button class="btn" id="b6Back">Base64 → 图片</button></div><div id="b6Out2" class="result"></div><img id="b6Prev" class="preview" style="display:none">');

panelHTML("favicon","Favicon 生成","上传一张图片（建议方形），生成 16/32/48/64/128 多尺寸网站图标，点击色块下载。",
 '<div class="row"><input type="file" id="fvFile" accept="image/*"></div>'
+'<div class="row"><button class="btn" id="fvGo">生成图标</button></div><div id="fvOut" class="result"></div><div id="fvList" class="swatches"></div>');

init(function(){
  /* 图片压缩 */
  $("compQ").addEventListener("input",function(e){$("compQv").textContent=e.target.value+"%";});
  var compImg=null;
  $("compFile").addEventListener("change",function(){loadImg(this,function(img,f,url){compImg=img;
    $("compPrev").src=url;$("compPrev").style.display="block";
    $("compOut").textContent="原始大小："+fmtSize(f.size)+"，尺寸 "+img.width+"×"+img.height;});});
  $("compGo").addEventListener("click",function(){
    if(!compImg){toast("请先选择图片");return;}
    var q=+$("compQ").value/100,max=+$("compMax").value||0;
    var w=compImg.width,h=compImg.height;
    if(max&&Math.max(w,h)>max){var s=max/Math.max(w,h);w=Math.round(w*s);h=Math.round(h*s);}
    var c=drawCanvas(compImg,w,h);
    var url=c.toDataURL("image/jpeg",q);
    dl(url,"compressed.jpg");
    var out=Math.round((url.length-url.split(",")[0].length-1)*0.75);
    $("compOut").textContent="✓ 压缩完成：输出 "+w+"×"+h+"，约 "+fmtSize(out)+"，已开始下载";
    $("compOut").className="result ok";
  });
  /* 格式转换 */
  var convImg=null,convName="image";
  $("convFile").addEventListener("change",function(){loadImg(this,function(img,f,url){convImg=img;
    convName=f.name.replace(/\.[^.]+$/,"");
    $("convPrev").src=url;$("convPrev").style.display="block";
    $("convOut").textContent="已加载："+f.name+"（"+img.width+"×"+img.height+"）";});});
  $("convGo").addEventListener("click",function(){
    if(!convImg){toast("请先选择图片");return;}
    var fmt=$("convFmt").value;
    var c=document.createElement("canvas");c.width=convImg.width;c.height=convImg.height;
    var ctx=c.getContext("2d");
    if(fmt==="image/jpeg"){ctx.fillStyle="#fff";ctx.fillRect(0,0,c.width,c.height);}
    ctx.drawImage(convImg,0,0);
    var url=c.toDataURL(fmt,0.9);
    var ext=fmt==="image/jpeg"?"jpg":fmt==="image/png"?"png":"webp";
    dl(url,convName+"."+ext);
    $("convOut").textContent="✓ 转换完成，已开始下载 "+convName+"."+ext;
    $("convOut").className="result ok";
  });
  /* 改尺寸 */
  var rsImg=null;
  $("rsFile").addEventListener("change",function(){loadImg(this,function(img){rsImg=img;
    $("rsOut").textContent="原始尺寸："+img.width+"×"+img.height;$("rsPrev").style.display="none";});});
  $("rsGo").addEventListener("click",function(){
    if(!rsImg){toast("请先选择图片");return;}
    var w=+$("rsW").value||0,h=+$("rsH").value||0;
    if(!w&&!h){toast("请填写宽度或高度");return;}
    if(w&&!h)h=Math.round(rsImg.height*w/rsImg.width);
    if(!w&&h)w=Math.round(rsImg.width*h/rsImg.height);
    var url=drawCanvas(rsImg,w,h).toDataURL("image/png");
    dl(url,"resized.png");
    $("rsOut").textContent="✓ 已生成 "+w+"×"+h+"，开始下载";
    $("rsOut").className="result ok";
    $("rsPrev").src=url;$("rsPrev").style.display="block";
  });
  /* 旋转翻转 */
  var roImg=null;
  $("roFile").addEventListener("change",function(){loadImg(this,function(img){roImg=img;$("roPrev").style.display="none";});});
  $("roGo").addEventListener("click",function(){
    if(!roImg){toast("请先选择图片");return;}
    var mode=$("roMode").value,c;
    if(mode==="h"||mode==="v"){
      c=document.createElement("canvas");c.width=roImg.width;c.height=roImg.height;
      var ctx=c.getContext("2d");
      ctx.translate(mode==="h"?c.width:0,mode==="v"?c.height:0);
      ctx.scale(mode==="h"?-1:1,mode==="v"?-1:1);
      ctx.drawImage(roImg,0,0);
    }else{
      var deg=+mode,swap=deg===90||deg===270;
      c=document.createElement("canvas");c.width=swap?roImg.height:roImg.width;c.height=swap?roImg.width:roImg.height;
      var ctx2=c.getContext("2d");
      ctx2.translate(c.width/2,c.height/2);ctx2.rotate(deg*Math.PI/180);
      ctx2.drawImage(roImg,-roImg.width/2,-roImg.height/2);
    }
    var url=c.toDataURL("image/png");
    dl(url,"rotated.png");
    $("roOut").textContent="✓ 处理完成，已开始下载";
    $("roOut").className="result ok";
    $("roPrev").src=url;$("roPrev").style.display="block";
  });
  /* 裁剪 */
  var crImg=null;
  $("crFile").addEventListener("change",function(){loadImg(this,function(img){crImg=img;
    $("crOut").textContent="原始尺寸："+img.width+"×"+img.height;$("crPrev").style.display="none";});});
  $("crGo").addEventListener("click",function(){
    if(!crImg){toast("请先选择图片");return;}
    var x=Math.max(0,+$("crX").value||0),y=Math.max(0,+$("crY").value||0);
    var w=Math.min(+$("crW").value||0,crImg.width-x),h=Math.min(+$("crH").value||0,crImg.height-y);
    if(w<=0||h<=0){toast("请填写有效的宽高");return;}
    var c=document.createElement("canvas");c.width=w;c.height=h;
    c.getContext("2d").drawImage(crImg,x,y,w,h,0,0,w,h);
    var url=c.toDataURL("image/png");
    dl(url,"cropped.png");
    $("crOut").textContent="✓ 已裁剪 "+w+"×"+h+"，开始下载";
    $("crOut").className="result ok";
    $("crPrev").src=url;$("crPrev").style.display="block";
  });
  /* 取色器 */
  var pkCanvas=$("pkCanvas"),pkCtx=null;
  $("pkFile").addEventListener("change",function(){loadImg(this,function(img){
    pkCanvas.width=img.width;pkCanvas.height=img.height;
    pkCtx=pkCanvas.getContext("2d");pkCtx.drawImage(img,0,0);
    pkCanvas.style.display="block";$("pkOut").textContent="已加载，点击图片任意位置取色";});});
  pkCanvas.addEventListener("click",function(e){
    if(!pkCtx)return;
    var r=pkCanvas.getBoundingClientRect();
    var x=Math.round((e.clientX-r.left)*pkCanvas.width/r.width);
    var y=Math.round((e.clientY-r.top)*pkCanvas.height/r.height);
    var d=pkCtx.getImageData(x,y,1,1).data;
    var hex="#"+[d[0],d[1],d[2]].map(function(v){return ("0"+v.toString(16)).slice(-2)}).join("").toUpperCase();
    $("pkOut").innerHTML="坐标 ("+x+", "+y+")：<b>"+hex+"</b> &nbsp; RGB("+d[0]+", "+d[1]+", "+d[2]+")";
    var sw=document.createElement("div");sw.className="sw";sw.style.background=hex;
    sw.innerHTML="<span>"+hex+"</span>";sw.title="点击复制";
    sw.addEventListener("click",function(){copyText(hex)});
    $("pkHist").insertAdjacentHTML("afterbegin","");
    $("pkHist").prepend(sw);
  });
  /* 水印 */
  var wmImg=null;
  $("wmFile").addEventListener("change",function(){loadImg(this,function(img){wmImg=img;$("wmPrev").style.display="none";});});
  $("wmGo").addEventListener("click",function(){
    if(!wmImg){toast("请先选择图片");return;}
    var text=$("wmText").value||"水印",size=+$("wmSize").value||28,op=+$("wmOp").value||0.4,pos=$("wmPos").value;
    var c=document.createElement("canvas");c.width=wmImg.width;c.height=wmImg.height;
    var ctx=c.getContext("2d");ctx.drawImage(wmImg,0,0);
    ctx.font=size+'px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillStyle="rgba(0,0,0,"+op+")";
    ctx.globalAlpha=op;
    ctx.fillStyle="#000";
    var m=ctx.measureText(text).width,pad=16,x,y;
    if(pos==="br"){x=c.width-m-pad;y=c.height-pad;}
    else if(pos==="bl"){x=pad;y=c.height-pad;}
    else if(pos==="tr"){x=c.width-m-pad;y=size+pad;}
    else if(pos==="tl"){x=pad;y=size+pad;}
    else{x=(c.width-m)/2;y=c.height/2;}
    ctx.fillText(text,x,y);
    var url=c.toDataURL("image/png");
    dl(url,"watermarked.png");
    $("wmOut").textContent="✓ 水印已添加，开始下载";
    $("wmOut").className="result ok";
    $("wmPrev").src=url;$("wmPrev").style.display="block";
  });
  /* 图片 Base64 */
  $("b6Go").addEventListener("click",function(){
    loadImg($("b6File"),function(img,f,url){
      $("b6Out").textContent=url;
      $("b6Out2").textContent="✓ 原始大小 "+fmtSize(f.size)+"，Base64 约 "+fmtSize(url.length)+"，已显示在上方文本框，全选复制即可使用";
      $("b6Out2").className="result ok";
    });
  });
  $("b6Back").addEventListener("click",function(){
    var s=$("b6In").value.trim();
    if(!s){toast("请先粘贴 Base64");return;}
    if(!/^data:image/i.test(s))s="data:image/png;base64,"+s;
    $("b6Prev").src=s;$("b6Prev").style.display="block";
    $("b6Out2").textContent="✓ 已还原（右键图片可另存）";
    $("b6Out2").className="result ok";
  });
  /* Favicon */
  $("fvGo").addEventListener("click",function(){
    loadImg($("fvFile"),function(img){
      var list=$("fvList");list.innerHTML="";
      var sizes=[16,32,48,64,128];
      sizes.forEach(function(s){
        var c=document.createElement("canvas");c.width=s;c.height=s;
        var ctx=c.getContext("2d");ctx.imageSmoothingEnabled=true;
        ctx.drawImage(img,0,0,s,s);
        var url=c.toDataURL("image/png");
        var sw=document.createElement("div");sw.className="sw";sw.style.background="url("+url+")";sw.style.backgroundSize="contain";sw.style.backgroundRepeat="no-repeat";sw.style.backgroundPosition="center";sw.style.background="#fff url("+url+") center/contain no-repeat";
        sw.innerHTML="<span>"+s+"px</span>";sw.title="点击下载 "+s+"px";
        sw.addEventListener("click",function(){dl(url,"favicon-"+s+".png")});
        list.appendChild(sw);
      });
      $("fvOut").textContent="✓ 生成完成，点击下方图标下载对应尺寸（建议在网站 head 中引用 32px 或 64px 版本）";
      $("fvOut").className="result ok";
    });
  });
});
