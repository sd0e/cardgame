// Card Game
// by Sebastian Doe (@sebastiandoe5)

let deck = [];

let playerCards = {
	'p1': [],
	'p2': []
};

const player1Email = 'player1@sebdoe.com', player2Email = 'player2@sebdoe.com';
const player1DisplayName = 'Player One', player2DisplayName = 'Player Two';

// Shuffles the array based on the Fisher-Yates Shuffle
const shuffle = array => {
	let currentIndex = array.length;
	let randomIndex;

	while (currentIndex != 0) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;
		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}

	return array;
}

// Generates a random deck by making an ordered array, then shuffling it
const generateRandomDeck = () => {
	let tempArray = [];

	// The cards are generated in the format 'XY(Y)', where X is the colour and Y(Y) (second Y if 10) is the number
	for (let num = 0; num < 30; num++) {
		if (num < 10) tempArray.push(`B${num + 1}`);
		else if (num < 20) tempArray.push(`R${num - 9}`);
		else tempArray.push(`Y${num - 19}`);
	}

	deck = shuffle(tempArray);
}

generateRandomDeck();

// Determines which card wins between the two given
const winDecision = (card1, card2) => {
	// If the cards are of the same colour, it returns the card with the largest number
	if (card1[0] === card2[0]) {
		if (Number(card1.substring(1)) > Number(card2.substring(1))) return card1;
		return [card2, 'Because the '];
	}

	// Otherwise returns whichever is the superior colour
	// (the else statement is unnecessary as it would have left the function before otherwise)
	if (card1[0] === 'R' && card2[0] === 'B') return card1;
	if (card1[0] === 'B' && card2[0] === 'R') return card2;
	
	if (card1[0] === 'Y' && card2[0] === 'R') return card1;
	if (card1[0] === 'R' && card2[0] === 'Y') return card2;
	
	if (card1[0] === 'B' && card2[0] === 'Y') return card1;
	if (card1[0] === 'Y' && card2[0] === 'B') return card2;
}

for (let cardIdx = 0; cardIdx < 30; cardIdx += 2) {
	const winningCard = winDecision(deck[cardIdx], deck[cardIdx + 1]);

	if (deck[cardIdx] === winningCard) {
		// Player 1 won
		playerCards['p1'].push(deck[cardIdx], deck[cardIdx + 1]);
	} else {
		// Player 2 won
		playerCards['p2'].push(deck[cardIdx], deck[cardIdx + 1]);
	}
}

const winner = playerCards['p1'].length > playerCards['p2'].length ? 'p1' : 'p2';

if (localStorage.results === undefined) {
	localStorage.results = JSON.stringify([]);
}

// Stores the results of the finished game in the localStorage
// localStorage is the web's equivalent of an external file, and the results can be downloaded as a JSON file
const storeResults = () => {
	const JSONToStore = {
		'p1': player1Email,
		'p2': player2Email,
		'winner': winner,
		'winnerDisplayName': winner === 'p1' ? player1DisplayName : player2DisplayName,
		'winnerCardNum': playerCards[winner].length,
		'loserCardNum': playerCards[winner === 'p1' ? 'p2' : 'p1'].length
	}

	let tempResults = JSON.parse(localStorage.results);
	tempResults.push(JSONToStore);
	localStorage.results = JSON.stringify(tempResults);
}

storeResults();

const getPlayerWithHighestScore = () => {
	// Define the highestScores 2D array
	let highestScores = [[0], [0], [0], [0], [0]];

	const results = JSON.parse(localStorage.results);

	for (let resultIdx = 0; resultIdx < results.length; resultIdx++) {
		// Get the necessary details of the game
		const result = results[resultIdx];
		const winnerDisplayName = result['winnerDisplayName'];
		const score = result.winnerCardNum;

		// Calculate whether this score beats any other scores
		for (let highestScoresIdx = 0; highestScoresIdx < highestScores.length; highestScoresIdx++) {
			if (score > highestScores[highestScoresIdx][0]) {
				highestScores[highestScoresIdx] = [score, winnerDisplayName];
				break;
			}
		}
	}

	console.log(highestScores);
}

getPlayerWithHighestScore();