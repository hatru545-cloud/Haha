/*
  CONFIG: để lời nhắn đồng bộ cho tất cả mọi người, tạo project Supabase
  rồi điền SUPABASE_URL và SUPABASE_ANON_KEY bên dưới. Hướng dẫn trong README.md.
*/
const SUPABASE_URL = ""; // Ví dụ: https://xxxx.supabase.co
const SUPABASE_ANON_KEY = ""; // Chỉ dùng public anon key; KHÔNG dùng service_role key.

const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
const state = { name: "bạn", modal: null, music: false, photosAnimated: false };
const intro = $("#intro"), home = $("#home"), modal = $("#modal"), modalContent = $("#modalContent");
const audio = $("#bgMusic");
audio.volume = .45;
// Try to start music automatically; browsers may require a first user interaction.
async function tryAutoMusic(){try{await audio.play();state.music=true;const b=$("#musicBtn");if(b){b.textContent="♫ Tắt nhạc";b.setAttribute("aria-pressed","true");}return true;}catch(e){return false;}}
window.addEventListener("load",()=>{tryAutoMusic();});
const resumeMusicOnce=async()=>{if(audio.paused){const ok=await tryAutoMusic();if(ok){document.removeEventListener("pointerdown",resumeMusicOnce);document.removeEventListener("touchstart",resumeMusicOnce);document.removeEventListener("keydown",resumeMusicOnce);}}};
document.addEventListener("pointerdown",resumeMusicOnce,{passive:true});
document.addEventListener("touchstart",resumeMusicOnce,{passive:true});
document.addEventListener("keydown",resumeMusicOnce);
let robotIndex = 0;
let robotTimers = [];
let transitionTimer = null;
const robotLines = [
  "Ủa, tới đây rồi hả? 👀\nĐợi xíu, hệ thống đang kiểm tra xem hôm nay có phải ngày đặc biệt không...",
  "À, thì ra hôm nay là ngày 20/10 🌷",
  "Mà nè...\nCó những người ngày nào cũng gặp, tưởng là bình thường lắm. Đến lúc thời gian trôi qua mới thấy, hóa ra đó là những ngày đáng nhớ.",
  "Tui có chuẩn bị một thứ khá hay ở phía sau, mong cậu sẽ thích💗"
];
function showToast(message){const old=$(".toast");if(old)old.remove();const el=document.createElement("div");el.className="toast";el.textContent=message;document.body.append(el);setTimeout(()=>el.remove(),4000)}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function personalized(text){return text.replaceAll("X",state.name)}
function clearRobotTimers(){robotTimers.forEach(clearTimeout);robotTimers=[];}
function startIntro(name){
  state.name = (name || "bạn").trim().slice(0,35) || "bạn";
  $$(".name-slot").forEach(el=>el.textContent=state.name);
  $("#nameStep").classList.add("hidden");$("#robotStep").classList.remove("hidden");$("#skipIntro").classList.remove("hidden");
  robotIndex=0;clearRobotTimers();renderRobotLine();
}
function renderRobotLine(){
  const target=$("#robotDialogue");
  if(robotIndex>=robotLines.length){
    const robot=$("#robotStep");robot.classList.add("robot-fade-out");
    robotTimers.push(setTimeout(()=>{robot.classList.add("hidden");robot.classList.remove("robot-fade-out");$("#bookStep").classList.remove("hidden");},650));
    robotTimers.push(setTimeout(showHome,3900));
    return;
  }
  const parts=robotLines[robotIndex].split("\n");
  target.innerHTML=parts.map(x=>`<span class="line type-line"></span>`).join("");
  const spans=$$(".type-line",target);
  let total=0;
  spans.forEach((span,idx)=>{
    const text=parts[idx];
    const delay=total;
    robotTimers.push(setTimeout(()=>{
      let char=0;
      const type=()=>{
        if(char<text.length){span.textContent+=text.charAt(char++);robotTimers.push(setTimeout(type, text.length>70?31:39));}
        else if(idx===spans.length-1){
          const readingPause=Math.max(1450,Math.min(3400,text.length*34));
          robotTimers.push(setTimeout(()=>{robotIndex++;renderRobotLine();},readingPause));
        }
      };type();
    },delay));
    total+=text.length*(text.length>70?31:39)+420;
  });
}
$("#nameForm").addEventListener("submit",e=>{e.preventDefault();startIntro($("#visitorName").value)});
function showHome(){clearRobotTimers();intro.classList.add("hidden");home.classList.remove("hidden");$("#skipIntro").classList.add("hidden")} 
$("#skipIntro").addEventListener("click",showHome);

function openModal(kind){
  state.modal=kind;modalContent.innerHTML="";
  const templates={letter:letterTemplate(),gift:giftTemplate(),album:albumTemplate(),guestbook:guestbookTemplate()};
  modalContent.innerHTML=templates[kind];modal.classList.remove("hidden");document.body.style.overflow="hidden";
  if(kind==="letter")animateLetterPhotos();
  if(kind==="guestbook"){loadMessages();$("#guestForm").addEventListener("submit",submitMessage)}
  if(kind==="gift")$("#openGift").addEventListener("click",()=>showGreetingCard());
  if(kind==="album")wirePhotoClicks();
}
function closeModal(){
  modal.classList.add("hidden");document.body.style.overflow="";state.modal=null;
}
$("#closeModal").addEventListener("click",closeModal);
modal.addEventListener("click",e=>{if(e.target===modal)closeModal()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){if(!$("#photoLightbox").classList.contains("hidden"))closeLightbox();else if(!modal.classList.contains("hidden"))closeModal()}});
function playMagicTransition(kind){
  const overlay=$("#magicTransition");
  if(transitionTimer)clearTimeout(transitionTimer);
  const petals=$(".magic-petals",overlay);petals.innerHTML="";
  const glyphs=["♡","✿","✧","♥","❀"];
  for(let i=0;i<25;i++){
    const el=document.createElement("span");el.textContent=glyphs[i%glyphs.length];el.className="magic-petal";
    el.style.left=`${Math.random()*100}%`;el.style.setProperty("--fall-duration",`${4+Math.random()*5}s`);el.style.setProperty("--fall-delay",`${-Math.random()*7}s`);el.style.setProperty("--sway",`${Math.round(Math.random()*70-35)}px`);el.style.fontSize=`${12+Math.random()*20}px`;petals.append(el);
  }
  overlay.classList.remove("hidden","magic-out");overlay.classList.add("magic-in");
  transitionTimer=setTimeout(()=>{
    overlay.classList.remove("magic-in");overlay.classList.add("magic-out");
    setTimeout(()=>{overlay.classList.add("hidden");overlay.classList.remove("magic-out");openModal(kind)},420);
  },2550);
}
$$("[data-open]").forEach(btn=>btn.addEventListener("click",()=>openModal(btn.dataset.open)));
function letterTemplate(){return `
<h2 class="modal-title" id="modalTitle">💌 Một lời nhắn nhỏ</h2>
<p class="modal-sub">Dành cho ${escapeHTML(state.name)} — vài cánh hoa nhỏ thay lời chúc nha. 🩷</p>
<div class="letter-area">
 <div class="falling-flowers" aria-hidden="true"></div>
 <article class="letter-message"><h3>Gửi ${escapeHTML(state.name)} 🩷</h3>
 <p>Nhân dịp 20/10 tui chúc ${escapeHTML(state.name)} sẽ có một ngày thật vui, thật ý nghĩa.</p>
 <p>Hiện giờ thì tui không còn gặp ${escapeHTML(state.name)} nhiều nữa, ${escapeHTML(state.name)} cũng đang cố gắng trên con đường mà ${escapeHTML(state.name)} chọn. Tui mong ${escapeHTML(state.name)} vẫn sẽ cố gắng hoàn thành chặng đường phía trước dù có gian nan cỡ nào.</p>
 <p>Tui thì chả giỏi văn vở nên chỉ muốn nói là chúc ${escapeHTML(state.name)} có 1 ngày thật nhiều ý nghĩa nhé, và cũng đừng quên đi những kỉ niệm thời cấp 2 nhe 🩷</p>
 <p>— Một món quà nhỏ dành cho tụi mình 🍒</p></article>
</div><p class="tiny letter-footer-note" style="text-align:center">Một chút thương mến, gói trong trang giấy nhỏ 🩷</p>`}
function animateLetterPhotos(){
  const garden=$(".falling-flowers",modalContent);
  if(garden){
    garden.innerHTML="";
    const flowers=["✿","❀","✾","❁","🌸"];
    for(let i=0;i<22;i++){
      const flower=document.createElement("span");
      flower.className="falling-flower";
      flower.textContent=flowers[i%flowers.length];
      flower.style.left=(Math.random()*100)+"%";
      flower.style.animationDuration=(8+Math.random()*9)+"s";
      flower.style.animationDelay=(-Math.random()*15)+"s";
      flower.style.fontSize=(12+Math.random()*13)+"px";
      flower.style.setProperty("--drift",((Math.random()*80)-40)+"px");
      flower.style.opacity=(0.18+Math.random()*0.3).toFixed(2);
      garden.appendChild(flower);
    }
  }
  setTimeout(()=>$(".letter-message",modalContent)?.classList.add("show"),350);
}
function giftTemplate(){return `<h2 class="modal-title" id="modalTitle">🎁 Hộp quà 20/10</h2><p class="modal-sub">Một tấm thiệp nhỏ xíu dành tặng các bạn nữ của lớp mình. Mở hộp ra thử xem nè!</p><button id="openGift" class="gift-box" aria-label="Mở hộp quà"></button><p class="gift-instruction">Chạm vào hộp quà để mở 🎀</p><div id="giftResult"></div>`}
function showGreetingCard(){
  const result=$("#giftResult");if(!result)return;
  const name=escapeHTML(state.name);
  result.innerHTML=`<div class="firework-stage" aria-hidden="true">${Array.from({length:24},(_,i)=>`<span class="spark spark-${i%8}" style="--i:${i};--delay:${(i%6)*.12}s;--hue:${(i*47)%360}">✦</span>`).join("")}<span class="firework-burst burst-one">✦</span><span class="firework-burst burst-two">✧</span><span class="firework-burst burst-three">✦</span></div><article class="greeting-card gift-celebration"><div class="cat-robot" role="img" aria-label="Robot mèo dễ thương"><div class="cat-ears"><i></i><i></i></div><div class="cat-head"><span class="cat-eye"></span><span class="cat-eye"></span><span class="cat-cheek left"></span><span class="cat-cheek right"></span><span class="cat-mouth">ᴗ</span></div><div class="cat-bell">♥</div></div><div class="big-heart">🎆✨🎆</div><h3>CHÚC ${name} CÓ 1 NGÀY 20/10 THẬT HẠNH PHÚC🩷</h3><p class="cat-robot-talk">“Meo meo~ Chúc bạn nhận được thật nhiều niềm vui hôm nay nha! 💗”</p><div class="big-heart">🎀💗🎀</div></article>`;
  $("#openGift").style.animation="none";$("#openGift").disabled=true;showToast("Pháo hoa bắn lên rồi nè 🎆");
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const stage=$('.firework-stage',result);if(stage){stage.classList.add('fireworks-go');setTimeout(()=>stage.classList.remove('fireworks-go'),4200)}
}
function albumTemplate(){return `<h2 class="modal-title" id="modalTitle">📸 Album ngày ấy</h2><p class="modal-sub">Những khoảnh khắc của lớp mình. 💗</p><div class="album-grid">${[1,2,3,4,5,6,7,8].map(n=>`<button class="album-tile" style="--rot:${n%2?'-2deg':'2deg'}" data-photo="photo${n}.jpg" aria-label="Mở ảnh ${n}"><img class="album-photo" src="photo${n}.jpg" alt="Ảnh lớp ${n}" loading="lazy"></button>`).join("")}</div>`}
function wirePhotoClicks(){ $$("[data-photo]",modalContent).forEach(el=>el.addEventListener("click",()=>openPhoto(el.dataset.photo,el.querySelector(".photo-placeholder")?.outerHTML))) }
function openPhoto(src,placeholderHTML){
  const lb=$("#photoLightbox"),img=$("#lightboxImg"),ph=$("#lightboxPlaceholder");
  img.classList.add("hidden");ph.classList.add("hidden");lb.classList.remove("hidden");
  img.onload=()=>{img.classList.remove("hidden");ph.classList.add("hidden")};
  img.onerror=()=>{img.classList.add("hidden");ph.classList.remove("hidden");ph.innerHTML=placeholderHTML||"📸<br>Chưa có ảnh ở đây nha."};
  img.src=src;
}
function closeLightbox(){$("#photoLightbox").classList.add("hidden");$("#lightboxImg").removeAttribute("src")}
$("#closeLightbox").addEventListener("click",closeLightbox);
$("#photoLightbox").addEventListener("click",e=>{if(e.target.id==="photoLightbox")closeLightbox()});

function guestbookTemplate(){return `<h2 class="modal-title" id="modalTitle">📒 Góc tâm sự của tụi mình</h2><p class="modal-sub">Có điều gì muốn gửi đến mọi người không? Viết lại một chút kỷ niệm, một lời chúc hay đơn giản là vài dòng tâm sự nhé. 💗</p>
<form class="guest-form" id="guestForm"><label for="guestName">Tên hoặc biệt danh</label><input id="guestName" maxlength="35" placeholder="Nhập tên của bạn..." required><label for="guestText">Lời nhắn của bạn</label><textarea id="guestText" maxlength="700" placeholder="Viết gì đó cho cả lớp nha..." required></textarea><div class="notice">📢 Lưu ý: Lời nhắn của bạn sẽ được lưu lại và những người truy cập website sau này cũng có thể đọc được, kèm theo tên bạn. Chỉ gửi những điều bạn thoải mái chia sẻ với cả lớp nhé.</div><button class="primary" type="submit">Gửi lời tâm sự 💗</button></form>
<div class="data-warning" id="dataWarning"></div><section class="guest-list"><h3>💬 Lời nhắn từ mọi người</h3><div id="guestMessages"><p class="tiny" style="text-align:center">Đang tải lời nhắn…</p></div></section>`}
const starterMessages=[
{name:"Một người bạn cũ",message:"Mong là sau này dù mỗi đứa một con đường, tụi mình vẫn nhớ những ngày đi học cùng nhau nha. 🩷",created_at:"2026-10-17T08:00:00.000Z",sample:true},
{name:"Hội hay cười cuối lớp",message:"Chúc cả lớp luôn gặp chuyện vui, bớt deadline và nhớ giữ liên lạc đó nha =))) 🍒",created_at:"2026-10-17T09:00:00.000Z",sample:true}
];
function supabaseReady(){return SUPABASE_URL.startsWith("https://")&&SUPABASE_ANON_KEY.length>20}
async function dbRequest(path,options={}){
  const response=await fetch(`${SUPABASE_URL}/rest/v1/${path}`,{...options,headers:{"apikey":SUPABASE_ANON_KEY,"Authorization":`Bearer ${SUPABASE_ANON_KEY}`,"Content-Type":"application/json","Prefer":options.method==="POST"?"return=representation":"",...(options.headers||{})}});
  if(!response.ok)throw new Error(`Database error ${response.status}`);
  return response.status===204?null:response.json();
}
async function loadMessages(){
 const target=$("#guestMessages"),warning=$("#dataWarning");if(!target)return;
 warning.textContent=supabaseReady()?"Lời nhắn được lưu chung trên website.":"Bản thử hiện chưa kết nối kho dữ liệu chung: lời nhắn mới chỉ lưu trên trình duyệt này. Muốn cả lớp cùng thấy, hãy làm bước Supabase trong README.md.";
 let messages=[];
 if(supabaseReady()){try{messages=await dbRequest("messages?select=name,message,created_at&order=created_at.desc&limit=100")}catch(e){warning.textContent="Chưa đọc được dữ liệu chung. Kiểm tra cấu hình Supabase trong script.js và README.md.";messages=JSON.parse(localStorage.getItem("classMessages")||"[]")}}
 else messages=JSON.parse(localStorage.getItem("classMessages")||"[]");
 const all=[...messages,...starterMessages];
 target.innerHTML=all.length?all.map(m=>`<article class="guest-message"><header><span>💌 ${escapeHTML(m.name)}</span><time>${m.sample?"Lời nhắn mẫu":formatDate(m.created_at)}</time></header><p>${escapeHTML(m.message)}</p></article>`).join(""):'<p class="tiny" style="text-align:center">Chưa có lời nhắn nào — viết lời đầu tiên nha! 💗</p>';
}
function formatDate(s){if(!s)return"";const d=new Date(s);return Number.isNaN(d.getTime())?"":d.toLocaleDateString("vi-VN",{day:"2-digit",month:"2-digit",year:"numeric"})}
async function submitMessage(e){
 e.preventDefault();const name=$("#guestName").value.trim(),message=$("#guestText").value.trim();if(!name||!message)return;
 const item={name:name.slice(0,35),message:message.slice(0,700),created_at:new Date().toISOString()};
 const btn=$("button[type=submit]",e.currentTarget);btn.disabled=true;btn.textContent="Đang gửi…";
 try{
   if(supabaseReady()){await dbRequest("messages",{method:"POST",body:JSON.stringify({name:item.name,message:item.message})});showToast("Lời nhắn đã được gửi cho cả lớp 💗")}
   else{const old=JSON.parse(localStorage.getItem("classMessages")||"[]");old.unshift(item);localStorage.setItem("classMessages",JSON.stringify(old));showToast("Đã lưu trên trình duyệt này. Muốn cả lớp cùng thấy, cần kết nối Supabase nha!")}
   $("#guestText").value="";await loadMessages();
 }catch(err){showToast("Chưa gửi được. Kiểm tra kết nối hoặc cấu hình Supabase nha.");}
 finally{btn.disabled=false;btn.textContent="Gửi lời tâm sự 💗"}
}
$("#musicBtn").addEventListener("click",async()=>{
 if(!audio.getAttribute("src")||audio.getAttribute("src").endsWith("music.mp3")&&audio.readyState===0){
   try{await audio.play();state.music=true;$("#musicBtn").textContent="♫ Tắt nhạc";$("#musicBtn").setAttribute("aria-pressed","true")}
   catch(e){showToast("Ông bỏ file nhạc tên music.mp3 vào cùng thư mục với index.html trước nha 🎵")}
 }else if(audio.paused){try{await audio.play();state.music=true;$("#musicBtn").textContent="♫ Tắt nhạc";$("#musicBtn").setAttribute("aria-pressed","true")}catch(e){showToast("Chưa phát được nhạc. Kiểm tra file music.mp3 nha.")}}
 else{audio.pause();state.music=false;$("#musicBtn").textContent="♫ Bật nhạc";$("#musicBtn").setAttribute("aria-pressed","false")}
});
$("#volume").addEventListener("input",e=>audio.volume=Number(e.target.value));
