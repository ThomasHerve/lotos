let host = 'localhost';
let port = '9999';
var connection = new WebSocket('ws://'+host+':'+port);

connection.onopen = function(){
	console.log("Connection with gdb server opened");
	document.getElementById("is_connected").style.color = "green";
	document.getElementById("is_connected").innerHTML = "Connected !"
};


connection.onmessage = function(e){
	/* Change ici quoi faire lorsque tu reçois un message dans e.data */
	
	document.getElementById("msg").innerHTML = e.data;
	if(!fichier_valide){
		if(e.data.split(" ")[1] == "successfuly" && e.data.split(" ")[2] == "initialized"){
			fichier_valide = true;
			document.getElementById("image").src = "images/valide.png";
		}
	}
	// Par exemple
	//response_text.innerHTML = e.data;
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
