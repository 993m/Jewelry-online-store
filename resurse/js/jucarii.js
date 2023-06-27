window.addEventListener("load", function(){

    function sorteaza(semn){
        var articole= document.getElementsByClassName("produs");
        var v_articole=Array.from(articole);
        v_articole.sort(function(a,b){
            var varsta_a= parseInt(a.getElementsByClassName("val-varsta")[0].innerHTML);
            var varsta_b= parseInt(b.getElementsByClassName("val-varsta")[0].innerHTML);
            if(varsta_a!=varsta_b)
                return semn*(varsta_a - varsta_b);
            else{
                var pret_a= a.getElementsByClassName("val-pret")[0].innerHTML;
                var pret_b= b.getElementsByClassName("val-pret")[0].innerHTML;
                return  semn*(pret_a - pret_b);
            }
        });

        for(let art of v_articole){
            art.parentElement.appendChild(art);
        }
    }

    document.getElementById("filtrare").onclick=function(){

        var butoaneRadio=document.getElementsByName("rad");
        for(let rad of butoaneRadio){
            if(rad.checked){
                var valSortare=rad.value;
                break;
            }
        }

            if(valSortare = "cresc"){
                sorteaza(1);
            }
            else sorteaza(-1);


        var articole = document.getElementsByClassName("produs");
        for (let art of articole) {
            art.style.display = "none";
            
            let cond;
            for(let culoare of art.getElementsByClassName("lista-culori"))
                cond =(document.getElementById("select").value=="toate") || (culoare.innerHTM==document.getElementById("select").value );

            if(cond) art.style.display = "block";
        }
    }

    
})