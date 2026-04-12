// carousel pause
const track=document.getElementById("carousel-track");
track.addEventListener("mouseenter",()=>track.style.animationPlayState="paused");
track.addEventListener("mouseleave",()=>track.style.animationPlayState="running");

// momo scroll
document.getElementById("momo").addEventListener("click",()=>{
 document.querySelector("#featured").scrollIntoView({behavior:"smooth"});
});

// modal
function openModal(){document.getElementById("modal").style.display="block";}
function closeModal(){document.getElementById("modal").style.display="none";}

// reservation
function submitForm(){
 let name=document.getElementById("name").value;
 let date=document.getElementById("date").value;
 let time=document.getElementById("time").value;

 if(!name||!date||!time){alert("Fill all details");return;}

 let msg=`Reservation:%0AName:${name}%0ADate:${date}%0ATime:${time}`;
 window.open(`https://wa.me/917042377168?text=${msg}`);
}