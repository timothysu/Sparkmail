
var paintText = function(gm, baseImgPath, incomingTxt, fontSize, spaceSize) {

        // starting pos of first text line, number of words per line
		var x = 10,
			y = 10,
			wrdsPerLine = 9;

		// get array of words in body
		console.log(incomingTxt);
		var wrdArray = incomingTxt.split(' ');
		console.log(wrdArray[0]);
		console.log(wrdArray[1]);

		// get number of words, number of lines
		var wrdCount = wrdArray.length,
			lines = Math.ceil(wrdCount / wrdsPerLine),
			height = lines*70;

		// resize based on number of lines
        // debug:: new image written to /public/img/2

		// for each line, print out the
		//for (var i=0; i<lines; i+=wrdsPerLine) {
			for (var j=0; j<=wrdArray.length; j++) {
				console.log(j);
				gm(baseImgPath).font('Arial.ttf').fontSize(14).fill("#000000").drawText(x, y, wrdArray[j]).write('./content/2.gif',
                                                               function(e){
            if (!e) {
							//console.log(j);
                console.log(wrdArray[j]);
							}
            else
                console.log(e);
        });;
				x += wrdArray[j].length*fontSize + spaceSize;
			}
			//y += 2*fontSize;
		//}
	};

// exports this module to global
module.exports = paintText;
