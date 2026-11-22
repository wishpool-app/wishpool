/* 文本工具模块：字数统计、去重、大小写、替换、行排序、去空白、标点、MD、随机文本、对比 */
reg("count","text","字数统计","字符、汉字、单词、标点统计");
reg("dedup","text","文本去重","按行去除重复内容");
reg("case","text","大小写转换","大写、小写、驼峰、下划线");
reg("replace","text","文本替换","支持正则的批量替换");
reg("sortlines","text","行排序","升序、降序、按长度、随机");
reg("trimlines","text","去空行空白","去空行、去首尾空格");
reg("punct","text","中英标点互转","中文标点 ↔ 英文标点");
reg("md2html","text","Markdown 转换","Markdown 转 HTML 源码");
reg("randomtext","text","随机文本生成","生成中文假文用于排版测试");
reg("diff","text","文本对比","逐行对比两段文字差异");

panelHTML("count","字数统计","实时统计，适合作文、论文、文案场景。",
 '<textarea id="cntIn" placeholder="在这里粘贴或输入文字…"></textarea>'
+'<div class="stat-grid"><div class="stat"><b id="c-total">0</b><span>总字符</span></div><div class="stat"><b id="c-han">0</b><span>汉字</span></div><div class="stat"><b id="c-word">0</b><span>英文单词</span></div><div class="stat"><b id="c-num">0</b><span>数字</span></div><div class="stat"><b id="c-line">0</b><span>行数</span></div><div class="stat"><b id="c-punc">0</b><span>标点</span></div></div>');

panelHTML("dedup","文本去重","按行去除重复内容，可选去空行、排序。",
 '<textarea id="ddIn" placeholder="每行一条，粘贴到这里…"></textarea>'
+'<div class="row" style="margin-top:10px"><label><input type="checkbox" id="ddBlank" checked> 去掉空行</label><label><input type="checkbox" id="ddSort"> 排序</label>'
+'<button class="btn" id="ddGo">去重</button><button class="btn ghost" id="ddCopy">复制结果</button></div>'
+'<textarea id="ddOut" placeholder="结果…" style="margin-top:10px"></textarea><div id="ddStat" class="result"></div>');

panelHTML("case","大小写 / 命名转换","英文文本各种大小写与命名风格转换。",
 '<textarea id="csIn" placeholder="输入英文文本，如 hello world user name"></textarea>'
+'<div class="row" style="margin-top:10px"><button class="btn" data-cs="upper">UPPER</button><button class="btn" data-cs="lower">lower</button><button class="btn" data-cs="cap">Capitalize</button><button class="btn" data-cs="camel">camelCase</button><button class="btn" data-cs="pascal">PascalCase</button><button class="btn" data-cs="snake">snake_case</button><button class="btn" data-cs="kebab">kebab-case</button></div>'
+'<div class="out-box" id="csOut"></div><div class="row"><button class="btn ghost" id="csCopy">复制结果</button></div>');

panelHTML("replace","文本替换","批量替换，支持正则表达式。",
 '<textarea id="rpIn" placeholder="原始文本…"></textarea>'
+'<div class="row" style="margin-top:10px"><label>查找 <input type="text" id="rpFind" style="width:200px"></label><label>替换为 <input type="text" id="rpTo" style="width:200px"></label>'
+'<label><input type="checkbox" id="rpRegex"> 使用正则</label><button class="btn" id="rpGo">替换</button></div>'
+'<textarea id="rpOut" placeholder="结果…" style="margin-top:10px"></textarea>');

panelHTML("sortlines","行排序","对每一行按不同规则排序。",
 '<textarea id="slIn" placeholder="每行一条…"></textarea>'
+'<div class="row" style="margin-top:10px"><button class="btn" data-sl="asc">升序</button><button class="btn" data-sl="desc">降序</button><button class="btn" data-sl="len">按长度</button><button class="btn" data-sl="shuffle">随机打乱</button><button class="btn" data-sl="reverse">倒序</button></div>'
+'<textarea id="slOut" placeholder="结果…" style="margin-top:10px"></textarea>');

panelHTML("trimlines","去空行 / 去空白","清理文本中的空行与多余空格。",
 '<textarea id="trIn" placeholder="粘贴文本…"></textarea>'
+'<div class="row" style="margin-top:10px"><label><input type="checkbox" id="trEmpty" checked> 去掉空行</label><label><input type="checkbox" id="trTrim" checked> 去首尾空格</label><label><input type="checkbox" id="trMulti"> 合并连续空格</label>'
+'<button class="btn" id="trGo">清理</button></div><textarea id="trOut" placeholder="结果…" style="margin-top:10px"></textarea>');

panelHTML("punct","中英标点互转","中文标点 ↔ 英文标点，一键互转。",
 '<textarea id="pnIn" placeholder="粘贴文本…"></textarea>'
+'<div class="row" style="margin-top:10px"><button class="btn" id="pn2en">中文 → 英文</button><button class="btn" id="pn2cn">英文 → 中文</button></div>'
+'<textarea id="pnOut" placeholder="结果…" style="margin-top:10px"></textarea>');

panelHTML("md2html","Markdown 转 HTML","常用语法：标题、加粗、斜体、列表、链接、行内代码、分隔线。",
 '<textarea id="mdIn" placeholder="# 标题&#10;**加粗** *斜体* `code`&#10;- 列表项&#10;[链接](https://example.com)"></textarea>'
+'<div class="row" style="margin-top:10px"><button class="btn" id="mdGo">转换</button><button class="btn ghost" id="mdCopy">复制 HTML</button></div>'
+'<textarea id="mdOut" placeholder="HTML 源码…" style="margin-top:10px"></textarea><div class="cat-title">渲染预览</div><div id="mdPrev" class="out-box"></div>');

panelHTML("randomtext","随机文本生成","生成中文假文，用于排版、占位测试。",
 '<div class="row"><label>段落数 <input type="number" id="rtN" value="3" min="1" max="20" style="width:70px"></label><button class="btn" id="rtGo">生成</button><button class="btn ghost" id="rtCopy">复制</button></div>'
+'<textarea id="rtOut" placeholder="结果…" style="margin-top:6px"></textarea>');

panelHTML("diff","文本对比","逐行对比两段文本，红色为 A 删除行，绿色为 B 新增行。",
 '<textarea id="dfA" placeholder="文本 A…"></textarea><textarea id="dfB" placeholder="文本 B…" style="margin-top:10px"></textarea>'
+'<div class="row" style="margin-top:10px"><button class="btn" id="dfGo">对比</button></div><div id="dfOut" class="out-box"></div>');

init(function(){
  /* 字数统计 */
  $("cntIn").addEventListener("input",function(e){
    var t=e.target.value;
    $("c-total").textContent=t.length;
    $("c-han").textContent=(t.match(/[\u4e00-\u9fa5]/g)||[]).length;
    $("c-word").textContent=(t.match(/[a-zA-Z]+/g)||[]).length;
    $("c-num").textContent=(t.match(/[0-9]+/g)||[]).length;
    $("c-line").textContent=t?t.split("\n").length:0;
    $("c-punc").textContent=(t.match(/[，。！？、；：""''（）,.!?;:()'"-]/g)||[]).length;
  });
  /* 文本去重 */
  $("ddGo").addEventListener("click",function(){
    var lines=$("ddIn").value.split("\n");
    if($("ddBlank").checked)lines=lines.filter(function(l){return l.trim()!==""});
    var seen={},out=[];
    lines.forEach(function(l){if(!seen[l]){seen[l]=1;out.push(l);}});
    if($("ddSort").checked)out.sort(function(a,b){return a.localeCompare(b,"zh")});
    $("ddOut").value=out.join("\n");
    $("ddStat").textContent="✓ 共 "+lines.length+" 行，去重后 "+out.length+" 行，移除 "+(lines.length-out.length)+" 行";
    $("ddStat").className="result ok";
  });
  $("ddCopy").addEventListener("click",function(){copyText($("ddOut").value)});
  /* 大小写 */
  $("csOut").textContent="";
  document.querySelectorAll("[data-cs]").forEach(function(b){
    b.addEventListener("click",function(){
      var words=$("csIn").value.trim().toLowerCase().split(/[^a-zA-Z0-9]+/).filter(Boolean);
      var m=b.getAttribute("data-cs"),r="";
      if(m==="upper")r=$("csIn").value.toUpperCase();
      else if(m==="lower")r=$("csIn").value.toLowerCase();
      else if(m==="cap")r=words.map(function(w){return w.charAt(0).toUpperCase()+w.slice(1)}).join(" ");
      else if(m==="camel")r=words.map(function(w,i){return i?w.charAt(0).toUpperCase()+w.slice(1):w}).join("");
      else if(m==="pascal")r=words.map(function(w){return w.charAt(0).toUpperCase()+w.slice(1)}).join("");
      else if(m==="snake")r=words.join("_");
      else if(m==="kebab")r=words.join("-");
      $("csOut").textContent=r;
    });
  });
  $("csCopy").addEventListener("click",function(){copyText($("csOut").textContent)});
  /* 替换 */
  $("rpGo").addEventListener("click",function(){
    var s=$("rpIn").value,find=$("rpFind").value,to=$("rpTo").value;
    if(!find){toast("请输入查找内容");return;}
    var out;
    try{
      if($("rpRegex").checked)out=s.replace(new RegExp(find,"g"),to);
      else out=s.split(find).join(to);
    }catch(e){toast("正则有误："+e.message);return;}
    $("rpOut").value=out;
    toast("替换完成");
  });
  /* 行排序 */
  document.querySelectorAll("[data-sl]").forEach(function(b){
    b.addEventListener("click",function(){
      var lines=$("slIn").value.split("\n").filter(function(l){return l.trim()!==""});
      var m=b.getAttribute("data-sl");
      if(m==="asc")lines.sort(function(a,b){return a.localeCompare(b,"zh")});
      else if(m==="desc")lines.sort(function(a,b){return b.localeCompare(a,"zh")});
      else if(m==="len")lines.sort(function(a,b){return a.length-b.length});
      else if(m==="shuffle"){for(var i=lines.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=lines[i];lines[i]=lines[j];lines[j]=t;}}
      else if(m==="reverse")lines.reverse();
      $("slOut").value=lines.join("\n");
      toast("完成");
    });
  });
  /* 去空行 */
  $("trGo").addEventListener("click",function(){
    var lines=$("trIn").value.split("\n");
    lines=lines.map(function(l){
      var r=l;
      if($("trTrim").checked)r=r.trim();
      if($("trMulti").checked)r=r.replace(/\s{2,}/g," ");
      return r;
    });
    if($("trEmpty").checked)lines=lines.filter(function(l){return l!==""});
    $("trOut").value=lines.join("\n");
    toast("清理完成");
  });
  /* 标点互转 */
  var cnP="，。！？；：（）【】《》、“”‘’、—…";
  var enP=",.!?;:()[]<>\"\"''-,..";
  var pairs=[["，",","],["。","."],["！","!"],["？","?"],["；",";"],["：",":"],["（","("],["）",")"],["【","["],["】","]"],["《","<"],["》",">"],["、",","],["—","-"],["…","..."],["\u201c","\""],["\u201d","\""],["\u2018","'"],["\u2019","'"]];
  function mapP(s,dir){
    pairs.forEach(function(p){
      var a=dir==="2en"?p[0]:p[1],b=dir==="2en"?p[1]:p[0];
      if(dir==="2cn"&&p[1]===".")return; /* 英文句点不转中文句号，避免破坏小数 */
      s=s.split(a).join(b);
    });
    return s;
  }
  $("pn2en").addEventListener("click",function(){$("pnOut").value=mapP($("pnIn").value,"2en")});
  $("pn2cn").addEventListener("click",function(){$("pnOut").value=mapP($("pnIn").value,"2cn")});
  /* MD 转 HTML */
  function esc(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
  $("mdGo").addEventListener("click",function(){
    var out=$("mdIn").value.split("\n").map(function(line){
      var l=esc(line);
      l=l.replace(/^### (.*)$/,"<h3>$1</h3>").replace(/^## (.*)$/,"<h2>$1</h2>").replace(/^# (.*)$/,"<h1>$1</h1>");
      l=l.replace(/^\s*[-*] (.*)$/,"<li>$1</li>");
      l=l.replace(/^---$/,"<hr>");
      l=l.replace(/\*\*(.+?)\*\*/g,"<b>$1</b>").replace(/\*(.+?)\*/g,"<i>$1</i>");
      l=l.replace(/`(.+?)`/g,"<code>$1</code>");
      l=l.replace(/\[(.+?)\]\((.+?)\)/g,'<a href="$2">$1</a>');
      return l;
    }).join("\n");
    $("mdOut").value=out;
    $("mdPrev").innerHTML=out;
    $("mdPrev").querySelectorAll("a").forEach(function(a){a.target="_blank"});
  });
  $("mdCopy").addEventListener("click",function(){copyText($("mdOut").value)});
  /* 随机文本 */
  var bank="春日的阳光洒在窗台上；远处的山峦笼罩着薄雾；他推开门走进安静的院子；咖啡的香气弥漫在空气里；孩子们在草地上追逐嬉戏；夜色渐深城市亮起灯火；一本书放在桌角还没有读完；风把落叶吹到小径上；我们沿着河边慢慢散步；时间就这样悄悄流逝过去；她的笑容让人安心；窗外的雨敲打着玻璃；记忆像潮水一样涌来；未来总是充满无限可能；生活需要一点小小的仪式感。".split("；");
  $("rtGo").addEventListener("click",function(){
    var n=Math.min(20,Math.max(1,+$("rtN").value||3)),paras=[];
    for(var i=0;i<n;i++){
      var sent=[];
      for(var j=0;j<5;j++)sent.push(bank[Math.floor(Math.random()*bank.length)]);
      paras.push(sent.join("")+"");
    }
    $("rtOut").value=paras.join("\n\n");
  });
  $("rtCopy").addEventListener("click",function(){copyText($("rtOut").value)});
  /* 文本对比 */
  $("dfGo").addEventListener("click",function(){
    var A=$("dfA").value.split("\n"),B=$("dfB").value.split("\n");
    var n=A.length,m=B.length,dp=[],i,j;
    for(i=0;i<=n;i++){dp[i]=new Array(m+1);dp[i][0]=0;}
    for(j=0;j<=m;j++)dp[0][j]=0;
    for(i=1;i<=n;i++)for(j=1;j<=m;j++)
      dp[i][j]=A[i-1]===B[j-1]?dp[i-1][j-1]+1:Math.max(dp[i-1][j],dp[i][j-1]);
    var out=[],i2=n,j2=m;
    while(i2>0&&j2>0){
      if(A[i2-1]===B[j2-1]){out.unshift(['=',A[i2-1]]);i2--;j2--;}
      else if(dp[i2-1][j2]>=dp[i2][j2-1]){out.unshift(['-',A[i2-1]]);i2--;}
      else{out.unshift(['+',B[j2-1]]);j2--;}
    }
    while(i2>0){out.unshift(['-',A[i2-1]]);i2--;}
    while(j2>0){out.unshift(['+',B[j2-1]]);j2--;}
    if(!out.length){$("dfOut").textContent="两段文本完全相同";return;}
    $("dfOut").innerHTML=out.map(function(o){
      if(o[0]==="-")return '<span class="diff-del">− '+esc(o[1])+"</span>";
      if(o[0]==="+")return '<span class="diff-add">+ '+esc(o[1])+"</span>";
      return "&nbsp; "+esc(o[1]);
    }).join("");
  });
});
