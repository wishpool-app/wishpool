/* AI 智能体模块：接入 OpenAI 兼容接口（DeepSeek / 智谱 GLM / 通义千问 / Kimi 等） */
reg("ai","ai","AI 智能助手","接入 AI 智能体，支持多种模型");

panelHTML("ai","AI 智能助手","接入任意 OpenAI 兼容接口的 AI 智能体（DeepSeek、智谱 GLM、通义千问、Kimi、OpenAI 等）。API Key 仅保存在你自己的浏览器本地，不会上传到本站服务器。",
 '<div class="row"><label>接口地址 <input type="text" id="aiUrl" style="width:320px" placeholder="https://api.deepseek.com/v1/chat/completions"></label></div>'
+'<div class="row"><label>模型 <input type="text" id="aiModel" style="width:180px" placeholder="deepseek-chat"></label>'
+'<label>API Key <input type="password" id="aiKey" style="width:220px" placeholder="sk-..."></label>'
+'<button class="btn ghost" id="aiSave">保存配置</button></div>'
+'<div class="chat-box" id="aiBox"><div class="ai">你好！我是 AI 助手。请先在上方填入接口地址、模型和 API Key 并保存，然后就可以开始对话了。</div></div>'
+'<div class="row"><input type="text" id="aiIn" style="flex:1;min-width:200px" placeholder="输入消息，回车发送…"><button class="btn" id="aiSend">发送</button></div>'
+'<div id="aiOut" class="result"></div>');

init(function(){
  var DEFAULT_URL="https://api.deepseek.com/v1/chat/completions";
  var DEFAULT_MODEL="deepseek-chat";
  $("aiUrl").value=localStorage.getItem("toolai_url")||DEFAULT_URL;
  $("aiModel").value=localStorage.getItem("toolai_model")||DEFAULT_MODEL;
  $("aiKey").value=localStorage.getItem("toolai_key")||"";
  var history=[];
  $("aiSave").addEventListener("click",function(){
    localStorage.setItem("toolai_url",$("aiUrl").value.trim());
    localStorage.setItem("toolai_model",$("aiModel").value.trim());
    localStorage.setItem("toolai_key",$("aiKey").value.trim());
    toast("✓ 配置已保存到本地浏览器");
  });
  function addMsg(cls,text){
    var d=document.createElement("div");d.className=cls;d.textContent=text;
    $("aiBox").appendChild(d);
    $("aiBox").scrollTop=$("aiBox").scrollHeight;
    return d;
  }
  async function send(){
    var msg=$("aiIn").value.trim(),key=$("aiKey").value.trim(),url=$("aiUrl").value.trim();
    if(!msg)return;
    if(!key){$("aiOut").textContent="请先填入 API Key 并点击「保存配置」";$("aiOut").className="result err";return;}
    $("aiIn").value="";$("aiOut").textContent="";
    addMsg("me",msg);
    var loading=addMsg("ai","思考中…");
    history.push({role:"user",content:msg});
    try{
      var res=await fetch(url,{
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":"Bearer "+key},
        body:JSON.stringify({model:$("aiModel").value.trim()||DEFAULT_MODEL,messages:[{role:"system",content:"你是工具吧（toolba.cn）网站内置的AI助手，回答简洁准确，使用中文。"}].concat(history.slice(-20))})
      });
      if(!res.ok){
        var errText=await res.text();
        throw new Error("HTTP "+res.status+"："+errText.slice(0,200));
      }
      var data=await res.json();
      var reply=data.choices&&data.choices[0]&&data.choices[0].message?data.choices[0].message.content:JSON.stringify(data).slice(0,500);
      loading.textContent=reply;
      history.push({role:"assistant",content:reply});
    }catch(e){
      loading.textContent="✕ 调用失败："+e.message+"\n常见原因：API Key 无效、接口地址不对、模型名错误、余额不足或网络跨域限制。";
    }
  }
  $("aiSend").addEventListener("click",send);
  $("aiIn").addEventListener("keydown",function(e){if(e.key==="Enter")send()});
});
