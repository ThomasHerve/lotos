
document.getElementById("selec").onclick = file;
var fichier_valide = false;

function file(){
    if(connection.readyState === 1) {
        connection.send("load-file " + document.getElementById("file").value);
    }
}

document.getElementById("clic").onclick = envoie;

function envoie(){
    if(connection.readyState === 1) {
        connection.send(document.getElementById("input").value);
    }
}

document.onkeyup = function(e) {
  if(e.which == 13){
    envoie();
  }
};
