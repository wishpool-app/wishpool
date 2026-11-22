/* 更多实用模块：文字转语音、番茄钟、世界时钟、设备信息 */
reg("tts","misc","文字转语音","朗读中文文本（本地合成）");
reg("pomodoro","misc","番茄钟","25 分钟专注计时器");
reg("worldclock","misc","世界时钟","各大城市当前时间");
reg("deviceinfo","misc","设备信息","屏幕、浏览器、硬件信息");

panelHTML("tts","文字转语音","使用浏览器本地语音合成朗读文本，可调语速。",
 '<textarea id="ttIn" placeholder="输入要朗读的文字…"></textarea>'
+'<div class="row" style="margin-top:10px"><label>语速 <input type="range" id="ttRate" min="0.5" max="2" step="0.1" value="1"> <b id="ttRateV">1.0</b></label>'
+'<button class="btn" id="ttGo">朗读</button><button class="btn ghost" id="ttStop">停止</button></div>'
+'<div id="ttOut" class="result"></div>');

panelHTML("pomodoro","番茄钟","25 分钟专注 + 5 分钟休息，开始你的高效工作循环。",
 '<div class="row"><label>专注时长 <input type="number" id="pmWork" value="25" min="1" max="120" style="width:70px"> 分钟</label>'
+'<label>休息时长 <input type="number" id="pmRest" value="5" min="1" max="30" style="width:70px"> 分钟</label></div>'
+'<div style="text-align:center"><b id="pmDisp" style="font-size:56px;color:var(--primary)">25:00</b></div>'
+'<div class="row" style="justify-content:center;margin-top:14px"><button class="btn" id="pmStart">开始专注</button><button class="btn ghost" id="pmPause">暂停</button><button class="btn ghost" id="pmReset">重置</button></div>'
+'<div id="pmOut" class="result" style="text-align:center"></div>');

panelHTML("worldclock","世界时钟","查看各大城市当前时间。",
 '<div id="wcList" class="stat-grid"></div><div id="wcOut" class="result"></div>');

panelHTML("deviceinfo","设备信息","查看当前浏览器、屏幕与硬件信息。",
 '<div class="row"><button class="btn" id="dvGo">读取设备信息</button></div><div id="dvOut" class="out-box"></div>');

init(function(){
  /* TTS */
  $("ttRate").addEventListener("input",function(e){$("ttRateV").textContent=(+e.target.value).toFixed(1)});
  $("ttGo").addEventListener("click",function(){
    if(!("speechSynthesis" in window)){$("ttOut").textContent="✕ 当前浏览器不支持语音合成";$("ttOut").className="result err";return;}
    var u=new SpeechSynthesisUtterance($("ttIn").value);
    u.lang="zh-CN";u.rate=+$("ttRate").value||1;
    speechSynthesis.cancel();speechSynthesis.speak(u);
    $("ttOut").textContent="🔊 正在朗读…";$("ttOut").className="result ok";
  });
  $("ttStop").addEventListener("click",function(){if("speechSynthesis" in window)speechSynthesis.cancel();$("ttOut").textContent="已停止";});
  /* 番茄钟 */
  var pmTimer=null,pmLeft=0,pmMode="work";
  function pmShow(){
    var m=Math.floor(pmLeft/60),s=pmLeft%60;
    $("pmDisp").textContent=("0"+m).slice(-2)+":"+("0"+s).slice(-2);
  }
  function beep(){
    try{
      var ctx=new (window.AudioContext||window.webkitAudioContext)();
      var o=ctx.createOscillator(),g=ctx.createGain();
      o.connect(g);g.connect(ctx.destination);
      o.frequency.value=880;o.type="sine";
      g.gain.setValueAtTime(0.3,ctx.currentTime);
      o.start();g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+1);
      o.stop(ctx.currentTime+1);
    }catch(e){}
  }
  function pmSet(mode){
    var min=mode==="work"?+$("pmWork").value||25:+$("pmRest").value||5;
    pmLeft=min*60;pmMode=mode;pmShow();
  }
  pmSet("work");
  $("pmStart").addEventListener("click",function(){
    if(pmTimer)clearInterval(pmTimer);
    pmTimer=setInterval(function(){
      pmLeft--;
      if(pmLeft<=0){
        clearInterval(pmTimer);pmTimer=null;beep();
        if(pmMode==="work"){$("pmOut").textContent="🍅 专注完成！休息一下";pmSet("rest");}
        else{$("pmOut").textContent="✓ 休息结束，继续加油！";pmSet("work");}
        return;
      }
      pmShow();
    },1000);
    $("pmOut").textContent=pmMode==="work"?"专注中…":"休息中…";
  });
  $("pmPause").addEventListener("click",function(){if(pmTimer){clearInterval(pmTimer);pmTimer=null;$("pmOut").textContent="已暂停";}});
  $("pmReset").addEventListener("click",function(){if(pmTimer)clearInterval(pmTimer);pmTimer=null;$("pmOut").textContent="";pmSet("work");});
  /* 世界时钟 */
  var cities=[["北京","Asia/Shanghai"],["东京","Asia/Tokyo"],["新加坡","Asia/Singapore"],["伦敦","Europe/London"],["巴黎","Europe/Paris"],["纽约","America/New_York"],["洛杉矶","America/Los_Angeles"],["悉尼","Australia/Sydney"]];
  var box=$("wcList");
  cities.forEach(function(c){
    var d=document.createElement("div");d.className="stat";
    d.innerHTML='<b id="wc-'+c[1].replace(/\//g,"-")+'" style="font-size:17px">--:--</b><span>'+c[0]+'</span>';
    box.appendChild(d);
  });
  function wcTick(){
    cities.forEach(function(c){
      try{
        var el=$("wc-"+c[1].replace(/\//g,"-"));
        if(el)el.textContent=new Date().toLocaleTimeString("zh-CN",{timeZone:c[1],hour:"2-digit",minute:"2-digit"});
      }catch(e){}
    });
  }
  wcTick();setInterval(wcTick,10000);
  /* 设备信息 */
  $("dvGo").addEventListener("click",function(){
    var info=[];
    info.push("屏幕分辨率："+window.screen.width+" × "+window.screen.height);
    info.push("可用区域："+window.screen.availWidth+" × "+window.screen.availHeight);
    info.push("窗口大小："+window.innerWidth+" × "+window.innerHeight);
    info.push("设备像素比："+(window.devicePixelRatio||1));
    info.push("CPU 核心数："+(navigator.hardwareConcurrency||"未知"));
    info.push("内存（GB）："+(navigator.deviceMemory||navigator.deviceMemory===0?navigator.deviceMemory:"未知"));
    info.push("语言："+navigator.language);
    info.push("在线状态："+(navigator.onLine?"在线":"离线"));
    info.push("平台："+(navigator.platform||"未知"));
    info.push("UserAgent："+navigator.userAgent);
    if(navigator.cookieEnabled!==undefined)info.push("Cookie："+(navigator.cookieEnabled?"启用":"禁用"));
    $("dvOut").textContent=info.join("\n");
  });
});
/* ===== 娱乐减压（WishPool 矩阵）===== */
reg("muyu","fun","在线电子木鱼","敲木鱼积功德，连击翻倍，十级静心等级");
reg("confess","fun","股民忏悔室","写下亏损忏悔，股民来拍拍你，功德攒到股海老僧");
reg("wishpool","fun","许愿池","写下愿望投进池里，收到一封来自未来自己的信");
