/* 计算与生活模块：房贷、个税、BMI、日期间隔、年龄、利息、单位换算、随机数、倒计时、人民币大写 */
reg("mortgage","calc","房贷计算器","等额本息 / 等额本金对比");
reg("tax","calc","个税计算器","年度综合所得税估算");
reg("bmi","calc","BMI 计算","身体质量指数与健康区间");
reg("datediff","calc","日期间隔","两个日期相差多少天");
reg("age","calc","年龄计算","精确到年月日的周岁");
reg("interest","calc","利息计算","单利 / 复利收益估算");
reg("unitconv","calc","单位换算","长度、重量、面积、温度");
reg("randomnum","calc","随机数生成","指定范围的随机整数");
reg("countdown","calc","倒计天数","距离目标日期还有多少天");
reg("rmbupper","calc","人民币大写","数字金额转中文大写");

panelHTML("mortgage","房贷计算器","输入贷款金额、利率、年限，对比两种还款方式。",
 '<div class="row"><label>贷款金额（元） <input type="number" id="mgAmt" value="1000000" style="width:120px"></label>'
+'<label>年利率（%） <input type="number" id="mgRate" value="3.6" step="0.01" style="width:80px"></label>'
+'<label>年限 <input type="number" id="mgYears" value="30" style="width:70px"> 年</label></div>'
+'<div class="row"><button class="btn" id="mgGo">计算</button></div><div id="mgOut" class="out-box"></div>');

panelHTML("tax","个税计算器","按年度综合所得估算个人所得税（起征点 6 万/年）。",
 '<div class="row"><label>年收入（元） <input type="number" id="txInc" value="200000" style="width:120px"></label>'
+'<label>社保公积金（元/年） <input type="number" id="txSocial" value="24000" style="width:110px"></label>'
+'<label>专项附加扣除（元/年） <input type="number" id="txDeduct" value="0" style="width:110px"></label></div>'
+'<div class="row"><button class="btn" id="txGo">计算</button></div><div id="txOut" class="out-box"></div>');

panelHTML("bmi","BMI 计算","身体质量指数 = 体重(kg) ÷ 身高²(m²)。",
 '<div class="row"><label>身高 <input type="number" id="bmH" value="170" style="width:80px"> cm</label>'
+'<label>体重 <input type="number" id="bmW" value="65" step="0.1" style="width:80px"> kg</label>'
+'<button class="btn" id="bmGo">计算</button></div><div id="bmOut" class="out-box"></div>');

panelHTML("datediff","日期间隔","计算两个日期之间相差多少天。",
 '<div class="row"><label>开始 <input type="date" id="dd1"></label><label>结束 <input type="date" id="dd2"></label>'
+'<button class="btn" id="dtdGo">计算</button></div><div id="dtdOut" class="out-box"></div>');

panelHTML("age","年龄计算","根据出生日期计算精确周岁。",
 '<div class="row"><label>出生日期 <input type="date" id="agIn"></label><button class="btn" id="agGo">计算</button></div>'
+'<div id="agOut" class="out-box"></div>');

panelHTML("interest","利息计算","估算单利 / 复利收益。",
 '<div class="row"><label>本金 <input type="number" id="itP" value="100000" style="width:110px"> 元</label>'
+'<label>年利率 <input type="number" id="itR" value="3" step="0.01" style="width:70px"> %</label>'
+'<label>年限 <input type="number" id="itY" value="5" style="width:70px"> 年</label></div>'
+'<div class="row"><button class="btn" id="itGo">计算</button></div><div id="itOut" class="out-box"></div>');

panelHTML("unitconv","单位换算","长度、重量、面积、温度快捷换算。",
 '<div class="row"><label>类别 <select id="ucCat"><option value="len">长度</option><option value="wt">重量</option><option value="area">面积</option><option value="temp">温度</option></select></label>'
+'<label>数值 <input type="number" id="ucVal" value="1" step="any" style="width:100px"></label></div>'
+'<div class="row"><label>从 <select id="ucFrom"></select></label><label>到 <select id="ucTo"></select></label>'
+'<button class="btn" id="uncGo">换算</button></div><div id="uncOut" class="out-box"></div>');

panelHTML("randomnum","随机数生成","生成指定范围内的随机整数（可批量）。",
 '<div class="row"><label>范围 <input type="number" id="rnMin" value="1" style="width:90px"> ~ <input type="number" id="rnMax" value="100" style="width:90px"></label>'
+'<label>数量 <input type="number" id="rnN" value="1" min="1" max="100" style="width:70px"></label>'
+'<label><input type="checkbox" id="rnUnique"> 不重复</label>'
+'<button class="btn" id="rnGo">生成</button></div><div id="rnOut" class="out-box"></div>');

panelHTML("countdown","倒计天数","距离目标日期还有多少天。",
 '<div class="row"><label>目标日期 <input type="date" id="cdIn"></label><button class="btn" id="cdGo">计算</button></div>'
+'<div id="cdOut" class="out-box"></div>');

panelHTML("rmbupper","人民币大写","数字金额转中文大写（发票、合同用）。",
 '<div class="row"><label>金额 <input type="number" id="rmIn" step="any" style="width:180px" placeholder="如 12345.67"></label>'
+'<button class="btn" id="rmGo">转换</button></div><div id="rmOut" class="out-box"></div>');

init(function(){
  /* 房贷 */
  $("mgGo").addEventListener("click",function(){
    var L=+$("mgAmt").value,r=+$("mgRate").value/100,y=+$("mgYears").value;
    if(!L||!y){toast("请填写金额和年限");return;}
    var m=r/12,n=y*12;
    var mx=L*m*Math.pow(1+m,n)/(Math.pow(1+m,n)-1);
    var total1=mx*n;
    var int2=L*m*(n+1)/2;
    var total2=L+int2;
    var first2=L/n+L*m;
    $("mgOut").textContent=
      "【等额本息】\n每月还款："+mx.toFixed(2)+" 元\n还款总额："+total1.toFixed(2)+" 元\n支付利息："+(total1-L).toFixed(2)+" 元\n\n"
     +"【等额本金】\n首月还款："+first2.toFixed(2)+" 元（每月约递减 "+(L/n*m).toFixed(2)+" 元）\n末月还款："+(L/n+L/n*m).toFixed(2)+" 元\n还款总额："+total2.toFixed(2)+" 元\n支付利息："+int2.toFixed(2)+" 元";
  });
  /* 个税 */
  $("txGo").addEventListener("click",function(){
    var inc=+$("txInc").value||0,soc=+$("txSocial").value||0,ded=+$("txDeduct").value||0;
    var taxable=inc-60000-soc-ded;
    if(taxable<=0){$("txOut").textContent="应纳税所得额 ≤ 0，无需缴纳个人所得税";return;}
    var br=[[36000,.03,0],[144000,.1,2520],[300000,.2,16920],[420000,.25,31920],[660000,.3,52920],[960000,.35,85920],[Infinity,.45,181920]];
    var rate=.03,qc=0;
    for(var i=0;i<br.length;i++){if(taxable<=br[i][0]){rate=br[i][1];qc=br[i][2];break;}}
    var tax=taxable*rate-qc;
    $("txOut").textContent=
      "应纳税所得额："+taxable.toFixed(2)+" 元\n适用税率："+(rate*100)+"%（速算扣除数 "+qc+"）\n年度应纳个税："+tax.toFixed(2)+" 元\n税后收入："+(inc-soc-tax).toFixed(2)+" 元\n\n注：为简化估算，未考虑年度中间入职、奖金单独计税等因素。";
  });
  /* BMI */
  $("bmGo").addEventListener("click",function(){
    var h=(+$("bmH").value||0)/100,w=+$("bmW").value||0;
    if(!h||!w){toast("请填写身高体重");return;}
    var bmi=w/(h*h),cat,col;
    if(bmi<18.5){cat="偏瘦";col="var(--muted)";}
    else if(bmi<24){cat="正常";col="var(--ok)";}
    else if(bmi<28){cat="偏胖";col="#d97706";}
    else{cat="肥胖";col="var(--err)";}
    var ideal=(22*h*h).toFixed(1);
    $("bmOut").innerHTML='BMI：<b style="font-size:22px;color:'+col+'">'+bmi.toFixed(1)+'</b>（'+cat+'）\n健康体重范围：'+(18.5*h*h).toFixed(1)+" ~ "+(24*h*h).toFixed(1)+" kg\n理想体重（BMI 22）：约 "+ideal+" kg";
  });
  /* 日期间隔 */
  $("dtdGo").addEventListener("click",function(){
    var a=new Date($("dd1").value),b=new Date($("dd2").value);
    if(isNaN(a)||isNaN(b)){toast("请选择两个日期");return;}
    var days=Math.round(Math.abs(b-a)/86400000);
    $("dtdOut").textContent="相差 "+days+" 天（约 "+(days/365).toFixed(2)+" 年 / "+(days/30).toFixed(1)+" 个月）";
  });
  /* 年龄 */
  $("agGo").addEventListener("click",function(){
    var b=new Date($("agIn").value);
    if(isNaN(b)){toast("请选择出生日期");return;}
    var now=new Date();
    var y=now.getFullYear()-b.getFullYear(),m=now.getMonth()-b.getMonth(),d=now.getDate()-b.getDate();
    if(d<0){m--;d+=new Date(now.getFullYear(),now.getMonth(),0).getDate();}
    if(m<0){y--;m+=12;}
    var days=Math.floor((now-b)/86400000);
    $("agOut").textContent="周岁："+y+" 岁 "+m+" 个月 "+d+" 天\n总共已生活 "+days.toLocaleString()+" 天（约 "+(days/365.25).toFixed(1)+" 年）";
  });
  /* 利息 */
  $("itGo").addEventListener("click",function(){
    var p=+$("itP").value||0,r=+$("itR").value/100,y=+$("itY").value||0;
    if(!p||!y){toast("请填写本金和年限");return;}
    var si=p*r*y;
    var ci=p*Math.pow(1+r,y)-p;
    $("itOut").textContent=
      "单利：到期本息 "+(p+si).toFixed(2)+" 元，利息 "+si.toFixed(2)+" 元\n"
     +"复利（年复）：到期本息 "+(p+ci).toFixed(2)+" 元，利息 "+ci.toFixed(2)+" 元\n"
     +"复利比单利多："+(ci-si).toFixed(2)+" 元";
  });
  /* 单位换算 */
  var UNITS={
    len:[["毫米",.001],["厘米",.01],["米",1],["千米",1000],["英寸",.0254],["英尺",.3048],["英里",1609.344],["里",500],["尺",1/3]],
    wt:[["毫克",.001],["克",1],["千克",1000],["吨",1e6],["磅",453.592],["盎司",28.3495],["斤",500]],
    area:[["平方米",1],["平方千米",1e6],["公顷",10000],["亩",666.667],["平方英尺",.0929]],
    temp:[["摄氏度 °C","C"],["华氏度 °F","F"],["开尔文 K","K"]]
  };
  function fillUnits(){
    var cat=$("ucCat").value,opts=UNITS[cat].map(function(u,i){return '<option value="'+i+'">'+u[0]+"</option>"}).join("");
    $("ucFrom").innerHTML=opts;$("ucTo").innerHTML=opts;
    $("ucTo").selectedIndex=Math.min(2,UNITS[cat].length-1);
  }
  fillUnits();
  $("ucCat").addEventListener("change",fillUnits);
  $("uncGo").addEventListener("click",function(){
    var cat=$("ucCat").value,v=+$("ucVal").value||0,fi=+$("ucFrom").value,ti=+$("ucTo").value;
    var out;
    if(cat==="temp"){
      var baseC;
      var fromName=UNITS.temp[fi][1],toName=UNITS.temp[ti][1];
      if(fromName==="C")baseC=v;else if(fromName==="F")baseC=(v-32)*5/9;else baseC=v-273.15;
      if(toName==="C")out=baseC;else if(toName==="F")out=baseC*9/5+32;else out=baseC+273.15;
    }else{
      out=v*UNITS[cat][fi][1]/UNITS[cat][ti][1];
    }
    $("uncOut").textContent=$("ucVal").value+" "+UNITS[cat][fi][0]+" = "+out.toLocaleString(undefined,{maximumFractionDigits:6})+" "+UNITS[cat][ti][0];
  });
  /* 随机数 */
  $("rnGo").addEventListener("click",function(){
    var min=Math.ceil(+$("rnMin").value),max=Math.floor(+$("rnMax").value);
    var n=Math.min(100,Math.max(1,+$("rnN").value||1));
    if(isNaN(min)||isNaN(max)||min>max){toast("范围无效");return;}
    var out=[];
    if($("rnUnique").checked){
      var pool=[];for(var i=min;i<=max&&pool.length<1e6;i++)pool.push(i);
      if(n>pool.length){toast("不重复数量超过范围总数");return;}
      for(var j=0;j<n;j++){var k=Math.floor(Math.random()*pool.length);out.push(pool.splice(k,1)[0]);}
    }else{
      for(var m=0;m<n;m++)out.push(Math.floor(Math.random()*(max-min+1))+min);
    }
    $("rnOut").textContent=out.join("，");
  });
  /* 倒计时 */
  $("cdGo").addEventListener("click",function(){
    var t=new Date($("cdIn").value);
    if(isNaN(t)){toast("请选择目标日期");return;}
    var now=new Date();now.setHours(0,0,0,0);
    var days=Math.round((t-now)/86400000);
    $("cdOut").textContent=days>0?("距离 "+$("cdIn").value+" 还有 "+days+" 天"):
      days===0?"就是今天！":"已过去 "+Math.abs(days)+" 天";
  });
  /* 人民币大写 */
  $("rmGo").addEventListener("click",function(){
    var n=+$("rmIn").value;
    if(isNaN(n)){toast("请输入金额");return;}
    if(n<0){$("rmOut").textContent="负数请直接写「负」字加正数金额";return;}
    var digits="零壹贰叁肆伍陆柒捌玖";
    var units=["","拾","佰","仟"],bigU=["","万","亿","万亿"];
    function int2cn(x){
      if(x===0)return "零";
      var s="",big=0;
      while(x>0){
        var part=x%10000;
        if(part>0){
          var ps="",zero=false;
          var p=part,idx=0;
          while(p>0){
            var d=p%10;
            if(d===0){if(ps&&!zero)ps="零"+ps;zero=true;}
            else{ps=digits[d]+units[idx]+ps;zero=false;}
            p=Math.floor(p/10);idx++;
          }
          s=ps+bigU[big]+s;
        }else if(s&&!s.startsWith("零")){s="零"+s;}
        x=Math.floor(x/10000);big++;
      }
      return s;
    }
    var neg=n<0;n=Math.abs(n);
    var ip=Math.floor(n),fp=Math.round((n-ip)*100);
    var r="";
    if(ip===0)r="零";
    else r=int2cn(ip);
    r+="元";
    if(fp===0)r+="整";
    else{
      var jiao=Math.floor(fp/10),fen=fp%10;
      if(jiao)r+=digits[jiao]+"角";
      if(fen)r+=digits[fen]+"分";
      if(!jiao&&!fen)r+="整";
    }
    $("rmOut").textContent=(neg?"负":"")+"人民币"+r;
  });
});
