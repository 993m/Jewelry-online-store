function setCookie(nume, val, timpExp, path="/"){
    d=new Date();
    d.setTime(d.getTime()+timpExp);
    document.cookie=`${nume}=${val}; expires=${d.toUTCString()}; path=${path}`;    

}

function getCookie(nume){
    var vectCookie=document.cookie.split(";");
    for(let c of vectCookie){
        c=c.trim();
        if(c.startsWith(nume+"=")){
            return c.substring(nume.length+1,)
        }
    }
}

function deleteCookie(nume){
    setCookie(nume, "", 0);
}

function checkBanner(){
    if(getCookie("acceptat_banner")){
        document.getElementById("banner").style.display="none";
    }
    else{
        document.getElementById("banner").style.display="block";
        document.getElementById("ok_cookies").onclick=function(){
            setCookie("acceptat_banner", "true", 1*60*1000); //expira intr-un minut
            document.getElementById("banner").style.display="none";
        }
    }
}

function checkGreetingCookie() {
    if(getCookie("acceptat_banner")){
        let username = getCookie("username");
        if (username != undefined) {
         alert("Buna din nou, " + username + "!");
        } else {
          username = prompt("Cum te numesti?", "");
          if (username != "" && username != null) {
            setCookie("username", username, 60*60*1000); //expira intr-o ora
          }
        }
    }
    
  }

window.addEventListener("DOMContentLoaded", function(){
    checkBanner();
    checkGreetingCookie();
})