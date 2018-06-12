/*******************************
*                              *
*  Lotos: Webclient for Moly   *
*       by Thomas HERVE        *
*                              *
*                              *
*******************************/

var etat = 0;
var tailleCarre = 2.5
var compteIter = -1;
var position = 0;
var tailleProgramme = undefined;
var dataJSON;
var w;
var decale;

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
     ctx.lineWidth = 2;
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
         ctx.lineWidth = 2;
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
        w =  document.getElementById('viewport').width/60//Math.max(20, 20+gfx.textWidth(node.name));
        this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height);  
        var pS = this.particleSystem;
        decale = w * tailleCarre;
        var that = this;
		    this.particleSystem.eachEdge(function(edge, pt1, pt2){
                var versPile = false;
                if(pS.getNode(edge.data.enfant).data.active && pS.getNode(edge.data.parent).data.active){
                    //cas classique explosé
                    var x1 = pt1.x;
                    var x2 = pt2.x;
                    var y1 = pt1.y;
                    var y2 = pt2.y;
                    var DEP = false;
                    var courbe = false;
                    var parsDePile = false;

                    //le cas ou on pointe de la pile vers un element encore dans arbor
                    if(!pS.getNode(edge.data.parent).data.actifPile)
                    {
                        var Decalage = canvas.height/15;
                        var Deployer = false;
                        var totalBlocs = 0;
                        DEP = true;
                        listStack.forEach(element => {
                            if(element.deplie){
                                element.variables.forEach(variable => {
                                    if(variable.address == pS.getNode(edge.data.parent).name){
                                        Deployer = true;
                                        //si on doit partir d'un champs d'une structure
                                        if(pS.getNode(variable.address).data.typeGenerique == "struct"){
                                            parsDePile = true;
                                        }             
                                    }
                                    if( pS.getNode(variable.address).data.typeGenerique == "struct" && !Deployer){
                                        Decalage += canvas.height/15 + canvas.height/15 * pS.getNode(variable.address).data.champs.length;
                                    }
                                    else if(!Deployer)Decalage += canvas.height/15;
                                });
                                totalBlocs+=element.nbElem;
                            }
                            else if(!Deployer){
                                Decalage += canvas.height/15;
                                totalBlocs++;
                            }else totalBlocs++;
                        });
                        if(Deployer){//le cas ou la frame est deplié, il faut donc tracer les fleches 
                            x1 = canvas.width/15 + canvas.width/60;
                            y1 = canvas.height/30 + Decalage - decalePile(14,totalBlocs,document.getElementById("sliderPile").value,canvas.height/15);
                            if(!pS.getNode(edge.data.enfant).data.actifPile){//le cas ou l'enfant est aussi dans la pile
                                courbe = true;
                                Decalage = canvas.height/15;
                                var Deployer2 = false;
                                totalBlocs = 0;
                                listStack.forEach(element => {
                                    if(element.deplie){
                                        element.variables.forEach(variable => {
                                            if(!Deployer2 && variable.address != pS.getNode(edge.data.enfant).name && pS.getNode(variable.address).data.typeGenerique == "struct"){
                                                totalBlocs+=pS.getNode(variable.address).data.champs.length;
                                                Decalage += canvas.height/15 * pS.getNode(variable.address).data.champs.length;
                                            }
                                            else if(pS.getNode(variable.address).data.typeGenerique == "struct"){
                                                totalBlocs+=pS.getNode(variable.address).data.champs.length;
                                            }
                                            if(variable.address == pS.getNode(edge.data.enfant).name)Deployer2 = true;
                                            if(!Deployer2)Decalage += canvas.height/15;
                                            totalBlocs++;
                                    });
                                }
                                else if(!Deployer2){
                                    Decalage += canvas.height/15;
                                    totalBlocs++;
                                }else totalBlocs++;
                            });
                            if(Deployer2){
                                x2 = canvas.width/15 + canvas.width/60;
                                y2 =  Decalage - decalePile(14,totalBlocs,document.getElementById("sliderPile").value,canvas.height/15) - canvas.height/60;
                            }
                            else{
                                return;
                            }
                        }
                        }else{
                            return;
                        }
                    }
                    /////////////////////////////////////////////////////////////////
                    //Le cas tres particulier ou un element du tas pointe vers la pile
                    else if(!pS.getNode(edge.data.enfant).data.actifPile)
                    {
                        var Deployer2 = false;
                        var Decalage = canvas.height/15;
                        totalBlocs = 0;
                        listStack.forEach(element => {
                            if(element.deplie){
                                element.variables.forEach(variable => {
                                    if(variable.address == pS.getNode(edge.data.enfant).name){
                                        Deployer2 = true;
                                    }
                                    if(!Deployer2)Decalage += canvas.height/15;
                                    
                                });
                                totalBlocs+=element.nbElem;
                            }
                            else if(!Deployer2){
                                Decalage += canvas.height/15;
                                totalBlocs++;
                            }else totalBlocs++;
                        });
                        if(Deployer2){
                            x2 = canvas.width/15 + canvas.width/60;
                            y2 = canvas.height/30 + Decalage - decalePile(14,totalBlocs,document.getElementById("sliderPile").value,canvas.height/15);
                            versPile = true;
                        }
                        else{
                            return;
                        }
                    }   
                    /////////////////////////////////////////////////////////////////
                    this.renderer.ctx.strokeStyle = "black";
                    var dist = w;
                    if((!pS.getNode(edge.data.parent).data.deplie || pS.getNode(edge.data.parent).data.typeGenerique != "struct")){
                        if(pS.getNode(edge.data.parent) == pS.getNode(edge.data.enfant)){//on pointe sur sois meme
                            this.renderer.ctx.strokeStyle = donneCouleur(pS.getNode(edge.data.parent).data.type)
                            this.renderer.ctx.beginPath();
                            this.renderer.ctx.arc(x1 - dist, y1 + dist, dist, 0, Math.PI * 1.5, false); 
                            this.renderer.ctx.stroke();
                            that.Vecteur(this.renderer.ctx,x1 - dist/2 - 11,y1,x1 - dist/2 - 10,y1)
                        }
                        else{
                        if(parsDePile){
                            y1 +=  canvas.height/15 * (edge.data.compte_field+1);
                        }
                        this.renderer.ctx.strokeStyle = donneCouleur(pS.getNode(edge.data.parent).data.type)
                        
                        if(pS.getNode(edge.data.enfant).data.deplie && (pS.getNode(edge.data.enfant).data.typeGenerique == "struct" || pS.getNode(edge.data.enfant).data.typeGenerique == "primitive" || pS.getNode(edge.data.enfant).data.typeGenerique == "string" || versPile)){
                            if(x1 < x2 && (x1-x2)*(x1-x2) > (y1-y2)*(y1-y2)){
                                x2 -= decale/2
                            }
                            else if( (pS.getNode(edge.data.enfant).data.typeGenerique == "primitive" || pS.getNode(edge.data.enfant).data.typeGenerique == "string")&& x1 > x2 && (x1-x2)*(x1-x2) > (y1-y2)*(y1-y2)){
                                x2 += decale/2
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
                            if(!versPile){
                            var d = Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2))
                            var pointX = x2 + ((x1-x2) * dist) /d
                            var pointY = y2 + ((y1-y2) * dist) /d
                            }
                            else{
                                var pointX = x2;
                                var pointY = y2; 
                            }
                        }
                        
                        this.renderer.ctx.lineWidth = 1;
                        if(courbe)that.VecteurCourbe(this.renderer.ctx,x1,y1,pointX,pointY)
                        else that.Vecteur(this.renderer.ctx,x1,y1,pointX,pointY)
                    }
                    }
                    else{
                        if(parsDePile){
                            y1 +=  canvas.height/15 * (edge.data.compte_field+1);
                        }else{
                            x1 = x1 + decale * edge.data.compte_field;
                        }
                        if(pS.getNode(edge.data.enfant).data.deplie && (pS.getNode(edge.data.enfant).data.typeGenerique == "struct" || pS.getNode(edge.data.enfant).data.typeGenerique == "primitive" || pS.getNode(edge.data.enfant).data.typeGenerique == "string" || versPile)){
                            if(!versPile){
                            if(x1 < x2 && (x1-x2)*(x1-x2) > (y1-y2)*(y1-y2)){
                                x2 -= decale/2
                            }
                            else if((pS.getNode(edge.data.enfant).data.typeGenerique == "primitive" || pS.getNode(edge.data.enfant).data.typeGenerique == "string")&& x1 > x2 && (x1-x2)*(x1-x2) > (y1-y2)*(y1-y2)){
                                x2 += decale/2
                            }
                            else if(y1 > y2){
                                y2 += decale/2;
                            }
                            else if(y1 < y2){
                                y2 -= decale/2;
                            }
                        }
                            var pointX = x2;
                            var pointY = y2;
                        }
                        else{
                            if(!versPile){
                                var d = Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2))
                                var pointX = x2 + ((x1-x2) * dist) /d
                                var pointY = y2 + ((y1-y2) * dist) /d
                            }
                            else{
                                var pointX = x2;
                                var pointY = y2; 
                            }
                        }
                        var departX = x1
                        var departY = y1

                        if(!DEP){
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
                        }
                        if(pS.getNode(edge.data.parent) == pS.getNode(edge.data.enfant)){
                            this.renderer.ctx.lineWidth = 1;
                            that.VecteurCourbe(this.renderer.ctx,x1, y1 - decale/2,x2,y2 - decale/2)
                        }
                        else{
                            this.renderer.ctx.lineWidth = 1;
                            if(courbe)that.VecteurCourbe(this.renderer.ctx,departX, departY,pointX,pointY)
                            else that.Vecteur(this.renderer.ctx,departX, departY,pointX,pointY)
                            }
                        }                   
                }
                
		    })

		    this.particleSystem.eachNode(function(node, pt){
                if(node.data.active && node.data.actifPile){
                if (!node.data.deplie){
                    this.renderer.ctx.beginPath();
                    this.renderer.ctx.fillStyle = donneCouleur(node.data.type);
                    this.renderer.ctx.arc(pt.x,pt.y,w,0,2*Math.PI);
                    this.renderer.ctx.fill();
                    CreerText(this.renderer.ctx,pt.x,pt.y,Math.max(w * 1.5/node.data.nom.length,8),"Arial","black",node.data.nom);   
                }else{
                    if(node.data.typeGenerique == "primitive" || node.data.typeGenerique == "string"){
                        CreerRectangle(this.renderer.ctx,pt.x ,pt.y,w * tailleCarre,w * tailleCarre, donneCouleur(node.data.type),"black",2); 
                        var text = node.data.valeurScalaire;
                        CreerTexteNonCentre(this.renderer.ctx,pt.x - (w * tailleCarre/2) * 0.9,pt.y - (w * tailleCarre/2)*0.8,8,"Arial","black",node.data.nom,0,w * tailleCarre); 
                        CreerText(this.renderer.ctx,pt.x,pt.y + 7,Math.max(w * tailleCarre/text.length,7),"Arial","black",text,0,w * tailleCarre * 1.8);
                    }
                    else if(node.data.typeGenerique == "struct"){
                        this.renderer.ctx.fillStyle = donneCouleur(node.data.type)
                        var pX = pt.x
                        node.data.champs.forEach(element => {
                            CreerRectangle(this.renderer.ctx,pX ,pt.y,w * tailleCarre,w * tailleCarre, donneCouleur(node.data.type),"black",2); 
                            
                            var text = element.value;
                            var textname = element.field_name;
                            if(element.is_pointer)text = element.field_name;
                            //le nom du champs
                            else{
                                CreerTexteNonCentre(this.renderer.ctx,pX - (w * tailleCarre/2) * 0.9,pt.y - (w * tailleCarre/2)*0.8,8,"Arial","black",textname,0,w * tailleCarre); 
                            }
                            //le champs
                            var letext = w * tailleCarre/text.length;
                            if(text.length == 1)letext *= 0.8
                            CreerText(this.renderer.ctx,pX,pt.y,Math.max(letext,7),"Arial","black",text,0,w * tailleCarre); 
                            pX += w*tailleCarre
                        });
                    }                              
                    else{
                        this.renderer.ctx.fillStyle = donneCouleur(node.data.type)
                        this.renderer.ctx.beginPath();
                        this.renderer.ctx.arc(pt.x,pt.y,w,0,2*Math.PI);
                        this.renderer.ctx.fill();
                        CreerText(this.renderer.ctx,pt.x,pt.y,Math.max(w * 1.5/node.data.nom.length,8),"Arial","black",node.data.nom);  
                    }
                }
            }
            })

            if(pileActive){//On dessine la pile
                ///On compte le nombre de bloc de la pile à afficher
                var totalBlocs = 0;
                listStack.forEach(element => {
                    if(element.variables.length > 0){
                        if(element.deplie){
                            totalBlocs+=element.nbElem;
                        }
                        else totalBlocs++;
                    }
                });

                var sous_ctx = sys.renderer.ctx;
                var tailleX =  canvas.width/15;
                var tailleY = canvas.height/15;
                var compte_position = tailleY;
                listStack.forEach(element => {
                    if(element.variables.length > 0){
                        if(element.deplie){
                            //le rectangle gris sur le coté
                            CreerRectangle(sous_ctx,((tailleX)/4)/2,(tailleY*element.nbElem)/2 + compte_position - decalePile(14,totalBlocs,document.getElementById("sliderPile").value,tailleY),tailleX/4,(tailleY * element.nbElem),"#AAAAAA","black",1);
                            //TEXTE DU RECTANGLE GRIS//
                            sous_ctx.fillStyle = 'black';
                            let text = element.name;
                            sous_ctx.font = "20px Arial"
                            let x = tailleX/8;
                            let y = (tailleY*element.nbElem)/2 + compte_position - decalePile(14,totalBlocs,document.getElementById("sliderPile").value,tailleY);
                            sous_ctx.save();
                            sous_ctx.translate(x, y);
                            sous_ctx.rotate(-Math.PI / 2);
                            sous_ctx.textAlign = 'center';
                            sous_ctx.fillText(text, 0, 0);
                            sous_ctx.restore();
                            //////////////////////////
                            element.variables.forEach(variable => {
                                var color = donneCouleur(sys.getNode(variable.address).data.type)
                                if(sys.getNode(variable.address).data.typeGenerique == "struct")color = "#AAAAAA"
                                CreerRectangle(sous_ctx,tailleX/2 + (tailleX)/4,tailleY/2 + compte_position -  decalePile(14,totalBlocs,document.getElementById("sliderPile").value,tailleY),tailleX,tailleY,color,"black",1)
                                let textVar = variable.name
                                if(sys.getNode(variable.address).data.typeGenerique != "pointer" && sys.getNode(variable.address).data.typeGenerique != "struct")textVar+= " : " + sys.getNode(variable.address).data.valeurScalaire;
                                CreerText(sous_ctx,tailleX/2 + (tailleX)/4,tailleY/2 + compte_position -  decalePile(14,totalBlocs,document.getElementById("sliderPile").value,tailleY),Math.min(25,Math.max(tailleX/textVar.length,8)),"Arial","black",textVar,0,tailleX);
                                compte_position+=tailleY;
                                //le cas structure dans la pile
                                if(sys.getNode(variable.address).data.typeGenerique == "struct"){
                                    sys.getNode(variable.address).data.champs.forEach(champ =>{
                                        CreerRectangle(sous_ctx,tailleX/2 + (tailleX)/4,tailleY/2 + compte_position -  decalePile(14,totalBlocs,document.getElementById("sliderPile").value,tailleY),tailleX,tailleY,donneCouleur(sys.getNode(variable.address).data.type),"black",1);
                                        CreerRectangle(sous_ctx,2.5 * tailleX/8,tailleY/2 + compte_position -  decalePile(14,totalBlocs,document.getElementById("sliderPile").value,tailleY),tailleX/8,tailleY,"#AAAAAA","#AAAAAA",2);
                                        sous_ctx.beginPath();
                                        sous_ctx.lineWidth = 1;
                                        sous_ctx.strokeStyle = "black"
                                        sous_ctx.moveTo(3 * tailleX/8,compte_position -  decalePile(14,totalBlocs,document.getElementById("sliderPile").value,tailleY))
                                        sous_ctx.lineTo(3 * tailleX/8,tailleY + compte_position -  decalePile(14,totalBlocs,document.getElementById("sliderPile").value,tailleY))
                                        sous_ctx.stroke();
                                        textVar = champ.field_name;
                                        if(!champ.is_pointer)textVar+= " : " + champ.value;
                                        CreerText(sous_ctx,tailleX/2 + (tailleX)/4,tailleY/2 + compte_position -  decalePile(14,totalBlocs,document.getElementById("sliderPile").value,tailleY),Math.min(25,Math.max(tailleX/textVar.length,8)),"Arial","black",textVar,0,tailleX);
                                        compte_position+=tailleY;
                                    })
                                    //bordure
                                    sous_ctx.beginPath();
                                    sous_ctx.lineWidth = 4;
                                    sous_ctx.strokeStyle = "black"
                                    sous_ctx.rect((tailleX)/4,-(tailleY) + (compte_position  - sys.getNode(variable.address).data.champs.length * tailleY) -  decalePile(14,totalBlocs,document.getElementById("sliderPile").value,tailleY),tailleX,tailleY * (1+sys.getNode(variable.address).data.champs.length));
                                    sous_ctx.stroke();
                                }
                            });
                        }   
                        else {
                            CreerRectangle(sous_ctx,(tailleX)/4,tailleY/2 + compte_position -  decalePile(14,totalBlocs,document.getElementById("sliderPile").value,tailleY),tailleX * 2,tailleY,"#AAAAAA","black",1)
                            CreerText(sous_ctx,tailleX/2 + (tailleX)/8,tailleY/2 + compte_position -  decalePile(14,totalBlocs,document.getElementById("sliderPile").value,tailleY),Math.min(25,tailleX/element.name.length),"Arial","black",element.name,0,tailleX);
                            compte_position+=tailleY;
                        }
                        
                    }
                });


            }

            //les types en haut de la fenetre
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


            //si on affiche le tableau
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

                coordy = fixe;
                var those = this;
                compte = 0;
                //si c'est un tableau de pointeurs
                if(nodeTab.data.is_pointer){
                    nodeTab.data.tableau.forEach(element => {
                        if(compte >= stateSlider * nodeTab.data.tableau.length && compte <= stateSlider * nodeTab.data.tableau.length + nbplace){
                            coordy += fixe;
                            var valide = false;
                            var sous_x,sous_y;
                            sys.eachNode(function(node, pt){
                                if(node.name == element && node.data.actifPile && node.data.active){
                                    sous_x = pt.x;
                                    sous_y = pt.y;
                                    valide = node;
                                }
                            })

                            if(valide){
                                var x1 = this.canvas.width * 0.89;
                                var y1 = coordy;
                                var x2 = sous_x;
                                var y2 = sous_y;
                                if(valide.data.deplie && (valide.data.typeGenerique == "struct" ||valide.data.typeGenerique == "primitive" || valide.data.typeGenerique == "string" )){
                                    if(x1 < x2 && (x1-x2)*(x1-x2) > (y1-y2)*(y1-y2)){
                                        x2 -= decale/2
                                    }
                                    else if((valide.data.typeGenerique == "primitive"|| valide.data.typeGenerique == "string") && x1 > x2 && (x1-x2)*(x1-x2) > (y1-y2)*(y1-y2)){
                                        x2 += decale/2
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
                                those.Vecteur(leContexte,this.canvas.width * 0.89,coordy,pointX,pointY);
                            }
                        }compte++;
                    });
                }
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
                    if(listeCouleurAssocier[selec] == donneCouleur(node.data.type)){
                        node.data.active = !node.data.active;
                    }
                })
                that.redraw()
            }
            if(pileActive && e.pageX < (canvas.width * 1.5 / 15 - (canvas.width/90))){

                var totalBlocs = 0;
                listStack.forEach(element => {
                    if(element.deplie){
                       totalBlocs+=element.nbElem;
                    }else totalBlocs++;
                });
                var tailleY = canvas.height/15;
                var posy = tailleY * 1.5 + 10 -  decalePile(14,totalBlocs,document.getElementById("sliderPile").value,tailleY);
                listStack.forEach(element => {
                    var dec;
                    if(!element.deplie){
                        dec = tailleY/2;
                        if(e.pageY <= posy + dec && e.pageY >= posy - dec){
                            element.deplie = true;
                        }
                        posy += tailleY;
                    }

                    else{
                        var compte = 0;
                        var posYcentral;
                        compte+=element.nbElem;
                        
                        posYcentral = posy + tailleY * compte/2 - tailleY/2;
                        dec = tailleY * compte/2;
                        posy += compte * tailleY;
                        if(e.pageY < posYcentral + dec && e.pageY > posYcentral - dec){
                            element.deplie = false;
                        }
                    }
                });
                that.redraw();
            }


            else{
             //PARTIE NODES
            nearest = sys.nearest(_mouseP);
            if(!nearest)return false;
            if (!nearest.node) return false;
            selected = (nearest.distance < 200) ? nearest : null;
            dragged = selected;

            if (dragged && dragged.node !== null && dragged.node.data.active){
              dragged.node.fixed = true;
              nodeSelectionne = dragged.node.name;
              if(di == 0 && dragged.node.data.typeGenerique != "array"){
                  if(!rec_on)dragged.node.data.deplie = !dragged.node.data.deplie
                  else depliageRecursif(!dragged.node.data.deplie,dragged.node);
              }
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

////////////////////EFFETS SUR ARBOR ///////////////

var listeRecursive = [];
function depliageRecursif(etatOrigine,node){
    listeRecursive = [];
    depliageRecursifEffectif(etatOrigine,node,undefined);
}

function depliageRecursifEffectif(etatOrigine,node,previous){
    node.data.deplie = etatOrigine;
    if(previous)listeRecursive.push(previous);
    sys.eachEdge(function(edge, pt1, pt2){
        if(sys.getNode(edge.data.parent) == node && !appartientListe(node,listeRecursive)){
            depliageRecursifEffectif(etatOrigine,sys.getNode(edge.data.enfant),edge);
        }
    })
}



////////////////////INIT/////////////////////////////


var canvas = document.getElementById('viewport')//on recupere le canvas
var ctx = document.getElementById('viewport').getContext('2d');//son contexte (permet de dessiner)
var nodeSelectionne = null;//variable global contenant la node actuellement cliqué
var nodeTab = null;//variable contenant la derniere node cliquer de type array
var sys = arbor.ParticleSystem(10000, 500, 0.5);//on declare un particleSysteme qui permet le temps reel
sys.parameters({gravity:true})//on ajoute la gravité
sys.renderer = new Renderer(document.getElementById('viewport'),arbor);//on créé le renderer du particleSysteme
var listeCouleur = [];//chaque structure
var listeCouleurAssocier  = [];//generer aleatoirement
var listeCouleurActive = []; //permet de savoit si tel ou tel couleur est active
var listeCol = [];//la liste qui contiendra toutes les couleurs à utiliser avant de les generer aléatoirement --initialisé dans ouvrirJSON--
var listeCarre = [];//contiendra tout les carrés permettant de faire la legende
var pileActive = false;//savoir si actuellement la pile est afficher ou non
var listVariablesPile = [];//liste contenant les variables de la pile (une variable = une adresse et un nom)
var listStack = [];//liste qui contient une frame dans sa globalité


///////////////////FONCTIONS COULEURS//////////////

function donneCouleur(nom){
	var valeur = nom
	for(let i = 0; i < listeCouleur.length;i++){
		if(listeCouleur[i] == valeur)return listeCouleurAssocier[i];
	}
	return "black";
}

function couleurRandom(){
    if(listeCol.length>0){
        return listeCol.shift();
    }
    return '#'+(randomFixe(0.3)*0xFFFFFF<<0).toString(16);
}


/////////////////////////////TRAITEMENT D'UN JSON COMPLET/////////////////////////

class noeud{
    constructor(adresse,type,symbol_name,tableau,typeGenerique,champs,valeurScalaire,is_pointer){
        this.parents = []
        this.nbParents = 0;
        this.enfants = []
        this.nbEnfants = 0;
        this.adresse = adresse;
        this.type = type;
        this.symbol_name = symbol_name;
        this.tableau = tableau;7
        this.typeGenerique = typeGenerique;
        this.nomsPointeurs = []
        this.champs = champs
        this.valeurScalaire = valeurScalaire;
        this.is_pointer = is_pointer;
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


function ouvrirJSON(sys,message){
    sys.eachEdge(function(edge, pt1, pt2){
        sys.pruneEdge(edge);
    })
    sys.eachNode(function(node, pt){
        sys.pruneNode(node);
    })
    listeCol = ["#d73027","#f46d43","#fdae61","#fee08b","#d9ef8b","#a6d96a","#66bd63","1a9850"]
    dataJSON = JSON.parse(message);
    /*
    dataJSON = {
        "location": {
            "file": "cycle.c",
            "line": 12
        },
        "nodes": [
            {
                "base": {
                    "address": "0x7fffffffdca8",
                    "symbol_name": "tab",
                    "type": "chaine tab",
                    "raw_type": "chaine tab",
                    "size": 8
                },
                "meta-type": "array",
                "dynamic": true,
                "element_type": "chaine tab",
                "element_size": 4,
                "n_elements": 3,
                "is_pointer": true,
                "elements": [
                    "0x555555756260",
                    "0x555555756280",
                    "0x5555557562a0"
                ]
            },
            {
                "base": {
                    "address": "0x555555756260",
                    "symbol_name": null,
                    "type": "Bonjour",
                    "raw_type": "struct A",
                    "size": 16
                },
                "meta-type": "struct",
                "fields": [
                    {
                        "field_name": "A",
                        "bitpos": 0,
                        "type": "Bonjour *",
                        "size": 8,
                        "value": "0x555555756280",
                        "is_pointer": true
                    },
                    {
                        "field_name": "B",
                        "bitpos": 64,
                        "type": "int",
                        "size": 4,
                        "value": "1",
                        "is_pointer": false
                    }
                ]
            },
            {
                "base": {
                    "address": "0x555555756280",
                    "symbol_name": null,
                    "type": "Bonjour",
                    "raw_type": "struct A",
                    "size": 16
                },
                "meta-type": "struct",
                "fields": [
                    {
                        "field_name": "A",
                        "bitpos": 0,
                        "type": "Bonjour *",
                        "size": 8,
                        "value": "0x5555557562a0",
                        "is_pointer": true
                    },
                    {
                        "field_name": "B",
                        "bitpos": 64,
                        "type": "int",
                        "size": 4,
                        "value": "2",
                        "is_pointer": false
                    }
                ]
            },
            {
                "base": {
                    "address": "0x5555557562a0",
                    "symbol_name": null,
                    "type": "Bonjour",
                    "raw_type": "struct A",
                    "size": 16
                },
                "meta-type": "struct",
                "fields": [
                    {
                        "field_name": "A",
                        "bitpos": 0,
                        "type": "Bonjour *",
                        "size": 8,
                        "value": "0x7fffffffdbf0",
                        "is_pointer": true
                    },
                    {
                        "field_name": "B",
                        "bitpos": 64,
                        "type": "int",
                        "size": 4,
                        "value": "3",
                        "is_pointer": false
                    }
                ]
            },
            {
                "base": {
                    "address": "0x7fffffffdb24",
                    "symbol_name": "nbCel",
                    "type": "int",
                    "raw_type": "int",
                    "size": 4
                },
                "meta-type": "primitive",
                "value": "2"
            },
            {
                "base": {
                    "address": "0x7fffffffdb28",
                    "symbol_name": "c",
                    "type": "Bonjour *",
                    "raw_type": "Bonjour *",
                    "size": 8
                },
                "meta-type": "pointer",
                "target": "0x5555557562a0",
                "target_type": "Bonjour"
            },
            {
                "base": {
                    "address": "0x7fffffffdb54",
                    "symbol_name": "nbCel",
                    "type": "int",
                    "raw_type": "int",
                    "size": 4
                },
                "meta-type": "primitive",
                "value": "3"
            },
            {
                "base": {
                    "address": "0x7fffffffdb58",
                    "symbol_name": "c",
                    "type": "Bonjour *",
                    "raw_type": "Bonjour *",
                    "size": 8
                },
                "meta-type": "pointer",
                "target": "0x555555756280",
                "target_type": "Bonjour"
            },
            {
                "base": {
                    "address": "0x7fffffffdb68",
                    "symbol_name": "suiv",
                    "type": "Bonjour *",
                    "raw_type": "Bonjour *",
                    "size": 8
                },
                "meta-type": "pointer",
                "target": "0x5555557562a0",
                "target_type": "Bonjour"
            },
            {
                "base": {
                    "address": "0x7fffffffdb84",
                    "symbol_name": "nbCel",
                    "type": "int",
                    "raw_type": "int",
                    "size": 4
                },
                "meta-type": "primitive",
                "value": "4"
            },
            {
                "base": {
                    "address": "0x7fffffffdb88",
                    "symbol_name": "c",
                    "type": "Bonjour *",
                    "raw_type": "Bonjour *",
                    "size": 8
                },
                "meta-type": "pointer",
                "target": "0x555555756260",
                "target_type": "Bonjour"
            },
            {
                "base": {
                    "address": "0x7fffffffdb98",
                    "symbol_name": "suiv",
                    "type": "Bonjour *",
                    "raw_type": "Bonjour *",
                    "size": 8
                },
                "meta-type": "pointer",
                "target": "0x555555756280",
                "target_type": "Bonjour"
            },
            {
                "base": {
                    "address": "0x7fffffffdbb4",
                    "symbol_name": "nbCel",
                    "type": "int",
                    "raw_type": "int",
                    "size": 4
                },
                "meta-type": "primitive",
                "value": "5"
            },
            {
                "base": {
                    "address": "0x7fffffffdbb8",
                    "symbol_name": "c",
                    "type": "Bonjour *",
                    "raw_type": "Bonjour *",
                    "size": 8
                },
                "meta-type": "pointer",
                "target": "0x7fffffffdbf0",
                "target_type": "Bonjour"
            },
            {
                "base": {
                    "address": "0x7fffffffdbc8",
                    "symbol_name": "suiv",
                    "type": "Bonjour *",
                    "raw_type": "Bonjour *",
                    "size": 8
                },
                "meta-type": "pointer",
                "target": "0x555555756260",
                "target_type": "Bonjour"
            },
            {
                "base": {
                    "address": "0x7fffffffdbec",
                    "symbol_name": "nbCel",
                    "type": "int",
                    "raw_type": "int",
                    "size": 4
                },
                "meta-type": "primitive",
                "value": "5"
            },
            {
                "base": {
                    "address": "0x7fffffffdbf0",
                    "symbol_name": "Cqfd",
                    "type": "Bonjour",
                    "raw_type": "struct A",
                    "size": 16
                },
                "meta-type": "struct",
                "fields": [
                    {
                        "field_name": "A",
                        "bitpos": 0,
                        "type": "Bonjour *",
                        "size": 8,
                        "value": "0x555555756260",
                        "is_pointer": true
                    },
                    {
                        "field_name": "B",
                        "bitpos": 64,
                        "type": "int",
                        "size": 4,
                        "value": "0",
                        "is_pointer": false
                    }
                ]
            }
        ],
        "edges": [
            [
                "0x555555756260",
                "0x555555756280",
                "A"
            ],
            [
                "0x555555756280",
                "0x5555557562a0",
                "A"
            ],
            [
                "0x5555557562a0",
                "0x7fffffffdbf0",
                "A"
            ],
            [
                "0x7fffffffdb28",
                "0x5555557562a0",
                null
            ],
            [
                "0x7fffffffdb58",
                "0x555555756280",
                null
            ],
            [
                "0x7fffffffdb68",
                "0x5555557562a0",
                null
            ],
            [
                "0x7fffffffdb88",
                "0x555555756260",
                null
            ],
            [
                "0x7fffffffdb98",
                "0x555555756280",
                null
            ],
            [
                "0x7fffffffdbb8",
                "0x7fffffffdbf0",
                null
            ],
            [
                "0x7fffffffdbc8",
                "0x555555756260",
                null
            ],
            [
                "0x7fffffffdbf0",
                "0x555555756260",
                "A"
            ]
        ],
        "stack": [
            {
                "name": "main",
                "variables": [
                    {
                        "name": "Cqfd",
                        "address": "0x7fffffffdbf0"
                    },
                    {
                        "name": "nbCel",
                        "address": "0x7fffffffdbec"
                    }
                ]
            },
            {
                "name": "init_rec",
                "variables": [
                    {
                        "name": "suiv",
                        "address": "0x7fffffffdbc8"
                    },
                    {
                        "name": "c",
                        "address": "0x7fffffffdbb8"
                    },
                    {
                        "name": "nbCel",
                        "address": "0x7fffffffdbb4"
                    }
                ]
            },
            {
                "name": "init_rec",
                "variables": [
                    {
                        "name": "suiv",
                        "address": "0x7fffffffdb98"
                    },
                    {
                        "name": "c",
                        "address": "0x7fffffffdb88"
                    },
                    {
                        "name": "nbCel",
                        "address": "0x7fffffffdb84"
                    }
                ]
            },
            {
                "name": "init_rec",
                "variables": [
                    {
                        "name": "suiv",
                        "address": "0x7fffffffdb68"
                    },
                    {
                        "name": "c",
                        "address": "0x7fffffffdb58"
                    },
                    {
                        "name": "nbCel",
                        "address": "0x7fffffffdb54"
                    }
                ]
            },
            {
                "name": "init_rec",
                "variables": [
                    {
                        "name": "c",
                        "address": "0x7fffffffdb28"
                    },
                    {
                        "name": "nbCel",
                        "address": "0x7fffffffdb24"
                    }
                ]
            }
        ]
    }*/
    retour = creerNoeud(dataJSON);
    creerNode(sys,retour)
    CreerStack();
}



function CreerStack(){
    listVariablesPile = [];
    listStack = [];
    var listnomframe = []
    var comptenomframe = []
    dataJSON.stack.forEach(element => {
        var ajout = "";
        var compte = 0;
        if(!appartientListe(element.name,listnomframe)){
            listnomframe.push(element.name);
            comptenomframe.push(0);
        }
        else{
            comptenomframe[positionList(element.name,listnomframe)]++;
            ajout = "(" +  (comptenomframe[positionList(element.name,listnomframe)] + 1) + ")";
        }
        element.name+=ajout;

        //nombre d'objet dans cette stack
        element.variables.forEach(variable => {
            if(sys.getNode(variable.address).data.typeGenerique == "struct"){
                compte++;
                sys.getNode(variable.address).data.champs.forEach(champ => {
                   compte++;
               });
            }
            else compte++
        });

        listStack.push(Object.assign({deplie:false,nbElem:compte},element));
        element.variables.forEach(variable => {
            listVariablesPile.push(variable);
        });
    });

}


function positionList(element,list){
    let position = -1
    let c = 0;
    list.forEach(e => {
        if(e == element)position = c;
        c++;
    });
    return position;
}

/**
 * Creer une structure de type "noeud" a partir d'un JSON
 * @param {object} data l'objet obtenu à partir du JSON
 */
function creerNoeud(data){
    //tout d'abord, créér une liste de chaque noeud pour setup les info de bases
    var listeNoeud = [];
    data.nodes.forEach(element => {
        var type = element.base.type
        listeNoeud.push(new noeud(element.base.address,type,element.base.symbol_name,element.elements,element["meta-type"],element.fields,element.value,element.is_pointer))
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
    });
    //on créé les legendes à partir de la liste de couleur 
	for(let i = listeCouleurActive.length; i < listeCouleur.length;i++){
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

        /////////////savoir si la node est active////////////////
        //COULEUR
        var posCouleur = 0;
        for(let i = 0;i < listeCouleur.length;i++){
            if(listeCouleur[i] == element.type)posCouleur = i;
        }
        //PILE
        var actifPile = true;
        
        //si la pile est active au coup d'avant
        if(pileActive){
            actifPile = casPileActive(element.adresse);
        }
        /////////////////////////////////////////////////////////
        sys.addNode(element.adresse,{nom:symb,type:element.type,tableau:element.tableau,active:listeCouleurActive[posCouleur],deplie:true,actifPile:actifPile,typeGenerique:element.typeGenerique,nomsPointeurs:element.nomsPointeurs,champs:element.champs,valeurScalaire:element.valeurScalaire,is_pointer:element.is_pointer});
        
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
            sys.addEdge(element.adresse,enfant.adresse,{parent:element.adresse,enfant:enfant.adresse,compte_field:pos,max_field:maxfield});
		});
    });   
}


function casPileActive(element){
    var retour = true;
        listVariablesPile.forEach(variable => {
            if(element == variable.address){
                retour = false;
            }
        });
    return retour;
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
    if(texte.length>30){
        texte = texte.substr(0,27);
        texte+= "..."
    }
    ctx.textAlign = "center";
    ctx.textBaseline="middle";
    ctx.font = Taille + "px " + police;
    ctx.fillStyle = couleur; 
    if(saut == undefined)saut = 0;
    var compte = 0;
    var num = texte.split("\n").length - saut
    if( num > 1){
        coordY -= Taille * (texte.split("\n").length/2) 
    }
   
    if(tailleMax != undefined && tailleMax > 0){
        var nbSaut = 0; 
        texte.split("\n").forEach(element => {
            if(element.length > tailleMax/Taille){
                nbSaut+=(element.length/(tailleMax/Taille) << 0)
            }
        });

        if(nbSaut%2 == 1 && nbSaut != 0)coordY-= (nbSaut/2 << 0) * Taille
        else if(nbSaut != 0)coordY-= ((nbSaut/2 << 0) + 0.5) * Taille
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

var rec_on = true;

function recOn(){
    if(rec_on){
        document.getElementById("deploiement").style.backgroundColor = "red"
    }else document.getElementById("deploiement").style.backgroundColor = "#4CAF50"
    rec_on = !rec_on;
}

//BOUTONS
document.getElementById("viewport").width =  0.98 * screen.width;
document.getElementById("viewport").height = 0.8 * screen.height;
document.getElementById("clickMe").onclick = depInfo;
var di = 0;
document.getElementById("versTableau").onclick = versTableau;
document.getElementById("sliderTab").oninput = refresh;
document.getElementById("sliderPile").oninput = refresh;
document.getElementById("dunno").onclick = SwapPile;
document.getElementById("deploiement").onclick = recOn;


///POSITIONNEMENT SLIDER TAB
document.getElementById("sliderTab").style.width = 0.8 * screen.height;
document.getElementById("sliderTab").value = 0;

document.getElementById("sliderTab").style.top ="10px" 
//document.getElementById("sliderTab").style.left =  0.9 * screen.availWidth + "px"//document.getElementById("viewport").width*0.81  + "px" 
document.getElementById("sliderTab").style.visibility = "hidden"

///POSITIONNEMENT SLIDER PILE
document.getElementById("sliderPile").style.width = 0.75 * screen.height;
document.getElementById("sliderPile").style.height = "5px";
document.getElementById("sliderPile").value = 0;
//document.getElementById("sliderPile").style.left = "-" + document.getElementById("viewport").width/15 * 2.7 +"px" //"-17.5%"
document.getElementById("sliderPile").style.visibility = "hidden"

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

////////////////////////////////////////////////////////////////TIMELINE////////////////////////////////////////////////////////////////////////////////////////

document.getElementById("TimeLine").value = 0;
document.getElementById("TimeLine").style.width = document.getElementById("viewport").width * 0.99;
document.getElementById("TimeLine").oninput = timeLine

document.getElementById("plus1").onclick = plus1;
document.getElementById("plus5").onclick = plus5;
document.getElementById("plus10").onclick = plus10;
document.getElementById("moins1").onclick = moins1;


function AvanceGDB(i){
    connection.send("n " + i);
    connection.send("print_memory -j");
}


function plus1(){
    plus(1)
}

function plus5(){
    plus(5)
}

function plus10(){
    plus(10)
}

function plus(nb){
    if(position == 0)return;
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
        AvanceGDB(nb);
        sys.renderer.redraw()
    }
}

function moins1(){
    if(position == 0)return;
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

///////////////////////////////////////////MODE PILE//////////////////////////////////////

function SwapPile(){
    if(pileActive){
        document.getElementById("dunno").value = "Mode Pile";
        sys.eachNode(function(node, pt){
            node.data.actifPile = true;
        })
        document.getElementById("sliderPile").style.visibility = "hidden"
    }else{
        document.getElementById("dunno").value = "Mode Eclaté";
        sys.eachNode(function(node, pt){
            listVariablesPile.forEach(variable => {
                if(node.name == variable.address){
                    node.data.actifPile = false;
                }
            });
        })
        document.getElementById("sliderPile").style.visibility = "visible"
    }
    pileActive = !pileActive;
    refresh();
}


function decalePile(nbBlocsPlassables,nbBlocsTotaux,pourcent,taille){
    pourcent /= 2;
    if(nbBlocsPlassables>=nbBlocsTotaux)return 0;
    let max = ( nbBlocsTotaux - nbBlocsPlassables ) * taille
    return Math.min(max,(pourcent * nbBlocsTotaux) * taille);
}


///\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\\\
//\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\FONCTIONS DE MANIPULATIONS DES NOEUDS ET EDGES /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\\