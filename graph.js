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
     cone(ctx,xA,yA,xB,yB,xC,yC){
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.moveTo(xA,yA);ctx.lineTo(xB,yB);
        ctx.lineTo(xC,yC);
        ctx.closePath();
        ctx.fillStyle = "black"
        ctx.fill(); 
        ctx.stroke();
     }
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
                        
                        var cote = 0;
                        if(pS.getNode(edge.data.enfant).data.deplie && (pS.getNode(edge.data.enfant).data.typeGenerique == "struct" || pS.getNode(edge.data.enfant).data.typeGenerique == "primitive" || pS.getNode(edge.data.enfant).data.typeGenerique == "string" || versPile)){
                            if(x1 < x2 && (x1-x2)*(x1-x2) > (y1-y2)*(y1-y2)){
                                x2 -= decale/2
                                cote = 1;//gauche
                            }
                            else if( (pS.getNode(edge.data.enfant).data.typeGenerique == "primitive" || pS.getNode(edge.data.enfant).data.typeGenerique == "string")&& x1 > x2 && (x1-x2)*(x1-x2) > (y1-y2)*(y1-y2)){
                                x2 += decale/2
                                cote = 2;//droite
                            }
                            else if(y1 > y2){
                                y2 += decale/2;
                                cote = 3;//dessus
                            }
                            else if(y1 <= y2){
                                y2 -= decale/2;
                                cote = 4;//dessous
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
                        else{
                            if(edge.data.integre){
                                switch(cote){
                                    case 1:
                                    case 2:
                                        that.cone(this.renderer.ctx,x1,y1,pointX ,pointY - decale/2,pointX ,pointY + decale/2);
                                    break;
                                    case 3:
                                    case 4:
                                        that.cone(this.renderer.ctx,x1,y1,pointX - decale/2 ,pointY,pointX + decale/2,pointY);
                                    break;
                                }
                                
                            }
                            else that.Vecteur(this.renderer.ctx,x1,y1,pointX,pointY);
                        } 
                    }
                    }
                    else{
                        if(parsDePile){
                            y1 +=  canvas.height/15 * (edge.data.compte_field+1);
                        }else{
                            x1 = x1 + decale * edge.data.compte_field;
                        }
                        var cote = 0;
                        if(pS.getNode(edge.data.enfant).data.deplie && (pS.getNode(edge.data.enfant).data.typeGenerique == "struct" || pS.getNode(edge.data.enfant).data.typeGenerique == "primitive" || pS.getNode(edge.data.enfant).data.typeGenerique == "string" || versPile)){
                            if(!versPile){
                            if(x1 < x2 && (x1-x2)*(x1-x2) > (y1-y2)*(y1-y2)){
                                x2 -= decale/2
                                cote = 1;//gauche
                            }
                            else if((pS.getNode(edge.data.enfant).data.typeGenerique == "primitive" || pS.getNode(edge.data.enfant).data.typeGenerique == "string")&& x1 > x2 && (x1-x2)*(x1-x2) > (y1-y2)*(y1-y2)){
                                x2 += decale/2
                                cote = 2;//droite
                            }
                            else if(y1 > y2){
                                y2 += decale/2;
                                cote = 3;//dessus
                            }
                            else if(y1 <= y2){
                                y2 -= decale/2;
                                cote = 4;//dessous
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
                            else{
                                if(edge.data.integre){
                                    switch(cote){
                                        case 1:
                                        case 2:
                                            that.cone(this.renderer.ctx,departX,departY,pointX ,pointY - decale/2,pointX ,pointY + decale/2);
                                        break;
                                        case 3:
                                        case 4:
                                            that.cone(this.renderer.ctx,departX,departY,pointX - decale/2 ,pointY,pointX + decale/2,pointY);
                                        break;
                                    }
                                }
                                else that.Vecteur(this.renderer.ctx,departX, departY,pointX,pointY)}
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
                        CreerText(this.renderer.ctx,pt.x,pt.y,Math.max(w * tailleCarre/text.length,7),"Arial","black",text,0,w * tailleCarre * 1.8);
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
            else if(pileActive && e.pageX < (canvas.width * 1.5 / 15 - (canvas.width/90))){
                var modif = false;
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
                            modif = true;
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
                            modif = true;
                        }
                    }
                });
                if(!modif){
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
var listeCol = ["#d73027","#f46d43","#fdae61","#fee08b","#d9ef8b","#a6d96a","#66bd63","1a9850"];//la liste qui contiendra toutes les couleurs à utiliser avant de les generer aléatoirement --initialisé dans ouvrirJSON--
var listeCarre = [];//contiendra tout les carrés permettant de faire la legende
var pileActive = false;//savoir si actuellement la pile est afficher ou non
var listVariablesPile = [];//liste contenant les variables de la pile (une variable = une adresse et un nom)
var listStack = [];//liste qui contient une frame dans sa globalité
var listeNode = [];//liste qui garde les nodes du coup d'avant pour permettre de conserver leurs etat

///////////////////FONCTIONS COULEURS//////////////

function donneCouleur(nom){
	var valeur = nom
	for(let i = 0; i < listeCouleur.length;i++){
		if(listeCouleur[i] == valeur)return listeCouleurAssocier[i];
	}
	return "black";
}

function couleurRandom(){
    if(listeCol.length>1){
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
        this.champs = champs
        this.valeurScalaire = valeurScalaire;
        this.is_pointer = is_pointer;
    }
    addEnfant(nouveauNoeud,nomP){
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

var exData = undefined
function ouvrirJSON(sys,message){ 
    
    try{
        if(JSON.parse(message) == dataJSON)return
        dataJSON = JSON.parse(message);
    }
    catch{
        return;
    }

    sys.eachNode(function(node, pt){
        listeNode.push(node)
    });

    sys.eachEdge(function(edge, pt1, pt2){
        sys.pruneEdge(edge);
    })
    sys.eachNode(function(node, pt){
        sys.pruneNode(node.name);
    })

    /*
    dataJSON = {
    "location": {
        "file": "main2.c",
        "line": 46
    },
    "nodes": [
        {
            "base": {
                "address": "0x55555575ed30",
                "symbol_name": null,
                "type": "seq_bez",
                "raw_type": "struct seq_bez",
                "size": 32
            },
            "meta-type": "struct",
            "fields": [
                {
                    "field_name": "size",
                    "bitpos": 0,
                    "type": "unsigned int",
                    "size": 4,
                    "value": "3172",
                    "is_pointer": false
                },
                {
                    "field_name": "TMAX",
                    "bitpos": 32,
                    "type": "unsigned int",
                    "size": 4,
                    "value": "3172",
                    "is_pointer": false
                },
                {
                    "field_name": "card",
                    "bitpos": 64,
                    "type": "unsigned int",
                    "size": 4,
                    "value": "3172",
                    "is_pointer": false
                },
                {
                    "field_name": "tab",
                    "bitpos": 128,
                    "type": "Bezier3 *",
                    "size": 8,
                    "value": "0x7ffff7eb0010",
                    "is_pointer": true
                },
                {
                    "field_name": "suiv",
                    "bitpos": 192,
                    "type": "struct seq_bez *",
                    "size": 8,
                    "value": "0x0",
                    "is_pointer": true
                }
            ]
        },
        {
            "base": {
                "address": "0x55555575f9c0",
                "symbol_name": null,
                "type": "Point",
                "raw_type": "struct point",
                "size": 16
            },
            "meta-type": "struct",
            "fields": [
                {
                    "field_name": "x",
                    "bitpos": 0,
                    "type": "double",
                    "size": 8,
                    "value": "25",
                    "is_pointer": false
                },
                {
                    "field_name": "y",
                    "bitpos": 64,
                    "type": "double",
                    "size": 8,
                    "value": "44",
                    "is_pointer": false
                }
            ]
        },
        {
            "base": {
                "address": "0x7ffff714b010",
                "symbol_name": null,
                "type": "Pixel",
                "raw_type": "enum {...}",
                "size": 4
            },
            "meta-type": "primitive",
            "value": "BLANC"
        },
        {
            "base": {
                "address": "0x7ffff7eb0010",
                "symbol_name": null,
                "type": "Bezier3",
                "raw_type": "struct Bezier3",
                "size": 64
            },
            "meta-type": "struct",
            "fields": [
                {
                    "field_name": "C0",
                    "bitpos": 0,
                    "type": "Point",
                    "size": 16,
                    "value": "(Point C0) 0x7ffff7eb0010: \n\tdouble x: 25\n\tdouble y: 44\n",
                    "is_pointer": false
                },
                {
                    "field_name": "C1",
                    "bitpos": 128,
                    "type": "Point",
                    "size": 16,
                    "value": "(Point C1) 0x7ffff7eb0020: \n\tdouble x: 27.965146459028553\n\tdouble y: 36.965146459028553\n",
                    "is_pointer": false
                },
                {
                    "field_name": "C2",
                    "bitpos": 256,
                    "type": "Point",
                    "size": 16,
                    "value": "(Point C2) 0x7ffff7eb0030: \n\tdouble x: 32.298479792361888\n\tdouble y: 31.298479792361888\n",
                    "is_pointer": false
                },
                {
                    "field_name": "C3",
                    "bitpos": 384,
                    "type": "Point",
                    "size": 16,
                    "value": "(Point C3) 0x7ffff7eb0040: \n\tdouble x: 38\n\tdouble y: 27\n",
                    "is_pointer": false
                }
            ]
        },
        {
            "base": {
                "address": "0x7ffff7ee2010",
                "symbol_name": null,
                "type": "Pixel",
                "raw_type": "enum {...}",
                "size": 4
            },
            "meta-type": "primitive",
            "value": "BLANC"
        },
        {
            "base": {
                "address": "0x7fffffffdc20",
                "symbol_name": "argv",
                "type": "char **",
                "raw_type": "char **",
                "size": 8
            },
            "meta-type": "pointer",
            "target": "0x7fffffffdde8",
            "target_type": "char *"
        },
        {
            "base": {
                "address": "0x7fffffffdc2c",
                "symbol_name": "argc",
                "type": "int",
                "raw_type": "int",
                "size": 4
            },
            "meta-type": "primitive",
            "value": "2"
        },
        {
            "base": {
                "address": "0x7fffffffdc30",
                "symbol_name": "i",
                "type": "int",
                "raw_type": "int",
                "size": 4
            },
            "meta-type": "primitive",
            "value": "1"
        },
        {
            "base": {
                "address": "0x7fffffffdc34",
                "symbol_name": "val_max",
                "type": "int",
                "raw_type": "int",
                "size": 4
            },
            "meta-type": "primitive",
            "value": "1"
        },
        {
            "base": {
                "address": "0x7fffffffdc38",
                "symbol_name": "d",
                "type": "double",
                "raw_type": "double",
                "size": 8
            },
            "meta-type": "primitive",
            "value": "1"
        },
        {
            "base": {
                "address": "0x7fffffffdc40",
                "symbol_name": "I",
                "type": "Image",
                "raw_type": "struct Image_s",
                "size": 16
            },
            "meta-type": "struct",
            "fields": [
                {
                    "field_name": "L",
                    "bitpos": 0,
                    "type": "UINT",
                    "size": 4,
                    "value": "(UINT L) 0x7fffffffdc40: 500",
                    "is_pointer": false
                },
                {
                    "field_name": "H",
                    "bitpos": 32,
                    "type": "UINT",
                    "size": 4,
                    "value": "(UINT H) 0x7fffffffdc44: 500",
                    "is_pointer": false
                },
                {
                    "field_name": "tab",
                    "bitpos": 64,
                    "type": "Pixel *",
                    "size": 8,
                    "value": "0x7ffff7ee2010",
                    "is_pointer": true
                }
            ]
        },
        {
            "base": {
                "address": "0x7fffffffdc50",
                "symbol_name": "I_masque",
                "type": "Image",
                "raw_type": "struct Image_s",
                "size": 16
            },
            "meta-type": "struct",
            "fields": [
                {
                    "field_name": "L",
                    "bitpos": 0,
                    "type": "UINT",
                    "size": 4,
                    "value": "(UINT L) 0x7fffffffdc50: 500",
                    "is_pointer": false
                },
                {
                    "field_name": "H",
                    "bitpos": 32,
                    "type": "UINT",
                    "size": 4,
                    "value": "(UINT H) 0x7fffffffdc54: 500",
                    "is_pointer": false
                },
                {
                    "field_name": "tab",
                    "bitpos": 64,
                    "type": "Pixel *",
                    "size": 8,
                    "value": "0x7ffff714b010",
                    "is_pointer": true
                }
            ]
        },
        {
            "base": {
                "address": "0x7fffffffdc60",
                "symbol_name": "P",
                "type": "Point",
                "raw_type": "struct point",
                "size": 16
            },
            "meta-type": "struct",
            "fields": [
                {
                    "field_name": "x",
                    "bitpos": 0,
                    "type": "double",
                    "size": 8,
                    "value": "26",
                    "is_pointer": false
                },
                {
                    "field_name": "y",
                    "bitpos": 64,
                    "type": "double",
                    "size": 8,
                    "value": "45",
                    "is_pointer": false
                }
            ]
        },
        {
            "base": {
                "address": "0x7fffffffdc70",
                "symbol_name": "S",
                "type": "Seq_point",
                "raw_type": "struct seq",
                "size": 16
            },
            "meta-type": "struct",
            "fields": [
                {
                    "field_name": "TMAX",
                    "bitpos": 0,
                    "type": "unsigned int",
                    "size": 4,
                    "value": "4096",
                    "is_pointer": false
                },
                {
                    "field_name": "Taille",
                    "bitpos": 32,
                    "type": "unsigned int",
                    "size": 4,
                    "value": "3215",
                    "is_pointer": false
                },
                {
                    "field_name": "tab",
                    "bitpos": 64,
                    "type": "Point *",
                    "size": 8,
                    "value": "0x55555575f9c0",
                    "is_pointer": true
                }
            ]
        },
        {
            "base": {
                "address": "0x7fffffffdc80",
                "symbol_name": "E_simp_B2",
                "type": "Ens_Seq_Bez",
                "raw_type": "struct Ens_Bez",
                "size": 32
            },
            "meta-type": "struct",
            "fields": [
                {
                    "field_name": "size",
                    "bitpos": 0,
                    "type": "unsigned int",
                    "size": 4,
                    "value": "1",
                    "is_pointer": false
                },
                {
                    "field_name": "TMAX",
                    "bitpos": 32,
                    "type": "unsigned int",
                    "size": 4,
                    "value": "100",
                    "is_pointer": false
                },
                {
                    "field_name": "card",
                    "bitpos": 64,
                    "type": "unsigned int",
                    "size": 4,
                    "value": "1",
                    "is_pointer": false
                },
                {
                    "field_name": "tab",
                    "bitpos": 128,
                    "type": "seq_bez *",
                    "size": 8,
                    "value": "0x55555575ed30",
                    "is_pointer": true
                },
                {
                    "field_name": "suiv",
                    "bitpos": 192,
                    "type": "struct Ens_Bez *",
                    "size": 8,
                    "value": "0x0",
                    "is_pointer": true
                }
            ]
        },
        {
            "base": {
                "address": "0x7fffffffdcc0",
                "symbol_name": "R",
                "type": "Robot",
                "raw_type": "struct robot",
                "size": 40
            },
            "meta-type": "struct",
            "fields": [
                {
                    "field_name": "Pos_a",
                    "bitpos": 0,
                    "type": "Point",
                    "size": 16,
                    "value": "(Point Pos_a) 0x7fffffffdcc0: \n\tdouble x: 25\n\tdouble y: 44\n",
                    "is_pointer": false
                },
                {
                    "field_name": "Dir_a",
                    "bitpos": 128,
                    "type": "Dir_rob",
                    "size": 4,
                    "value": "(Dir_rob Dir_a) 0x7fffffffdcd0: EST",
                    "is_pointer": false
                },
                {
                    "field_name": "Pos_dep",
                    "bitpos": 192,
                    "type": "Point",
                    "size": 16,
                    "value": "(Point Pos_dep) 0x7fffffffdcd8: \n\tdouble x: 25\n\tdouble y: 44\n",
                    "is_pointer": false
                }
            ]
        },
        {
            "base": {
                "address": "0x7fffffffdde8",
                "symbol_name": null,
                "type": "char *",
                "raw_type": "char *",
                "size": 8
            },
            "meta-type": "string",
            "value": "/home/admin1/Bureau/stage/moly/main2"
        }
    ],
    "edges": [
        [
            "0x55555575ed30",
            "0x7ffff7eb0010",
            "tab"
        ],
        [
            "0x55555575ed30",
            null,
            "suiv"
        ],
        [
            "0x7fffffffdc20",
            "0x7fffffffdde8",
            null
        ],
        [
            "0x7fffffffdc40",
            "0x7ffff7ee2010",
            "tab"
        ],
        [
            "0x7fffffffdc50",
            "0x7ffff714b010",
            "tab"
        ],
        [
            "0x7fffffffdc70",
            "0x55555575f9c0",
            "tab"
        ],
        [
            "0x7fffffffdc80",
            "0x55555575ed30",
            "tab"
        ],
        [
            "0x7fffffffdc80",
            null,
            "suiv"
        ]
    ],
    "stack": [
        {
            "name": "main",
            "variables": [
                {
                    "name": "R",
                    "address": "0x7fffffffdcc0"
                },
                {
                    "name": "E_simp_B2",
                    "address": "0x7fffffffdc80"
                },
                {
                    "name": "S",
                    "address": "0x7fffffffdc70"
                },
                {
                    "name": "P",
                    "address": "0x7fffffffdc60"
                },
                {
                    "name": "I_masque",
                    "address": "0x7fffffffdc50"
                },
                {
                    "name": "I",
                    "address": "0x7fffffffdc40"
                },
                {
                    "name": "d",
                    "address": "0x7fffffffdc38"
                },
                {
                    "name": "val_max",
                    "address": "0x7fffffffdc34"
                },
                {
                    "name": "i",
                    "address": "0x7fffffffdc30"
                },
                {
                    "name": "argc",
                    "address": "0x7fffffffdc2c"
                },
                {
                    "name": "argv",
                    "address": "0x7fffffffdc20"
                }
            ]
        }
    ]
    };*/

    document.getElementById("dataLigne").innerHTML = " Fichier: " + dataJSON.location.file + ", ligne numero: " + dataJSON.location.line
    retour = creerNoeud(dataJSON);
    creerNode(sys,retour)
    CreerStack();
}

function CreerStack(){
    //ancienne liste de stack
    var exListStack = []
    if(listStack!=[]){
        listStack.forEach(element => {
            if(element.deplie)exListStack.push(element.name);
        });
    }

    listStack = [];
    var listnomframe = []
    var comptenomframe = []
    var compte_stack = 0;
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


        var is_deplie = false;
        if(appartientListe(element.name,exListStack)){
            is_deplie = true;
        }

        listStack.push(Object.assign({deplie:is_deplie,nbElem:compte},element));
       
        compte_stack++;
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



function creationNodesRecursives(champs,parent){
    if(champs == undefined)return;
    champs.forEach(lechamp => {
        var champ = lechamp.value;
        if(typeof champ == "object"){
                if(!appartientListe(champ.base.type,listeCouleur)){
                    listeCouleur.push(champ.base.type);
                    var couleur = couleurRandom();
                    listeCouleurAssocier.push(couleur);	
                }
            
            var posX = canvas.width/30;
            //on créé les legendes à partir de la liste de couleur 
            for(let i = listeCouleurActive.length; i < listeCouleur.length;i++){
                listeCarre.push(new carre(ctx,posX + i * canvas.width/15,canvas.height/30,canvas.width/15,canvas.height/15,listeCouleurAssocier[i],listeCouleur[i],"Arial"));
                listeCouleurActive.push(true);
            }
       
           //mettres les nouvelles nodes
           var symb;
               if(champ.base.symbol_name != null)symb =  champ.base.symbol_name;
               else {
                   symb =  champ.base.adresse;
               }
       
               /////////////savoir si la node est active////////////////
               //COULEUR
               var posCouleur = 0;
               for(let i = 0;i < listeCouleur.length;i++){
                   if(listeCouleur[i] == champ.type)posCouleur = i;
               }
               //PILE
               var actifPile = true;
               
               //si la pile est active au coup d'avant
               if(pileActive){
                   actifPile = casPileActive(champ.adresse);
               }
               /////////////////////////////////////////////////////////
               let estDeplie = true 
               listeNode.forEach(node => {
                   if(champ.base.address == node.name)estDeplie = node.data.deplie
               });
               sys.addNode(champ.base.address,{nom:symb,type:champ.base.type,tableau:champ.elements,active:listeCouleurActive[posCouleur],deplie:estDeplie,actifPile:actifPile,typeGenerique:champ["meta-type"],champs:champ.fields,valeurScalaire:champ.value,is_pointer:champ.is_pointer});
               var pos = 0;
                var maxfield = 0;
                if(sys.getNode(parent).data.champs != undefined){
                    maxfield = sys.getNode(parent).data.champs.length-1;
                    for(let i = 0; i<sys.getNode(parent).data.champs.length;i++){
                        if(sys.getNode(parent).data.champs[i].value.base && sys.getNode(parent).data.champs[i].value.base.address == champ.base.address)pos = i;
                    }
                }
               sys.addEdge(parent,champ.base.address,{parent:parent,enfant:champ.base.address,compte_field:pos,max_field:maxfield,integre:true});
               //si on a une recursion
               creationNodesRecursives(champ.champs,champ.base.address);
        }
    });
}


function creerNode(sys,liste){
    listVariablesPile = [];
    dataJSON.stack.forEach(element => {
        element.variables.forEach(variable => {
            listVariablesPile.push(variable);
        });
    });

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
        listeCarre.push(new carre(ctx,posX + i * canvas.width/15,canvas.height/30,canvas.width/15,canvas.height/15,listeCouleurAssocier[i],listeCouleur[i],"Arial"));
        listeCouleurActive.push(true);
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
        let estDeplie = true 
        listeNode.forEach(node => {
            if(element.adresse == node.name)estDeplie = node.data.deplie
        });
        sys.addNode(element.adresse,{nom:symb,type:element.type,tableau:element.tableau,active:listeCouleurActive[posCouleur],deplie:estDeplie,actifPile:actifPile,typeGenerique:element.typeGenerique,champs:element.champs,valeurScalaire:element.valeurScalaire,is_pointer:element.is_pointer});
        
        //si on a une recursion
        creationNodesRecursives(element.champs,element.adresse);
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

    if(pileActive){
        sys.eachNode(function(node, pt){
            listVariablesPile.forEach(variable => {
                if(node.name == variable.address){
                    node.data.actifPile = false;
                }
            });
        })
    }
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
    Taille = 12
    if(texte.length>15){
        texte = texte.substr(0,12);
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

        if(nbSaut%2 == 1 && nbSaut != 0)coordY-= ((nbSaut/2 << 0) * Taille)/2
        else if(nbSaut != 0)coordY-= (((nbSaut/2 << 0)) + 0.5 * Taille)/2
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

document.getElementById("TimeLine").style.width = document.getElementById("viewport").width * 0.5;
document.getElementById("TimeLine").oninput = timeLine

document.addEventListener('keyup',dealWithKeyboard)

function dealWithKeyboard(e) {
    if(!open)return
    if(e.key == "ArrowRight"){
        e.preventDefault()
        flecheDroit()
    }
    if(e.key == "ArrowLeft"){
        e.preventDefault()
        flecheGauche()
    }
    if(e.key == "n"){
        NS()
    }
    if(e.key == "b"){
        bloqueForce()
    }
}

var forcesOn = true
function bloqueForce(){
    if(forcesOn){
        sys.parameters({friction:1,repulsion:0,stiffness:0})
    }
    else sys.parameters({friction:0.5,repulsion:10000,stiffness:500})
    forcesOn = !forcesOn
}


function flecheDroit(){
    if(document.getElementById("TimeLine").value == 1 || tailleProgramme == 0){
        plus1()
    }
    else{
        var incremente = 0;
        var finalpos = undefined;
        var position = document.getElementById("TimeLine").value * tailleProgramme;
        for (let index = 0; index < decaleDepuisLastJSON.length; index++) {
            if(position == incremente){
                finalpos = index;
                pos_slide = index;
            }
            incremente += decaleDepuisLastJSON[index];
         }
        document.getElementById("TimeLine").value = parseFloat(document.getElementById("TimeLine").value ) + (decaleDepuisLastJSON[finalpos]/tailleProgramme)
        timeLine();
    }
}   

function flecheGauche(){
    if(document.getElementById("TimeLine").value == 0 || tailleProgramme == 0){
        return;
    }else{
        var incremente = 0;
        var finalpos = undefined;
        var position = document.getElementById("TimeLine").value * tailleProgramme;
        for (let index = 0; index < decaleDepuisLastJSON.length; index++) {
            if(position >= incremente && position <= incremente + decaleDepuisLastJSON[index]){
                finalpos = index;
                pos_slide = index; 
            }
            incremente += decaleDepuisLastJSON[index];
        }
        if(document.getElementById("TimeLine").value < 1 || fin)finalpos--
        document.getElementById("TimeLine").value = parseFloat(document.getElementById("TimeLine").value ) - (decaleDepuisLastJSON[finalpos]/tailleProgramme)
        timeLine();
    }
}

document.getElementById("plus1").onclick = plus1;
document.getElementById("plus5").onclick = plus5;
document.getElementById("plus10").onclick = plus10;
document.getElementById("NS").onclick = NS;


function NS(){
    if(document.getElementById("NS").value == "Next"){
        document.getElementById("NS").value = "Step"
    }
    else{
        document.getElementById("NS").value = "Next"
    }
}

function AvanceGDB(i){
    if(document.getElementById("NS").value == "Next")envoieServeur("n " + i);
    else envoieServeur("s " + i);
    envoieServeur("print_memory -j");
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

var decaleDepuisLastJSON = [];//stockera le decalage entre chaque frame enregistré
var tailleProgramme = 0
bloc = false;
var last_nb = 0;

function plus(nb,saut){
    if(!open)return
    if(bloc)return;
    if(document.getElementById("is_connected").style.color != "green")return;
    updateTimeline(nb);
    if(!saut)AvanceGDB(nb);//on avance de nb pas
    decaleDepuisLastJSON.push(nb);//on ajoute de cb de pas on est avancer cette fois ci
    listeSautJSON.push(saut != undefined)

    sys.renderer.redraw()
}

function updateTimeline(nb){
    document.getElementById("TimeLine").value = 1;
    tailleProgramme+=nb;
    last_nb = nb;
}

function updateTimelineGraphique(){//rajout des marques en CSS
    if(decaleDepuisLastJSON.length == 0)return;
    var incremente = 0;
    var ajout = "linear-gradient(to right, rgb(204, 204, 204) 0%"
    for (let index = 0; index < decaleDepuisLastJSON.length; index++) {
        var couleur = "rgb(204, 204, 204)"
        var ex_color = "rgb(204, 204, 204)"
        if(listeSautJSON[index])couleur = "rgb(255, 50, 50)"
        if(index > 0 &&listeSautJSON[index - 1])ex_color = "rgb(255, 50, 50)"
        var pos = incremente/tailleProgramme * 100;
        if(pos!=0)ajout += ", " +  ex_color + " " + (pos-0.1) + "%, rgb(0, 0, 0) " + pos +"%, " + couleur +" " + (pos+0.1) + "%";
        else ajout += ", rgb(0, 0, 0) " + (pos+0.01) +"%, " + couleur + " " + (pos+0.1) + "%";
        incremente += decaleDepuisLastJSON[index];
     }
     ajout += ", " + couleur + "99.8%,rgb(0, 0, 0) 99.9%,rgb(204, 204, 204) 100%)"
     document.getElementById("TimeLine").style.backgroundImage  = ajout;
}

function timeLine(){
    if(tailleProgramme == 0){
        document.getElementById("TimeLine").value = 0.5
        return
    }
    var position = document.getElementById("TimeLine").value * tailleProgramme;
    position = Math.round(position);

    var incremente = 0;
    var finalpos = undefined;
    var pas = 0;
    var pos_slide = 0;
    for (let index = 0; index < decaleDepuisLastJSON.length; index++) {
       if(position >= incremente && position <= incremente + decaleDepuisLastJSON[index]){
            if(position - incremente < (incremente + decaleDepuisLastJSON[index]) - position){
                finalpos = index;
                pas = incremente;
                pos_slide = index;
            }
            else{
                finalpos = index + 1;
                pas = incremente + decaleDepuisLastJSON[index];
                pos_slide = index + 1;
            }
       }
       incremente += decaleDepuisLastJSON[index];
    }
   
    if(listeJSON[finalpos] != lastMessageValide){
        ouvrirJSON(sys,listeJSON[finalpos]);
        document.getElementById("pas").innerHTML = "Pas actuel : " + pas;
    }
    document.getElementById("TimeLine").value = pas/tailleProgramme;
    lastMessageValide = listeJSON[finalpos];
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



///////fonctions useless/////////////
table = "(╯°□°）╯︵ ┻━┻"
credit();
function credit(){
    console.log("Moly : Developpé par Théo Barrolet et Aurelien Flori");
    console.log("Lotos : Developpé par Thomas Hervé");
    return table;
}
//////////////////////////////////

///\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\\\
//\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\FONCTIONS DE MANIPULATIONS DES NOEUDS ET EDGES/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\\\

function updateJSON(data){
    dataJSON = JSON.parse(data);
    nouvellesNodes(data.nodes.new);
    modifNodes(data.nodes.modified);
    supprNodes(data.nodes.deleted);
    supprEdge(data.edges.deleted);
    nouveauxEdges(data.edges.new);
    CreerStack();
    refresh();
}

function nouveauxEdges(edges){
    edges.forEach(element => {
        var pos = 0;
        var maxfield = 0;
        if(sys.getNode(element[0]).data.champs != undefined){
            maxfield = sys.getNode(element[0]).data.champs.length-1;
            for(let i = 0; i<sys.getNode(element[0]).data.champs.length;i++){
                if(sys.getNode(element[0]).data.champs[i].is_pointer &&sys.getNode(element[0]).data.champs[i].value == enfant.adresse)pos = i;
            }
        }
        sys.addEdge(element[0],element[1],{parent:element[0],enfant:element[1],compte_field:pos,max_field:maxfield});
    });

    //securité pour la pile
    if(pileActive){
        sys.eachNode(function(node, pt){
            listVariablesPile.forEach(variable => {
                if(node.name == variable.address){
                    node.data.actifPile = false;
                }
            });
        })
    }
}

function supprEdge(edges){
    edges.forEach(element => {
        sys.eachEdge(function(edge, pt1, pt2){
            if(edge.data.parent == element[0] && edge.data.enfant == element[1]){
                sys.pruneEdge(edge);
            }
        })
    });
}

function supprNodes(nodes){
    nodes.forEach(element => {
        sys.pruneNode(element.base.address);
    });
}


function modifNodes(nodes){
    nodes.forEach(element => {
        if(typeof element.valeur == "object"){
            nouvellesNodes([element]);
        }else{
        var sous_node = sys.getNode(element.base.address);
        if(element.base.symbol_name != null)symb =  element.base.symbol_name;
        else {
            symb =  element.base.adresse;
        }
        sous_node.data.nom = symb;
        sous_node.data.type = element.base.type;
        sous_node.data.tableau = element.elements;
        sous_node.data.typeGenerique = element["meta-type"];
        sous_node.data.champs = element.fields;
        sous_node.data.valeurScalaire = element.value;
        sous_node.data.is_pointer = element.is_pointer;
    }
    });

}

function nouvellesNodes(nodes){
    //remettre la pile à jour
    listVariablesPile = [];
    dataJSON.stack.forEach(element => {
        element.variables.forEach(variable => {
            listVariablesPile.push(variable);
        });
    });

     //les couleurs
     var posX = canvas.width/30;
     //Chaque couleur est generer si le type n'a pas de couleur assigné
     nodes.forEach(element => {
         if(!appartientListe(element.base.type,listeCouleur)){
             listeCouleur.push(element.base.type);
             var couleur = couleurRandom();
             listeCouleurAssocier.push(couleur);	
         }
     });

     //on créé les legendes à partir de la liste de couleur 
     for(let i = listeCouleurActive.length; i < listeCouleur.length;i++){
         listeCarre.push(new carre(ctx,posX + i * canvas.width/15,canvas.height/30,canvas.width/15,canvas.height/15,listeCouleurAssocier[i],listeCouleur[i],"Arial"));
         listeCouleurActive.push(true);
     }

    //mettres les nouvelles nodes
    var symb;
    nodes.forEach(element => {
        if(element.base.symbol_name != null)symb =  element.base.symbol_name;
        else {
            symb =  element.base.adresse;
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
        sys.addNode(element.base.address,{nom:symb,type:element.base.type,tableau:element.elements,active:listeCouleurActive[posCouleur],deplie:true,actifPile:actifPile,typeGenerique:element["meta-type"],champs:element.fields,valeurScalaire:element.value,is_pointer:element.is_pointer});
        //si on a une recursion
        creationNodesRecursives(element.champs,element.base.address);
    });
}