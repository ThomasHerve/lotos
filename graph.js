var etat = 0;
var tailleCarre = 2.5

class Renderer{
	constructor(canvas,arbor){
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
        this.particleSystem
	}
  	init(system){
        this.particleSystem = system;
        this.resize()
        this.particleSystem.screenSize(this.canvas.width, this.canvas.height); 
        this.particleSystem.screenPadding(80);
        
        this.initMouseHandling(this.canvas,this.particleSystem,this)
    };


     Norm(xA,yA,xB,yB) {return Math.sqrt(Math.pow(xB-xA,2)+Math.pow(yB-yA,2));}
     Vecteur (ctx,xA,yA,xB,yB,ArrowLength,ArrowWidth) {
     if (ArrowLength === undefined) {ArrowLength=10;}
     if (ArrowWidth === undefined) {ArrowWidth=8;}
     ctx.lineCap="round";
    // Calculs des coordonnées des points C, D et E
     var AB=this.Norm(xA,yA,xB,yB);
     var xC=xB+ArrowLength*(xA-xB)/AB;var yC=yB+ArrowLength*(yA-yB)/AB;
     var xD=xC+ArrowWidth*(-(yB-yA))/AB;var yD=yC+ArrowWidth*((xB-xA))/AB;
     var xE=xC-ArrowWidth*(-(yB-yA))/AB;var yE=yC-ArrowWidth*((xB-xA))/AB;
     // et on trace le segment [AB], et sa flèche:
     ctx.beginPath();
     ctx.moveTo(xA,yA);ctx.lineTo(xB,yB);
     ctx.moveTo(xD,yD);ctx.lineTo(xB,yB);ctx.lineTo(xE,yE);
     ctx.stroke();
    }


  	redraw(){
        this.ctx.fillStyle = "white";
        var w =  document.getElementById('viewport').width/60//Math.max(20, 20+gfx.textWidth(node.name));
        this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height);  
        var pS = this.particleSystem;
        var decale = w * tailleCarre;
        var that = this;
		    this.particleSystem.eachEdge(function(edge, pt1, pt2){
                if( pS.getNode(edge.data.enfant).data.active &&  pS.getNode(edge.data.parent).data.active){
                    this.renderer.ctx.strokeStyle = "black";
                    var dist = w;
                    if(di == 1 || pS.getNode(edge.data.parent).name != nodeSelectionne || pS.getNode(edge.data.parent).data.typeGenerique != "struct" || pS.getNode(edge.data.parent).data.pointeurs.length == 0){
                        this.renderer.ctx.strokeStyle = (edge.data.double) ? "rgba(255,0,0, .333)" : donneCouleur(edge.data.parent)
                        var x1 = pt1.x;
                        var x2 = pt2.x;
                        var y1 = pt1.y;
                        var y2 = pt2.y;
                        if(pS.getNode(edge.data.enfant).name == nodeSelectionne && pS.getNode(edge.data.enfant).data.typeGenerique == "struct" && di == 0){
                            if(x1 < x2 && (x1-x2)*(x1-x2) > (y1-y2)*(y1-y2)){
                                x2 -= decale/2
                            }
                            else if(y1 > y2){
                                y2 += decale/2;
                            }
                            else if(y1 < y2){
                                y2 -= decale/2;
                            }
                            var pointX = x2;
                            var pointY = y2;
                        }
                        else{
                            var d = Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2))
                            var pointX = x2 + ((x1-x2) * dist) /d
                            var pointY = y2 + ((y1-y2) * dist) /d
                        }
                        that.Vecteur(this.renderer.ctx,pt1.x, pt1.y,pointX,pointY)
                    }
                    else{
                        var compte = 0;
                        pS.getNode(edge.data.parent).data.isPointer.forEach(element => {
                            if(element){
                                var x1 = pt1.x + decale * compte;
                                var x2 = pt2.x;
                                var y1 = pt1.y;
                                var y2 = pt2.y;
                                var d = Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2))
                                var pointX = x2 + ((x1-x2) * dist) /d
                                var pointY = y2 + ((y1-y2) * dist) /d
                                var departX = x1
                                var departY = pt1.y

                                if(compte ==0 && departX > pointX){
                                    departX -= decale/2
                                }
                                else if(compte == pS.getNode(edge.data.parent).data.isPointer.length-1 && departX < pointX){
                                    departX += decale/2
                                }
                                else if(departY > pointY){
                                    departY -= decale/2;
                                }
                                else if(departY < pointY){
                                    departY += decale/2;
                                }
                                that.Vecteur(this.renderer.ctx,departX, departY,pointX,pointY)
                            }
                            compte++;
                        });
                       
                    }

                    //TROUVER COORD FLECHE
                    
                }
		    })

		    this.particleSystem.eachNode(function(node, pt){
                if(node.data.active){
                if (node.name != nodeSelectionne || di == 1){
                    this.renderer.ctx.beginPath();
                    this.renderer.ctx.fillStyle = donneCouleur(node.name);
                    this.renderer.ctx.strokeStyle = donneCouleur(node.name);
                    this.renderer.ctx.arc(pt.x,pt.y,w,0,2*Math.PI);
                    this.renderer.ctx.fill();
                    this.renderer.ctx.stroke();
                    CreerText(this.renderer.ctx,pt.x,pt.y,Math.max(w/node.data.nom.length,5),"Arial","black",node.data.nom);   
                }else{
                    if(node.data.typeGenerique == "struct"){
                        this.renderer.ctx.fillStyle = donneCouleur(node.name)
                        this.renderer.ctx.fillRect(listeCarre[0].e4 * 13,0,listeCarre[0].e4 * 2,listeCarre[0].e5 * 15)
                        CreerTexteNonCentre(this.renderer.ctx,listeCarre[0].e4 * 13,listeCarre[0].e5 * 1.2,listeCarre[0].e5/4,"Arial","black",node.name,1,listeCarre[0].e4 * 2); 

                        var pX = pt.x
                        var compt = 0;
                        //console.log(node.data.champs[0])
                        node.data.champs.forEach(element => {
                            CreerRectangle(this.renderer.ctx,pX ,pt.y,w * tailleCarre,w * tailleCarre, donneCouleur(node.name),"black",2); 
                            
                            var text = element.value;
                            if(element.is_pointer)text = element.field_name;
                            CreerText(this.renderer.ctx,pX,pt.y,Math.max(w * tailleCarre/text.length,7),"Arial","black",text); 
                            compt++; 

                            pX += w*tailleCarre
                        });


                        if(false){

                            CreerRectangle(this.renderer.ctx,pt.x ,pt.y,w * tailleCarre,w * tailleCarre, donneCouleur(node.name),"black",2);    
                            var pX = pt.x  + w*tailleCarre
                            var compt = 0;
                            var t = node.name.split("\n")[1].split(":")[1];
                            CreerText(this.renderer.ctx,pt.x,pt.y,Math.max(w * tailleCarre/t.length,7),"Arial","black",t);  
    
                            
                            node.data.pointeurs.forEach(el => {
                                CreerRectangle(this.renderer.ctx,pX,pt.y,w * tailleCarre,w * tailleCarre, donneCouleur(node.name),"black",2);    
                                var text = (node.data.nomsPointeurs[compt][2])?node.data.nomsPointeurs[compt][2]:"null"
                                CreerText(this.renderer.ctx,pX,pt.y,Math.max(w * tailleCarre/text.length,7),"Arial","black",text);  
                                compt++;
                                pX += w*tailleCarre
                            });    
                            
                            
                        }
                    }                              
                    else{
                        this.renderer.ctx.fillStyle = donneCouleur(node.name)
                        this.renderer.ctx.beginPath();
                        this.renderer.ctx.arc(pt.x,pt.y,w,0,2*Math.PI);
                        this.renderer.ctx.fill();
                        this.renderer.ctx.stroke();
                        CreerText(this.renderer.ctx,pt.x,pt.y,Math.max(w/node.data.nom.length,5),"Arial","black",node.data.nom);  
                    }
                }
            }
            })


            var compte = 0;
            listeCarre.forEach(element => {
                if(listeCouleurActive[compte]){
                    CreerRectangleText(element.e1,element.e2,element.e3,element.e4,element.e5,element.e6,element.e7,element.e8)
                }
                else{
                    CreerRectangleText(element.e1,element.e2,element.e3,element.e4,element.e5,"#AAAAAA",element.e7,element.e8)
                }
                compte++;
            });


           var leContexte = this.ctx;
           if(etat == 1){
               var compte = 0;
               var fixe = this.canvas.height/50;
               var coordy = fixe;
               var tailleFont = coordy * 0.8;
               var nbplace = (this.canvas.height/fixe << 0) - 3;//nb de case que l'on peut afficher
               var stateSlider = document.getElementById("sliderTab").value;
               CreerText(leContexte,this.canvas.width * 0.95,coordy,tailleFont,"Arial","black",nodeTab.data.nom);
                nodeTab.data.tableau.forEach(element => {
                    if(compte >= stateSlider * nodeTab.data.tableau.length && compte <= stateSlider * nodeTab.data.tableau.length + nbplace){
                        coordy += fixe;
                        CreerText(leContexte,this.canvas.width * 0.90,coordy,tailleFont,"Arial","black",compte + ":")
                        CreerText(leContexte,this.canvas.width * 0.95,coordy,tailleFont,"Arial","black",element)
                    }compte++;
                });
           }
		
    };
    resize(){
        sys.screen({size:{width:canvas.width, height:canvas.height}})
        this.redraw()
    };
	initMouseHandling(canvas,particleSystem,that){
        var dragged = null;
        var _mouseP = null;
        var selected = null;
        var nearest = null;
        var handler = {
          clicked:function(e){
             _mouseP = arbor.Point(e.pageX, e.pageY)
            //PARTIE BOUTON
            if(e.pageX < (listeCarre.length) * canvas.width/15 && e.pageY <  canvas.height/15){
                var selec = e.pageX/(canvas.width/15)<<0;
                listeCouleurActive[selec] = !listeCouleurActive[selec];
                particleSystem.eachNode(function(node, pt){
                    if(listeCouleurAssocier[selec] == donneCouleur(node.name)){
                        node.data.active = !node.data.active;
                        
                    }
                })
                that.redraw()
            }
            else{
             //PARTIE NODES
            nearest = sys.nearest(_mouseP);
            if (!nearest.node) return false
            selected = (nearest.distance < 200) ? nearest : null
            dragged = selected;

            if (dragged && dragged.node !== null && dragged.node.data.active){
              dragged.node.fixed = true;
              nodeSelectionne = dragged.node.name;
              if(di == 0 && etat == 1 && dragged.node.data.typeGenerique != "array")versTableau();
              if(dragged.node.data.tableau != undefined){
                  nodeTab = dragged.node;
                  if(di == 0){
                      versTableau();
                  }
              }
            }
			canvas.addEventListener("mousemove", handler.dragged); 
            document.defaultView.addEventListener("mouseup", handler.dropped); 
            return false
            }
          },
          dragged:function(e){
            var s = arbor.Point(e.pageX, e.pageY)
            if (dragged && dragged.node !== null && di == 1 && dragged.node.data.active){
              var p = particleSystem.fromScreen(s)
              dragged.node.p = p
            }
            return false
          },
          dropped:function(e){
            if (dragged===null || dragged.node===undefined) return
            if (dragged.node !== null) dragged.node.fixed = false
            dragged.node.tempMass = 1000
            dragged = null
			canvas.addEventListener("mousemove", handler.dragged); 
            document.defaultView.addEventListener("mouseup", handler.dropped); 
            _mouseP = null
            nodeSelectionne = null;
            return false
          }
        }
        
		// start listening
		canvas.addEventListener("mousedown", handler.clicked); 
      }
}


////////////////////INIT/////////////////////////////


var canvas = document.getElementById('viewport')//on recupere le canvas
var ctx = document.getElementById('viewport').getContext('2d');//son contexte (permet de dessiner)
var nodeSelectionne = null;//variable global contenant la node actuellement cliqué
var nodeTab = null;
var sys = arbor.ParticleSystem(100, 500, 0.8);//on declare un particleSysteme qui permet le temps reel
sys.parameters({gravity:true})//on ajoute la gravité
sys.renderer = new Renderer(document.getElementById('viewport'),arbor);//on créé le renderer du particleSysteme
var listeCouleur = [];//chaque structure
var listeCouleurAssocier  = [];//generer aleatoirement
var listeCouleurActive = []; //permet de savoit si tel ou tel couleur est active



///////FONCTIONS ARBOR//////////////

function donneCouleur(nom){
	var valeur = nom.split("\n")[0] 
	for(let i = 0; i < listeCouleur.length;i++){
		if(listeCouleur[i] == valeur)return listeCouleurAssocier[i];
	}
	return "black";
}


/////////////////////////////TRAITEMENT/////////////////////////

class noeud{
    constructor(adresse,type,contenu,symbol_name,tableau,typeGenerique,champs){
        //this.marque = false;
        //this.pose = false;
        //this.numCycle = [];
        this.parents = []
        this.nbParents = 0;
        this.enfants = []
        this.nbEnfants = 0;
        this.adresse = adresse;
        this.type = type;
        this.contenu = contenu;
        this.symbol_name = symbol_name;
        this.tableau = tableau;7
        this.typeGenerique = typeGenerique;
        this.nomsPointeurs = []
        this.champs = champs
    }
    addEnfant(nouveauNoeud,nomP){
        this.enfants.push(nouveauNoeud);
        this.nbEnfants++;
        this.nomsPointeurs.push(nomP);
    }
    addParent(nouveauNoeud){
        this.parents.push(nouveauNoeud);
        this.nbParents++;
    }
}

class carre{
	constructor(e1,e2,e3,e4,e5,e6,e7,e8){
		this.e1 = e1;
		this.e2 = e2;
		this.e3 = e3;
		this.e4 = e4;
		this.e5 = e5;
		this.e6 = e6;
		this.e7 = e7;
		this.e8 = e8;
	}
}
listeCarre = [];



function reload(){
    clear();
	ouvrirJSON(sys);
}

function ouvrirJSON(sys){
    var data = {
        "nodes": [
            {
                "base": {
                    "address": "0x5555557566b0",
                    "symbol_name": null,
                    "type": "struct salarie",
                    "raw_type": "struct salarie",
                    "size": 56
                },
                "type": "struct",
                "fields": [
                    {
                        "field_name": "prenom",
                        "bitpos": 0,
                        "type": "char [16]",
                        "size": 16,
                        "value": "John"
                    },
                    {
                        "field_name": "nom",
                        "bitpos": 128,
                        "type": "char [32]",
                        "size": 32,
                        "value": "Doe"
                    },
                    {
                        "field_name": "age",
                        "bitpos": 384,
                        "type": "uint8_t",
                        "size": 1,
                        "value": "(uint8_t) 0x5555557566e0: 34 '\"'"
                    },
                    {
                        "field_name": "anciennete",
                        "bitpos": 392,
                        "type": "uint8_t",
                        "size": 1,
                        "value": "(uint8_t) 0x5555557566e1: 10 '\\n'"
                    },
                    {
                        "field_name": "salaire",
                        "bitpos": 416,
                        "type": "uint32_t",
                        "size": 4,
                        "value": "(uint32_t) 0x5555557566e4: 2500"
                    },
                    {
                        "field_name": "pointeur",
                        "bitpos": 500,
                        "type": "struct salarie **",
                        "size": 4,
                        "value": "(uint32_t) 0x5555557566e4: 2500",
                        "is_pointer" : true
                    }
                ]
            },
            {
                "base": {
                    "address": "0x7fffffffdc78",
                    "symbol_name": "s1",
                    "type": "struct salarie *",
                    "raw_type": "struct salarie *",
                    "size": 8
                },
                "type": "pointer",
                "target": "0x0",
                "target_type": "struct salarie"
            },
            {
                "base": {
                    "address": "0x7fffffffdc80",
                    "symbol_name": "s2",
                    "type": "struct salarie *",
                    "raw_type": "struct salarie *",
                    "size": 8
                },
                "type": "pointer",
                "target": "0x5555557566b0",
                "target_type": "struct salarie"
            },
            {
                "base": {
                    "address": "0x7fffffffdca8",
                    "symbol_name": "tab",
                    "type": "uint32_t *",
                    "raw_type": "uint32_t *",
                    "size": 8
                },
                "type": "array",
                "dynamic": true,
                "element_type": "uint32_t",
                "element_size": 4,
                "n_elements": 100,
                "elements": [
                    "210",
                    "280",
                    "315",
                    "266",
                    "181",
                    "9",
                    "487",
                    "486",
                    "6",
                    "276",
                    "16",
                    "39",
                    "196",
                    "60",
                    "348",
                    "14",
                    "254",
                    "182",
                    "211",
                    "376",
                    "323",
                    "40",
                    "318",
                    "326",
                    "80",
                    "328",
                    "42",
                    "67",
                    "192",
                    "55",
                    "92",
                    "474",
                    "371",
                    "151",
                    "258",
                    "464",
                    "11",
                    "103",
                    "412",
                    "449",
                    "345",
                    "129",
                    "76",
                    "180",
                    "248",
                    "13",
                    "421",
                    "158",
                    "69",
                    "300",
                    "430",
                    "297",
                    "355",
                    "224",
                    "59",
                    "51",
                    "397",
                    "82",
                    "288",
                    "136",
                    "252",
                    "246",
                    "154",
                    "269",
                    "99",
                    "109",
                    "285",
                    "289",
                    "160",
                    "137",
                    "49",
                    "384",
                    "226",
                    "502",
                    "334",
                    "286",
                    "453",
                    "234",
                    "410",
                    "418",
                    "374",
                    "330",
                    "0",
                    "227",
                    "314",
                    "459",
                    "35",
                    "477",
                    "142",
                    "402",
                    "292",
                    "463",
                    "385",
                    "389",
                    "339",
                    "408",
                    "167",
                    "168",
                    "209",
                    "455",
                    "157"
                ],
                "starting_address": "0x555555756260"
            }
        ],
        "edges": [
            [
                "0x5555557566b0",
                "0x7fffffffdc78",
                "pointeur"
            ],
            [
                "0x7fffffffdc80",
                "0x5555557566b0",
                null
            ]
        ]
    };
	retour = creerNoeud(data);  
	creerNode(sys,retour) 
}





/**
 * Creer une structure de type "noeud" a partir d'un JSON
 * @param {object} data l'objet obtenu à partir du JSON
 */
function creerNoeud(data){
    //tout d'abord, créér une liste de chaque noeud pour setup les info de bases
    var listeNoeud = [];
    data.nodes.forEach(element => {
        var contenu = "";
        if(element.type == 'struct'){
        element.fields.forEach(e => {
            contenu+= e.field_name + " : " + e.value + "\n";
        });
		}
		else if(element.type == 'pointer'){
            contenu = element.base.symbol_name + "\nadresse: " + element.base.address + "\ntarget: " + element.target + "\ntarget type: " + element.target_type;
        }
        else if(element.type == 'array'){
            contenu = element.base.symbol_name + "\ntype: "+element.element_type+"\nnombre elements: "+element.n_elements
        }
        else{
            contenu = element.base.symbol_name + "\ntype: "+element.base.raw_type+"\nvaleur: "+element.value;
        }
        var type = element.base.type
        listeNoeud.push(new noeud(element.base.address,type,contenu,element.base.symbol_name,element.elements,element.type,element.fields))
    });

    //la liste est créé, il va falloir maintenant creer les structures
    data.edges.forEach(element => {
        //pour chaque arrete
        if(element[1]){
            var noeud1,noeud2;
            listeNoeud.forEach(n => {
                if(n.adresse == element[0])noeud1 = n;
                else if(n.adresse == element[1])noeud2 = n;
            });

            noeud1.addEnfant(noeud2,element);
            noeud2.addParent(noeud1);
            
        }

    });
    return listeNoeud;
}


var listeCol = ["red","cyan","green","yellow","pink","light blue"]
function couleurRandom(){
    if(listeCol.length>0){
        return listeCol.shift();
    }
    return '#'+(randomFixe(0.3)*0xFFFFFF<<0).toString(16);
}

function creerNode(sys,liste){
    //les couleurs
    var posX = canvas.width/30;
    //Chaque couleur est generer si le type n'a pas de couleur assigné
	liste.forEach(element => {
		if(!appartientListe(element.type,listeCouleur)){
			listeCouleur.push(element.type);
			var couleur = couleurRandom();
			listeCouleurAssocier.push(couleur);	
        }
		element.contenu = element.type + "\n" + element.contenu;
    });
    //on créé les legendes à partir de la liste de couleur 
	for(let i = 0; i < listeCouleur.length;i++){
        listeCarre.push(new carre(ctx,posX,canvas.height/30,canvas.width/15,canvas.height/15,listeCouleurAssocier[i],listeCouleur[i],"Arial"));
        listeCouleurActive.push(true);
		posX+=canvas.width/15;
    }
   

    //on connait chaque noeud et ses parents/enfants, on peut donc créé les liens
    var symb;
    liste.forEach(element => {
        if(element.symbol_name != null)symb =  element.symbol_name;
        else {
            symb =  element.adresse;
        }    
       
        var isPointer = []
        if(element.champs){
        element.champs.forEach(e => {
            if(e.is_pointer){
                isPointer.push(true);
            }
            else isPointer.push(false);
        });
        }
        sys.addNode(element.contenu,{shape:'dot',nom:symb,tableau:element.tableau,active:true,typeGenerique:element.typeGenerique,pointeurs:element.enfants,nomsPointeurs:element.nomsPointeurs,champs:element.champs,isPointer:isPointer});
    });

	liste.forEach(element => {
		element.enfants.forEach(enfant => {
            //Creation des nodes
            let double = false;
            enfant.enfants.forEach(parent => {
                if(parent == element){
                    double = true;
                }
            });
			sys.addEdge(element.contenu,enfant.contenu,{double:double,parent:element.contenu,enfant:enfant.contenu});
		});
    });
}

function randomFixe(a){
    let retour = Math.random();
    while(retour < a)retour = Math.random();
    return retour;
}

function appartientListe(element,liste){
	retour = false;
	liste.forEach(e => {
		if(e == element)retour = true;
	});
	return retour;
}

/**
 * Creer un rectangle 
 * @param {any} ctx le contexte
 * @param {int} coordX coordonné X
 * @param {int} coordY coordonné Y
 * @param {int} TailleX taille en X
 * @param {int} TailleY taille en Y
 * @param {any} couleur la couleur format "#000000"
 */
function CreerRectangle(ctx,coordX,coordY,TailleX,TailleY,couleur,bordure,tailleBordure){
    if(bordure){
        ctx.beginPath();
        ctx.strokeStyle=bordure;   
        ctx.lineWidth=(tailleBordure != undefined)?tailleBordure:1;    
        ctx.fillStyle = couleur; 
        ctx.rect(coordX-TailleX/2,coordY-TailleY/2,TailleX,TailleY);//on centre le rectangle 
        ctx.fill();
        ctx.stroke();
    }  
    else{
        ctx.fillStyle = couleur; 
        ctx.fillRect(coordX-TailleX/2,coordY-TailleY/2,TailleX,TailleY);//on centre le rectangle 
    }
}

/**
 * Creer un texte
 * @param {any} ctx le contexte
 * @param {int} coordX coordonné X
 * @param {int} coordY coordonné Y
 * @param {int} Taille taille en pixels
 * @param {string} police la police (ex : Arial)
 * @param {any} couleur la couleur format "#000000"
 * @param {texte} texte le texte à ecrire
 */
function CreerText(ctx,coordX,coordY,Taille,police,couleur,texte,saut){
    ctx.textAlign = "center";
    ctx.textBaseline="middle";
    ctx.font = Taille + "px " + police;
    ctx.fillStyle = couleur; 
    if(saut == undefined)saut = 0;
    var compte = 0;
    var num = texte.split("\n").length - saut
    if( num > 1){
        coordY -= Taille * (texte.split("\n").length/2) 
        if(num == 0)coordY += Taille/2;
    }
    texte.split("\n").forEach(element => {
        if(compte >= saut){
        ctx.fillText(element,coordX,coordY); 
        coordY+=Taille;
        }compte++;
    });
}

function CreerTexteNonCentre(ctx,coordX,coordY,Taille,police,couleur,texte,saut,tailleMax){
    if(!tailleMax)tailleMax = 10000;
    else tailleMax *= 2;
    ctx.textAlign = "left";
    ctx.textBaseline="middle";
    ctx.font = Taille + "px " + police;
    ctx.fillStyle = couleur; 
    if(saut == undefined)saut = 0;
    var compte = 0;
    var num = texte.split("\n").length - saut
    if( num > 1){
        coordY -= Taille * (texte.split("\n").length/2) 
        if(num == 0)coordY += Taille/2;
    }
    texte.split("\n").forEach(element => {
        if(compte >= saut){
        var val = "";
        if(element.length > tailleMax/Taille){
           for(let i = 0;i < element.length;i++){
                if(val.length<tailleMax/Taille)val+=element[i];
                else{
                    ctx.fillText(val,coordX,coordY); 
                    coordY+=Taille;
                    val = "";
                }
           }
           ctx.fillText(val,coordX,coordY); 
            coordY+=Taille;
        }
        else{
            ctx.fillText(element,coordX,coordY); 
            coordY+=Taille;
        }
        }compte++;
    });
}

/**
 * Creer un rectangle avec du texte
 * @param {any} ctx le contexte
 * @param {int} coordX coordonné X
 * @param {int} coordY coordonné Y
 * @param {int} TailleX taille en X
 * @param {int} TailleY taille en Y
 * @param {any} couleur la couleur format "#000000", ne peut etre noir
 * @param {any} texte le texte
 * @param {string} police la police (ex : Arial)
 */
function CreerRectangleText(ctx,coordX,coordY,TailleX,TailleY,couleur,texte,police){
    if(couleur == "#000000")console.error("un carre textuel ne peut etre noir");
    CreerRectangle(ctx,coordX,coordY,TailleX,TailleY,couleur);
    var tailleMax = TailleX - 2;
    var tailleText = TailleY/(texte.length/3);
    if(tailleMax < tailleText)tailleText = tailleMax;
    CreerText(ctx,coordX,coordY + tailleText/2 ,tailleText,police,"#000000",texte);
}

function clear(){
	sys.renderer.particleSystem.eachNode(function(node, pt){
		sys.pruneNode(node);
	})
	listeCarre = [];
}

//BOUTONS
document.getElementById("viewport").width =  0.98 * screen.width;
document.getElementById("viewport").height = 0.8 * screen.height;
document.getElementById("clickMe").onclick = depInfo;
var di = 0;
document.getElementById("versTableau").onclick = versTableau;
document.getElementById("sliderTab").oninput = refresh;

///POSITIONNEMENT SLIDER
document.getElementById("sliderTab").style.width = 0.8 * screen.height;
document.getElementById("sliderTab").value = 0;

document.getElementById("sliderTab").style.top ="10px" 
document.getElementById("sliderTab").style.left = document.getElementById("viewport").width*0.8  + "px" 
document.getElementById("sliderTab").style.visibility = "hidden"


//TIMELINE
document.getElementById("TimeLine").value = 0;
document.getElementById("TimeLine").style.width = document.getElementById("viewport").width * 0.99;

function versTableau(){
    if(nodeTab == null)return;
    if(etat != 1){
        etat = 1;
        document.getElementById("sliderTab").style.visibility = "visible"
    }
    else {
        etat = 0;
        document.getElementById("sliderTab").style.visibility = "hidden"
    }
    refresh();
}

function refresh(){
    sys.renderer.redraw();
}

function depInfo(){
    if(di == 0){
        di = 1;
        document.getElementById("clickMe").value = "Info"
    }
    else {di = 0; document.getElementById("clickMe").value = "Deplacement"}
}

//LANCEMENT
ouvrirJSON(sys);
