

var mattBirthday = '23 Jul 1994 14:36:23 CDT'
var mattMoment;

var weekSize = 8;
var weekMargin = 5;
var numYears = 90;

var gridX = 30;
var gridY = 10;


function setup() {
	createCanvas(windowWidth, windowHeight, P2D);

	mattMoment = moment(mattBirthday)
	console.log(mattMoment)
	
	noLoop();
}

function draw(){
	background(255);

	strokeWeight(1);
 	
	var currentWeek = mattMoment.clone();

	textFont('monospace')

	for(var year = 0; year < numYears; year++) {
		currentWeek = mattMoment.clone().add(year, 'years')

		fill('#000')
		noStroke();
		textSize(10)
		text(str(year).padStart(2,' '), gridX - 20, year * (weekSize + weekMargin) + 18)

		for(var week = 0; week < 52; week++) {

			var x = (week * (weekSize + weekMargin)) + 0.5 + gridX
			var y = (year * (weekSize + weekMargin)) + 0.5 + gridY

			if(currentWeek < moment()) {
				stroke('#6ad5fc')
				fill('#6ad5fc')
			} else {
				stroke('#AAA')
				fill('#FFF')
			}
			
			rect(x, y, weekSize, weekSize);
			
			currentWeek.add(7, 'days');
		}
	}
}