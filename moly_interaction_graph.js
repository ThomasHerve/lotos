let host = 'localhost';
let port = '9999';
var connection = new WebSocket('ws://'+host+':'+port);
var lastMessage = "";
var fin = false;
var lastMessageValide = "";
var listeJSON = [];
var listeJSONObjet = []
var listeCommande = []
var listeSautJSON = []
var test = true//mettre true pour les tests
var open = false
var lastEnvoie = ""
var vientDeConsole = false
var compteOpen = -1

connection.onopen = function(){
	console.log("Connection with gdb server opened");
	document.getElementById("is_connected").style.color = "green";
	document.getElementById("is_connected").innerHTML = "Connected !"
	if(test){
		envoieServeur("load-file /mnt/c/Users/therv/Desktop/VisualStudioCode/HTMLCSS/Librairie_graphique_personnalisé/moly/progs/theo/dummy_list");
	}
	
};

connection.onmessage = function(e){
	/* Change ici quoi faire lorsque tu reçois un message dans e.data */
	var temp = e.data;

	if(compteOpen > 2 && !estConforme(lastEnvoie) && lastEnvoie != "print_memory -j"){
		ajoutLog(temp)
		return
	}


	if(test && e.data.split(" ")[1] == "successfuly" && e.data.split(" ")[2] == "initialized"){
		compteOpen = 0
		envoieServeur("print_memory -j");
		document.getElementById("image").src = "images/valide.png";
		document.getElementById("TimeLine").value = 0.5;
		return
	}
	if(!open){
		if(!test && e.data.split(" ")[1] == "successfuly" && e.data.split(" ")[2] == "initialized"){
			compteOpen = 0
			envoieServeur("print_memory -j");
			document.getElementById("image").src = "images/valide.png";
			document.getElementById("TimeLine").value = 0.5;
			return
		}
	}

	switch(compteOpen){
		case -1:
			return
		case 0:
			envoieServeur("n 0");
			document.getElementById("image").src = "images/valide.png";
			compteOpen = 2
			open = true
			break
		case 2:	
			compteOpen = 3
			break
	}



	if(temp != "Error occurred in Python command: local variable 'output' referenced before assignment" && temp != "Error occurred in Python command: 1"){
		lastMessage = temp
		essaie = true;
		try{
			JSON.parse(lastMessage)
		}
		catch(error){
			
			if(!estConforme(lastEnvoie) && lastEnvoie != "print_memory -j")return
			while(!isNaN(parseInt(lastMessage[0], 10))){		
				lastMessage = lastMessage.substring(1);
			}
			while(lastMessage[0] == "\\" && lastMessage[1] == "t"){
				lastMessage = lastMessage.substring(2);
			}
			listeCommande.push(lastMessage)
			document.getElementById("suivant").innerHTML = "Ligne prochainement executée : " + lastMessage;
			essaie = false;
			
		}
		if(essaie){
			listeJSON.push(lastMessage);
			listeJSONObjet.push(JSON.parse(lastMessage))
			lastMessageValide = lastMessage;
			let sortie = JSON.parse(lastMessage)
			if(sortie.nodes.new != undefined)updateJSON(lastMessage);
			else ouvrirJSON(sys,lastMessage);
			document.getElementById("pas").innerHTML = "Pas actuel : " + tailleProgramme;
			updateTimelineGraphique();
		}
	}
	else if (!fin){
		fin = true;
		tailleProgramme -= last_nb;
		document.getElementById("pas").innerHTML = "Pas actuel : " + tailleProgramme;
		updateTimelineGraphique();
		document.getElementById("etat").innerHTML = "Le programme a été entierement parcouru, pas totaux : " + tailleProgramme.toString();
		bloc = true;

		document.getElementById("plus1").style.backgroundColor  = "#AAAAAA";
		document.getElementById("plus5").style.backgroundColor  = "#AAAAAA";
		document.getElementById("plus10").style.backgroundColor  = "#AAAAAA";
	}
};

connection.onclose = function(){
	console.log("Connection with gdb server closed");
};


document.getElementById("selec").onclick = envoie;

function envoie(){
    if(connection.readyState === 1) {
		envoieServeur("load-file " + document.getElementById("file").value);
		document.getElementById("TimeLine").value = 0.5
		if(open){
			tailleProgramme = 0;
			document.getElementById("pas").innerHTML = "Pas actuel : " + tailleProgramme;
			decaleDepuisLastJSON = []
			updateTimelineGraphique();
			var ajout = "linear-gradient(to right, rgb(204, 204, 204) 0%"
			ajout += ", rgb(204, 204, 204) 99.8%,rgb(0, 0, 0) 99.9%,rgb(204, 204, 204) 100%)"
			document.getElementById("TimeLine").style.backgroundImage  = ajout;
			open = false
		}
    }
}


document.getElementById("boutonConsole").onclick = consoleEnvoie;

function consoleEnvoie(){
	if(connection.readyState === 1){
		var msg = document.getElementById("inputConsole").value
		msg = msg.toLowerCase()
		chaine = msg.split(" ")
		if(estConforme(msg)){
		    if(chaine[0] == "n" ||chaine[0] == "next"||chaine[0] == "s"||chaine[0] == "step"){
				if(((chaine[0] == "n" ||chaine[0] == "next")&&(document.getElementById("NS").value == "Step"))||((chaine[0] == "s" ||chaine[0] == "step")&&(document.getElementById("NS").value == "Next")))NS();
				if(chaine.length == 2){
					 if(!isNaN(parseInt(chaine[1])) && !fin){
						console.log(parseInt(chaine[1]))
						plus(parseInt(chaine[1]))
					 }
				}
				else if(chaine.length == 1 && !fin)plus1()
			}
			else{
				plus(1,true)
				envoieServeur(msg)
				envoieServeur("print_memory -j")
			}
		}
		else{
			envoieServeur(msg)
		}
	}
}

function ajoutLog(msg){
	document.getElementById("sortie3").innerHTML = document.getElementById("sortie2").innerHTML
	document.getElementById("sortie2").innerHTML = document.getElementById("sortie1").innerHTML
	document.getElementById("sortie1").innerHTML = msg
}

function envoieServeur(msg){
	lastEnvoie = msg
	connection.send(msg)
}


function estConforme(msg){
	msg = msg.toLowerCase()
	chaine = msg.split(" ")
	if(msg == "n" || msg == "s" || msg == "next" || msg == "step" || msg == "continue" || msg == "c" || msg == "until" || msg == "u")return true
	else if(chaine[0] == "n" ||chaine[0] == "next"||chaine[0] == "s"||chaine[0] == "step"){
		if(chaine.length == 2){
			try{
				return !isNaN(parseInt(chaine[1]))
			}
			catch{
				return false
			}
		}
	}
	return false;
}
/*
let command_text = document.getElementById("command-text");
let send_button = document.getElementById("send-command");
let response_text = document.getElementById("gdb-response");

send_button.onclick = function (e) {
	response_text.innerHTML = command_text.value;
	if(connection.readyState === 1) {
		envoieServeur(command_text.value);
	} else {
		console.log("Websocket not available");
	}
};*/

/* Pour envoyer une demande au serveur :
 * if(connection.readyState === 1) {
 *     envoieServeur(string_command);
 * } else {
 *     // Erreur
 * }
 *
 * la commande peut être une commande gdb générique comme next, step, n 5, etc
 * la commande pour demander un json est:
 * print_memory -j
 * il faut rajouter l'option -r (print_memory -j -r) pour avoir un contenu lisible (et pas condensé)
 *
 * /!\ Il faut utilise la commande load-file <chemin vers le fichier> pour charger un fichier et non*
 * la commande générique file, load-file s'occupe de charger moly et la surcharge de malloc */
