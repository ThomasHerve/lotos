document.getElementById("bouton").onclick = clic;
function clic(){
   var retour =  document.getElementById("Utilisateur").value;
   //console.log(connection.send(retour));
   connection.send(retour);
}