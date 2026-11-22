/* 颜色设计模块：颜色转换、配色生成、渐变生成、阴影生成 */
reg("colorconv","color","颜色转换","HEX / RGB / HSL 互转");
reg("palette","color","配色生成器","随机和谐色板，点击复制");
reg("gradient","color","渐变生成","CSS 渐变色代码生成");
reg("shadow","color","阴影生成","CSS box-shadow 调试");

panelHTML("colorconv","颜色转换","输入 HEX / RGB / HSL 任意一种格式，自动转换其余格式。",
 '<div class="row"><label>颜色值 <input type="text" id="ccIn" style="width:220px" placeholder="如 #2563eb 或 37,99,235"></label>'
+'<input type="color" id="ccPick" value="#2563eb" >'
+'<button class="btn" id="ccGo">转换</button></div>'
+'<div id="ccOut" class="out-box"></div><div id="ccSw" style="width:100%;height:64px;border-radius:10px;margin-top:10px;border:1px solid var(--border)"></div>');

panelHTML("palette","配色生成器","一键生成和谐配色，点击色块复制色值。",
 '<div class="row"><label>风格 <select id="plMode"><option value="analog">邻近色</option><option value="complement">互补色</option><option value="triad">三色组</option><option value="mono">单色系</option></select></label>'
+'<button class="btn" id="plGo">生成配色</button></div><div class="swatches" id="plOut" style="gap:10px"></div>');

panelHTML("gradient","CSS 渐变生成","调试 CSS 渐变背景并复制代码。",
 '<div class="row"><label>颜色1 <input type="color" id="grC1" value="#2563eb" ></label>'
+'<label>颜色2 <input type="color" id="grC2" value="#9333ea" ></label>'
+'<label>角度 <input type="range" id="grAng" min="0" max="360" value="135"> <b id="grAngV">135°</b></label>'
+'<label>类型 <select id="grType"><option value="linear">线性</option><option value="radial">径向</option></select></label></div>'
+'<div id="grPrev" style="height:120px;border-radius:12px;border:1px solid var(--border)"></div>'
+'<div class="row"><button class="btn ghost" id="grCopy" style="margin-top:10px">复制 CSS</button></div><div id="grCss" class="out-box"></div>');

panelHTML("shadow","CSS 阴影生成","实时调试 box-shadow 并复制代码。",
 '<div class="row"><label>X <input type="range" id="shX" min="-30" max="30" value="0"></label>'
+'<label>Y <input type="range" id="shY" min="-30" max="30" value="8"></label>'
+'<label>模糊 <input type="range" id="shB" min="0" max="60" value="24"></label>'
+'<label>扩散 <input type="range" id="shS" min="-20" max="30" value="0"></label>'
+'<label>颜色 <input type="color" id="shC" value="#2563eb" ></label></div>'
+'<div style="background:var(--bg);border-radius:12px;padding:50px;display:flex;justify-content:center">'
+'<div id="shBox" style="width:160px;height:100px;background:#fff;border-radius:12px"></div></div>'
+'<div class="row"><button class="btn ghost" id="shCopy" style="margin-top:10px">复制 CSS</button></div><div id="shCss" class="out-box"></div>');

init(function(){
  /* 颜色转换 */
  function hex2rgb(hex){
    var m=hex.replace("#","");
    if(m.length===3)m=m.split("").map(function(c){return c+c}).join("");
    if(!/^[0-9a-fA-F]{6}$/.test(m))return null;
    return [parseInt(m.slice(0,2),16),parseInt(m.slice(2,4),16),parseInt(m.slice(4,6),16)];
  }
  function rgb2hsl(r,g,b){
    r/=255;g/=255;b/=255;
    var mx=Math.max(r,g,b),mn=Math.min(r,g,b),h,s,l=(mx+mn)/2;
    if(mx===mn){h=s=0;}
    else{
      var d=mx-mn;
      s=l>.5?d/(2-mx-mn):d/(mx+mn);
      h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;
      h*=60;
    }
    return [Math.round(h),Math.round(s*100),Math.round(l*100)];
  }
  function out(picked){
    var rgb=hex2rgb(picked);
    if(!rgb){$("ccOut").textContent="无法识别颜色，请用 #RRGGBB 或 r,g,b 格式";return;}
    var hsl=rgb2hsl(rgb[0],rgb[1],rgb[2]);
    $("ccOut").textContent="HEX：#"+rgb.map(function(v){return ("0"+v.toString(16)).slice(-2)}).join("").toUpperCase()
      +"\nRGB：rgb("+rgb.join(", ")+")"
      +"\nHSL：hsl("+hsl[0]+", "+hsl[1]+"%, "+hsl[2]+"%)";
    $("ccSw").style.background=picked;
  }
  $("ccGo").addEventListener("click",function(){
    var v=$("ccIn").value.trim();
    if(/^\d+\s*,\s*\d+\s*,\s*\d+$/.test(v)){
      var p=v.split(",").map(function(x){return +x});
      out("#"+p.map(function(x){return ("0"+Math.max(0,Math.min(255,x)).toString(16)).slice(-2)}).join(""));
    }else out(v.startsWith("#")?v:"#"+v);
  });
  $("ccPick").addEventListener("input",function(e){$("ccIn").value=e.target.value.toUpperCase();out(e.target.value);});
  /* 配色生成 */
  function hsl2hex(h,s,l){
    s/=100;l/=100;
    var a=s*Math.min(l,1-l);
    var f=function(n){var k=(n+h/30)%12;return l-a*Math.max(-1,Math.min(k-3,9-k,1))};
    return "#"+[f(0),f(8),f(4)].map(function(v){return ("0"+Math.round(v*255).toString(16)).slice(-2)}).join("").toUpperCase();
  }
  $("plGo").addEventListener("click",function(){
    var mode=$("plMode").value,base=Math.floor(Math.random()*360),cols=[];
    if(mode==="analog")for(var i=0;i<5;i++)cols.push([base-30+i*15,55+Math.random()*25,38+i*9]);
    else if(mode==="complement")for(var i=0;i<5;i++){var h2=i<2?base:base+180;cols.push([h2+(i%2?12:0),50+i*8,30+i*13]);}
    else if(mode==="triad")for(var i=0;i<5;i++)cols.push([base+[0,120,240,0,120][i],55,30+i*12]);
    else for(var i=0;i<5;i++)cols.push([base,60,20+i*15]);
    var box=$("plOut");box.innerHTML="";
    cols.forEach(function(c){
      var hex=hsl2hex(c[0],c[1],c[2]);
      var sw=document.createElement("div");sw.className="sw";sw.style.background=hex;
      sw.innerHTML="<span>"+hex+"</span>";sw.title="点击复制 "+hex;
      sw.addEventListener("click",function(){copyText(hex)});
      box.appendChild(sw);
    });
  });
  $("plGo").click();
  /* 渐变 */
  function gradUpd(){
    var c1=$("grC1").value,c2=$("grC2").value,a=$("grAng").value,t=$("grType").value;
    $("grAngV").textContent=a+"°";
    var css=t==="linear"?("linear-gradient("+a+"deg, "+c1+", "+c2+")"):("radial-gradient(circle, "+c1+", "+c2+")");
    $("grPrev").style.background=css;
    $("grCss").textContent="background: "+css+";";
    $("grCss").dataset.css=css;
  }
  ["grC1","grC2","grAng","grType"].forEach(function(id){$(id).addEventListener("input",gradUpd)});
  gradUpd();
  $("grCopy").addEventListener("click",function(){copyText("background: "+$("grCss").dataset.css+";")});
  /* 阴影 */
  function shUpd(){
    var x=$("shX").value,y=$("shY").value,b=$("shB").value,s=$("shS").value,c=$("shC").value;
    var v=x+"px "+y+"px "+b+"px "+s+"px "+c;
    $("shBox").style.boxShadow=v;
    $("shCss").textContent="box-shadow: "+v+";";
  }
  ["shX","shY","shB","shS","shC"].forEach(function(id){$(id).addEventListener("input",shUpd)});
  shUpd();
  $("shCopy").addEventListener("click",function(){copyText($("shCss").textContent)});
});
