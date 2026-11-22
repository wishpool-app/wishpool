/* 开发工具模块：JSON、URL、Base64、SHA、文件哈希、正则、HTML转义、进制、UUID、密码、时间戳、CSV */
reg("json","dev","JSON 格式化","美化、压缩、校验 JSON");
reg("urlcodec","dev","URL 编解码","URL 编码与解码");
reg("b64","dev","Base64 编解码","文本 Base64 编码与解码");
reg("sha","dev","SHA 哈希","SHA-1/256/384/512 摘要");
reg("filehash","dev","文件哈希","计算文件 SHA-256 校验值");
reg("regex","dev","正则测试","在线测试正则表达式");
reg("htmlesc","dev","HTML 转义","HTML 实体转义与还原");
reg("radix","dev","进制转换","2/8/10/16 进制互转");
reg("uuid","dev","UUID 生成","批量生成 UUID v4");
reg("pwd","dev","随机密码","可定制强度的密码生成器");
reg("ts","dev","时间戳转换","Unix 时间戳与日期互转");
reg("csv","dev","CSV ⇄ JSON","CSV 与 JSON 相互转换");

panelHTML("json","JSON 格式化","美化 / 压缩 JSON，校验语法错误。",
 '<textarea id="jsIn" placeholder=\'粘贴 JSON，如 {"name":"工具箱","v":1}\'></textarea>'
+'<div class="row" style="margin-top:10px"><label>缩进 <select id="jsIndent"><option>2</option><option>4</option><option>8</option></select></label>'
+'<button class="btn" id="jsFmt">格式化</button><button class="btn ghost" id="jsMin">压缩</button><button class="btn ghost" id="jsCopy">复制</button></div>'
+'<textarea id="jsOut" placeholder="结果…" style="margin-top:10px"></textarea><div id="jsStat" class="result"></div>');

panelHTML("urlcodec","URL 编解码","URL 百分号编码与解码。",
 '<textarea id="ucIn" placeholder="输入内容…"></textarea>'
+'<div class="row" style="margin-top:10px"><button class="btn" id="ucEnc">编码</button><button class="btn" id="ucDec">解码</button><button class="btn ghost" id="ucCopy">复制</button></div>'
+'<textarea id="ucOut" placeholder="结果…" style="margin-top:10px"></textarea>');

panelHTML("b64","Base64 编解码","文本与 Base64 互转（支持中文）。",
 '<textarea id="b4In" placeholder="输入文本或 Base64…"></textarea>'
+'<div class="row" style="margin-top:10px"><button class="btn" id="b4Enc">编码</button><button class="btn" id="b4Dec">解码</button><button class="btn ghost" id="b4Copy">复制</button></div>'
+'<textarea id="b4Out" placeholder="结果…" style="margin-top:10px"></textarea>');

panelHTML("sha","SHA 哈希","计算文本的 SHA-1 / SHA-256 / SHA-384 / SHA-512 摘要（浏览器原生加密接口）。",
 '<textarea id="shIn" placeholder="输入文本…"></textarea>'
+'<div class="row" style="margin-top:10px"><button class="btn" data-sh="SHA-1">SHA-1</button><button class="btn" data-sh="SHA-256">SHA-256</button><button class="btn" data-sh="SHA-384">SHA-384</button><button class="btn" data-sh="SHA-512">SHA-512</button></div>'
+'<div id="shOut" class="out-box"></div>');

panelHTML("filehash","文件哈希","计算文件的 SHA-256 / SHA-1 校验值，用于验证文件完整性。",
 '<div class="row"><input type="file" id="fhFile"></div>'
+'<div class="row"><button class="btn" data-fh="SHA-256">计算 SHA-256</button><button class="btn" data-fh="SHA-1">计算 SHA-1</button></div>'
+'<div id="fhOut" class="out-box"></div>');

panelHTML("regex","正则测试","输入正则与测试文本，查看全部匹配结果。",
 '<div class="row"><label>正则 <input type="text" id="rePat" style="width:280px" placeholder="如 \\d+" value=""></label>'
+'<label>标志 <input type="text" id="reFlags" style="width:70px" value="g"></label>'
+'<button class="btn" id="reGo">测试</button></div>'
+'<textarea id="reText" placeholder="测试文本…" style="margin-top:6px"></textarea>'
+'<div id="reOut" class="result"></div>');

panelHTML("htmlesc","HTML 转义","HTML 特殊字符与实体互转。",
 '<textarea id="heIn" placeholder="输入内容…"></textarea>'
+'<div class="row" style="margin-top:10px"><button class="btn" id="heEsc">转义 &lt; &gt; &amp;</button><button class="btn" id="heUnesc">还原实体</button><button class="btn ghost" id="heCopy">复制</button></div>'
+'<textarea id="heOut" placeholder="结果…" style="margin-top:10px"></textarea>');

panelHTML("radix","进制转换","2 / 8 / 10 / 16 进制互转（支持整数）。",
 '<div class="row"><label>数值 <input type="text" id="rdIn" style="width:220px" placeholder="如 FF 或 255"></label>'
+'<label>原进制 <select id="rdFrom"><option value="10">10 进制</option><option value="2">2 进制</option><option value="8">8 进制</option><option value="16">16 进制</option></select></label></div>'
+'<div class="row"><button class="btn" id="rdGo">转换</button></div><div id="rdOut" class="out-box"></div>');

panelHTML("uuid","UUID 生成","批量生成 UUID v4（随机唯一标识符）。",
 '<div class="row"><label>数量 <input type="number" id="uuN" value="5" min="1" max="100" style="width:70px"></label>'
+'<label><input type="checkbox" id="uuUpper"> 大写</label><label><input type="checkbox" id="uuLine"> 去掉连字符</label>'
+'<button class="btn" id="uuGo">生成</button></div><div id="uuOut" class="out-box"></div>');

panelHTML("pwd","随机密码生成","本地生成高强度随机密码，绝不联网。",
 '<div class="row"><label>长度 <input type="number" id="pwLen" value="16" min="6" max="64" style="width:70px"></label>'
+'<label>数量 <input type="number" id="pwN" value="5" min="1" max="20" style="width:70px"></label></div>'
+'<div class="row"><label><input type="checkbox" id="pwU" checked> 大写 A-Z</label><label><input type="checkbox" id="pwL" checked> 小写 a-z</label>'
+'<label><input type="checkbox" id="pwD" checked> 数字 0-9</label><label><input type="checkbox" id="pwS" checked> 符号 !@#$</label>'
+'<button class="btn" id="pwGo">生成</button></div><div id="pwOut" class="out-box"></div>');

panelHTML("ts","时间戳转换","Unix 时间戳与日期时间互转。",
 '<div class="row"><label>当前时间戳：<b id="tsNow" style="color:var(--primary)"></b></label><button class="btn ghost" id="tsRefresh">刷新</button></div>'
+'<div class="row"><input type="text" id="tsIn" placeholder="输入时间戳，如 1760000000"><button class="btn" id="tsToD">时间戳 → 日期</button></div>'
+'<div class="row"><input type="datetime-local" id="dtIn"><button class="btn" id="dtToTs">日期 → 时间戳</button></div>'
+'<div id="tsOut" class="result"></div>');

panelHTML("csv","CSV ⇄ JSON","CSV 与 JSON 相互转换（首行为表头）。",
 '<textarea id="cvIn" placeholder="CSV 或 JSON 输入…"></textarea>'
+'<div class="row" style="margin-top:10px"><button class="btn" id="cv2j">CSV → JSON</button><button class="btn" id="jv2c">JSON → CSV</button><button class="btn ghost" id="cvCopy">复制</button></div>'
+'<textarea id="cvOut" placeholder="结果…" style="margin-top:10px"></textarea><div id="cvStat" class="result"></div>');

init(function(){
  /* JSON */
  $("jsFmt").addEventListener("click",function(){
    try{var o=JSON.parse($("jsIn").value);
      $("jsOut").value=JSON.stringify(o,null,+$("jsIndent").value);
      $("jsStat").textContent="✓ JSON 有效，已格式化";$("jsStat").className="result ok";
    }catch(err){$("jsStat").textContent="✕ JSON 语法错误："+err.message;$("jsStat").className="result err";}
  });
  $("jsMin").addEventListener("click",function(){
    try{$("jsOut").value=JSON.stringify(JSON.parse($("jsIn").value));
      $("jsStat").textContent="✓ 已压缩";$("jsStat").className="result ok";
    }catch(err){$("jsStat").textContent="✕ "+err.message;$("jsStat").className="result err";}
  });
  $("jsCopy").addEventListener("click",function(){copyText($("jsOut").value)});
  /* URL */
  $("ucEnc").addEventListener("click",function(){try{$("ucOut").value=encodeURIComponent($("ucIn").value)}catch(e){}});
  $("ucDec").addEventListener("click",function(){try{$("ucOut").value=decodeURIComponent($("ucIn").value.replace(/\+/g," "))}catch(e){toast("无法解码：格式有误")}});
  $("ucCopy").addEventListener("click",function(){copyText($("ucOut").value)});
  /* Base64 */
  function b64enc(s){return btoa(unescape(encodeURIComponent(s)))}
  function b64dec(s){return decodeURIComponent(escape(atob(s.replace(/\s/g,""))))}
  $("b4Enc").addEventListener("click",function(){try{$("b4Out").value=b64enc($("b4In").value)}catch(e){toast("编码失败")}});
  $("b4Dec").addEventListener("click",function(){try{$("b4Out").value=b64dec($("b4In").value)}catch(e){toast("解码失败：不是有效的 Base64")}});
  $("b4Copy").addEventListener("click",function(){copyText($("b4Out").value)});
  /* SHA */
  async function shaHex(algo,text){
    var buf=await crypto.subtle.digest(algo,new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(function(b){return ("0"+b.toString(16)).slice(-2)}).join("");
  }
  document.querySelectorAll("[data-sh]").forEach(function(b){
    b.addEventListener("click",async function(){
      try{
        var h=await shaHex(b.getAttribute("data-sh"),$("shIn").value);
        $("shOut").textContent=b.getAttribute("data-sh")+"：\n"+h;
        $("shOut").style.color="var(--primary)";
      }catch(e){$("shOut").textContent="当前环境不支持 SubtleCrypto（请用 https 或 localhost 访问）";}
    });
  });
  /* 文件哈希 */
  document.querySelectorAll("[data-fh]").forEach(function(b){
    b.addEventListener("click",async function(){
      var f=$("fhFile").files&&$("fhFile").files[0];
      if(!f){toast("请先选择文件");return;}
      $("fhOut").textContent="计算中…";
      try{
        var buf=await f.arrayBuffer();
        var dig=await crypto.subtle.digest(b.getAttribute("data-fh"),buf);
        var hex=Array.from(new Uint8Array(dig)).map(function(x){return ("0"+x.toString(16)).slice(-2)}).join("");
        $("fhOut").textContent=f.name+"（"+fmtSize(f.size)+"）\n"+b.getAttribute("data-fh")+"：\n"+hex;
      }catch(e){$("fhOut").textContent="计算失败："+e.message;}
    });
  });
  /* 正则 */
  $("reGo").addEventListener("click",function(){
    var pat=$("rePat").value,fl=$("reFlags").value||"g",text=$("reText").value;
    if(!pat){toast("请输入正则");return;}
    try{
      var re=new RegExp(pat,fl.includes("g")?fl:fl+"g");
      var m,c=0,out=[];
      while((m=re.exec(text))!==null){
        c++;out.push("第"+c+"处（位置 "+m.index+"）："+m[0]+(m.length>1?"，分组："+m.slice(1).join(" | "):""));
        if(m.index===re.lastIndex)re.lastIndex++;
      }
      $("reOut").textContent=c?("✓ 共 "+c+" 处匹配：\n"+out.join("\n")):"没有找到匹配";
      $("reOut").className="result "+(c?"ok":"");
    }catch(e){$("reOut").textContent="✕ 正则错误："+e.message;$("reOut").className="result err";}
  });
  /* HTML 转义 */
  $("heEsc").addEventListener("click",function(){
    $("heOut").value=$("heIn").value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
  });
  $("heUnesc").addEventListener("click",function(){
    var d=document.createElement("div");d.innerHTML=$("heIn").value;
    $("heOut").value=d.textContent;
  });
  $("heCopy").addEventListener("click",function(){copyText($("heOut").value)});
  /* 进制 */
  $("rdGo").addEventListener("click",function(){
    var v=$("rdIn").value.trim(),from=+$("rdFrom").value;
    var n=parseInt(v,from);
    if(isNaN(n)||!/^[0-9a-zA-Z]+$/.test(v)){$("rdOut").textContent="✕ 无效数值";return;}
    $("rdOut").textContent="2 进制：\n"+n.toString(2)+"\n\n8 进制：\n"+n.toString(8)+"\n\n10 进制：\n"+n.toString(10)+"\n\n16 进制：\n"+n.toString(16).toUpperCase();
  });
  /* UUID */
  $("uuGo").addEventListener("click",function(){
    var n=Math.min(100,Math.max(1,+$("uuN").value||5)),out=[];
    for(var i=0;i<n;i++){
      var u=(crypto.randomUUID?crypto.randomUUID():("xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(c){var r=Math.random()*16|0;return (c==="x"?r:(r&0x3|0x8)).toString(16)})));
      if($("uuUpper").checked)u=u.toUpperCase();
      if($("uuLine").checked)u=u.replace(/-/g,"");
      out.push(u);
    }
    $("uuOut").textContent=out.join("\n");
  });
  /* 密码 */
  $("pwGo").addEventListener("click",function(){
    var len=Math.min(64,Math.max(6,+$("pwLen").value||16));
    var n=Math.min(20,Math.max(1,+$("pwN").value||5));
    var chars="";
    if($("pwU").checked)chars+="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if($("pwL").checked)chars+="abcdefghijklmnopqrstuvwxyz";
    if($("pwD").checked)chars+="0123456789";
    if($("pwS").checked)chars+="!@#$%^&*()-_=+[]{};:,.<>?";
    if(!chars){toast("请至少选择一种字符类型");return;}
    var out=[];
    for(var i=0;i<n;i++){
      var p="";
      var arr=new Uint32Array(len);crypto.getRandomValues(arr);
      for(var j=0;j<len;j++)p+=chars[arr[j]%chars.length];
      out.push(p);
    }
    $("pwOut").textContent=out.join("\n");
  });
  /* 时间戳 */
  function tick(){$("tsNow").textContent=Math.floor(Date.now()/1000);}
  tick();setInterval(tick,1000);
  $("tsRefresh").addEventListener("click",tick);
  $("tsToD").addEventListener("click",function(){
    var v=$("tsIn").value.trim();if(!v)return;
    var n=Number(v);if(v.length===13)n=n/1000;
    var d=new Date(n*1000);
    $("tsOut").textContent=isNaN(d)?"✕ 无效时间戳":"✓ "+d.toLocaleString("zh-CN")+"（本地时间）";
    $("tsOut").className="result "+(isNaN(d)?"err":"ok");
  });
  $("dtToTs").addEventListener("click",function(){
    var v=$("dtIn").value;if(!v)return;
    $("tsOut").textContent="✓ "+Math.floor(new Date(v).getTime()/1000)+"（秒） / "+new Date(v).getTime()+"（毫秒）";
    $("tsOut").className="result ok";
  });
  /* CSV ⇄ JSON */
  function parseCSV(text){
    var rows=[],row=[],cur="",inQ=false;
    for(var i=0;i<text.length;i++){
      var ch=text[i];
      if(inQ){
        if(ch==='"'){if(text[i+1]==='"'){cur+='"';i++;}else inQ=false;}
        else cur+=ch;
      }else{
        if(ch==='"')inQ=true;
        else if(ch===","){row.push(cur);cur="";}
        else if(ch==="\n"||ch==="\r"){if(ch==="\r"&&text[i+1]==="\n")i++;row.push(cur);cur="";rows.push(row);row=[];}
        else cur+=ch;
      }
    }
    if(cur!==""||row.length){row.push(cur);rows.push(row);}
    return rows.filter(function(r){return r.length>1||r[0]!==""});
  }
  $("cv2j").addEventListener("click",function(){
    var rows=parseCSV($("cvIn").value);
    if(rows.length<2){$("cvStat").textContent="✕ 至少需要表头和一行数据";$("cvStat").className="result err";return;}
    var head=rows[0],out=[];
    for(var i=1;i<rows.length;i++){
      var o={};head.forEach(function(h,j){o[h.trim()]=rows[i][j]||""});out.push(o);
    }
    $("cvOut").value=JSON.stringify(out,null,2);
    $("cvStat").textContent="✓ 解析 "+(rows.length-1)+" 行数据";$("cvStat").className="result ok";
  });
  $("jv2c").addEventListener("click",function(){
    try{
      var arr=JSON.parse($("cvIn").value);
      if(!Array.isArray(arr)||!arr.length)throw new Error("需要 JSON 数组");
      var head=Object.keys(arr[0]);
      function cell(v){v=v==null?"":String(v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;}
      var lines=[head.join(",")];
      arr.forEach(function(o){lines.push(head.map(function(h){return cell(o[h])}).join(","))});
      $("cvOut").value=lines.join("\n");
      $("cvStat").textContent="✓ 生成 "+arr.length+" 行 CSV";$("cvStat").className="result ok";
    }catch(e){$("cvStat").textContent="✕ "+e.message;$("cvStat").className="result err";}
  });
  $("cvCopy").addEventListener("click",function(){copyText($("cvOut").value)});
});
