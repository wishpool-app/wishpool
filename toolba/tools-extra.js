/* 扩展工具模块（第一批 12 个）：数据转换、开发辅助、二维码、图片处理 */
reg("yaml","dev","JSON ⇄ YAML","JSON 与 YAML 相互转换");
reg("xml2json","dev","XML ⇄ JSON","XML 与 JSON 相互转换");
reg("json2ts","dev","JSON 转 TS","由 JSON 自动生成 TypeScript 类型");
reg("sqlformat","dev","SQL 格式化","SQL 语句美化与关键字大写");
reg("jwt","dev","JWT 解析","解析 JWT 的头部与载荷内容");
reg("cron","dev","Cron 表达式","解析 Cron 并计算下次执行时间");
reg("md5","dev","MD5 加密","文本 MD5 摘要（32/16 位）");
reg("px2rem","dev","px 转 rem","px / rem / rpx / vw 互转");
reg("qrwifi","qr","WiFi 二维码","扫码直接连 WiFi，免输密码");
reg("barcode","qr","条形码生成","生成 CODE128 等标准条形码");
reg("imgmerge","img","图片拼接","多张图片横向或纵向拼成一张");
reg("gray","img","图片黑白","灰度、黑白二值、复古色调");

/* ========== 1. JSON ⇄ YAML ========== */
panelHTML("yaml","JSON ⇄ YAML","左边粘 JSON，一键转 YAML；也能把 YAML 还原成 JSON。",
 '<textarea id="ymIn" placeholder=\'粘贴 JSON，如 {"name":"工具吧","tools":["json","yaml"]}\'></textarea>'
+'<div class="row" style="margin-top:10px"><button class="btn" id="ymJ2Y">JSON → YAML</button>'
+'<button class="btn" id="ymY2J">YAML → JSON</button><button class="btn ghost" id="ymCopy">复制结果</button></div>'
+'<textarea id="ymOut" placeholder="结果…" style="margin-top:10px"></textarea><div id="ymStat" class="result"></div>');

init(function(){
  function yQuote(s){
    if(s==="")return '""';
    if(/^\s|\s$/.test(s))return JSON.stringify(s);
    if(/^[-?:,\[\]{}#&*!|>'"%@`]/.test(s))return JSON.stringify(s);
    if(/:\s| #/.test(s))return JSON.stringify(s);
    if(/^(true|false|null|yes|no|on|off|~)$/i.test(s))return JSON.stringify(s);
    if(/^-?\d+(\.\d+)?([eE][-+]?\d+)?$/.test(s))return JSON.stringify(s);
    return s;
  }
  function toYaml(v,ind){
    var pad="  ";
    if(v===null||v===undefined)return "null";
    if(typeof v==="number"||typeof v==="boolean")return String(v);
    if(typeof v==="string")return yQuote(v);
    if(Array.isArray(v)){
      if(!v.length)return "[]";
      var out="";
      v.forEach(function(it,i){
        var s=toYaml(it,ind+pad);
        var nl=i?"\n":"";
        if(it&&typeof it==="object"&&!Array.isArray(it)&&Object.keys(it).length){
          var ls=s.split("\n");
          out+=nl+ind+"- "+ls[0].replace(/^ +/,"");
          for(var j=1;j<ls.length;j++)out+="\n"+ls[j];
        }else if(Array.isArray(it)){
          out+=nl+ind+"- "+s.replace(/^ +/,"").replace(/\n/g,"\n"+ind+"  ");
        }else{
          out+=nl+ind+"- "+s;
        }
      });
      return out;
    }
    if(typeof v==="object"){
      var ks=Object.keys(v);
      if(!ks.length)return "{}";
      var o="";
      ks.forEach(function(k,i){
        var val=v[k],pre=(i?"\n":"")+ind+yQuote(k)+":";
        if(val!==null&&typeof val==="object"&&(!Array.isArray(val)||val.length)){
          o+=pre+"\n"+toYaml(val,ind+pad);
        }else{
          o+=pre+" "+toYaml(val,ind+pad);
        }
      });
      return o;
    }
    return String(v);
  }
  function yScalar(s){
    s=s.replace(/\s+#.*$/,"").trim();
    if(s==="")return "";
    if(/^".*"$/.test(s)){try{return JSON.parse(s);}catch(e){return s.slice(1,-1);}}
    if(/^'.*'$/.test(s))return s.slice(1,-1).replace(/''/g,"'");
    if(/^(true|True|TRUE|yes|on)$/.test(s))return true;
    if(/^(false|False|FALSE|no|off)$/.test(s))return false;
    if(/^(null|Null|NULL|~)$/.test(s))return null;
    if(/^\[.*\]$/.test(s)||/^\{.*\}$/.test(s)){try{return JSON.parse(s);}catch(e){}}
    if(/^-?\d+(\.\d+)?([eE][-+]?\d+)?$/.test(s))return Number(s);
    return s;
  }
  function yamlToObj(text){
    var raw=text.split(/\r?\n/),lines=[],i;
    for(i=0;i<raw.length;i++){
      var t=raw[i].replace(/\s+$/,"");
      if(!t.trim())continue;
      if(/^\s*#/.test(t))continue;
      var ind=t.match(/^ */)[0].length;
      lines.push({ind:ind,s:t.trim()});
    }
    if(!lines.length)return null;
    var pos=0;
    function parseBlock(ind){
      if(pos>=lines.length)return null;
      var first=lines[pos];
      if(first.s.charAt(0)==="-")return parseList(first.ind);
      return parseMap(first.ind);
    }
    function parseList(ind){
      var arr=[];
      while(pos<lines.length&&lines[pos].ind===ind&&lines[pos].s.charAt(0)==="-"){
        var rest=lines[pos].s.slice(1).trim();
        if(!rest){
          pos++;
          arr.push(pos<lines.length&&lines[pos].ind>ind?parseBlock(lines[pos].ind):null);
          continue;
        }
        var m=rest.match(/^["']?([^"':]+)["']?\s*:\s*(.*)$/);
        if(m&&!/^["']/.test(rest)){
          var obj={},k=m[1].trim(),vs=m[2].trim();
          pos++;
          obj[k]=vs?yScalar(vs):(pos<lines.length&&lines[pos].ind>ind?parseBlock(lines[pos].ind):null);
          while(pos<lines.length&&lines[pos].ind>ind&&lines[pos].s.charAt(0)!=="-"){
            var l=lines[pos],ci=l.s.indexOf(":");
            if(ci<0){pos++;continue;}
            var k2=l.s.slice(0,ci).trim().replace(/^["']|["']$/g,""),v2=l.s.slice(ci+1).trim();
            pos++;
            obj[k2]=v2?yScalar(v2):(pos<lines.length&&lines[pos].ind>l.ind?parseBlock(lines[pos].ind):null);
          }
          arr.push(obj);
        }else{
          pos++;
          arr.push(yScalar(rest));
        }
      }
      return arr;
    }
    function parseMap(ind){
      var map={};
      while(pos<lines.length&&lines[pos].ind===ind&&lines[pos].s.charAt(0)!=="-"){
        var l=lines[pos],ci=l.s.indexOf(":");
        if(ci<0){pos++;continue;}
        var k=l.s.slice(0,ci).trim().replace(/^["']|["']$/g,""),vs=l.s.slice(ci+1).trim();
        pos++;
        map[k]=vs?yScalar(vs):(pos<lines.length&&lines[pos].ind>ind?parseBlock(lines[pos].ind):null);
      }
      return map;
    }
    return parseBlock(lines[0].ind);
  }
  $("ymJ2Y").addEventListener("click",function(){
    var t=$("ymIn").value.trim();
    if(!t){toast("请先粘贴 JSON");return;}
    try{
      var obj=JSON.parse(t);
      $("ymOut").value=toYaml(obj,"");
      $("ymStat").textContent="✓ 已转换为 YAML，可直接复制到配置文件";
      $("ymStat").className="result ok";
    }catch(e){
      $("ymStat").textContent="✕ JSON 格式有误："+e.message;
      $("ymStat").className="result err";
    }
  });
  $("ymY2J").addEventListener("click",function(){
    var t=$("ymIn").value.trim();
    if(!t){toast("请先粘贴 YAML");return;}
    try{
      var o=yamlToObj(t);
      $("ymOut").value=JSON.stringify(o,null,2);
      $("ymStat").textContent="✓ 已转换为 JSON（支持常规块状 YAML）";
      $("ymStat").className="result ok";
    }catch(e){
      $("ymStat").textContent="✕ 解析失败："+e.message+"（请检查缩进是否为空格）";
      $("ymStat").className="result err";
    }
  });
  $("ymCopy").addEventListener("click",function(){copyText($("ymOut").value)});
});

/* ========== 2. XML ⇄ JSON ========== */
panelHTML("xml2json","XML ⇄ JSON","XML 与 JSON 双向转换，属性以 @ 前缀保留。",
 '<textarea id="xjIn" placeholder=\'粘贴 XML 或 JSON，如 <user id="1"><name>张三</name></user>\'></textarea>'
+'<div class="row" style="margin-top:10px"><button class="btn" id="xjX2J">XML → JSON</button>'
+'<button class="btn" id="xjJ2X">JSON → XML</button><button class="btn ghost" id="xjCopy">复制结果</button></div>'
+'<textarea id="xjOut" placeholder="结果…" style="margin-top:10px"></textarea><div id="xjStat" class="result"></div>');

init(function(){
  function nodeToObj(node){
    var o={},i,ch;
    if(node.attributes&&node.attributes.length){
      for(i=0;i<node.attributes.length;i++){
        o["@"+node.attributes[i].name]=node.attributes[i].value;
      }
    }
    var kids=node.childNodes,text="",hasEl=false;
    for(i=0;i<kids.length;i++){
      ch=kids[i];
      if(ch.nodeType===1){
        hasEl=true;
        var name=ch.nodeName,v=nodeToObj(ch);
        if(o[name]===undefined)o[name]=v;
        else if(Array.isArray(o[name]))o[name].push(v);
        else o[name]=[o[name],v];
      }else if(ch.nodeType===3||ch.nodeType===4){
        text+=ch.nodeValue;
      }
    }
    text=text.replace(/\s+/g," ").trim();
    if(!hasEl&&!Object.keys(o).length)return text;
    if(text)o["#text"]=text;
    return o;
  }
  function objToXml(v,name,ind){
    ind=ind||"";
    if(v===null||v===undefined)return ind+"<"+name+"/>";
    if(typeof v!=="object")return ind+"<"+name+">"+String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")+"</"+name+">";
    if(Array.isArray(v)){
      return v.map(function(it){return objToXml(it,name,ind)}).join("\n");
    }
    var attrs="",inner="",text="",ks=Object.keys(v),child=0;
    ks.forEach(function(k){
      if(k.charAt(0)==="@")attrs+=" "+k.slice(1)+'="'+String(v[k]).replace(/"/g,"&quot;")+'"';
      else if(k==="#text")text+=String(v[k]);
      else child++;
    });
    if(!child&&!text)return ind+"<"+name+attrs+"/>";
    ks.forEach(function(k){
      if(k.charAt(0)==="@"||k==="#text")return;
      inner+="\n"+objToXml(v[k],k,ind+"  ");
    });
    if(text&&!child)return ind+"<"+name+attrs+">"+text.replace(/&/g,"&amp;").replace(/</g,"&lt;")+"</"+name+">";
    return ind+"<"+name+attrs+">"+inner+"\n"+(text?ind+"  "+text+"\n":"")+ind+"</"+name+">";
  }
  $("xjX2J").addEventListener("click",function(){
    var t=$("xjIn").value.trim();
    if(!t){toast("请先粘贴 XML");return;}
    try{
      var doc=new DOMParser().parseFromString(t,"application/xml");
      var err=doc.querySelector("parsererror");
      if(err)throw new Error("XML 语法错误");
      var root=doc.documentElement,res={};
      res[root.nodeName]=nodeToObj(root);
      $("xjOut").value=JSON.stringify(res,null,2);
      $("xjStat").textContent="✓ 根节点："+root.nodeName+"，属性以 @ 开头，文本内容在 #text 中";
      $("xjStat").className="result ok";
    }catch(e){
      $("xjStat").textContent="✕ "+e.message;
      $("xjStat").className="result err";
    }
  });
  $("xjJ2X").addEventListener("click",function(){
    var t=$("xjIn").value.trim();
    if(!t){toast("请先粘贴 JSON");return;}
    try{
      var obj=JSON.parse(t),ks=Object.keys(obj),out="";
      if(ks.length===1&&typeof obj[ks[0]]==="object"){
        out='<?xml version="1.0" encoding="UTF-8"?>\n'+objToXml(obj[ks[0]],ks[0],"");
      }else{
        out='<?xml version="1.0" encoding="UTF-8"?>\n'+objToXml(obj,"root","");
      }
      $("xjOut").value=out;
      $("xjStat").textContent="✓ 已生成 XML";
      $("xjStat").className="result ok";
    }catch(e){
      $("xjStat").textContent="✕ JSON 格式有误："+e.message;
      $("xjStat").className="result err";
    }
  });
  $("xjCopy").addEventListener("click",function(){copyText($("xjOut").value)});
});

/* ========== 3. JSON 转 TypeScript ========== */
panelHTML("json2ts","JSON 转 TypeScript","粘贴接口返回的 JSON，自动生成可直接用的 TS 接口定义。",
 '<textarea id="jtIn" placeholder=\'粘贴 JSON，如 {"id":1,"name":"张三","tags":["a"],"vip":true}\'></textarea>'
+'<div class="row" style="margin-top:10px"><label>根名称 <input type="text" id="jtRoot" value="Root" style="width:140px"></label>'
+'<button class="btn" id="jtGo">生成类型</button><button class="btn ghost" id="jtCopy">复制代码</button></div>'
+'<textarea id="jtOut" placeholder="生成的 TypeScript 代码…" style="margin-top:10px;min-height:200px;font-family:Menlo,Consolas,monospace"></textarea><div id="jtStat" class="result"></div>');

init(function(){
  function cap(s){return s.charAt(0).toUpperCase()+s.slice(1);}
  function typeOf(v,name,defs){
    if(v===null)return "null";
    if(Array.isArray(v)){
      if(!v.length)return "any[]";
      var subs=[];
      v.forEach(function(it){
        var t=typeOf(it,name+"Item",defs);
        if(subs.indexOf(t)<0)subs.push(t);
      });
      if(subs.length===1)return subs[0]+"[]";
      return "("+subs.join(" | ")+")[]";
    }
    if(typeof v==="object"){
      var iface=cap(name);
      var lines=["export interface "+iface+" {"];
      Object.keys(v).forEach(function(k){
        var sub=iface+cap(k.replace(/[^A-Za-z0-9]/g,""));
        lines.push("  "+safeKey(k)+": "+typeOf(v[k],sub,defs)+";");
      });
      lines.push("}");
      defs[iface]=lines.join("\n");
      return iface;
    }
    return typeof v==="number"?"number":typeof v==="boolean"?"boolean":"string";
  }
  function safeKey(k){return /^[A-Za-z_$][\w$]*$/.test(k)?k:JSON.stringify(k);}
  function mergeObjs(arr){
    if(!arr.length)return null;
    var o={},keys={};
    arr.forEach(function(it){Object.keys(it).forEach(function(k){keys[k]=1})});
    Object.keys(keys).forEach(function(k){
      var vals=arr.map(function(it){return it[k]}).filter(function(x){return x!==undefined});
      o[k]=vals[0];
    });
    return o;
  }
  $("jtGo").addEventListener("click",function(){
    var t=$("jtIn").value.trim();
    if(!t){toast("请先粘贴 JSON");return;}
    try{
      var data=JSON.parse(t),defs={},rootName=($("jtRoot").value||"Root").replace(/[^A-Za-z0-9_]/g,"")||"Root";
      var mainType=typeOf(data,rootName,defs);
      var names=Object.keys(defs);
      var code=names.map(function(k){return defs[k]}).filter(Boolean).join("\n\n");
      if(names.indexOf(cap(rootName))<0){
        var alias="export type "+cap(rootName)+" = "+mainType+";";
        code=code?code+"\n\n"+alias:alias;
      }
      $("jtOut").value=code;
      $("jtStat").textContent="✓ 生成 "+(names.length+(names.indexOf(cap(rootName))<0?1:0))+" 个类型定义，可直接粘贴进 .ts 文件";
      $("jtStat").className="result ok";
    }catch(e){
      $("jtStat").textContent="✕ JSON 格式有误："+e.message;
      $("jtStat").className="result err";
    }
  });
  $("jtCopy").addEventListener("click",function(){copyText($("jtOut").value)});
});

/* ========== 4. SQL 格式化 ========== */
panelHTML("sqlformat","SQL 格式化","把挤成一行的 SQL 排成规范缩进，关键字自动大写。",
 '<textarea id="sfIn" placeholder="粘贴 SQL，如 select id,name from users where status=1 order by id desc"></textarea>'
+'<div class="row" style="margin-top:10px"><label><input type="checkbox" id="sfUpper" checked> 关键字大写</label>'
+'<label>缩进 <select id="sfInd"><option value="2">2 空格</option><option value="4">4 空格</option></select></label>'
+'<button class="btn" id="sfGo">格式化</button><button class="btn ghost" id="sfCopy">复制</button></div>'
+'<textarea id="sfOut" placeholder="格式化结果…" style="margin-top:10px;font-family:Menlo,Consolas,monospace"></textarea>');

init(function(){
  var KW=["select","from","where","and","or","not","in","is","null","like","between","join","left","right","inner","outer","full","cross","on","group","by","order","having","limit","offset","union","all","distinct","insert","into","values","update","set","delete","create","table","alter","drop","index","primary","key","foreign","references","default","as","case","when","then","else","end","asc","desc","count","sum","avg","max","min","if","exists","view","add","column","int","varchar","text","datetime","date","decimal","not null"];
  var BREAK=["select","from","where","group by","order by","having","limit","union","insert into","values","update","delete from","left join","right join","inner join","outer join","full join","join","on","and","or","set"];
  $("sfGo").addEventListener("click",function(){
    var s=$("sfIn").value;
    if(!s.trim()){toast("请先粘贴 SQL");return;}
    var ind=new Array(+$("sfInd").value+1).join(" ");
    var holes=[];
    s=s.replace(/'(?:''|[^'])*'/g,function(m){holes.push(m);return "\u0001"+(holes.length-1)+"\u0001";});
    s=s.replace(/"(?:[^"]|"")*"/g,function(m){holes.push(m);return "\u0001"+(holes.length-1)+"\u0001";});
    s=s.replace(/--[^\n]*/g,function(m){holes.push(m);return "\u0001"+(holes.length-1)+"\u0001";});
    s=s.replace(/\s+/g," ");
    var lower=s.replace(/\(/g," ( ").replace(/\)/g," ) ").replace(/,/g," , ").replace(/\s+/g," ").trim();
    var toks=lower.split(" "),out=[],i=0,buf=[];
    function flush(){if(buf.length){out.push(buf.join(" "));buf=[];}}
    while(i<toks.length){
      var w=toks[i].toLowerCase();
      var two=(toks[i+1]?w+" "+toks[i+1].toLowerCase():"");
      if(BREAK.indexOf(two)>-1){
        flush();
        out.push(two);i+=2;continue;
      }
      if(BREAK.indexOf(w)>-1&&w!=="on"&&w!=="and"&&w!=="or"&&w!=="set"){
        flush();out.push(w);i++;continue;
      }
      if(w==="and"||w==="or"||w==="set"||w==="on"){
        flush();out.push(w);i++;continue;
      }
      buf.push(toks[i]);i++;
    }
    flush();
    var lines=[],cur="";
    out.forEach(function(tk){
      var t=tk.toLowerCase();
      if(BREAK.indexOf(t)>-1&&t!=="and"&&t!=="or"&&t!=="on"&&t!=="set"){
        if(cur)lines.push(cur);
        cur=tk;
      }else if(t==="and"||t==="or"||t==="on"||t==="set"){
        if(cur)lines.push(cur);
        cur=ind+tk;
      }else{
        cur+=(cur?" ":"")+tk;
      }
    });
    if(cur)lines.push(cur);
    var res=lines.map(function(l){
      var parts=l.split(" ").map(function(w2){
        var clean=w2.replace(/[\u0001]/g,"");
        return KW.indexOf(clean.toLowerCase())>-1&&$("sfUpper").checked?w2.toUpperCase():w2;
      });
      return parts.join(" ");
    }).join("\n");
    res=res.replace(/\u0001(\d+)\u0001/g,function(m,n){return holes[+n]});
    $("sfOut").value=res.replace(/\(\s+/g,"(").replace(/\s+\)/g,")").replace(/\s+,/g,",");
  });
  $("sfCopy").addEventListener("click",function(){copyText($("sfOut").value)});
});

/* ========== 5. JWT 解析 ========== */
panelHTML("jwt","JWT 解析","粘贴 JWT，查看头部、载荷和过期时间（不上传令牌）。",
 '<textarea id="jwIn" placeholder="粘贴 JWT，形如 eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx.yyyyy" style="min-height:110px"></textarea>'
+'<div class="row" style="margin-top:10px"><button class="btn" id="jwGo">解析</button><button class="btn ghost" id="jwCopy">复制载荷</button></div>'
+'<div id="jwOut" style="margin-top:12px"></div>');

init(function(){
  function b64u(s){
    s=s.replace(/-/g,"+").replace(/_/g,"/");
    while(s.length%4)s+="=";
    var bin=atob(s),out="",i;
    try{
      return decodeURIComponent(escape(bin));
    }catch(e){
      for(i=0;i<bin.length;i++)out+="%"+("00"+bin.charCodeAt(i).toString(16)).slice(-2);
      try{return decodeURIComponent(out);}catch(e2){return bin;}
    }
  }
  function block(title,json,color){
    return '<div style="margin-bottom:10px"><div style="font-size:12.5px;color:'+color+';font-weight:700;margin-bottom:4px">'+title+'</div>'
      +'<pre style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:12px;font-size:12.5px;overflow:auto;white-space:pre-wrap;word-break:break-all">'
      +json.replace(/</g,"&lt;")+'</pre></div>';
  }
  $("jwGo").addEventListener("click",function(){
    var t=$("jwIn").value.trim().replace(/\s/g,"");
    if(!t){toast("请先粘贴 JWT");return;}
    var parts=t.split(".");
    if(parts.length<2){$("jwOut").innerHTML='<div class="result err">✕ 不是有效的 JWT（应有 3 段，用 . 分隔）</div>';return;}
    try{
      var head=b64u(parts[0]),pay=b64u(parts[1]);
      var hj=JSON.stringify(JSON.parse(head),null,2),pj=JSON.stringify(JSON.parse(pay),null,2);
      var html=block("HEADER · 头部",hj,"#2563eb")+block("PAYLOAD · 载荷",pj,"#16a34a");
      var p=JSON.parse(pay),info="";
      if(p.iat)info+="签发时间："+new Date(p.iat*1000).toLocaleString("zh-CN")+"　";
      if(p.exp){
        var left=p.exp*1000-Date.now();
        info+="过期时间："+new Date(p.exp*1000).toLocaleString("zh-CN")+"　";
        info+=left>0?"（还有 "+Math.floor(left/86400000)+" 天有效）":"（已过期）";
      }
      html+='<div class="result '+(info.indexOf("已过期")>-1?"err":"ok")+'">'+(info||"未设置 exp / iat 字段")+'</div>';
      html+='<div style="font-size:12px;color:var(--muted);margin-top:8px">提示：工具只做解码，不校验签名，不会上传令牌内容。</div>';
      $("jwOut").innerHTML=html;
    }catch(e){
      $("jwOut").innerHTML='<div class="result err">✕ 解码失败：内容不是合法的 Base64URL JSON</div>';
    }
  });
  $("jwCopy").addEventListener("click",function(){
    var pre=document.querySelectorAll("#jwOut pre");
    if(pre.length>1)copyText(pre[1].textContent);
  });
});

/* ========== 6. Cron 表达式 ========== */
panelHTML("cron","Cron 表达式","解析 5 位 Cron，中文说明下次 10 次执行时间。",
 '<div class="row"><label>表达式 <input type="text" id="crnIn" value="0 9 * * 1-5" style="width:220px;font-family:Menlo,Consolas,monospace"></label>'
+'<button class="btn" id="crnGo">解析</button></div>'
+'<div style="font-size:12.5px;color:var(--muted);margin-bottom:8px">格式：分 时 日 月 周　例：<code>0 9 * * 1-5</code> 工作日 9:00；<code>*/30 * * * *</code> 每 30 分钟</div>'
+'<div id="crnOut" class="result"></div>');

init(function(){
  function parseField(field,min,max){
    var vals={},parts=field.split(","),i;
    for(i=0;i<parts.length;i++){
      var p=parts[i],step=1,rng;
      if(p.indexOf("/")>-1){var sp=p.split("/");p=sp[0];step=+sp[1]||1;}
      if(p==="*"||p==="?"){rng=[min,max];}
      else if(p.indexOf("-")>-1){var a=p.split("-");rng=[+a[0],+a[1]];}
      else{rng=[+p,+p];}
      if(isNaN(rng[0])||isNaN(rng[1]))return null;
      for(var v=rng[0];v<=rng[1];v+=step){
        if(v<min||v>max)return null;
        vals[v]=1;
      }
    }
    return vals;
  }
  function desc(field,type){
    var names={mon:"月",dow:"周"};
    if(field==="*"||field==="?")return type==="min"?"每分钟":type==="hour"?"每小时":type==="dom"?"每天":type==="mon"?"每月":type==="dow"?"每周每天":"";
    if(/^\*\/\d+$/.test(field))return "每 "+field.split("/")[1]+(type==="min"?" 分钟":type==="hour"?" 小时":type==="dom"?" 天":type==="mon"?" 个月":" 周");
    if(/^\d+-\d+$/.test(field)){var a=field.split("-");return a[0]+" 到 "+a[1]+(type==="dow"?"（周"+(+a[0])+"到周"+(+a[1])+"）":"");}
    return field;
  }
  function fmt(d){
    function p(n){return n<10?"0"+n:""+n;}
    return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate())+" "+p(d.getHours())+":"+p(d.getMinutes());
  }
  $("crnGo").addEventListener("click",function(){
    var f=$("crnIn").value.trim().split(/\s+/);
    var out=$("crnOut");
    if(f.length!==5){out.className="result err";out.textContent="✕ 需要 5 个字段：分 时 日 月 周（例如 0 9 * * 1-5）";return;}
    var mi=parseField(f[0],0,59),ho=parseField(f[1],0,23),dom=parseField(f[2],1,31),mo=parseField(f[3],1,12),dow=parseField(f[4],0,6);
    if(!mi||!ho||!dom||!mo||!dow){out.className="result err";out.textContent="✕ 表达式超出范围：分 0-59、时 0-23、日 1-31、月 1-12、周 0-6（0 和 7 都是周日）";return;}
    var txt="执行规则："+desc(f[1],"hour")+"，"+desc(f[0],"min")+"（"+f[1]+" 时 "+f[0]+" 分，"+desc(f[2],"dom")+"，"+desc(f[3],"mon")+"）";
    var d=new Date();d.setSeconds(0,0);d.setMinutes(d.getMinutes()+1);
    var list=[],guard=0;
    while(list.length<10&&guard<200000){
      guard++;
      if(mi[d.getMinutes()]&&ho[d.getHours()]&&mo[d.getMonth()+1]){
        var dw=d.getDay(),domHit=dom[d.getDate()],dwHit=dow[dw]||(dw===0&&dow[7]);
        var domStar=(f[2]==="*"||f[2]==="?"),dwStar=(f[4]==="*"||f[4]==="?");
        var ok=domStar&&dwStar?true:(domStar?dwHit:(dwStar?domHit:(domHit||dwHit)));
        if(ok&&dom[d.getDate()])list.push(fmt(d));
      }
      d.setMinutes(d.getMinutes()+1);
    }
    out.className="result ok";
    out.innerHTML=txt+"\n\n接下来 10 次执行：\n"+(list.length?list.map(function(x,i){return (i+1)+". "+x}).join("\n"):"（未找到，请检查日期与星期是否冲突）");
  });
  if($("crnIn"))$("crnGo").click();
});

/* ========== 7. MD5 ========== */
panelHTML("md5","MD5 加密","文本生成 MD5 摘要，输出 32 位与 16 位两种形式。",
 '<textarea id="md5In" placeholder="输入需要加密的文本…"></textarea>'
+'<div class="row" style="margin-top:10px"><button class="btn" id="md5Go">生成 MD5</button><button class="btn ghost" id="md5Copy">复制 32 位</button></div>'
+'<div id="md5Out" class="out-box"></div>');

init(function(){
  function md5(str){
    function toBytes(s){
      var b=[],i,c;
      for(i=0;i<s.length;i++){
        c=s.charCodeAt(i);
        if(c<128)b.push(c);
        else if(c<2048){b.push(192|(c>>6),128|(c&63));}
        else if(c<55296||c>=57344){b.push(224|(c>>12),128|((c>>6)&63),128|(c&63));}
        else{
          i++;var c2=s.charCodeAt(i);
          var cp=65536+((c&1023)<<10)+(c2&1023);
          b.push(240|(cp>>18),128|((cp>>12)&63),128|((cp>>6)&63),128|(cp&63));
        }
      }
      return b;
    }
    function add(a,b){return (a+b)|0;}
    function rol(x,c){return (x<<c)|(x>>>(32-c));}
    var S=[7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21];
    var K=[],i;
    for(i=0;i<64;i++)K[i]=Math.floor(Math.abs(Math.sin(i+1))*4294967296)|0;
    var bytes=toBytes(str),bits=bytes.length*8;
    bytes.push(128);
    while(bytes.length%64!==56)bytes.push(0);
    var lo=bits>>>0,hi=Math.floor(bits/4294967296);
    for(i=0;i<4;i++)bytes.push((lo>>>(i*8))&255);
    for(i=0;i<4;i++)bytes.push((hi>>>(i*8))&255);
    var a0=0x67452301,b0=0xefcdab89|0,c0=0x98badcfe|0,d0=0x10325476,off,j;
    for(off=0;off<bytes.length;off+=64){
      var M=[];
      for(j=0;j<16;j++)M[j]=bytes[off+j*4]|(bytes[off+j*4+1]<<8)|(bytes[off+j*4+2]<<16)|(bytes[off+j*4+3]<<24);
      var A=a0,B=b0,C=c0,D=d0;
      for(i=0;i<64;i++){
        var F,g;
        if(i<16){F=(B&C)|((~B)&D);g=i;}
        else if(i<32){F=(D&B)|((~D)&C);g=(5*i+1)%16;}
        else if(i<48){F=B^C^D;g=(3*i+5)%16;}
        else{F=C^(B|(~D));g=(7*i)%16;}
        var tmp=D;D=C;C=B;
        B=add(B,rol(add(add(A,F),add(K[i],M[g])),S[i]));
        A=tmp;
      }
      a0=add(a0,A);b0=add(b0,B);c0=add(c0,C);d0=add(d0,D);
    }
    function hx(n){var s="",k;for(k=0;k<4;k++)s+=("0"+((n>>>(k*8))&255).toString(16)).slice(-2);return s;}
    return hx(a0)+hx(b0)+hx(c0)+hx(d0);
  }
  $("md5Go").addEventListener("click",function(){
    var t=$("md5In").value;
    if(t===""){toast("请输入文本");return;}
    var h=md5(t);
    $("md5Out").innerHTML='<div style="font-size:12px;color:var(--muted)">32 位（小写）</div><div style="font-family:Menlo,Consolas,monospace;word-break:break-all;color:var(--primary);font-weight:700">'+h+'</div>'
      +'<div style="font-size:12px;color:var(--muted);margin-top:10px">32 位（大写）</div><div style="font-family:Menlo,Consolas,monospace;word-break:break-all">'+h.toUpperCase()+'</div>'
      +'<div style="font-size:12px;color:var(--muted);margin-top:10px">16 位（取中间 16 个字符，常见于旧系统）</div><div style="font-family:Menlo,Consolas,monospace;word-break:break-all">'+h.slice(8,24)+'</div>';
  });
  $("md5Copy").addEventListener("click",function(){
    var el=$("md5Out").querySelector("div:nth-child(2)");
    if(el)copyText(el.textContent);
  });
});

/* ========== 8. px 转 rem ========== */
panelHTML("px2rem","px 转 rem","设计稿 px 换算 rem / rpx / vw，移动端适配常用。",
 '<div class="row"><label>px <input type="number" id="prPx" value="100" style="width:110px"></label>'
+'<label>根字号 <input type="number" id="prBase" value="16" style="width:80px"> px</label>'
+'<label>设计稿宽 <input type="number" id="prW" value="750" style="width:90px"> px</label>'
+'<button class="btn" id="prGo">换算</button></div>'
+'<div id="prOut" class="out-box"></div>'
+'<div class="row" style="margin-top:14px"><label>反向：rem <input type="number" id="prRem" value="1" step="0.1" style="width:110px"></label>'
+'<button class="btn ghost" id="prBack">转回 px</button><span id="prBackOut" class="result" style="margin:0"></span></div>');

init(function(){
  function calc(){
    var px=+$("prPx").value||0,base=+$("prBase").value||16,w=+$("prW").value||750;
    var rem=px/base,rpx=px*750/w,vw=px/w*100,vh=px/(w*16/9)*100;
    $("prOut").innerHTML=
      '<div style="font-family:Menlo,Consolas,monospace;line-height:2">'
      +'<div><span style="color:var(--muted)">rem：</span><b style="color:var(--primary)">'+(+rem.toFixed(4))+'rem</b>　<span style="color:var(--muted)">（根字号 '+base+'px）</span></div>'
      +'<div><span style="color:var(--muted)">rpx：</span><b style="color:var(--primary)">'+(+rpx.toFixed(2))+'rpx</b>　<span style="color:var(--muted)">（设计稿 '+w+'px，小程序常用）</span></div>'
      +'<div><span style="color:var(--muted)">vw：</span><b style="color:var(--primary)">'+(+vw.toFixed(3))+'vw</b>　<span style="color:var(--muted)">（视口宽度百分比）</span></div>'
      +'<div><span style="color:var(--muted)">按 16:9 屏折算高度：</span>'+(+vh.toFixed(3))+'vh</div>'
      +'</div>';
  }
  $("prGo").addEventListener("click",calc);
  $("prBack").addEventListener("click",function(){
    var base=+$("prBase").value||16;
    $("prBackOut").textContent=(+(+$("prRem").value*base).toFixed(2))+" px";
  });
  ["prPx","prBase","prW"].forEach(function(id){$(id).addEventListener("input",calc)});
  calc();
});

/* ========== 9. WiFi 二维码 ========== */
panelHTML("qrwifi","WiFi 二维码","生成 WiFi 二维码，客人扫码即可连接，不用报密码。",
 '<div class="row"><label style="width:100%">WiFi 名称（SSID）<input type="text" id="wfSsid" placeholder="例如 MyHome-5G" style="flex:1;min-width:200px"></label></div>'
+'<div class="row"><label style="width:100%">密码 <input type="text" id="wfPwd" placeholder="WiFi 密码" style="flex:1;min-width:200px"></label></div>'
+'<div class="row"><label>加密方式 <select id="wfType"><option value="WPA">WPA / WPA2（绝大多数）</option><option value="WEP">WEP（老设备）</option><option value="nopass">无密码</option></select></label>'
+'<label><input type="checkbox" id="wfHide"> 隐藏网络</label>'
+'<button class="btn" id="wfGo">生成二维码</button><button class="btn ghost" id="wfDl" style="display:none">下载 PNG</button></div>'
+'<div id="wfMsg" class="result"></div><div id="wfBox" style="text-align:center;margin-top:12px"></div>');

init(function(){
  var last=null;
  $("wfGo").addEventListener("click",function(){
    var ssid=$("wfSsid").value.trim(),pwd=$("wfPwd").value,type=$("wfType").value;
    if(!ssid){toast("请填写 WiFi 名称");return;}
    if(type!=="nopass"&&!pwd){toast("请填写 WiFi 密码");return;}
    function esc(s){return s.replace(/([\\;,:"])/g,"\\$1");}
    var txt="WIFI:T:"+type+";S:"+esc(ssid)+";"+(type==="nopass"?"":"P:"+esc(pwd)+";")+($("wfHide").checked?"H:true;":"")+";";
    var box=$("wfBox");box.innerHTML="";last=null;$("wfDl").style.display="none";
    if(typeof QRCode==="undefined"){$("wfMsg").textContent="✕ 二维码组件加载失败，请刷新页面";$("wfMsg").className="result err";return;}
    try{
      new QRCode(box,{text:txt,width:300,height:300,correctLevel:QRCode.CorrectLevel.M});
    }catch(e){
      $("wfMsg").textContent="✕ 生成失败：密码或名称过长";
      $("wfMsg").className="result err";return;
    }
    var cv=box.querySelector("canvas");
    if(cv){cv.style.maxWidth="100%";cv.style.borderRadius="10px";try{last=cv.toDataURL("image/png");}catch(e){}}
    if(!last){var im=box.querySelector("img");if(im){im.style.maxWidth="100%";last=im.src;}}
    $("wfMsg").textContent="✓ 已生成，客人用手机相机或微信扫一扫即可连网";
    $("wfMsg").className="result ok";
    if(last)$("wfDl").style.display="inline-block";
  });
  $("wfDl").addEventListener("click",function(){if(last)dl(last,"wifi-"+Date.now()+".png")});
});

/* ========== 10. 条形码 ========== */
panelHTML("barcode","条形码生成","生成 CODE128 / EAN13 / CODE39 标准条形码，可下载。",
 '<div class="row"><label style="width:100%">内容 <input type="text" id="bcIn" placeholder="数字或字母，如 6901234567892" style="flex:1;min-width:200px"></label></div>'
+'<div class="row"><label>格式 <select id="bcFmt"><option value="CODE128">CODE128（通用，支持字母数字）</option><option value="EAN13">EAN-13（13 位商品码）</option><option value="CODE39">CODE39（工业/仓储）</option><option value="ITF14">ITF-14（物流箱码，14 位）</option></select></label>'
+'<label>线宽 <select id="bcW"><option value="2">粗</option><option value="1.5">中</option><option value="1">细</option></select></label>'
+'<button class="btn" id="bcGo">生成</button><button class="btn ghost" id="bcDl" style="display:none">下载 PNG</button></div>'
+'<div id="bcMsg" class="result"></div><div id="bcBox" style="text-align:center;margin-top:12px;background:#fff;border-radius:10px;padding:10px"><canvas id="bcCv"></canvas></div>');

init(function(){
  $("bcGo").addEventListener("click",function(){
    var v=$("bcIn").value.trim();
    if(!v){toast("请输入内容");return;}
    if($("bcFmt").value==="EAN13"&&!/^\d{12,13}$/.test(v)){$("bcMsg").textContent="✕ EAN-13 需要 12 或 13 位纯数字";$("bcMsg").className="result err";return;}
    if($("bcFmt").value==="ITF14"&&!/^\d{13,14}$/.test(v)){$("bcMsg").textContent="✕ ITF-14 需要 13 或 14 位纯数字";$("bcMsg").className="result err";return;}
    $("bcMsg").textContent="正在生成…";$("bcMsg").className="result";
    loadLib("/vendor/jsbarcode.min.js").then(function(){
      try{
        JsBarcode("#bcCv",v,{format:$("bcFmt").value,width:+$("bcW").value,height:90,displayValue:true,fontSize:16,margin:10,background:"#ffffff",lineColor:"#000000"});
        var cv=$("bcCv");cv.style.maxWidth="100%";
        $("bcMsg").textContent="✓ 已生成，可直接打印或下载";
        $("bcMsg").className="result ok";
        $("bcDl").style.display="inline-block";
      }catch(e){
        $("bcMsg").textContent="✕ 生成失败：内容与所选格式不匹配（CODE128 支持字母数字，EAN13 只能纯数字）";
        $("bcMsg").className="result err";
      }
    }).catch(function(){
      $("bcMsg").textContent="✕ 条形码组件加载失败，请检查网络后重试";
      $("bcMsg").className="result err";
    });
  });
  $("bcDl").addEventListener("click",function(){
    try{dl($("bcCv").toDataURL("image/png"),"barcode-"+Date.now()+".png");}catch(e){toast("下载失败，请长按图片保存");}
  });
});

/* ========== 11. 图片拼接 ========== */
panelHTML("imgmerge","图片拼接","多张图片横向或纵向拼成一张长图，可调间距和背景色。",
 '<div class="row"><input type="file" id="imFile" accept="image/*" multiple></div>'
+'<div class="row"><label>方向 <select id="imDir"><option value="v">纵向拼接（长图）</option><option value="h">横向拼接</option></select></label>'
+'<label>间距 <input type="number" id="imGap" value="0" min="0" max="100" style="width:70px"> px</label>'
+'<label>背景 <input type="color" id="imBg" value="#ffffff"></label>'
+'<label><input type="checkbox" id="imFit" checked> 宽度对齐</label>'
+'<button class="btn" id="imGo">拼接</button><button class="btn ghost" id="imDl" style="display:none">下载图片</button></div>'
+'<div id="imMsg" class="result"></div><div id="imList" class="swatches"></div><div id="imPrev" style="margin-top:10px"></div>');

init(function(){
  var imgs=[],last=null;
  $("imFile").addEventListener("change",function(){
    var files=this.files;imgs=[];last=null;$("imDl").style.display="none";
    $("imList").innerHTML="";$("imPrev").innerHTML="";
    if(!files||!files.length)return;
    var loaded=0;
    for(var i=0;i<files.length;i++){
      (function(f,idx){
        var r=new FileReader();
        r.onload=function(){
          var im=new Image();
          im.onload=function(){
            imgs[idx]=im;
            loaded++;
            var t=document.createElement("div");
            t.style.cssText="width:60px;height:44px;border-radius:8px;background:url("+r.result+") center/cover;border:1px solid var(--border)";
            $("imList").appendChild(t);
            if(loaded===files.length){
              $("imMsg").textContent="✓ 已载入 "+files.length+" 张图片，点「拼接」生成";
              $("imMsg").className="result ok";
            }
          };
          im.src=r.result;
        };
        r.readAsDataURL(f);
      })(files[i],i);
    }
  });
  $("imGo").addEventListener("click",function(){
    var list=imgs.filter(Boolean);
    if(!list.length){toast("请先选择图片");return;}
    var gap=Math.max(0,+$("imGap").value||0),dir=$("imDir").value,fit=$("imFit").checked;
    var w=0,h=0,i;
    if(dir==="v"){
      w=fit?Math.min.apply(null,list.map(function(x){return x.width})):Math.max.apply(null,list.map(function(x){return x.width}));
      list.forEach(function(im){
        var hh=fit?Math.round(im.height*w/im.width):im.height;
        h+=hh;
      });
      h+=gap*(list.length-1);
    }else{
      h=fit?Math.min.apply(null,list.map(function(x){return x.height})):Math.max.apply(null,list.map(function(x){return x.height}));
      list.forEach(function(im){
        var ww=fit?Math.round(im.width*h/im.height):im.width;
        w+=ww;
      });
      w+=gap*(list.length-1);
    }
    var c=document.createElement("canvas");
    c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));
    var ctx=c.getContext("2d");
    ctx.fillStyle=$("imBg").value;ctx.fillRect(0,0,c.width,c.height);
    var x=0,y=0;
    list.forEach(function(im){
      if(dir==="v"){
        var hh=fit?Math.round(im.height*w/im.width):im.height;
        ctx.drawImage(im,0,y,w,hh);y+=hh+gap;
      }else{
        var ww=fit?Math.round(im.width*h/im.height):im.width;
        ctx.drawImage(im,x,0,ww,h);x+=ww+gap;
      }
    });
    last=c.toDataURL("image/png");
    $("imPrev").innerHTML='<img src="'+last+'" style="max-width:100%;border:1px solid var(--border);border-radius:10px">';
    $("imMsg").textContent="✓ 拼接完成："+c.width+" × "+c.height+" px";
    $("imMsg").className="result ok";
    $("imDl").style.display="inline-block";
  });
  $("imDl").addEventListener("click",function(){if(last)dl(last,"merged-"+Date.now()+".png")});
});

/* ========== 12. 图片黑白 ========== */
panelHTML("gray","图片黑白","一键转灰度、黑白二值或复古色调，适合扫描件和证件打印。",
 '<div class="row"><input type="file" id="gyFile" accept="image/*"></div>'
+'<div class="row"><label>效果 <select id="gyMode"><option value="gray">灰度（自然）</option><option value="bin">黑白二值（扫描件效果）</option><option value="sepia">复古棕</option><option value="high">高对比</option></select></label>'
+'<label>强度 <input type="range" id="gyTh" min="0" max="255" value="128" style="width:140px"></label>'
+'<button class="btn" id="gyGo">应用</button><button class="btn ghost" id="gyDl" style="display:none">下载</button></div>'
+'<div id="gyMsg" class="result"></div><div id="gyPrev" style="margin-top:10px"></div>');

init(function(){
  var src=null,last=null;
  $("gyFile").addEventListener("change",function(){
    loadImg(this,function(img){
      src=img;last=null;$("gyDl").style.display="none";$("gyPrev").innerHTML="";
      var c=drawCanvas(img,img.width,img.height);
      $("gyPrev").innerHTML='<img src="'+c.toDataURL("image/png")+'" style="max-width:100%;border:1px solid var(--border);border-radius:10px">';
      $("gyMsg").textContent="原图 "+img.width+" × "+img.height+" px，选择效果后点「应用」";
      $("gyMsg").className="result";
    });
  });
  $("gyGo").addEventListener("click",function(){
    if(!src){toast("请先选择图片");return;}
    var c=drawCanvas(src,src.width,src.height),ctx=c.getContext("2d"),d=ctx.getImageData(0,0,c.width,c.height),p=d.data;
    var mode=$("gyMode").value,th=+$("gyTh").value,i,r,g,b,l;
    for(i=0;i<p.length;i+=4){
      r=p[i];g=p[i+1];b=p[i+2];
      l=0.299*r+0.587*g+0.114*b;
      if(mode==="gray"){p[i]=p[i+1]=p[i+2]=l;}
      else if(mode==="bin"){var v=l>th?255:0;p[i]=p[i+1]=p[i+2]=v;}
      else if(mode==="sepia"){
        p[i]=Math.min(255,l*1.07+20);p[i+1]=Math.min(255,l*0.95+8);p[i+2]=Math.min(255,l*0.75);
      }else{
        var v2=((l-128)*1.6)+128;v2=v2<0?0:v2>255?255:v2;
        p[i]=p[i+1]=p[i+2]=v2;
      }
    }
    ctx.putImageData(d,0,0);
    last=c.toDataURL("image/png");
    $("gyPrev").innerHTML='<img src="'+last+'" style="max-width:100%;border:1px solid var(--border);border-radius:10px">';
    $("gyMsg").textContent="✓ 已应用效果，可继续切换对比";
    $("gyMsg").className="result ok";
    $("gyDl").style.display="inline-block";
  });
  $("gyDl").addEventListener("click",function(){if(last)dl(last,"bw-"+Date.now()+".png")});
});
