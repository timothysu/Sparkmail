
	var paintText = function(gm, baseImgPath, incomingTxt, fontSize, spaceSize) {

        console.log("paintText called");


        // starting pos of first text line, number of words per line
		var x = 10,
			y = 10,
			wrdsPerLine = 9;

		// get array of words in body
		var wrdArray = incomingTxt.split(' ');

		// get number of words, number of lines
		var wrdCount = wrdArray.length,
			lines = wrdCount / wrdsPerLine,
			height = lines*70;

		// resize based on number of lines
        // debug:: new image written to /public/img/2
		gm(baseImgPath).resize(480, height).write('./content/2.gif',
                                                               function(e){
            if (!e)
                console.log('good');
            else
                console.log(e);
        });

		// for each line, print out the
		for (var i=0; i<lines; i+=wrdsPerLine) {
			for (var j=0; j<wrdArray.length; j++) {
				gm(baseImgPath).font('Arial.ttf').drawText(x, y, wrdArray[j]).write('./content/2.gif', 
                                                               function(e){
            if (!e)
                console.log('good');
            else
                console.log(e);
        });;
				x += wrdArray[j].length*fontSize + spaceSize;
			}
			y += 2*fontSize;
		}
	};

// exports this module to global
module.exports = paintText;
