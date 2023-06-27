window.addEventListener("load", function(){

    //bifare elem in cosul virtual
    iduriProduse=localStorage.getItem("cos_virtual");
            if(iduriProduse){
                iduriProduse=iduriProduse.split(",");
            }
            else{
                iduriProduse=[];
            }
            for(let id_p of iduriProduse){
                let index=id_p.split('|')[0]
                let val=id_p.split('|')[1]
                var ch=document.querySelector(`[value='${index}'].select-cos`)
                if(ch){
                    ch.checked=true;
                    document.getElementById(ch.value).innerHTML=val
                }
            }


    document.getElementById("inp-pret").onchange=function(){
        document.getElementById("infoRange").innerHTML=" (" + this.value + ")";
    }


    document.getElementById("resetare").onclick=function(){
        var articole=document.getElementsByClassName("produs");
        for(let art of articole)
            art.style.display="block";
        document.getElementById("inp-nume").value="";
        document.getElementById("i_rad4").checked=true;
        document.getElementById("inp-pret").value=parseFloat(document.getElementById("inp-pret").max);
        document.getElementById("infoRange").innerHTML=' ('+document.getElementById("inp-pret").max+')';
        
        document.getElementById("sel-toate").selected=true;
    }

    document.getElementById("filtrare").onclick=function(){

        var valNume = document.getElementById("inp-nume").value.toLowerCase();

        var butoaneRadio=document.getElementsByName("gr_rad");
        for(let rad of butoaneRadio){
            if(rad.checked){
                var valCarate=rad.value;
                break;
            }
        }

        var valStiluri=[];
        var butoaneCheckboxuri = document.getElementsByName("stil_bijuterie")
        for(let stil of butoaneCheckboxuri)
        {
            if(stil.checked){
                valStiluri.push(stil.value.toLowerCase());
            }
        }
        
        var minCarate, maxCarate;
        if (valCarate!="toate"){
            [minCarate, maxCarate]=valCarate.split(":");
            minCarate=parseFloat(minCarate);
            maxCarate=parseFloat(maxCarate);
        }
        else{
            minCarate=0;
            maxCarate=100;
        }

        var valPret = document.getElementById("inp-pret").value;

        var valCategorie = document.getElementById("inp-categorie").value;

        var valCuloare = document.getElementById("culoare").value;

        var valMetale=[];
        for(let metal of document.getElementById("metal").options)
            {
                if(metal.selected)
                    valMetale.push(metal.value);
            }

        var articole = document.getElementsByClassName("produs");
        for (let art of articole) {
            art.style.display = "none";
            let numeArt = art.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase();

            let cond1 = (numeArt.startsWith(valNume));

            let carateArt=parseFloat(art.getElementsByClassName("val-carate")[0].innerHTML);
            let cond2=(minCarate <= carateArt && carateArt <= maxCarate);

            let pretArt=parseInt(art.getElementsByClassName("val-pret")[0].innerHTML);
            let cond3=(pretArt <= valPret);

            let categorieArt = art.getElementsByClassName("val-categorie")[0].innerHTML;
            let cond4 =(valCategorie=="Toate") || (categorieArt==valCategorie);

            let culoareArt = art.getElementsByClassName("val-culoare")[0].innerHTML;
            let cond5 =(valCuloare=="Oricare") || (culoareArt==valCuloare);

            let stiluri = art.getElementsByClassName("val-stiluri")[0].innerHTML.toLowerCase().split(",");
            let cond6=0;
            for(var stil1 of valStiluri)
                for(var stil2 of stiluri) 
                    cond6 = cond6 || (stil1 == stil2);

            let metal = art.getElementsByClassName("val-metal")[0].innerHTML.toLowerCase();
            let cond7 = 0;
            for(var m of valMetale)
                cond7 = cond7 || (m == metal);


            let conditieFinala = cond1 && cond2 && cond3 && cond4 && cond5 && cond6 && cond7;
            if (conditieFinala){
                art.style.display = "block";
            }

            
        }
    }


    function sorteaza(semn){
        var articole= document.getElementsByClassName("produs");
        var v_articole=Array.from(articole);
        v_articole.sort(function(a,b){
            var pret_a= parseFloat(a.getElementsByClassName("val-pret")[0].innerHTML);
            var pret_b= parseFloat(b.getElementsByClassName("val-pret")[0].innerHTML);
            if(pret_a!=pret_b)
                return semn*(pret_a - pret_b);
            else{
                
                var nrStiluri_a= a.getElementsByClassName("val-stiluri")[0].innerHTML.split(",").length();
                var nrStiluri_b= b.getElementsByClassName("val-stiluri")[0].innerHTML.split(",").length();
                return semn*(nrStiluri_a - nrStiluri_b);
            }

        });

        for(let art of v_articole){
            art.parentElement.appendChild(art);
        }
    }

    document.getElementById("sortCrescNume").onclick=function(){
        sorteaza(1);
    }
    
    document.getElementById("sortDescrescNume").onclick=function(){
        sorteaza(-1);
    }

    var checkboxuri=document.getElementsByClassName("select-cos");
    for(let ch of checkboxuri){
         ch.onchange=function(){
             let index=parseInt(ch.value)
             let p = document.querySelector(`[id='${index}'].cant`)


            iduriProduse=localStorage.getItem("cos_virtual");
            if(iduriProduse){
                iduriProduse=iduriProduse.split(",");
            }
            else{
                iduriProduse=[];
            }

            if(this.checked){
                iduriProduse.push(this.value+'|1');
            }
            else{
                var poz=iduriProduse.indexOf(this.value+'|'+p.innerHTML);
                if(poz!=-1)
                    iduriProduse.splice(poz,1);
            }
            localStorage.setItem("cos_virtual", iduriProduse.join(","))
        }}
            

    var btn_adauga=document.getElementsByClassName("adauga");

    for(let b of btn_adauga){
            let p=document.getElementById(b.value);
            b.onclick=function(){
                iduriProduse=localStorage.getItem("cos_virtual");
                if(iduriProduse){ 
                       iduriProduse=iduriProduse.split(",");
                }

                var poz=iduriProduse.indexOf(this.value+'|'+p.innerHTML);
                if(poz!=-1)
                {
                    iduriProduse.splice(poz, 1); 
                }

                let val= parseInt(p.innerHTML)+1
                p.innerHTML=val.toString()

                iduriProduse.push(this.value+'|'+p.innerHTML);

                localStorage.setItem("cos_virtual", iduriProduse.join(","))
            }}

            
    var btn_scade=document.getElementsByClassName("scade");
for(let b of btn_scade){
    let p=document.getElementById(b.value);
    b.onclick=function(){
        if(p.innerHTML!='1'){
            iduriProduse=localStorage.getItem("cos_virtual");
            if(iduriProduse){ 
                   iduriProduse=iduriProduse.split(",");
            }

            var poz=iduriProduse.indexOf(this.value+'|'+p.innerHTML);
            if(poz!=-1)
            {
                iduriProduse.splice(poz, 1); 
            }

            let val= parseInt(p.innerHTML)-1
            p.innerHTML=val.toString()
            console.log(p.innerHTML)

            iduriProduse.push(this.value+'|'+p.innerHTML);

            localStorage.setItem("cos_virtual", iduriProduse.join(","))
        }
    }
}
            

document.getElementById("suma").onclick=function(){
    let suma = 0;
    iduriProduse=localStorage.getItem("cos_virtual");
    if(iduriProduse){ 
           iduriProduse=iduriProduse.split(",");
    }

    if(iduriProduse)
    for(let prod of iduriProduse){
        //if(prod.getElementsByClassName("select-cos")[0].checked )
            let index=prod.split("|")[0]
            let cant=prod.split("|")[1]
            suma += document.querySelector(`[value='${index}'].val-pret`).innerHTML * parseInt(cant)
    }

    
    localStorage.setItem("cos_virtual", iduriProduse.join(","))
        let infoSuma=document.createElement("p");
        infoSuma.innerHTML="Suma: "+suma;
        infoSuma.className="info-produse";
        let p=document.getElementById("suma")
        p.parentNode.insertBefore(infoSuma,p.nextSibling);
        setTimeout(function(){infoSuma.remove()}, 4000);


}
        
   


    // document.getElementById("suma").onclick=function(){
    //     let suma = 0;
    //     var produse = document.getElementsByClassName("produs");
    //     for(let prod of produse){
    //         //if(prod.getElementsByClassName("select-cos")[0].checked )
    //             suma += parseInt(prod.getElementsByClassName("val-pret")[0].innerHTML)
    //     }
    //         let infoSuma=document.createElement("p");
    //         infoSuma.innerHTML="Suma: "+suma;
    //         infoSuma.className="info-produse";
    //         let p=document.getElementById("suma")
    //         p.parentNode.insertBefore(infoSuma,p.nextSibling);
    //         setTimeout(function(){infoSuma.remove()}, 4000);
    // }

})