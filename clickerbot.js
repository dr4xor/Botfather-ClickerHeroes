var CLICKERHEROES_URL = "https://www.clickerheroes.com/";

// IMAGE SOURCES
var PLAY_PNG = "src/btn_play.png";
var SKULL_PNG = "src/skull.PNG";
var CLOSE_PNG = "src/btn_close.PNG";
var UPGRADE_PNG = "src/btn_upgrade.PNG";
var LVL_RIGHT_PNG = "src/btn_lvl_right.PNG";

//## CLICK AREA DETECTION ##

// Detects the skull underneath the healthbar and
// determines the position of the enemy relative to it.

var ENEMY_OFFSET = new Point(0, -250); //Is added to the skull position
var enemyPos;

//##########################


//## NEXT LEVEL DETECTION ##

// Calculates the positon of the button
// which loads the next level

var NEXT_LVL_OFFSET = new Point(-120, 0);
var nextLvlPos;

//##########################


//## CLICK LOOP ############

var SLEEP_BETWEEN_CLICKS = 1; //In milliseconds

// Amount of clicks until the bot tries to enter next level
var NEXT_LVL_FREQUENZY = 200;

// Amount of clicks until the bot tries to buy an ugrade
var BUY_UPGRADE_FREQUENZY = 20;

//#########################

function main() {
	Helper.log("Starting the game...");
	startGame();

	Helper.log("Find enemy click point...")
	enemyPos = findEnemyPos();
	Helper.log("[SUCCESS] EnemyPos: ", enemyPos);
	
	Helper.log("Find Next Level button...");
	nextLvlPos = findNextLevelPos();
	Helper.log("[SUCCESS] NextLvlPos: ", nextLvlPos);
	
	Helper.log("Starting click loop...");
	loop();
}

function loop() {

	var upgradeCycles = 0;
	var nextLvlCycles = 0;

	while (true) {
		clickEnemy();
		Helper.msleep(SLEEP_BETWEEN_CLICKS);

		upgradeCycles++;
		nextLvlCycles++;

		if(upgradeCycles > BUY_UPGRADE_FREQUENZY){
			clickBuyUpgrade();
			upgradeCycles = 0;
			Helper.msleep(SLEEP_BETWEEN_CLICKS);
		}

		if(nextLvlCycles > NEXT_LVL_FREQUENZY) {
			clickNextLvl();
			nextLvlCycles = 0;
			Helper.msleep(SLEEP_BETWEEN_CLICKS);
		}
	}
}

// Loads the game, clicks Play and closes any notifications
function startGame() {

	Browser.loadUrl(CLICKERHEROES_URL);
	Browser.finishLoading();

	Helper.sleep(5);

	findAndClick(PLAY_PNG);

	Helper.log("Search Close Button...");
	Helper.sleep(5);

	//Try to match close button
	findAndClick(CLOSE_PNG);
}

// Finds the location to hit the enemy
function findEnemyPos() {
	Helper.log("Searching for Skull...");

	var skullMatch;
	do {
		Helper.msleep(100); //Refresh every 100ms 
		skullMatch = findMatch(SKULL_PNG);
	}
	while(!skullMatch.isValid())

	var skullPos = skullMatch.getRect().getCenter();

	Helper.log("Found Skull at ", skullPos);

	return skullPos.pointAdded(ENEMY_OFFSET);
}

// Finds the location of the next level button
function findNextLevelPos() {
	var goRightBtnMatch = findMatch(LVL_RIGHT_PNG);
	var goRightBtnPos = goRightBtnMatch.getRect().getCenter();

	return goRightBtnPos.pointAdded(NEXT_LVL_OFFSET);
}

function clickEnemy() {
	Browser.leftClick(enemyPos);
}

function clickBuyUpgrade(){
	Helper.log("Search for \"Hire\"/\"Level Up\" Buttons");

	var upgrade_img = new Image(UPGRADE_PNG);
	var screenshot = Browser.takeScreenshot();

	var matches = Vision.findMatches(screenshot, upgrade_img, 0.98, 6);

	if(matches.length <= 0) {
		return;
	}

	// Find match with the highest top value
	var highestUpgrade = matches[0];
	for (var i = matches.length - 1; i >= 0; i--) {
		if (matches[i].getRect().getTop() > highestUpgrade.getRect().getTop()) {
			highestUpgrade = matches[i];
		}
	}

	Browser.leftClick(highestUpgrade.getRect().getCenter());
}

function clickNextLvl(){
	Helper.log("Tries to go to the next level");
	Browser.leftClick(nextLvlPos);
}

function findAndClick(path) {

	var match = findMatch(path);

	if (!match.isValid()) {
		return false;
	}

	var clickPoint = match.getRect().getCenter();

	Browser.leftClick(clickPoint);
	return match;
}

function findMatch(path) {
	var img = new Image(path);
	var screenshot = Browser.takeScreenshot();

	var matches = Vision.findMatches(screenshot, img, 0.999, 15);

	if(matches.length <= 0) {
		return new Match();
	}
	return matches[matches.length-1];
}


main();