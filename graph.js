var canvas = document.getElementById('viewport')
var ctx = document.getElementById('viewport').getContext('2d');
class Renderer{
	constructor(canvas){
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this.particleSystem
	}
  	init(system){
		this.particleSystem = system;
        this.particleSystem.screenSize(this.canvas.width, this.canvas.height); 
		this.particleSystem.screenPadding(80);
		this.initMouseHandling(this.canvas,this.particleSystem)

	};
  	redraw(){
		this.ctx.fillStyle = "white";
		this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height);
		this.particleSystem.eachEdge(function(edge, pt1, pt2){
			// edge: {source:Node, target:Node, length:#, data:{}}
			// pt1:  {x:#, y:#}  source position in screen coords
			// pt2:  {x:#, y:#}  target position in screen coords

			// draw a line from pt1 to pt2
			this.renderer.ctx.strokeStyle = "rgba(0,0,0, .333)"
			this.renderer.ctx.lineWidth = 1
			this.renderer.ctx.beginPath()
			this.renderer.ctx.moveTo(pt1.x, pt1.y)
			this.renderer.ctx.lineTo(pt2.x, pt2.y)
			this.renderer.ctx.stroke()
		})

		this.particleSystem.eachNode(function(node, pt){
			// node: {mass:#, p:{x,y}, name:"", data:{}}
			// pt:   {x:#, y:#}  node position in screen coords

			// draw a rectangle centered at pt
			var w = 10
			this.renderer.ctx.fillStyle = donneCouleur(node.name)//(node.data.alone) ? "pink" : "black"
			this.renderer.ctx.fillRect(pt.x-w/2, pt.y-w/2, w,w)
		})
		listeCarre.forEach(element => {
			CreerRectangleText(element.e1,element.e2,element.e3,element.e4,element.e5,element.e6,element.e7,element.e8)
		});
	};
	initMouseHandling(canvas,particleSystem){
        // no-nonsense drag and drop (thanks springy.js)
        var dragged = null;
		var _mouseP = null;
        // set up a handler object that will initially listen for mousedowns then
        // for moves and mouseups while dragging
        var handler = {
          clicked:function(e){
            //var pos = canvas.;
             _mouseP = arbor.Point(e.pageX/*-pos.left*/, e.pageY/*-pos.top*/)
            dragged = particleSystem.nearest(_mouseP);

            if (dragged && dragged.node !== null){
              // while we're dragging, don't let physics move the node
              dragged.node.fixed = true
            }

			canvas.addEventListener("mousemove", handler.dragged); 
            document.defaultView.addEventListener("mouseup", handler.dropped); 

            return false
          },
          dragged:function(e){
            var pos = canvas.offset;
            var s = arbor.Point(e.pageX/*-pos.left*/, e.pageY/*-pos.top*/)

            if (dragged && dragged.node !== null){
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
            return false
          }
        }
        
		// start listening
		canvas.addEventListener("mousedown", handler.clicked); 

      }
}


////////////////////TESTS/////////////////////////////

var sys = arbor.ParticleSystem(100, 1000, 0.8);
//var sys = arbor.ParticleSystem();
sys.parameters({gravity:true})
sys.renderer = new Renderer(document.getElementById('viewport'));

function test(){
sys.addEdge('rouge a','b')
sys.addEdge('rouge a','c')
sys.addEdge('rouge a','d')
sys.addEdge('d','rouge a')
sys.addEdge('rouge a','e')
sys.addNode('f', {alone:true, mass:.25})
}

var listeCouleur = [];//chaque structure
var listeCouleurAssocier  = [];//generer aleatoirement




///////FONCTIONS ARBOR//////////////

function donneCouleur(nom){
	var valeur = nom.split(" ")[0] 
	for(let i = 0; i < listeCouleur.length;i++){
		if(listeCouleur[i] == valeur)return listeCouleurAssocier[i];
	}
	return "black";
}







/////////////////////////////TRAITEMENT/////////////////////////

class noeud{
    constructor(adresse,type,contenu){
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
    }
    addEnfant(nouveauNoeud){
        this.enfants.push(nouveauNoeud);
        this.nbEnfants++;
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

ouvrirJSON(sys);


function reload(){
	clear();
	ouvrirJSON(sys);
}

function ouvrirJSON(sys){
    var data = {
        "nodes": [
            {
                "base": {
                    "address": "0x555555554670",
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
                        "value": "(char [16]) 0x555555554670: "
                    },
                    {
                        "field_name": "nom",
                        "bitpos": 128,
                        "type": "char [32]",
                        "size": 32,
                        "value": "(char [32]) 0x555555554680: "
                    },
                    {
                        "field_name": "age",
                        "bitpos": 384,
                        "type": "uint8_t",
                        "size": 1,
                        "value": "(uint8_t) 0x5555555546a0: 72 'H'"
                    },
                    {
                        "field_name": "anciennete",
                        "bitpos": 392,
                        "type": "uint8_t",
                        "size": 1,
                        "value": "(uint8_t) 0x5555555546a1: 141 '\\215'"
                    },
                    {
                        "field_name": "salaire",
                        "bitpos": 416,
                        "type": "uint32_t",
                        "size": 4,
                        "value": "(uint32_t) 0x5555555546a4: 1207967753"
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
                "target": "0x555555554670",
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
                "target": "0x7fffffffdd70",
                "target_type": "struct salarie"
            },
            {
                "base": {
                    "address": "0x7fffffffdd70",
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
                        "value": "\u0001"
                    },
                    {
                        "field_name": "nom",
                        "bitpos": 128,
                        "type": "char [32]",
                        "size": 32,
                        "value": ""
                    },
                    {
                        "field_name": "age",
                        "bitpos": 384,
                        "type": "uint8_t",
                        "size": 1,
                        "value": "(uint8_t) 0x7fffffffdda0: 161 '\\241'"
                    },
                    {
                        "field_name": "anciennete",
                        "bitpos": 392,
                        "type": "uint8_t",
                        "size": 1,
                        "value": "(uint8_t) 0x7fffffffdda1: 225 '\\341'"
                    },
                    {
                        "field_name": "salaire",
                        "bitpos": 416,
                        "type": "uint32_t",
                        "size": 4,
                        "value": "(uint32_t) 0x7fffffffdda4: 32767"
                    }
                ]
            }
        ],
        "edges": [
            [
                "0x7fffffffdc78",
                "0x555555554670",
                null
            ],
            [
                "0x7fffffffdc80",
                "0x7fffffffdd70",
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
        if(element.fields != undefined){
        element.fields.forEach(e => {
            contenu+= e.field_name + " : " + e.value + "\n";
        });
		}
		else{
			contenu = element.base.symbol_name;
		}
		var type = element.base.type
		if(type.split(" ").length > 0){
			type = ""
			for(let i = 0; i< element.base.type.split(" ").length;i++){
				type +=  element.base.type.split(" ")[i];
				if(element.base.type.split(" ").length-1 != i)type += "_";
			}
		}
        listeNoeud.push(new noeud(element.base.address,type,contenu))
    });

    //la liste est créé, il va falloir maintenant creer les structures
    data.edges.forEach(element => {
        //pour chaque arrete
        var noeud1,noeud2;
        listeNoeud.forEach(n => {
            if(n.adresse == element[0])noeud1 = n;
            else if(n.adresse == element[1])noeud2 = n;
        });
        noeud1.addEnfant(noeud2);
        noeud2.addParent(noeud1);
    });

    return listeNoeud;
}

function creerNode(sys,liste){
	//les couleurs
	var posX = 75;
	liste.forEach(element => {
		if(!appartientListe(element.type,listeCouleur)){
			listeCouleur.push(element.type);
			var couleur = '#'+(Math.random()*0xFFFFFF<<0).toString(16)
			listeCouleurAssocier.push(couleur);	
		}
		element.contenu = element.type + " " + element.contenu;
	});
	for(let i = 0; i < listeCouleur.length;i++){
		listeCarre.push(new carre(ctx,posX,25,150,50,listeCouleurAssocier[i],listeCouleur[i],"Arial"));
		posX+=150;
	}

	liste.forEach(element => {
		element.enfants.forEach(enfant => {
			sys.addEdge(element.contenu,enfant.contenu);
		});
	});

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
function CreerRectangle(ctx,coordX,coordY,TailleX,TailleY,couleur){
    if(TailleX < TailleY)console.error("les rectangles ne peuvent etre plus long que large");
    ctx.fillStyle = couleur; 
    ctx.fillRect(coordX-TailleX/2,coordY-TailleY/2,TailleX,TailleY);//on centre le rectangle
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
function CreerText(ctx,coordX,coordY,Taille,police,couleur,texte){
    ctx.textAlign = "center";
    ctx.textBaseline="middle";
    ctx.font = Taille + "px " + police;
    ctx.fillStyle = couleur; 
    ctx.fillText(texte,coordX,coordY); 
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
    var tailleText = TailleY/(texte.length/5);
    if(tailleMax < tailleText)tailleText = tailleMax;
    CreerText(ctx,coordX,coordY,tailleText,police,"#000000",texte);
}

document.getElementById("clickMe").onclick = reload;
function clear(){
	sys.renderer.particleSystem.eachNode(function(node, pt){
		sys.pruneNode(node);
	})
	listeCarre = [];
	
}