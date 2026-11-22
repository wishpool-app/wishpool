/* 二维码与文档模块：二维码生成、二维码解析、图片转 PDF */
reg("qrgen","qr","二维码生成","网址、文本生成二维码");
reg("qrparse","qr","二维码解析","从图片中识别二维码内容");
reg("img2pdf","qr","图片转 PDF","多张图片合并为一个 PDF 文件");

panelHTML("qrgen","二维码生成","输入网址或文字生成二维码（支持自定义颜色与尺寸）。",
 '<div class="row"><textarea id="qgIn" placeholder="输入网址或文本，如 https://example.com" style="min-height:90px"></textarea></div>'
+'<div class="row"><label>尺寸 <input type="number" id="qgSize" value="280" min="100" max="800" style="width:80px"> px</label>'
+'<label>颜色 <input type="color" id="qgColor" value="#1f2937"></label>'
+'<button class="btn" id="qgGo">生成二维码</button><button class="btn ghost" id="qgDl" style="display:none">下载 PNG</button></div>'
+'<div id="qgOut" class="result"></div><div id="qgBox" style="text-align:center;margin-top:12px"></div>');

panelHTML("qrparse","二维码解析","上传含二维码的图片，本地识别其中的内容。",
 '<div class="row"><input type="file" id="qpFile" accept="image/*"></div>'
+'<div id="qpOut" class="result"></div><img id="qpPrev" class="preview" style="display:none">');

panelHTML("img2pdf","图片转 PDF","选择多张图片（按选择顺序），每张一页，合并为 PDF。",
 '<div class="row"><input type="file" id="pfFile" accept="image/*" multiple></div>'
+'<div class="row"><button class="btn" id="pfGo">生成 PDF</button></div>'
+'<div id="pfOut" class="result"></div><div id="pfList" class="swatches"></div>');

init(function(){
  /* 二维码生成 */
  var qgLast=null;
  function qgDo(){
    var text=$("qgIn").value.trim();
    if(!text){toast("请输入内容");return;}
    if(typeof QRCode==="undefined"){$("qgOut").textContent="✕ 二维码组件未加载，请刷新页面重试";$("qgOut").className="result err";return;}
    var size=Math.min(800,Math.max(100,+$("qgSize").value||280));
    var box=$("qgBox");box.innerHTML="";qgLast=null;$("qgDl").style.display="none";
    try{
      new QRCode(box,{text:text,width:size,height:size,colorDark:$("qgColor").value,colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.M});
    }catch(e){
      $("qgOut").textContent="✕ 生成失败："+(e&&e.message?e.message:"内容过长，请缩短文字")+"";
      $("qgOut").className="result err";return;
    }
    var cv=box.querySelector("canvas");
    if(cv){
      cv.style.maxWidth="100%";cv.style.borderRadius="10px";cv.style.border="1px solid var(--border)";
      try{qgLast=cv.toDataURL("image/png");}catch(e){}
    }
    if(!qgLast){
      var im=box.querySelector("img");
      if(im){im.style.maxWidth="100%";im.style.borderRadius="10px";qgLast=im.src;}
    }
    if(qgLast){
      $("qgOut").textContent="✓ 生成完成。手机长按图片、电脑右键图片可保存。";
      $("qgOut").className="result ok";$("qgDl").style.display="inline-block";
    }else{
      $("qgOut").textContent="✕ 渲染失败，请换用电脑浏览器试试";$("qgOut").className="result err";
    }
  }
  $("qgGo").addEventListener("click",qgDo);
  $("qgDl").addEventListener("click",function(){if(qgLast)dl(qgLast,"qrcode.png")});
  /* 二维码解析 */
  $("qpFile").addEventListener("change",function(){
    var input=this;
    $("qpOut").textContent="正在加载识别组件…";$("qpOut").className="result";
    loadLib("vendor/jsQR.js").then(function(){
      $("qpOut").textContent="";
      loadImg(input,function(img,f,url){
        $("qpPrev").src=url;$("qpPrev").style.display="block";
        var c=document.createElement("canvas");c.width=img.width;c.height=img.height;
        var ctx=c.getContext("2d");ctx.drawImage(img,0,0);
        var data=ctx.getImageData(0,0,c.width,c.height);
        var res=jsQR(data.data,data.width,data.height);
        if(res){
          $("qpOut").innerHTML="✓ 识别成功：<div class=\"out-box\" id=\"qpText\"></div>";
          $("qpText").textContent=res.data;
          var b=document.createElement("button");b.className="btn ghost";b.textContent="复制内容";
          b.onclick=function(){copyText(res.data)};
          $("qpText").appendChild(b);
          $("qpOut").className="result ok";
        }else{
          $("qpOut").textContent="✕ 未识别到二维码，请确保图片清晰、二维码完整";
          $("qpOut").className="result err";
        }
      });
    }).catch(function(){
      $("qpOut").textContent="✕ 识别组件加载失败，请检查网络后重试";$("qpOut").className="result err";
    });
  });
  /* 图片转 PDF */
  $("pfGo").addEventListener("click",function(){
    var files=$("pfFile").files;
    if(!files||!files.length){toast("请先选择图片（可多选）");return;}
    $("pfOut").textContent="正在加载 PDF 组件…";$("pfOut").className="result";
    loadLib("vendor/jspdf.umd.min.js").then(function(){
      $("pfOut").textContent="正在生成 PDF…";
      var loaded=[],promises=[];
      Array.from(files).forEach(function(f){
        promises.push(new Promise(function(res){
          var r=new FileReader();
          r.onload=function(){var img=new Image();img.onload=function(){loaded.push({img:img,name:f.name});res();};img.src=r.result;};
          r.readAsDataURL(f);
        }));
      });
      return Promise.all(promises).then(function(){
        loaded.sort(function(a,b){return a.name.localeCompare(b.name)});
        var doc=new window.jspdf.jsPDF({unit:"pt",format:"a4"});
        var pw=doc.internal.pageSize.getWidth(),ph=doc.internal.pageSize.getHeight();
        loaded.forEach(function(item,i){
          if(i>0)doc.addPage();
          var w=item.img.width,h=item.img.height;
          var s=Math.min((pw-40)/w,(ph-40)/h);
          doc.addImage(item.img.src,"JPEG",(pw-w*s)/2,(ph-h*s)/2,w*s,h*s);
        });
        doc.save("images.pdf");
        $("pfOut").textContent="✓ 已生成包含 "+loaded.length+" 页的 PDF，开始下载";
        $("pfOut").className="result ok";
      });
    }).catch(function(){
      $("pfOut").textContent="✕ PDF 组件加载失败，请检查网络后重试";$("pfOut").className="result err";
    });
  });
  $("pfFile").addEventListener("change",function(){
    var list=$("pfList");list.innerHTML="";
    Array.from(this.files).forEach(function(f){
      var r=new FileReader();
      r.onload=function(){
        var sw=document.createElement("div");sw.className="sw";sw.style.background="#fff url("+r.result+") center/contain no-repeat";
        sw.innerHTML="<span>"+f.name+"</span>";
        list.appendChild(sw);
      };
      r.readAsDataURL(f);
    });
    $("pfOut").textContent="已选择 "+this.files.length+" 张图片，点击「生成 PDF」";
  });
});
