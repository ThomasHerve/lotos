var etat = 0;

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
        
        this.initMouseHandling(this.canvas,this.particleSystem)
	};
  	redraw(){
		this.ctx.fillStyle = "white";
        this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height);  
		    this.particleSystem.eachEdge(function(edge, pt1, pt2){
			    this.renderer.ctx.strokeStyle = (edge.data.double) ? "rgba(255,0,0, .333)" : donneCouleur(edge.data.parent)
			    this.renderer.ctx.lineWidth = 1
			    this.renderer.ctx.beginPath()
			    this.renderer.ctx.moveTo(pt1.x, pt1.y)
			    this.renderer.ctx.lineTo(pt2.x, pt2.y)
                this.renderer.ctx.stroke()
		    })

		    this.particleSystem.eachNode(function(node, pt){
                var w =  60//Math.max(20, 20+gfx.textWidth(node.name));
                var tailleRec = w * 20
                if (node.name != nodeSelectionne){
                    this.renderer.ctx.fillStyle = donneCouleur(node.name)
                    this.renderer.ctx.beginPath();
                    this.renderer.ctx.arc(pt.x-w/2,pt.y-w/2,w,0,2*Math.PI);
                    this.renderer.ctx.fill();
                    this.renderer.ctx.stroke();
                    CreerText(this.renderer.ctx,pt.x-w/2,pt.y-w/2,12,"Arial","black",node.data.nom);               
                }else{
                    var w = 10
                    this.renderer.ctx.fillStyle = donneCouleur(node.name)
                    this.renderer.ctx.fillRect(pt.x-w/2 - tailleRec/2, pt.y-w/2 - tailleRec/2,tailleRec,tailleRec)
                    CreerText(this.renderer.ctx,pt.x-w/2,pt.y-w/2,100,"Arial","black",node.name,1); 
                }
            })

            listeCarre.forEach(element => {
                CreerRectangleText(element.e1,element.e2,element.e3,element.e4,element.e5,element.e6,element.e7,element.e8)
            });
           var leContexte = this.ctx;
           if(etat == 1){
               var compte = 0;
               var coordy = 50;
               var nbplace = (this.canvas.height/50 << 0) - 3;//nb de case que l'on peut afficher
               var stateSlider = document.getElementById("sliderTab").value;
               CreerText(leContexte,this.canvas.width * 0.95,coordy,40,"Arial","black",nodeTab.data.nom);
                nodeTab.data.tableau.forEach(element => {
                    if(compte >= stateSlider * nodeTab.data.tableau.length && compte <= stateSlider * nodeTab.data.tableau.length + nbplace){
                        coordy += 50;
                        CreerText(leContexte,this.canvas.width * 0.90,coordy,40,"Arial","black",compte + ":")
                        CreerText(leContexte,this.canvas.width * 0.95,coordy,40,"Arial","black",element)
                    }compte++;
                });
           }
        
        //les "fleches"
        /*
        this.particleSystem.eachEdge(function(edge, pt1, pt2){
            var w = 15
			this.renderer.ctx.strokeStyle =  "rgba(255,0,0, .333)" 
			this.renderer.ctx.beginPath()
			this.renderer.ctx.arc(pt1.x-w/2,pt1.y-w/2,w,0,2*Math.PI);
            this.renderer.ctx.fill();
            this.renderer.ctx.stroke()
        })
        */
		
    };
    resize(){
        this.canvas.width =  0.98 * screen.width;
        this.canvas.height = 0.8 * screen.height;
        sys.screen({size:{width:canvas.width, height:canvas.height}})
        this.redraw()
    };
	initMouseHandling(canvas,particleSystem){
        var dragged = null;
        var _mouseP = null;
        var selected = null;
        var nearest = null;
        var handler = {
          clicked:function(e){
             _mouseP = arbor.Point(e.pageX/*-pos.left*/, e.pageY/*-pos.top*/)
            nearest = sys.nearest(_mouseP);
            if (!nearest.node) return false
            selected = (nearest.distance < 1000) ? nearest : null
            dragged = selected;

            if (dragged && dragged.node !== null){
              dragged.node.fixed = true;
              nodeSelectionne = dragged.node.name;
              if(dragged.node.data.tableau != undefined){
                  nodeTab = dragged.node;
              }
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
var sys = arbor.ParticleSystem(100, 1000, 0.8);//on declare un particleSysteme qui permet le temps reel
sys.parameters({gravity:true})//on ajoute la gravité
sys.renderer = new Renderer(document.getElementById('viewport'),arbor);//on créé le renderer du particleSysteme
var listeCouleur = [];//chaque structure
var listeCouleurAssocier  = [];//generer aleatoirement



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
    constructor(adresse,type,contenu,symbol_name,tableau){
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
        this.tableau = tableau;
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
                    "address": "0x7fffffffdca4",
                    "symbol_name": "val",
                    "type": "uint32_t",
                    "raw_type": "unsigned int",
                    "size": 4
                },
                "type": "scalar",
                "value": "42"
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
                "n_elements": 512,
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
                    "157",
                    "193",
                    "208",
                    "283",
                    "481",
                    "1",
                    "161",
                    "452",
                    "190",
                    "299",
                    "360",
                    "85",
                    "454",
                    "78",
                    "399",
                    "437",
                    "381",
                    "505",
                    "341",
                    "364",
                    "84",
                    "471",
                    "207",
                    "298",
                    "235",
                    "304",
                    "171",
                    "253",
                    "337",
                    "310",
                    "499",
                    "106",
                    "356",
                    "184",
                    "388",
                    "188",
                    "366",
                    "291",
                    "91",
                    "357",
                    "508",
                    "104",
                    "81",
                    "5",
                    "32",
                    "472",
                    "324",
                    "507",
                    "229",
                    "354",
                    "146",
                    "46",
                    "303",
                    "325",
                    "232",
                    "72",
                    "438",
                    "61",
                    "56",
                    "150",
                    "128",
                    "506",
                    "338",
                    "205",
                    "496",
                    "352",
                    "456",
                    "265",
                    "378",
                    "458",
                    "217",
                    "274",
                    "420",
                    "401",
                    "494",
                    "448",
                    "111",
                    "375",
                    "312",
                    "33",
                    "490",
                    "302",
                    "29",
                    "340",
                    "413",
                    "21",
                    "94",
                    "407",
                    "34",
                    "191",
                    "359",
                    "263",
                    "219",
                    "37",
                    "510",
                    "349",
                    "382",
                    "309",
                    "8",
                    "250",
                    "100",
                    "387",
                    "331",
                    "174",
                    "432",
                    "311",
                    "88",
                    "431",
                    "409",
                    "47",
                    "346",
                    "493",
                    "97",
                    "113",
                    "15",
                    "306",
                    "497",
                    "317",
                    "391",
                    "124",
                    "362",
                    "273",
                    "22",
                    "201",
                    "484",
                    "321",
                    "221",
                    "121",
                    "373",
                    "141",
                    "3",
                    "155",
                    "403",
                    "470",
                    "214",
                    "238",
                    "43",
                    "165",
                    "105",
                    "204",
                    "89",
                    "260",
                    "102",
                    "110",
                    "143",
                    "185",
                    "335",
                    "476",
                    "350",
                    "423",
                    "440",
                    "441",
                    "53",
                    "501",
                    "206",
                    "344",
                    "93",
                    "433",
                    "272",
                    "177",
                    "247",
                    "118",
                    "336",
                    "446",
                    "244",
                    "233",
                    "203",
                    "363",
                    "394",
                    "415",
                    "361",
                    "451",
                    "138",
                    "23",
                    "282",
                    "66",
                    "240",
                    "62",
                    "353",
                    "383",
                    "319",
                    "71",
                    "425",
                    "379",
                    "70",
                    "173",
                    "68",
                    "390",
                    "27",
                    "422",
                    "166",
                    "131",
                    "424",
                    "329",
                    "132",
                    "202",
                    "159",
                    "216",
                    "444",
                    "107",
                    "170",
                    "63",
                    "28",
                    "212",
                    "439",
                    "195",
                    "175",
                    "316",
                    "462",
                    "108",
                    "398",
                    "200",
                    "245",
                    "25",
                    "114",
                    "239",
                    "237",
                    "95",
                    "294",
                    "144",
                    "187",
                    "342",
                    "295",
                    "251",
                    "358",
                    "492",
                    "4",
                    "17",
                    "133",
                    "278",
                    "301",
                    "256",
                    "152",
                    "491",
                    "271",
                    "147",
                    "125",
                    "77",
                    "461",
                    "140",
                    "12",
                    "277",
                    "122",
                    "52",
                    "48",
                    "64",
                    "488",
                    "120",
                    "483",
                    "447",
                    "370",
                    "380",
                    "411",
                    "307",
                    "45",
                    "223",
                    "429",
                    "267",
                    "320",
                    "199",
                    "482",
                    "296",
                    "255",
                    "65",
                    "10",
                    "162",
                    "478",
                    "26",
                    "54",
                    "149",
                    "24",
                    "450",
                    "75",
                    "127",
                    "293",
                    "176",
                    "7",
                    "393",
                    "164",
                    "332",
                    "57",
                    "442",
                    "396",
                    "139",
                    "287",
                    "473",
                    "343",
                    "148",
                    "87",
                    "101",
                    "322",
                    "236",
                    "220",
                    "406",
                    "50",
                    "98",
                    "404",
                    "443",
                    "275",
                    "392",
                    "511",
                    "466",
                    "156",
                    "445",
                    "83",
                    "134",
                    "365",
                    "489",
                    "31",
                    "467",
                    "79",
                    "123",
                    "479",
                    "428",
                    "189",
                    "313",
                    "169",
                    "86",
                    "351",
                    "503",
                    "241",
                    "468",
                    "179",
                    "268",
                    "172",
                    "228",
                    "112",
                    "18",
                    "416",
                    "368",
                    "20",
                    "222",
                    "509",
                    "480",
                    "126",
                    "405",
                    "73",
                    "435",
                    "262",
                    "218",
                    "419",
                    "213",
                    "495",
                    "261",
                    "327",
                    "231",
                    "395",
                    "178",
                    "197",
                    "427",
                    "215",
                    "38",
                    "153",
                    "386",
                    "465",
                    "284",
                    "115",
                    "305",
                    "400",
                    "119",
                    "264",
                    "30",
                    "475",
                    "163",
                    "434",
                    "460",
                    "417",
                    "183",
                    "504",
                    "116",
                    "369",
                    "96",
                    "145",
                    "243",
                    "2",
                    "257",
                    "198",
                    "347",
                    "281",
                    "279",
                    "135",
                    "426",
                    "90",
                    "290",
                    "270",
                    "500",
                    "36",
                    "469",
                    "377",
                    "249",
                    "58",
                    "186",
                    "367",
                    "457",
                    "194",
                    "230",
                    "41",
                    "130",
                    "242",
                    "74",
                    "117",
                    "372",
                    "19",
                    "333",
                    "485",
                    "225",
                    "44",
                    "308",
                    "259",
                    "436",
                    "498",
                    "414"
                ],
                "starting_address": "0x555555756260"
            }
        ],
        "edges": []
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
        listeNoeud.push(new noeud(element.base.address,type,contenu,element.base.symbol_name,element.elements))
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
    var posX = 150;
    //Chaque couleur est generer si le type n'a pas de couleur assigné
	liste.forEach(element => {
		if(!appartientListe(element.type,listeCouleur)){
			listeCouleur.push(element.type);
			var couleur = '#'+(randomFixe(0.3)*0xFFFFFF<<0).toString(16)
			listeCouleurAssocier.push(couleur);	
        }
		element.contenu = element.type + "\n" + element.contenu;
    });
    //on créé les legendes à partir de la liste de couleur 
	for(let i = 0; i < listeCouleur.length;i++){
		listeCarre.push(new carre(ctx,posX,25,300,100,listeCouleurAssocier[i],listeCouleur[i],"Arial"));
		posX+=300;
	}

    //on connait chaque noeud et ses parents/enfants, on peut donc créé les liens
    var symb;
    liste.forEach(element => {
        if(element.symbol_name != null)symb =  element.symbol_name;
        else {
            symb =  element.adresse;
        }
        sys.addNode(element.contenu,{shape:'dot',nom:symb,tableau:element.tableau});
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
			sys.addEdge(element.contenu,enfant.contenu,{double:double,parent:element.contenu});
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

function clear(){
	sys.renderer.particleSystem.eachNode(function(node, pt){
		sys.pruneNode(node);
	})
	listeCarre = [];	
}

//BOUTONS
document.getElementById("clickMe").onclick = reload;
document.getElementById("versTableau").onclick = versTableau;
document.getElementById("sliderTab").oninput = refresh;
///POSITIONNEMENT DEGUEUX
document.getElementById("sliderTab").style.width = 0.8 * screen.height;
document.getElementById("sliderTab").style.top = screen.height-screen.height * 0.924 + "px" 
document.getElementById("sliderTab").style.left = screen.width * 0.93 + "px" 
document.getElementById("sliderTab").value = 0;

function versTableau(){
    if(nodeTab == null)return;
    if(etat != 1)etat = 1;
    else etat = 0;
    refresh();
}

function refresh(){
    sys.renderer.redraw();
}