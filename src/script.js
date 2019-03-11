
 var canvas,ctx;
 var zip;
 var imgElement;
 var imgTargetId;
 var images={};
 var folders={};

 //Create a enum like object to easily reference desired platforms
 const osTypes={ios:"ios",android:"android"};
 Object.freeze(osTypes);
 const orientation={portrait:"portrait",landscape:"landscape"};
 Object.freeze(orientation);
 //  1242 x 2208 pixels (portrait)
    //  2208 x 1242 pixels (landscape
 const sizeProfiles={
   "portrait5.5": {height:2208,width:1242},
   "landscape5.5": {height:1242,width:2208}
};




window.onload = function(){
  //Canvas should be loaded and ready to reference
  canvas = document.getElementById("previewCanvas");
  ctx = canvas.getContext("2d");
  //Get the canvas to init
  ctx.stroke();
   //Reference an element just to get the image accessable to draw on canvas
  imgElement = document.getElementById("loadedimage");
  initZip();
  

};

function imgRendered() {
  //Render complete
  drawImage();
  console.log("should be rendered");
}

function startImgRender() {
  //Rendering start
  requestAnimationFrame(imgRendered);
}

function imgLoaded()  {
  requestAnimationFrame(startImgRender);
}
function onFileSelected(event) {
  //Triggered after file selected
    var reader = new FileReader();
    var selectedFile = event.target.files[0];

 

    reader.onload = function(event) {
      imgElement.title = selectedFile.name;
      imgElement.src = event.target.result;
     
      
      if(imgElement && imgElement.naturalWidth && imgElement.naturalWidth>0 && imgElement.naturalHeight && imgElement.naturalHeight>0){
        imgLoaded()
        var imageObject={fileName:imgElement.title ,width:imgElement.naturalWidth,height:imgElement.naturalHeight};
      imgTargetId=imageObject.fileName;

      images[imageObject.fileName]=imageObject;
      console.log(images);
 
    }else{
      console.log("Failed to load Image");
    
    };
  
  }
  reader.readAsDataURL(selectedFile);

}

function drawImage(){
var imageObject= images[imgTargetId];
var targetWidth=0,targetHeight=0;

  if(imageObject.width>=imageObject.height){
    imageObject["orientation"]=orientation.landscape;
    targetHeight=sizeProfiles["landscape5.5"].height;
    targetWidth=sizeProfiles["landscape5.5"].width;

  }else{
    imageObject["orientation"]=orientation.portrait;
    targetHeight=sizeProfiles["portrait5.5"].height;
    targetWidth=sizeProfiles["portrait5.5"].width;
  }
  canvas.height=targetHeight;
  canvas.width=targetWidth;
  ctx.drawImage(imgElement,0,0,canvas.width,canvas.height);
  //Try force a canvas update
  ctx.stroke();
}

function initZip(){
  //JSZip.js Library
   zip = new JSZip();
  zip.file("Hello.txt", "Thank you for using APP Screenshot Generator\n");
  initZipFolders();
}
function initZipFolders(){
//For each defined os defined u osTypes
  Object.entries(osTypes).forEach(os => {
    let value = os[1];
    folders[value]= zip.folder(value);

  })
}
function addToZip(imgName,imgUrl,osType){
  //Create the image file in the zip
  folders[osType].file(imgName, imgUrl.split('base64,')[1],{base64: true});

}
function downloadAsZip(){
var imgData = canvas.toDataURL();
//For now just add one file to zip before downloading
addToZip("default.jpg",imgData,osTypes.ios);
zip.generateAsync({type:"blob"})
.then(function(content) {
    // FileSaver.js Library
    saveAs(content, "screenshots.zip");
});
}