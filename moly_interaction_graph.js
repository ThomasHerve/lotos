let host = 'localhost';
let port = '9999';
var connection = new WebSocket('ws://'+host+':'+port);
var lastMessage = "";
var fin = false;
var lastMessageValide = "";
var listeJSON = [];

connection.onopen = function(){
	console.log("Connection with gdb server opened");
	connection.send("load-file /mnt/c/Users/therv/Desktop/VisualStudioCode/HTMLCSS/Librairie_graphique_personnalisé/moly/progs/theo/dummy_list");
	connection.send("n");
	connection.send("print_memory -j")
};

//connection.send("coucou");

connection.onmessage = function(e){
	/* Change ici quoi faire lorsque tu reçois un message dans e.data */
	var temp = e.data;
	if(temp != "Error occurred in Python command: local variable 'output' referenced before assignment"){
		lastMessage = "";
		for(let i = 0;i <temp.length - 2;i++){
			if(temp[i] != "\\")lastMessage+= temp[i];
		}
		essaie = true;
		try{
			JSON.parse(lastMessage)
		}
		catch(error){
			essaie = false;
		}
		if(essaie){
			listeJSON.push(lastMessage);
			document.getElementById("TimeLine").max++;
			position = listeJSON.length;
			compteIter--;
			if(compteIter <= 0){
				ouvrirJSON(sys,lastMessage);
				bloc = false;
				document.getElementById("pas").innerHTML = "Pas actuel : " + position;
				document.getElementById("TimeLine").value = (position)/listeJSON.length * document.getElementById("TimeLine").max;
				lastMessageValide = lastMessage;
			}
			else lastMessageValide = lastMessage;
		}
	}
	else if (!fin){
		fin = true;
		tailleProgramme = listeJSON.length;
		document.getElementById("etat").innerHTML = "Le programme a été entierement parcouru, pas totaux : " + tailleProgramme.toString();
		ouvrirJSON(sys,lastMessageValide);
		bloc = false;
		document.getElementById("pas").innerHTML = "Pas actuel : " + position;
		document.getElementById("TimeLine").value = (position)/listeJSON.length * document.getElementById("TimeLine").max;

		document.getElementById("plus1").style.backgroundColor  = "#AAAAAA";
		document.getElementById("plus5").style.backgroundColor  = "#AAAAAA";
		document.getElementById("plus10").style.backgroundColor  = "#AAAAAA";
	}
};

connection.onclose = function(){
	console.log("Connection with gdb server closed");
};

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
