window.addEventListener("load",function(){

	prod_sel=localStorage.getItem("cos_virtual");
	
	

	if (prod_sel){
		var vect=prod_sel.split(",");
		var vect_ids=[]
		var vect_cant=[]
		for(let v of vect){
			vect_ids.push(v.split('|')[0])
			vect_cant.push(v.split('|')[1])
		}


		fetch("/produse_cos", {		

			method: "POST",
			headers:{'Content-Type': 'application/json'},
			
			mode: 'cors',		
			cache: 'default',
			body: JSON.stringify({

				ids_prod: vect_ids,
				cant_prod: prod_sel
				
			})
		})
		.then(function(rasp){ console.log(rasp); x=rasp.json(); console.log(x); return x})
		.then(function(objson) {

			console.log(objson);//objson e vectorul de produse
			let main=document.getElementsByTagName("main")[0];
			let btn=document.getElementById("cumpara");


			for (let prod of objson){
				let article=document.createElement("article");
				article.classList.add("cos-virtual");
				var h2=document.createElement("h2");
				h2.innerHTML=prod.nume;
				article.appendChild(h2);
				let imagine=document.createElement("img");
				imagine.src="/resurse/imagini/produse/"+prod.imagine;
				article.appendChild(imagine);

				let ca;
				for(let c of prod.cant.split(',')){
					if(c.split("|")[0]==prod.id)
						ca=c.split("|")[1]
				}
				console.log(ca)

				let pr=parseInt(prod.pret)*parseInt(ca)
				

				let descriere=document.createElement("p");
				descriere.innerHTML=prod.descriere+" <br><br><b>Pret:</b>"+pr.toString()+`<br>(${ca} bucati)`;
				article.appendChild(descriere);

				main.insertBefore(article, btn);				
			}
	
		}
		).catch(function(err){console.log(err)});

		document.getElementById("cumpara").onclick=function(){
			prod_sel=localStorage.getItem("cos_virtual");// "1,2,3"
			if (prod_sel){
				var vect_ids=prod_sel.split(",");
				fetch("/cumpara", {		
		
					method: "POST",
					headers:{'Content-Type': 'application/json'},
					
					mode: 'cors',		
					cache: 'default',
					body: JSON.stringify({
						ids_prod: vect_ids,
						a:10,
						b:"abc"
					})
				})
				.then(function(rasp){ console.log(rasp); return rasp.text()})
				.then(function(raspunsText) {
			
					console.log(raspunsText);
					if(raspunsText.startsWith("Totu bine")){
						localStorage.removeItem("cos_virtual")
						let p=document.createElement("p");
						p.innerHTML=raspunsText;
						document.getElementsByTagName("main")[0].innerHTML="";
						document.getElementsByTagName("main")[0].appendChild(p)
					}
					else if(raspunsText.startsWith("Nu puteti cumpara daca nu sunteti logat!"))
						{let p=document.createElement("p");
						p.innerHTML=raspunsText;
						document.getElementsByTagName("main")[0].innerHTML="";
						document.getElementsByTagName("main")[0].appendChild(p)}
				}).catch(function(err){console.log(err)});
			}
		}
		
	}
	else{
		document.getElementsByTagName("main")[0].innerHTML="<p>Nu aveti nimic in cos.</p>";
	}

	
});