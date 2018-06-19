
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

function envoieURL(dataURL){
    if(connection.readyState === 1) {
        var file =new Blob([dataURL], {type: "application/octet-stream"})
        console.log("load-file " + file)
        //connection.send("load-file " + file);
    }
}

document.onkeyup = function(e) {
  if(e.which == 13){
    envoie();
  }
};


var onFilesSelected = function(event) {
    var input = event.target;

    var reader = new FileReader();
    reader.onload = function(){
      var dataURL = reader.result;
      //dataURL = "/mnt/c/Users/therv/Desktop/VisualStudioCode/HTMLCSS/Librairie_graphique_personnalisé/moly/progs/theo/dummy_list"
      envoieURL(dataURL)
    };
    reader.readAsBinaryString(input.files[0]);
  };


  //( ͡° ͜ʖ ͡°)( ͡° ͜ʖ ͡°)( ͡° ͜ʖ ͡°)( ͡° ͜ʖ ͡°)( ͡° ͜ʖ ͡°)( ͡° ͜ʖ ͡°)( ͡° ͜ʖ ͡°)( ͡° ͜ʖ ͡°)( ͡° ͜ʖ ͡°)( ͡° ͜ʖ ͡°)( ͡° ͜ʖ ͡°)( ͡° ͜ʖ ͡°)( ͡° ͜ʖ ͡°)( ͡° ͜ʖ ͡°)( ͡° ͜ʖ ͡°)( ͡° ͜ʖ ͡°)( ͡° ͜ʖ ͡°)( ͡° ͜ʖ ͡°)( ͡° ͜ʖ ͡°)