const express = require("express");
const fs=require("fs");
const sharp=require("sharp");
const {Client}=require("pg");
const ejs=require("ejs");
const sass=require("sass");
const path=require("path")
const nodemailer=require('nodemailer')
const helmet=require('helmet');
const formidable=require('formidable');
const crypto=require('crypto');
const session=require('express-session');
const html_to_pdf = require('html-pdf-node');
const juice=require('juice');
const QRCode=require('qrcode');
const mongodb=require('mongodb')

var url="mongodb://localhost:27017"

const obGlobal={obImagini:null, 
    obErori:null,
    emailServer:"maria13tw@gmail.com",
    port:8080,
    sirAlphaNum:"",
    protocol:null,
    numeDomeniu:null, 
    clientMongo: mongodb.MongoClient, 
    bdMongo:null

};

obGlobal.clientMongo.connect(url, function(err, bd) {
    if (err) console.log(err);
    else{
        obGlobal.bdMongo = bd.db("proiect_web");
    }
});


async function trimiteMail(email, subiect, mesajText, mesajHtml, atasamente=[]){
	var transp= nodemailer.createTransport({
		service: "gmail",
		secure: false,
		auth:{//date login 
			user:obGlobal.emailServer,
            pass:"yetbxvnedrndwfcj"
		},
		tls:{
			rejectUnauthorized:false
		}
	});
	//genereaza html
	await transp.sendMail({
		from:obGlobal.emailServer,
		to:email,
		subject:subiect,//"Te-ai inregistrat cu succes",
		text:mesajText, //"Username-ul tau este "+username
		html: mesajHtml,// `<h1>Salut!</h1><p style='color:blue'>Username-ul tau este ${username}.</p> <p><a href='http://${numeDomeniu}/cod/${username}/${token}'>Click aici pentru confirmare</a></p>`,
		attachments: atasamente
	})
	console.log("trimis mail");
}




if(process.env.SITE_ONLINE){
    obGlobal.protocol="https://";
    obGlobal.numeDomeniu="pure-sands-24916.herokuapp.com"
    var client=new Client({database:"d135aua301kcr1", user:"ryvzhmidhdmqyo", password:"18c23dc68cd96f0e820989e67f532784aeef7751b25242a7bf9f5210c4ff6d06", host:"ec2-52-203-118-49.compute-1.amazonaws.com", port:5432, ssl: {
        rejectUnauthorized: false
      }}); 
}
else{
    obGlobal.protocol="http://"
    obGlobal.numeDomeniu="localhost:8080"
    var client=new Client({database:"proiect tehnici web", user:"maria", password:"1234", host:"localhost", port:5432});
}
client.connect();

foldere=["temp", "poze_uploadate"]
for(let folder of foldere){
    let calefolder=path.join(__dirname, folder)
    if (!fs.existsSync(calefolder))
        fs.mkdirSync(calefolder)
}

var v_intervale=[[65,80]]
for(let interval of v_intervale){
    for(let i=interval[0]; i<=interval[1];i++)
    obGlobal.sirAlphaNum+=String.fromCharCode(i);
}

function genereazaToken1(n){
    let token1="";
    var sir=[0,1,2,3,4,5,6,7,8,9]
    for(let i=0;i<10;i++)
        token1+=sir[Math.floor(Math.random()*sir.length)].toString()
    console.log(token1)
    return token1
}

function genereazaToken2(n){
    let token2="";
    for(let i=0;i<70;i++)
        token2+=obGlobal.sirAlphaNum[Math.floor(Math.random()*obGlobal.sirAlphaNum.length)].toString()
    console.log(token2)
    return token2
}



client.query("select * from unnest(enum_range(null::categ_bijuterie))", function(err, rezCateg){
    obGlobal.optiuni=rezCateg.rows;
})

app = express();
app.use(helmet.frameguard());//pentru a nu se deschide paginile site-ului in frame-uri
app.use(["/produse_cos", "/cumpara"], express.json({limit: '2mb'}))


app.use(session({ 
    secret: 'abcdefg',//folosit de express session pentru criptarea id-ului de sesiune
    resave: true,
    saveUninitialized: false
  }));


app.set("view engine", "ejs");
app.use("/resurse", express.static(__dirname+"/resurse"))
app.use("/poze_uploadate", express.static(__dirname+"/poze_uploadate"))

app.use("/*", function(req, res, next){
    res.locals.optiuni = obGlobal.optiuni;
    res.locals.utilizator=req.session.utilizator;
    res.locals.mesajLogin=req.session.mesajLogin;
    req.session.mesajLogin=null;
    next();
})

function getIp(req){//pentru Heroku
    var ip = req.headers["x-forwarded-for"];//ip-ul userului pentru care este forwardat mesajul
    if (ip){
        let vect=ip.split(",");
        return vect[vect.length-1];
    }
    else if (req.ip){
        return req.ip;
    }
    else{
     return req.connection.remoteAddress;
    }
}

app.get("/*", function(req, res, next){
    let id_utiliz=req.session.utilizator ? req.session.utilizator.id : null;
    let queryInsert=`insert into accesari (ip, user_id, pagina) values('${getIp(req)}', '${id_utiliz}', '${req.url}' )`
    client.query(queryInsert, function(err, rezQuery){
    })
    next();
})

var ipuri_active={};


app.all("/*",function(req,res,next){
    let ipReq=getIp(req);
    let ip_gasit=ipuri_active[ipReq+"|"+req.url];
    timp_curent=new Date();
    if(ip_gasit){
    
        if( (timp_curent-ip_gasit.data)< 20*1000) {//diferenta e in milisecunde; verific daca ultima accesare a fost pana in 20 secunde
            if (ip_gasit.nr>10){//mai mult de 10 cereri 
                res.send("<h1>Prea multe cereri intr-un interval scurt. Ia te rog sa fii cuminte, da?!</h1>");
                ip_gasit.data=timp_curent
                return;
            }
            else{  
                
                ip_gasit.data=timp_curent;
                ip_gasit.nr++;
            }
        }
        else{
            //console.log("Resetez: ", req.ip+"|"+req.url, timp_curent-ip_gasit.data)
            ip_gasit.data=timp_curent;
            ip_gasit.nr=1;//a trecut suficient timp de la ultima cerere; resetez
        }
    }
    else{
        ipuri_active[ipReq+"|"+req.url]={nr:1, data:timp_curent};
        //console.log("am adaugat ", req.ip+"|"+req.url);
        //console.log(ipuri_active);        

    }
    let comanda_param= `insert into accesari(ip, user_id, pagina) values ($1::text, $2,  $3::text)`;
    //console.log(comanda);
    if (ipReq){
        var id_utiliz=req.session.utilizator?req.session.utilizator.id:null;
        //console.log("id_utiliz", id_utiliz);
        client.query(comanda_param, [ipReq, id_utiliz, req.url], function(err, rez){
            if(err) console.log(err);
        });
    }
    next();   
}); 



function stergeAccesariVechi(){
    var queryDelete="delete from accesari where now()-data_accesare >= interval '1 day' ";
    client.query(queryDelete, function(err, rezQuery){

    })
}

stergeAccesariVechi();
setInterval(stergeAccesariVechi, 60*60*1000)

app.get(["/", "/index", "/home"], function(req, res){

    querySelect="select username, nume from utilizatori where rol='admin' and id in (select distinct user_id from accesari where now()-data_accesare <= interval '10 minutes')"

    client.query(querySelect, function(err, rezQuery){
        useriOnline=[]
        if(err) console.log(err);
        else useriOnline=rezQuery.rows;
        res.render("pagini/index", {imagini:obImagini.imagini, useriOnline: useriOnline});

    })

})

app.get("*/galerie_animata.css", function(req, res){
    var sirScss=fs.readFileSync(__dirname+"/resurse/scss/galerie_animata.scss").toString("utf8");
    var nr=Math.floor(Math.random()*6)+6;
    rezScss=ejs.render(sirScss, {nr_imag: nr});
    var caleScss=__dirname+"/temp/galerie_animata.scss";
    fs.writeFileSync(caleScss, rezScss);
    try{
        rezCompilare = sass.compile(caleScss, {sourceMap:true});
        var caleCss = __dirname+"/temp/galerie_animata.css";
        fs.writeFileSync(caleCss, rezCompilare.css);
        res.setHeader("Content-Type", "text/css");
        res.sendFile(caleCss);
    }
    catch(err){
        console.log(err);
        res.send("Eroare");
    }
});

app.get("/produse", function(req, res){
        var cond_where=req.query.tip ? `categorie='${req.query.tip}'` : " 1=1";
        client.query("select max(pret), min(pret) from bijuterii", function(err, rez){
        client.query("select * from bijuterii where "+cond_where, function(err, rezQuery){
            if(err){
                randeazaEroare(res, 2);
            }
            else{
                res.render("pagini/produse", {produse: rezQuery.rows , optiuni:obGlobal.optiuni, pret_maxim: rez.rows[0].max, pret_minim: rez.rows[0].min});
            }
            
        });

    });

});

/*app.get("/jucarii", function(req, res){
    client.query("select * from jucarii", function(err, rezQuery){
        if(err){
            randeazaEroare(res, 2);
        }
        else res.render("pagini/jucarii", {produse: rezQuery.rows});
    });
});
*/

app.get("/produs/:id", function(req, res){
    client.query(`select * from bijuterii where id= ${req.params.id}`, function(err, rezQuery){
        res.render("pagini/produs", {prod: rezQuery.rows[0] });
    });
});


//===================== cos virtual ====================//
app.post("/produse_cos", function(req, res){
    
    if(req.body.ids_prod.length!=0){
        let querySelect=`select id, nume, descriere, imagine, pret from bijuterii where id in (${req.body.ids_prod.join(",")})`
        client.query(querySelect, function(err, rezQuery){
            if(err){
                console.log(err)
                res.send("Eroare baza date")
            }
            
            for(let r of rezQuery.rows)
            r['cant']=req.body.cant_prod
                
               // console.log(rezQuery.rows)
            res.send(rezQuery.rows)
        })
    }
    else{
        res.send([])
    }
})


app.post("/cumpara",function(req, res){
    if(!req.session.utilizator){
        res.write("Nu puteti cumpara daca nu sunteti logat!");
        res.end();
        return;
    }
    //TO DO verificare id-uri pentru query-ul la baza de date
    client.query("select id, nume, pret, tip_produs, tip_metal, carate from bijuterii where id in ("+req.body.ids_prod+")", function(err,rez){
        //console.log(err, rez);
        //console.log(rez.rows);
        
        let rezFactura=ejs.render(fs.readFileSync("views/pagini/factura.ejs").toString("utf8"),{utilizator:req.session.utilizator,produse:rez.rows, protocol:obGlobal.protocol, domeniu:obGlobal.numeDomeniu});
        //console.log(rezFactura);
        let options = { format: 'A4', args: ['--no-sandbox', '--disable-extensions',  '--disable-setuid-sandbox'] };

        let file = { content: juice(rezFactura, {inlinePseudoElements:true}) };
       
        html_to_pdf.generatePdf(file, options).then(function(pdf) {
            if(!fs.existsSync("./temp"))
                fs.mkdirSync("./temp");
            var numefis="./temp/test"+(new Date()).getTime()+".pdf";
            fs.writeFileSync(numefis,pdf);
            let mText=`Stimate ${req.session.utilizator.username}, aveți atașată factura.`;
		    let mHtml=`<h1>Salut!</h1><p>${mText}</p>`;

            trimiteMail(req.session.utilizator.email,"Factura", mText, mHtml, [{ 
                                                    filename: 'factura.pdf',
                                                    content: fs.readFileSync(numefis)
                                                }]);
            res.write("Totu bine!");res.end();
            let factura= { data: new Date(), nume: req.session.utilizator.username, produse:rez.rows };
            obGlobal.bdMongo.collection("facturi").insertOne(factura, function(err, res) {
                if (err) console.log(err);
                else{
                    console.log("Am inserat factura in mongodb");
                    //doar de debug:
                    obGlobal.bdMongo.collection("facturi").find({}).toArray(function(err, result) {
                        if (err) console.log(err);
                        else console.log(result);
                      });
                }
              });
        });
              
       
    });
    
});



//===================== galerie statica ====================//

app.get("/galerie-statica", function(req, res){
    res.render("pagini/galerie-statica", {imagini:obImagini.imagini});
})

app.get("/eroare", function(req, res){randeazaEroare(res,1, "Titlu schimbat");});


//------------- utilizatori-------------------//
parolaServer="tehniciweb";

app.post("/inreg", function(req, res){
    var formular=new formidable.IncomingForm()
    formular.parse(req, function(err, campuriText, campuriFisier){

        var eroare="";
        if(campuriText.username==""){
            eroare+="Username necompletat. ";
        }
        if(!campuriText.nume){
            eroare+="Nume necompletat. ";
        }
        if(!campuriText.prenume){
            eroare+="Prenume necompletat. ";
        }
        if(!campuriText.email){
            eroare+="Email necompletat. ";
        }
        if(!campuriText.parola){
            eroare+="Parola necompletata. ";
        }
        if(!campuriText.rparola){
            eroare+="Parola trebuie reintrodusa. ";
        }
        
        if(!campuriText.username.match(new RegExp("^[A-Za-z0-9]+$"))){
            eroare+="Username nu corespunde patternului. ";
        }

        if(!campuriText.email.match(new RegExp("^[a-zA-Z0-9_-]+[@][a-zA-Z0-9]+[.][a-zA-Z][a-zA-Z][a-zA-Z]?$"))){
            eroare+="Emailul nu corespunde patternului. ";
        }

        if(!eroare){
            queryUtiliz=`select username from utilizatori where username= $1::text`;
            client.query(queryUtiliz, [campuriText.username], function(err, rezUtiliz){
                if(rezUtiliz.rows.length!=0){
                    eroare+="Username-ul exista deja. ";
                    res.render("pagini/inregistrare", {err: "Eroare " + eroare});
                    
                }
                else {
                    let token1=genereazaToken1();
                    let token2=genereazaToken2();
                    token2=`${campuriText.nume}-`+token2;
                    
                    console.log(token2)
                    var parolaCriptata=crypto.scryptSync(campuriText.parola, parolaServer, 64).toString('hex');
                    var comandaInserare=`insert into utilizatori (username, nume, prenume, parola, email, culoare_chat, cod) values ('${campuriText.username}','${campuriText.nume}','${campuriText.prenume}','${parolaCriptata}','${campuriText.email}','${campuriText.culoare_chat}', '${token2}' )`;
                    client.query(comandaInserare, function(err, rezInserare){
                        if(err) {
                            res.render("pagini/inregistrare", {err: "Eroare baza de date"});
                        }
                        else {
                            res.render("pagini/inregistrare", {raspuns: "Datele au fost introduse"});
                            let linkConfirmare=`${obGlobal.protocol}${obGlobal.numeDomeniu}/confirmare_inreg/${token1}/${campuriText.username.split("").reverse().join("")}/${token2}`;
                            trimiteMail(campuriText.email, `Buna, ${campuriText.username}!`, "text", `<p><span style='background-color:lightblue;font-size:large'>Bine ai venit</span> în comunitatea Castanilor!</p> <a href='${linkConfirmare}'>Confirma contul</a>`)
                        
                        }
                    })
                }
            })
        }
        else{
            res.render("pagini/inregistrare", {err: "Eroare " + eroare});
        }
        
    })

    formular.on("field", function(nume,val){  
        if(nume=="username")
        username=val;

    })

    formular.on("fileBegin", function(nume,fisier){ 
        caleUtiliz=path.join(__dirname, "poze_uploadate", username)
    if(!fs.existsSync(caleUtiliz)) fs.mkdirSync(caleUtiliz);
    fisier.filepath=path.join(caleUtiliz, fisier.originalFilename)
    })   


})

app.get("/confirmare_inreg/:token1/:username/:token2", function(req, res){
    var u = req.params.username.split("").reverse().join("")
    var comandaUpdate=`update utilizatori set confirmat_mail=true where username='${u}' and  cod='${req.params.token2}'`
    client.query(comandaUpdate, function(err, rezUpdate){
        if(err){
            console.log(err)
            randeazaEroare(res, 2)
        }
        else{
            if(rezUpdate.rowCount==1){
                res.render("pagini/confirmare")
            }
            else{
                randeazaEroare(res, -1,"Mail neconfirmat", "Incercati iar")
            }
        }
    })
}) 

app.post("/login", function(req, res){
    var formular=new formidable.IncomingForm()
    formular.parse(req, function(err, campuriText, campuriFisier){
        var parolaCriptata=crypto.scryptSync(campuriText.parola, parolaServer, 64).toString('hex');
        //var querySelect =`select * from utilizatori where username='${campuriText.username}' and parola='${parolaCriptata}' and confirmat_mail=true`;
        var querySelect=`select * from utilizatori where username= $1::text and parola=$2::text and confirmat_mail=true`;

        client.query(querySelect, [campuriText.username, parolaCriptata], function(err, rezSelect){
            if(err) console.log(err);
            else{
                if(rezSelect.rows.length==1){

                    req.session.utilizator={
                        id:rezSelect.rows[0].id,
                        nume: rezSelect.rows[0].nume, 
                        prenume: rezSelect.rows[0].prenume,
                        username: rezSelect.rows[0].username,
                        email: rezSelect.rows[0].email,
                        culoare_chat: rezSelect.rows[0].culoare_chat,
                        rol: rezSelect.rows[0].rol    

                    }
                    res.redirect("/index");
                }
                else{
                    //randeazaEroare(res, -1, "Login esuat", "Mail neconfirmat sau parola gresita", null)
                    req.session.mesajLogin="Login esuat"
                    res.redirect("/index")
                }
            }
        })
    })
})


//---------------- USERI -----------------------------

app.get("/useri", function(req, res){
    if(req.session.utilizator && req.session.utilizator.rol=="admin"){
        client.query("select * from utilizatori",function(err, rezQuery){
            res.render("pagini/useri", {useri: rezQuery.rows});
            
        });
    }
    else{
        randeazaEroare(res, 403);
    }

});

app.post("/sterge_utiliz", function(req, res){
    var formular = new formidable.IncomingForm();

    formular.parse(req, function(err, campuriText, campuriFile){
        var email= `select email from utilizatori where id= ${campuriText.id_utiliz}`;
        var queryDelete  = `delete from utilizatori where id= ${campuriText.id_utiliz}`;
        client.query(email, function(err, rezEmail){
            client.query(queryDelete, function(err, rezQuery){
                res.redirect("/useri");
                trimiteMail(rezEmail.rows[0].email, "La revedere!", "text", `<h1>Ti-am sters contul</h1>`)
                console.log(rezEmail.rows[0].email)
            })
        })
        
    })
})

// ---------------- Update profil -----------------------------
 
app.post("/profil", function(req, res){
    console.log("profil");
    if (!req.session.utilizator){
        res.render("pagini/eroare_generala",{text:"Nu sunteti logat."});
        return;
    }
    var formular= new formidable.IncomingForm();
 
    formular.parse(req,function(err, campuriText, campuriFile){
       
        var criptareParola=crypto.scryptSync(campuriText.parola,parolaServer, 64).toString('hex');
 
        //TO DO query
        var queryUpdate=`update utilizatori set nume='${campuriText.nume}', prenume='${campuriText.prenume}', email='${campuriText.email}', culoare_chat='${campuriText.culoare_chat}' where parola='${criptareParola}'`;
       
        client.query(queryUpdate,  function(err, rez){
            if(err){
                console.log(err);
                res.render("pagini/eroare_generala",{text:"Eroare baza date. Incercati mai tarziu."});
                return;
            }
            console.log(rez.rowCount);
            if (rez.rowCount==0){
                res.render("pagini/profil",{mesaj:"Update-ul nu s-a realizat. Verificati parola introdusa."});
                return;
            }
           else{
                req.session.utilizator.nume=campuriText.nume
                req.session.utilizator.prenume=campuriText.prenume
                req.session.utilizator.email=campuriText.email
                req.session.utilizator.culoare_chat=campuriText.culaore_chat
           }

 
            res.render("pagini/profil",{mesaj:"Update-ul s-a realizat cu succes."});
 
        });
       
 
    });
});



app.get("/logout", function(req, res){
    req.session.destroy();
    res.locals.utilizator=null;
    res.render("pagini/logout");
})



app.get("/*.ejs", function(req, res){
    randeazaEroare(res, 403);
})

app.get("/*", function(req, res, next){
    res.render("pagini"+req.url, function(err, rezRender){
        if(err){
            if(err.message.includes("Failed to lookup view")){
                randeazaEroare(res, 404);
            }
            else{
                res.render("pagini/eroare_generala");
            }
        }
        else{
            res.send(rezRender);
        }
    });

    res.locals.utilizator=req.session.utilizator;
    next();
});

function creeazaImagini(){
    var buf=fs.readFileSync(__dirname+"/resurse/json/galerie.json").toString("utf8");
    obImagini=JSON.parse(buf);//global
    //console.log(obImagini);

    for (let imag of obImagini.imagini){
        let nume_imag, extensie; 
        [nume_imag, extensie ]=imag.cale_imagine.split(".")// "abc.de".split(".") ---> ["abc","de"]
        
        let dim_mic=250;
        let dim_mediu=300;

        imag.mic=`${obImagini.cale_galerie}/mic/${nume_imag}-${dim_mic}.webp` //nume-150.webp // "a10" b=10 "a"+b `a${b}`
        //console.log(imag.mic);
        imag.mediu = `${obImagini.cale_galerie}/mediu/${nume_imag}-${dim_mediu}.png`;
        imag.mare=`${obImagini.cale_galerie}/${imag.cale_imagine}`;
        
        if (!fs.existsSync(imag.mic))
            sharp(__dirname+"/"+imag.mare).resize(dim_mic).toFile(__dirname+"/"+imag.mic);
       
        if (!fs.existsSync(imag.mediu))
            sharp(__dirname+"/"+imag.mare).resize(dim_mediu).toFile(__dirname+"/"+imag.mediu)
        
    }

}
creeazaImagini();

function creeazaErori(){
    var buf=fs.readFileSync(__dirname+"/resurse/json/erori.json").toString("utf8");
    obErori=JSON.parse(buf);//global
} 
creeazaErori();

function randeazaEroare(res, identificator, titlu, text, imagine){
    var eroare = obErori.erori.find(function(elem){return elem.identificator==identificator});
    titlu = titlu || (eroare && eroare.titlu) || "Titlu eroare custom";
    text = text || (eroare && eroare.text) || "Titlu eroare custom";
    imagine = imagine || (eroare && (obErori.cale_baza+"/"+eroare.imagine)) || "Titlu eroare custom";
    if(eroare && eroare.status) 
        res.status(eroare.identificator);
    res.render("pagini/eroare_generala",{titlu:titlu, text:text, imagine:imagine});

}

var s_port=process.env.PORT || obGlobal.port;
app.listen(s_port); 

//app.listen(8080);
console.log("a pornit")


