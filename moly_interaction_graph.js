let host = 'localhost';
let port = '9999';
var connection = new WebSocket('ws://'+host+':'+port);
var lastMessage = "";
var fin = false;
var lastMessageValide = "";
var listeJSON = [];
var listeCommande = []
var test = true//mettre true pour les tests
var open = false
var first = true

connection.onopen = function(){
	console.log("Connection with gdb server opened");
	if(test){
		document.getElementById("image").src = "images/valide.png";
		connection.send("load-file /mnt/c/Users/therv/Desktop/VisualStudioCode/HTMLCSS/Librairie_graphique_personnalisé/moly/progs/theo/dummy_list");
		connection.send("print_memory -j");
		connection.send("n 0");
		connection.send("n");
		connection.send("print_memory -j")
		open = true
		document.getElementById("TimeLine").value = 0.5
	}
	document.getElementById("is_connected").style.color = "green";
	document.getElementById("is_connected").innerHTML = "Connected !"
};

connection.onmessage = function(e){
	/* Change ici quoi faire lorsque tu reçois un message dans e.data */
	var temp = e.data;
	if(test && e.data.split(" ")[1] == "successfuly" && e.data.split(" ")[2] == "initialized")return
	if(!open){
		if(!test && e.data.split(" ")[1] == "successfuly" && e.data.split(" ")[2] == "initialized"){
			connection.send("print_memory -j");
			open = true;
			document.getElementById("image").src = "images/valide.png";
			connection.send("n 0");
			connection.send("n");
			connection.send("print_memory -j");
			document.getElementById("TimeLine").value = 0.5;
			return
		}
	}


	if(temp != "Error occurred in Python command: local variable 'output' referenced before assignment" && temp != "Error occurred in Python command: 1"){
		lastMessage = temp
		essaie = true;
		try{
			JSON.parse(lastMessage)
		}
		catch(error){
			while(!isNaN(parseInt(lastMessage[0], 10))){		
				lastMessage = lastMessage.substring(1);
			}
			
			while(lastMessage[0] == "\\" && lastMessage[1] == "t"){
				lastMessage = lastMessage.substring(2);
			}
			listeCommande.push(lastMessage)
			document.getElementById("suivant").innerHTML = "Ligne prochainement executée : " + lastMessage;
			if(listeCommande.length > 1)document.getElementById("courant").innerHTML = "Ligne courante : " + listeCommande[listeCommande.length-2];
			essaie = false;
		}
		if(essaie){
			listeJSON.push(lastMessage);
			lastMessageValide = lastMessage;
			let sortie = JSON.parse(lastMessage)
			if(sortie.nodes.new != undefined)updateJSON(lastMessage);
			else ouvrirJSON(sys,lastMessage);
			document.getElementById("pas").innerHTML = "Pas actuel : " + tailleProgramme;
			updateTimelineGraphique();
			var ex = JSON.parse(listeJSON[listeJSON.length-2])
			document.getElementById("dataLigne").innerHTML = " Fichier: " + ex.location.file + ", ligne numero: " + ex.location.line
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
		connection.send("load-file " + document.getElementById("file").value);
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

/*
let command_text = document.getElementById("command-text");
let send_button = document.getElementById("send-command");
let response_text = document.getElementById("gdb-response");

send_button.onclick = function (e) {
	response_text.innerHTML = command_text.value;
	if(connection.readyState === 1) {
		connection.send(command_text.value);
	} else {
		console.log("Websocket not available");
	}
};*/

/* Pour envoyer une demande au serveur :
 * if(connection.readyState === 1) {
 *     connection.send(string_command);
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
