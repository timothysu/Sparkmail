//Task to be completed: Take an existing image and resize to given LxW -- this is done to limit the size of images sent and viewed.

//creates the variable image that would be the image sent by the user
var image = require('image');

//locates the image and resizes the image. 
image('') //insert path here
.resize(480, 960) //resizes the image to fit within a box of 480x960 while maintaining the original aspect ratio
.autoOrient() //Auto-orients the image according to its EXIF data
