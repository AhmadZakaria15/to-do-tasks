(function(){
  var KEY="daily-streaks-v1", tasks=[];
  try{var s=localStorage.getItem(KEY); if(s) tasks=JSON.parse(s)||[];}catch(e){tasks=[];}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(tasks));}catch(e){}}
  function ds(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
  function back(n){var d=new Date();d.setDate(d.getDate()-n);return ds(d);}
  function streakOf(has){ // has(dateStr) -> bool
    var i=has(back(0))?0:1,n=0;
    while(has(back(i))&&n<4000){n++;i++;}
    return n;
  }
  function taskStreak(t){return streakOf(function(d){return t.done.indexOf(d)>-1;});}
  function overall(){
    if(!tasks.length) return 0;
    return streakOf(function(d){return tasks.every(function(t){return t.done.indexOf(d)>-1;});});
  }
  var $=function(id){return document.getElementById(id);};
  var lastDay=back(0);
  function render(){
    var td=back(0);
    $("today").textContent=new Date().toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"});
    var list=$("list"); list.innerHTML="";
    if(!tasks.length){list.innerHTML='<div class="empty">No tasks yet. Add one above to start a streak.</div>';}
    tasks.forEach(function(t){
      var done=t.done.indexOf(td)>-1, st=taskStreak(t);
      var li=document.createElement("li"); if(done) li.className="done";
      var c=document.createElement("button"); c.className="chk"; c.textContent=done?"✓":""; c.setAttribute("aria-label","Toggle "+t.name);
      c.onclick=function(){toggle(t.id);};
      var m=document.createElement("div"); m.className="name";
      var nm=document.createElement("div"); nm.textContent=t.name;
      var mt=document.createElement("div"); mt.className="meta"; mt.textContent="Best: "+bestOf(t)+" days";
      m.appendChild(nm); m.appendChild(mt);
      var sb=document.createElement("span"); sb.className="streak"; sb.textContent="🔥 "+st;
      var x=document.createElement("button"); x.className="del"; x.textContent="×"; x.setAttribute("aria-label","Delete "+t.name);
      x.onclick=function(){ if(confirm("Delete “"+t.name+"”?")){tasks=tasks.filter(function(k){return k.id!==t.id;});save();render();} };
      li.appendChild(c); li.appendChild(m); li.appendChild(sb); li.appendChild(x);
      list.appendChild(li);
    });
    var d=tasks.filter(function(t){return t.done.indexOf(td)>-1;}).length;
    $("prog").textContent=d+" / "+tasks.length+" today";
    $("fill").style.width=(tasks.length?d/tasks.length*100:0)+"%";
    $("overall").textContent=overall();
  }
  function bestOf(t){
    var a=t.done.slice().sort(),b=0,r=0,prev=null;
    a.forEach(function(d){
      if(prev){var p=new Date(prev+"T00:00:00");p.setDate(p.getDate()+1);r=(ds(p)===d)?r+1:1;}else r=1;
      if(r>b)b=r; prev=d;
    });
    return b;
  }
  function toggle(id){
    var td=back(0);
    tasks.forEach(function(t){ if(t.id===id){
      var i=t.done.indexOf(td);
      if(i>-1) t.done.splice(i,1); else t.done.push(td);
    }});
    save(); render();
  }
  function add(){
    var v=$("in").value.trim(); if(!v) return;
    tasks.push({id:Date.now()+Math.random().toString(36).slice(2,6),name:v,done:[]});
    $("in").value=""; save(); render();
  }
  $("addBtn").onclick=add;
  $("in").addEventListener("keydown",function(e){if(e.key==="Enter")add();});
  setInterval(function(){ if(back(0)!==lastDay){lastDay=back(0);render();} },30000);
  render();
})();