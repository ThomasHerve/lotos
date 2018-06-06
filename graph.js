var etat = 0;
var tailleCarre = 2.5
var compteIter = -1;
var position = 0;
var tailleProgramme = undefined;
var bloc = false;


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
    VecteurCourbe(ctx,xA,yA,xB,yB,ArrowLength,ArrowWidth) {
        if (ArrowLength === undefined) {ArrowLength=10;}
        if (ArrowWidth === undefined) {ArrowWidth=8;}
        ctx.lineCap="round";
        var coeff = 1
        if(xA < xB)coeff = -1
        var cp1x = Math.abs(xA + xB) / 2;
        var cp1y = Math.abs(yA + yB) / 2;
        cp1x += Math.abs(yA - yB)/2 * coeff;
        cp1y += Math.abs(xA - xB)/2 * -coeff;
        console.log(cp1x)
        // Calculs des coordonnées des points C, D et E
         var AB=this.Norm(cp1x,cp1y,xB,yB);
         var xC=xB+ArrowLength*(cp1x-xB)/AB;
         var yC=yB+ArrowLength*(cp1y-yB)/AB;
         var xD=xC+ArrowWidth*(-(yB-cp1y))/AB;
         var yD=yC+ArrowWidth*((xB-cp1x))/AB;
         var xE=xC-ArrowWidth*(-(yB-cp1y))/AB;
         var yE=yC-ArrowWidth*((xB-cp1x))/AB;
         // et on trace le segment [AB], et sa flèche:
         ctx.beginPath();
         ctx.moveTo(xA,yA);
         //ctx.lineTo(xB,yB);
         ctx.quadraticCurveTo(cp1x, cp1y, xB, yB)
         ctx.moveTo(xD,yD);
         ctx.lineTo(xB,yB);
         ctx.lineTo(xE,yE);
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
                    if(di == 1 || pS.getNode(edge.data.parent).name != nodeSelectionne || pS.getNode(edge.data.parent).data.typeGenerique != "struct"){
                        if(pS.getNode(edge.data.parent) == pS.getNode(edge.data.enfant)){//on pointe sur sois meme
                            this.renderer.ctx.strokeStyle = donneCouleur(edge.data.parent)
                            this.renderer.ctx.beginPath();
                            this.renderer.ctx.arc(pt1.x - dist, pt1.y + dist, dist, 0, Math.PI * 1.5, false); 
                            this.renderer.ctx.stroke();
                            that.Vecteur(this.renderer.ctx,pt1.x - dist/2 - 11,pt1.y,pt1.x - dist/2 - 10,pt1.y)
                        }
                        else{
                        this.renderer.ctx.strokeStyle = donneCouleur(edge.data.parent)
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
                    }
                    else{      
                        var x1 = pt1.x + decale * edge.data.compte_field;
                        var x2 = pt2.x;
                        var y1 = pt1.y;
                        var y2 = pt2.y;
                        var d = Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2))
                        var pointX = x2 + ((x1-x2) * dist) /d
                        var pointY = y2 + ((y1-y2) * dist) /d
                        var departX = x1
                        var departY = pt1.y

                        if(edge.data.compte_field ==0 && departX > pointX){
                            departX -= decale/2
                        }
                        else if(edge.data.compte_field == edge.data.max_field && departX < pointX){
                            departX += decale/2
                        }
                        else if(departY > pointY){
                            departY -= decale/2;
                        }
                        else if(departY < pointY){
                            departY += decale/2;
                        }
                        if(pS.getNode(edge.data.parent) == pS.getNode(edge.data.enfant)){
                            that.VecteurCourbe(this.renderer.ctx,x1, y1 - decale/2,x2,y2 - decale/2)
                        }
                        else{
                            that.Vecteur(this.renderer.ctx,departX, departY,pointX,pointY)
                            }
                        }                   
                }
		    })

		    this.particleSystem.eachNode(function(node, pt){
                if(node.data.active){
                if (node.name != nodeSelectionne || di == 1){
                    this.renderer.ctx.beginPath();
                    this.renderer.ctx.fillStyle = donneCouleur(node.name);
                    this.renderer.ctx.arc(pt.x,pt.y,w,0,2*Math.PI);
                    this.renderer.ctx.fill();
                    CreerText(this.renderer.ctx,pt.x,pt.y,Math.max(w * 1.5/node.data.nom.length,8),"Arial","black",node.data.nom);   
                }else{
                    if(node.data.typeGenerique == "scalar"){
                        CreerRectangle(this.renderer.ctx,pt.x ,pt.y,w * tailleCarre,w * tailleCarre, donneCouleur(node.name),"black",2); 
                        var text = node.data.valeurScalaire;
                        CreerText(this.renderer.ctx,pt.x,pt.y,Math.max(w * tailleCarre/text.length,7),"Arial","black",text,0,w * tailleCarre);
                    }
                    else if(node.data.typeGenerique == "struct"){
                        this.renderer.ctx.fillStyle = donneCouleur(node.name)
                        var pX = pt.x
                        node.data.champs.forEach(element => {
                            CreerRectangle(this.renderer.ctx,pX ,pt.y,w * tailleCarre,w * tailleCarre, donneCouleur(node.name),"black",2); 
                            
                            var text = element.value;
                            var textname = element.field_name;
                            if(element.is_pointer)text = element.field_name;
                            //le nom du champs
                            else{
                                CreerTexteNonCentre(this.renderer.ctx,pX - (w * tailleCarre/2) * 0.9,pt.y - (w * tailleCarre/2)*0.8,Math.max(w * tailleCarre/textname.length,8),"Arial","black",textname,0,w * tailleCarre); 
                            }
                            //le champs
                            var letext = w * tailleCarre/text.length;
                            if(text.length == 1)letext *= 0.8
                            CreerText(this.renderer.ctx,pX,pt.y,Math.max(letext,7),"Arial","black",text,0,w * tailleCarre); 
                            pX += w*tailleCarre
                        });
                    }                              
                    else{
                        this.renderer.ctx.fillStyle = donneCouleur(node.name)
                        this.renderer.ctx.beginPath();
                        this.renderer.ctx.arc(pt.x,pt.y,w,0,2*Math.PI);
                        this.renderer.ctx.fill();
                        CreerText(this.renderer.ctx,pt.x,pt.y,Math.max(w * 1.5/node.data.nom.length,8),"Arial","black",node.data.nom);  
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
    constructor(adresse,type,contenu,symbol_name,tableau,typeGenerique,champs,valeurScalaire){
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
        this.valeurScalaire = valeurScalaire;
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
	ouvrirJSON(sys,lastMessage);
}

function ouvrirJSON(sys,message){
    sys.eachEdge(function(edge, pt1, pt2){
        sys.pruneEdge(edge);
    })
    sys.eachNode(function(node, pt){
        sys.pruneNode(node);
    })
    listeCouleur = [];//chaque structure
    listeCouleurAssocier  = [];//generer aleatoirement
    listeCol = ["#d73027","#f46d43","#fdae61","#fee08b","#d9ef8b","#a6d96a","#66bd63","1a9850"]
    //var data = JSON.parse(message);
    var data = {
        "nodes": [
            {
                "base": {
                    "address": "0x555555756260",
                    "symbol_name": null,
                    "type": "struct A",
                    "raw_type": "struct A",
                    "size": 16
                },
                "type": "struct",
                "fields": [
                    {
                        "field_name": "test",
                        "bitpos": 0,
                        "type": "int",
                        "size": 8,
                        "value": "88",
                        "is_pointer": false
                    },
                    {
                        "field_name": "B",
                        "bitpos": 0,
                        "type": "char *",
                        "size": 8,
                        "value": "0x7fffffffe125",
                        "is_pointer": true
                    },
                    {
                        "field_name": "next",
                        "bitpos": 64,
                        "type": "struct A *",
                        "size": 8,
                        "value": "0x555555756280",
                        "is_pointer": true
                    }
                ]
            },
            {
                "base": {
                    "address": "0x5555557562c0",
                    "symbol_name": null,
                    "type": "struct A",
                    "raw_type": "struct A",
                    "size": 16
                },
                "type": "struct",
                "fields": [
                    {
                        "field_name": "B",
                        "bitpos": 0,
                        "type": "char *",
                        "size": 8,
                        "value": "0x7fffffffe14f",
                        "is_pointer": true
                    },
                    {
                        "field_name": "next",
                        "bitpos": 64,
                        "type": "struct A *",
                        "size": 8,
                        "value": "0x0",
                        "is_pointer": true
                    }
                ]
            },
            {
                "base": {
                    "address": "0x7fffffffdc30",
                    "symbol_name": "argv",
                    "type": "char **",
                    "raw_type": "char **",
                    "size": 8
                },
                "type": "pointer",
                "target": "0x7fffffffdd48",
                "target_type": "char *"
            },
            {
                "base": {
                    "address": "0x7fffffffdc3c",
                    "symbol_name": "argc",
                    "type": "int",
                    "raw_type": "int",
                    "size": 4
                },
                "type": "scalar",
                "value": "4"
            },
            {
                "base": {
                    "address": "0x7fffffffdc50",
                    "symbol_name": "T1",
                    "type": "struct A *",
                    "raw_type": "struct A *",
                    "size": 8
                },
                "type": "pointer",
                "target": "0x555555756260",
                "target_type": "struct A"
            },
            {
                "base": {
                    "address": "0x7fffffffdc58",
                    "symbol_name": "T2",
                    "type": "struct A *",
                    "raw_type": "struct A *",
                    "size": 8
                },
                "type": "pointer",
                "target": "0x5555557562c0",
                "target_type": "struct A"
            },
            {
                "base": {
                    "address": "0x7fffffffdd48",
                    "symbol_name": null,
                    "type": "char *",
                    "raw_type": "char *",
                    "size": 8
                },
                "type": "pointer",
                "target": "0x7fffffffe125",
                "target_type": "char"
            },
            {
                "base": {
                    "address": "0x7fffffffe125",
                    "symbol_name": null,
                    "type": "char",
                    "raw_type": "char",
                    "size": 1
                },
                "type": "scalar",
                "value": "47 '/'"
            },
            {
                "base": {
                    "address": "0x7fffffffe14f",
                    "symbol_name": null,
                    "type": "char",
                    "raw_type": "char",
                    "size": 1
                },
                "type": "scalar",
                "value": "50 '2'"
            }
        ],
        "edges": [
            [
                "0x555555756260",
                "0x7fffffffe125",
                "B"
            ],
            [
                "0x5555557562c0",
                "0x7fffffffe14f",
                "B"
            ],
            [
                "0x5555557562c0",
                null,
                "next"
            ],
            [
                "0x7fffffffdc30",
                "0x7fffffffdd48",
                null
            ],
            [
                "0x7fffffffdc50",
                "0x555555756260",
                null
            ],
            [
                "0x7fffffffdc58",
                "0x5555557562c0",
                null
            ],
            [
                "0x7fffffffdd48",
                "0x7fffffffe125",
                null
            ]
        ],
        "stack": [
            {
                "name": "main",
                "variables": [
                    {
                        "name": "T2",
                        "address": "0x7fffffffdc58"
                    },
                    {
                        "name": "T1",
                        "address": "0x7fffffffdc50"
                    },
                    {
                        "name": "argc",
                        "address": "0x7fffffffdc3c"
                    },
                    {
                        "name": "argv",
                        "address": "0x7fffffffdc30"
                    }
                ]
            }
        ]
    }
    
    
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
        listeNoeud.push(new noeud(element.base.address,type,contenu,element.base.symbol_name,element.elements,element.type,element.fields,element.value))
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

            if(!noeud2)noeud2 = noeud1
            if(!noeud1)noeud1 = noeud2
            noeud1.addEnfant(noeud2,element);
            noeud2.addParent(noeud1);
            
        }

    });
    return listeNoeud;
}


var listeCol = ["#d73027","#f46d43","#fdae61","#fee08b","#d9ef8b","#a6d96a","#66bd63","1a9850"]
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
        sys.addNode(element.contenu,{nom:symb,tableau:element.tableau,active:true,typeGenerique:element.typeGenerique,pointeurs:[],nomsPointeurs:element.nomsPointeurs,champs:element.champs,valeurScalaire:element.valeurScalaire});
    });

	liste.forEach(element => {
		element.enfants.forEach(enfant => {
            var pos = 0;
            var maxfield = 0;
            if(element.champs != undefined){
                for(let i = 0; i<element.champs.length;i++){
                    if(element.champs[i].is_pointer && element.champs[i].value == enfant.adresse)pos = i;
                }
                maxfield = element.champs.length-1;
                
            }
            sys.addEdge(element.contenu,enfant.contenu,{parent:element.contenu,enfant:enfant.contenu,compte_field:pos,max_field:maxfield});
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
function CreerText(ctx,coordX,coordY,Taille,police,couleur,texte,saut,tailleMax){
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
   
    if(tailleMax != undefined && tailleMax > 0){
        var nbSaut = 0; 
        texte.split("\n").forEach(element => {
            if(element.length > tailleMax/Taille){
                nbSaut+=(element.length/(tailleMax/Taille) << 0)
            }
        });

        if(nbSaut%2 == 1 && nbSaut != 0)coordY-= (nbSaut/2 << 0) * Taille
        else if(nbSaut != 0)coordY-= coordY-= ((nbSaut/2 << 0) + 0.5) * Taille
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
    CreerText(ctx,coordX,coordY,tailleText,police,"#000000",texte);
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
document.getElementById("dunno").onclick = reload;

///POSITIONNEMENT SLIDER
document.getElementById("sliderTab").style.width = 0.8 * screen.height;
document.getElementById("sliderTab").value = 0;

document.getElementById("sliderTab").style.top ="10px" 
document.getElementById("sliderTab").style.left = document.getElementById("viewport").width*0.8  + "px" 
document.getElementById("sliderTab").style.visibility = "hidden"

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

//TIMELINE

document.getElementById("TimeLine").value = 0;
document.getElementById("TimeLine").style.width = document.getElementById("viewport").width * 0.99;
document.getElementById("TimeLine").oninput = timeLine

document.getElementById("plus1").onclick = plus1;
document.getElementById("plus5").onclick = plus5;
document.getElementById("plus10").onclick = plus10;
document.getElementById("moins1").onclick = moins1;


function plus1(){
    if(position == 0)return;
    if(bloc)return;
    document.getElementById("moins1").style.backgroundColor = "red"
    if(position<listeJSON.length){
        position++;
        ouvrirJSON(sys,listeJSON[position-1]);
        if(tailleProgramme && position+10>=tailleProgramme){
            document.getElementById("plus10").style.backgroundColor = "#AAAAAA";
        }
        if(tailleProgramme && position+5>=tailleProgramme){
            document.getElementById("plus5").style.backgroundColor = "#AAAAAA";
        }
        if(tailleProgramme && position==tailleProgramme){
            document.getElementById("plus1").style.backgroundColor = "#AAAAAA";
        }
    }
    else if(fin){
        return;
    }else{
        compteIter = 1;
        bloc = true;
        connection.send("n");
        connection.send("print_memory -j");
        sys.renderer.redraw()
    }
    document.getElementById("pas").innerHTML = "Pas actuel : " + position;
    document.getElementById("TimeLine").value = (position)/listeJSON.length * document.getElementById("TimeLine").max;
}

function plus5(){
    plus(5)
}

function plus10(){
    plus(10)
}

function plus(nb){
    if(position == 0)return;
    if(bloc)return;
    if(tailleProgramme && position+nb<=tailleProgramme){
        position+=nb;
        ouvrirJSON(sys,listeJSON[position-1]);
        if(tailleProgramme && position+10>=tailleProgramme){
            document.getElementById("plus10").style.backgroundColor = "#AAAAAA";
        }
        if(tailleProgramme && position+5>=tailleProgramme){
            document.getElementById("plus5").style.backgroundColor = "#AAAAAA";
        }
        if(tailleProgramme && position==tailleProgramme){
            document.getElementById("plus1").style.backgroundColor = "#AAAAAA";
        }
        document.getElementById("moins1").style.backgroundColor = "red"
        document.getElementById("pas").innerHTML = "Pas actuel : " + position;
        document.getElementById("TimeLine").value = (position)/listeJSON.length * document.getElementById("TimeLine").max;
    }
    else if(fin)return;
    else{
        document.getElementById("moins1").style.backgroundColor = "red"
        if(position+nb>=listeJSON.length && position<listeJSON.length){
            nb -= (position+nb - listeJSON.length);
        }
        compteIter = nb;
        var dep = 0;
        bloc = true;
        for(let i = dep;i < nb;i++){
            connection.send("n");
            connection.send("print_memory -j");
        }
        sys.renderer.redraw()
    }
}

function moins1(){
    if(position == 0)return;
    if(bloc)return;
    if(position>1){
        position--;
        ouvrirJSON(sys,listeJSON[position-1]);
        sys.renderer.redraw()
        if(position == 1)document.getElementById("moins1").style.backgroundColor = "#AAAAAA";
    }
    if(tailleProgramme && position+10<tailleProgramme){
        document.getElementById("plus10").style.backgroundColor = "#4CAF50";
    }
    if(tailleProgramme && position+5<tailleProgramme){
        document.getElementById("plus5").style.backgroundColor = "#4CAF50";
    }
    document.getElementById("plus1").style.backgroundColor = "#4CAF50";
    document.getElementById("pas").innerHTML = "Pas actuel : " + position;
    document.getElementById("TimeLine").value = (position)/listeJSON.length * document.getElementById("TimeLine").max;
}


function timeLine(){
    if(position != Math.round(document.getElementById("TimeLine").value) &&  Math.round(document.getElementById("TimeLine").value)!=0){
        position = Math.round(document.getElementById("TimeLine").value);
        ouvrirJSON(sys,listeJSON[position-1]);
        if(tailleProgramme && position+10>=tailleProgramme){
            document.getElementById("plus10").style.backgroundColor = "#AAAAAA";
        }
        else{
            document.getElementById("plus10").style.backgroundColor = "#4CAF50";
        }
        if(tailleProgramme && position+5>=tailleProgramme){
            document.getElementById("plus5").style.backgroundColor = "#AAAAAA";
        }
        else{
            document.getElementById("plus5").style.backgroundColor = "#4CAF50";
        }
        if(tailleProgramme && position==tailleProgramme){
            document.getElementById("plus1").style.backgroundColor = "#AAAAAA";
        }
        else{
            document.getElementById("plus1").style.backgroundColor = "#4CAF50";
        }
        if(position > 1){
            document.getElementById("moins1").style.backgroundColor = "red"
        }
        else{
            document.getElementById("moins1").style.backgroundColor = "#AAAAAA"
        }
        document.getElementById("pas").innerHTML = "Pas actuel : " + position;
        document.getElementById("TimeLine").value = (position)/listeJSON.length * document.getElementById("TimeLine").max;
    }
}
