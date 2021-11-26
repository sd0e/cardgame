// Card Game
// by Sebastian Doe (@sebastiandoe5)

// Formats (index starting at 0):
// player1 and player2 array in localStorage:
//	[0]: Email
//	[1]: Display Name

let deck = [];

let playerCards = {
	'p1': [],
	'p2': []
};

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

const separateCardNumber = card => {
	const colourCode = card.split('').shift();
	const cardNumAsString = card.substr(1);

	return [colourCode, cardNumAsString];
}

const setTopCard = card => {
	const separateRes = separateCardNumber(card);

	const colourCode = separateRes[0];
	const cardNumAsString = separateRes[1];

	document.getElementById('topGameCardBack').classList.remove('black', 'red', 'yellow');
	document.getElementById('topGameCardBack').classList.add(colourCode === 'B' ? 'black' : (colourCode === 'R' ? 'red' : 'yellow'));

	document.getElementById('topGameCardNumber').innerText = cardNumAsString;

	// Set the new value of the amount of cards left
	document.getElementById('cardsRemainingCounter').innerText = (30 - window['cardIdx']).toString() + ' Left';
}

const clearGame = () => {
	playerCards = {
		'p1': [],
		'p2': []
	};
}

// Finds the most recent previous game where both players had the same email address, as well as all previous
const getMostRecentPastGame = () => {
	const allGamesArray = JSON.parse(localStorage.results);

	const player1Email = JSON.parse(localStorage.getItem('player1'))[0];
	const player2Email = JSON.parse(localStorage.getItem('player2'))[0];
	
	let recentGameFound = false;

	let totalGames = 0;

	let player1TotalWins = 0;
	let player2TotalWins = 0;

	const elementsToChange = Array.prototype.slice.call(document.getElementsByClassName('lastRoundHolder'));

	// Go through the most recent games backwards and find the ones where player 1's and player 2's email address are the same as the ones now
	for (let gameIdx = allGamesArray.length - 1; gameIdx >= 0; gameIdx--) {
		const gameJSON = allGamesArray[gameIdx];

		if (gameJSON.p1 === player1Email && gameJSON.p2 === player2Email) {
			for (let elementIndex = 0; elementIndex < elementsToChange.length; elementIndex++) {
				const element = elementsToChange[elementIndex];

				element.style.display = 'block';
			}
			
			totalGames++;

			if (gameJSON.winner === 'p1') player1TotalWins++;
			else player2TotalWins++;

			if (recentGameFound === false) {

				// The most recent past game
				recentGameFound = true;

				const winner = gameJSON.winner;

				// Get the most recent cards for each player
				const p1MostRecentCards = winner === 'p1' ? gameJSON.winnerCardNum : gameJSON.loserCardNum;
				document.getElementById('player1LastRoundSecondaryCardNum').innerText = p1MostRecentCards.toString();

				const p2MostRecentCards = winner === 'p2' ? gameJSON.winnerCardNum : gameJSON.loserCardNum;
				document.getElementById('player2LastRoundSecondaryCardNum').innerText = p2MostRecentCards.toString();

				const elementsToUpdate = ['player1LastRoundPrimary', 'player1LastRoundSecondary', 'player2LastRoundPrimary', 'player2LastRoundSecondary'];

				// Remove all colour classes from all the elements
				for (let elementIdx = 0; elementIdx < elementsToUpdate.length; elementIdx++) {
					const element = document.getElementById(elementsToUpdate[elementIdx]);
					element.classList.remove('good', 'neutral', 'bad');
				}

				document.getElementById('player1LastRoundPrimary').innerText = winner === 'p1' ? 'Won' : 'Lost';
				document.getElementById('player1LastRoundPrimary').classList.add(winner === 'p1' ? 'good' : 'bad');
				document.getElementById('player1LastRoundSecondary').classList.add(winner === 'p1' ? 'good' : 'bad');

				document.getElementById('player2LastRoundPrimary').innerText = winner === 'p2' ? 'Won' : 'Lost';
				document.getElementById('player2LastRoundPrimary').classList.add(winner === 'p2' ? 'good' : 'bad');
				document.getElementById('player2LastRoundSecondary').classList.add(winner === 'p2' ? 'good' : 'bad');
			}
		}
	}

	// If a game with the same players hasn't been found, hide the containers
	if (recentGameFound === false) {
		for (let elementIndex = 0; elementIndex < elementsToChange.length; elementIndex++) {
			const element = elementsToChange[elementIndex];

			element.style.display = 'none';
		}
	}
}

const newGame = () => {
	clearGame();

	updateScoreReadings();

	generateRandomDeck();

	getMostRecentPastGame();
	
	const topCardIdx = 0;
	window['cardIdx'] = topCardIdx;

	setTopCard(deck[topCardIdx]);
}

// Determines which card wins between the two given
const winDecision = (card1, card2) => {
	// If the cards are of the same colour, it returns the card with the largest number
	if (card1[0] === card2[0]) {
		if (Number(card1.substring(1)) > Number(card2.substring(1))) return card1;
		return card2;
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

window['winDecision'] = winDecision;

// Non-GUI-based way of deciding the score for each pair of cards by looping through to 30, two cards at a time 
// for (let cardIdx = 0; cardIdx < 30; cardIdx += 2) {
// 	const winningCard = winDecision(deck[cardIdx], deck[cardIdx + 1]);

// 	if (deck[cardIdx] === winningCard) {
// 		// Player 1 won
// 		playerCards['p1'].push(deck[cardIdx], deck[cardIdx + 1]);
// 	} else {
// 		// Player 2 won
// 		playerCards['p2'].push(deck[cardIdx], deck[cardIdx + 1]);
// 	}
// }

if (localStorage.results === undefined) {
	localStorage.results = JSON.stringify([]);
}

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

	return highestScores
}

// Either hides or shows everything which shows once both players are signed in, depending on if the newState is 'signedout' or not

const changeAllGameRelated = newState => {
	// Hide (or show) all of the subcontent holder divs by looping through iteration of their classname
	for (let idx = 0; idx < Array.prototype.slice.call(document.getElementsByClassName('subcontentHolder')).length; idx++) {
		newState === 'signedout' ? document.getElementsByClassName('subcontentHolder')[idx].classList.add('hidden') : document.getElementsByClassName('subcontentHolder')[idx].classList.remove('hidden')
	};

	// Hide (or show) all other game-related items through iteration of their IDs in an array
	const idArray = ['belowCards', 'player1LastCard', 'player2LastCard', 'gameCards'];
	idArray.forEach(id => {
		const el = document.getElementById(id);
		newState === 'signedout' ? el.classList.add('hidden') : el.classList.remove('hidden');
	});

	document.getElementById('bothPlayers').style.display = newState === 'signedout' ? 'block' : 'none';
}

const checkSignInStatus = () => {
	const player1 = JSON.parse(localStorage.getItem('player1'));
	const player2 = JSON.parse(localStorage.getItem('player2'));

	// Changes the game state to signed-out if one or both of the players aren't signed in
	if ((player1 !== null && player1 !== undefined) && (player2 !== null && player2 !== undefined)) {
		newGame();
		changeAllGameRelated('signedin');
	} else {
		changeAllGameRelated('signedout');
	}

	// If player1 is not currently signed in
	if (player1 === null || undefined) {
		document.getElementById('player1DisplayName').innerText = 'Sign In';
		document.getElementById('player1ChangeStateIcon').innerText = 'login';
		document.getElementById('player1ChangeStateText').innerText = 'Login';
		document.getElementById('player1ChangeStateButton').onclick = () => toggleSignIn('open', 'Player 1');
	} else {
		document.getElementById('player1DisplayName').innerText = player1[1];
		document.getElementById('player1ChangeStateIcon').innerText = 'logout';
		document.getElementById('player1ChangeStateText').innerText = 'Logout';
		document.getElementById('player1ChangeStateButton').onclick = () => signOutPlayer('p1');
	}

	// If player2 is not currently signed in
	if (player2 === null || undefined) {
		document.getElementById('player2DisplayName').innerText = 'Sign In';
		document.getElementById('player2ChangeStateIcon').innerText = 'login';
		document.getElementById('player2ChangeStateText').innerText = 'Login';
		document.getElementById('player2ChangeStateButton').onclick = () => toggleSignIn('open', 'Player 2');
	} else {
		document.getElementById('player2DisplayName').innerText = player2[1];
		document.getElementById('player2ChangeStateIcon').innerText = 'logout';
		document.getElementById('player2ChangeStateText').innerText = 'Logout';
		document.getElementById('player2ChangeStateButton').onclick = () => signOutPlayer('p2');
	}
}

const signOutPlayer = playerID => {
	localStorage.removeItem(playerID === 'p1' ? 'player1' : 'player2');
	checkSignInStatus();
}

// This code executes after the page is loaded
window.addEventListener('load', () => {
	window.setTimeout(() => {
		document.getElementById('loadingCoverHolder').classList.add('hidden');
	}, 500);

	checkSignInStatus();
});

// force is given a value of either 'close' or another value like 'open' if the window should be either opened or closed, and not toggled
const toggleSignIn = (force, playerString) => {
	document.getElementById('passwordError').style.display = 'none';
	const signInWindowPlayerStringEl = document.getElementById('signInWindowPlayerString');

	const signInPopupClasses = document.getElementById('signInScreen').classList;

	const closeWindow = () => {
		signInPopupClasses.remove('shown');
		signInPopupClasses.add('hidden');

		const usernameElement = document.getElementById('emailInput');
		const passwordElement = document.getElementById('passwordInput');
		const displayNameElement = document.getElementById('displayNameInput');

		// Remove the text from all inputs
		usernameElement.value = '';
		passwordElement.value = '';
		displayNameElement.value = '';
	}

	const showWindow = () => {
		signInPopupClasses.remove('hidden');
		signInPopupClasses.add('shown');
		signInWindowPlayerStringEl.innerText = playerString;
		document.getElementById('incorrectCombination').classList.add('hidden');

		if (playerString === 'Player 1') {
			signInWindowPlayerStringEl.classList.remove('p2');
			signInWindowPlayerStringEl.classList.add('p1');
		} else {
			signInWindowPlayerStringEl.classList.remove('p1');
			signInWindowPlayerStringEl.classList.add('p2');
		}
	}

	if (force !== undefined) {
		force === 'close' ? closeWindow() : showWindow();
	} else {
		if (signInPopupClasses.contains('shown')) closeWindow();
		else showWindow();
	}
}

// Checks if a username and password combination matches the records
const passwordMatches = (email, password) => {
	return new Promise(resolve => {
		firebase.auth().signInWithEmailAndPassword(email, password).then(userCredential => {
			firebase.auth().signOut().then(() => {
				if (userCredential) resolve(true);
				else resolve(false);
			});
		}).catch(err => resolve(false));
	});
	// for (let playerIdx = 0; playerIdx < players.length; playerIdx++) {
	// 	const playerArray = players[playerIdx]
	// 	if (playerArray[0] === email && playerArray[1] === password) return true;
	// }
	// // Would have returned before this point if it matched
	// return false;
}

const addPlayer = () => {
	const usernameElement = document.getElementById('emailInput');
	const passwordElement = document.getElementById('passwordInput');
	const displayNameElement = document.getElementById('displayNameInput');

	passwordMatches(usernameElement.value, passwordElement.value).then(passwordMatches => {
		if (passwordMatches) {
			// Password is correct
			const playerString = document.getElementById('signInWindowPlayerString').innerText;

			const arrayToSet = JSON.stringify([usernameElement.value, displayNameElement.value]);

			// Sets the value of either player1 or player2 depending on who is being signed in using a conditional (ternary) operator
			localStorage.setItem(playerString === 'Player 1' ? 'player1' : 'player2', arrayToSet);

			toggleSignIn('close');
			checkSignInStatus();
		} else {
			document.getElementById('incorrectCombination').classList.remove('hidden');
		}
	});
}

const playerRelativeScoreClass = (playerYouWant, playerToCompareTo) => {
	if (playerYouWant > playerToCompareTo) return 'good';
	if (playerYouWant < playerToCompareTo) return 'bad';
	return 'neutral';
}

const updateScoreReadings = () => {
	const player1NumberCards = playerCards['p1'].length;
	const player2NumberCards = playerCards['p2'].length;

	document.getElementById('player1CardsThisRound').innerText = player1NumberCards.toString();
	document.getElementById('player2CardsThisRound').innerText = player2NumberCards.toString();

	const thisRoundCardElements = Array.prototype.slice.call(document.getElementsByClassName('totalCardsThisRound'));
	
	const totalCards = player1NumberCards + player2NumberCards;

	for (let thisRoundCardElementIdx = 0; thisRoundCardElementIdx < thisRoundCardElements.length; thisRoundCardElementIdx++) {
		thisRoundCardElements[thisRoundCardElementIdx].innerText = totalCards;
	}

	const elementsToUpdate = ['player1ThisRoundPrimary', 'player1ThisRoundSecondary', 'player2ThisRoundPrimary', 'player2ThisRoundSecondary'];

	// Remove all colour classes from all the elements
	for (let elementIdx = 0; elementIdx < elementsToUpdate.length; elementIdx++) {
		const element = document.getElementById(elementsToUpdate[elementIdx]);
		element.classList.remove('good', 'neutral', 'bad');
	}

	// Adds new colour classes to the elements of both players, and add the descriptions

	const player1ScoreClass = playerRelativeScoreClass(player1NumberCards, player2NumberCards);
	document.getElementById('player1ThisRoundPrimary').classList.add(player1ScoreClass);
	document.getElementById('player1ThisRoundSecondary').classList.add(player1ScoreClass);

	const player1DescriptionText = player1ScoreClass === 'good' ? 'Winning' : (player1ScoreClass === 'neutral' ? 'Drawing' : 'Losing');
	document.getElementById('player1ThisRoundPrimary').innerText = player1DescriptionText;

	const player2ScoreClass = playerRelativeScoreClass(player2NumberCards, player1NumberCards);
	document.getElementById('player2ThisRoundPrimary').classList.add(player2ScoreClass);
	document.getElementById('player2ThisRoundSecondary').classList.add(player2ScoreClass);

	const player2DescriptionText = player2ScoreClass === 'good' ? 'Winning' : (player2ScoreClass === 'neutral' ? 'Drawing' : 'Losing');
	document.getElementById('player2ThisRoundPrimary').innerText = player2DescriptionText;
}

// Runs when a game has been completed and after the results have been added to localStorage
const gameFinishedAfterResultsStored = () => {
	newGame();

	const lastGame = JSON.stringify(JSON.parse(localStorage.results).pop());

	localStorage.lastGame = lastGame;
}

// Runs when the top card is flipped
document.getElementById('topGameCard').addEventListener('focusin', () => {
	const colour = Array.prototype.slice.call(document.getElementById('topGameCardBack').classList).pop();
	const numberAsString = document.getElementById('topGameCardNumber').innerText;
	const cardCode = colour.split('').shift().toUpperCase() + numberAsString;

	const currentPlayerElement = document.getElementById('currentPlayer');

	if (currentPlayerElement.innerText === 'Player 1') {
		// It's the turn of Player 1

		window.setTimeout(() => {
			// Sets the Last Card of Player 1 to the current card
			document.getElementById('player1LastCard').classList.remove('black', 'red', 'yellow', 'waiting');
			document.getElementById('player1LastCard').classList.add(colour);

			window['p1CardCode'] = cardCode;

			document.getElementById('player1LastCardNumber').innerText = numberAsString;

			const newCardIndex = window['cardIdx'] + 1;

			window['cardIdx'] = newCardIndex;

			window.setTimeout(() => {
				// Un-flip card based on the fact that it is selected
				document.activeElement.blur();
	
				// Change text and style of the current turn
				currentPlayerElement.innerText = 'Player 2';
				currentPlayerElement.classList.remove('p1');
				currentPlayerElement.classList.add('p2');

				window.setTimeout(() => {
					setTopCard(deck[newCardIndex]);
				}, 450);
			}, 1000);
		}, 1000);
	} else {
		// It's the turn of Player 2

		window.setTimeout(() => {
			// Sets the Last Card of Player 2 to the current card
			document.getElementById('player2LastCard').classList.remove('black', 'red', 'yellow', 'waiting');
			document.getElementById('player2LastCard').classList.add(colour);

			window['p1CardCode'];

			document.getElementById('player2LastCardNumber').innerText = numberAsString;

			const newCardIndex = window['cardIdx'] + 1;

			window['cardIdx'] = newCardIndex;

			window.setTimeout(() => {
				// Un-flip card based on the fact that it is selected
				document.activeElement.blur();
	
				// Change text and style of the current turn
				currentPlayerElement.innerText = 'Player 1';
				currentPlayerElement.classList.remove('p2');
				currentPlayerElement.classList.add('p1');

				window.setTimeout(() => {
					const winDecision = window['winDecision'](deck[window['cardIdx'] - 2], deck[window['cardIdx'] - 1]);			

					// Define the winner variable, which is stored as a number as a string
					let winner;

					if (deck[window['cardIdx'] - 2] === winDecision) {
						// Player 1 won
						winner = 'p1';
						playerCards['p1'].push(deck[cardIdx], deck[cardIdx + 1]);
					} else {
						// Player 2 won
						winner = 'p2';
						playerCards['p2'].push(deck[cardIdx], deck[cardIdx + 1]);
					}

					document.getElementById(`player${winner === 'p1' ? '2' : '1'}LastCard`).classList.remove('black', 'red', 'yellow', 'waiting');
					document.getElementById(`player${winner === 'p1' ? '2' : '1'}LastCard`).classList.add('waiting');
					document.getElementById(`player${winner === 'p1' ? '2' : '1'}LastCardNumber`).innerText = '?';

					document.getElementById(`player${winner.substr(1)}LastCard`).classList.add('scaleup');

					// Remove the scale-up 1s after the other, so it is obvious who the winner is
					window.setTimeout(() => {
						document.getElementById(`player${winner.substr(1)}LastCard`).classList.remove('black', 'red', 'yellow', 'waiting', 'scaleup');
						document.getElementById(`player${winner.substr(1)}LastCardNumber`).innerText = '?';
						document.getElementById(`player${winner.substr(1)}LastCard`).classList.add('waiting');
					}, 1000);

					updateScoreReadings();

					if (document.getElementById('cardsRemainingCounter').innerText !== '1 Left' && document.getElementById('cardsRemainingCounter').innerText !== '0 Left') {
						setTopCard(deck[newCardIndex]);
					} else {
						// Stores the results of the finished game in the localStorage
						// localStorage is the web's closest equivalent of an external file, and the results can be exported and imported as a JSON file

						const JSONToStore = {
							"p1": JSON.parse(localStorage.getItem('player1'))[0],
							"p2": JSON.parse(localStorage.getItem('player2'))[0],
							"winner": winner,
							"winnerDisplayName": winner === 'p1' ? JSON.parse(localStorage.getItem('player1'))[1] : JSON.parse(localStorage.getItem('player2'))[1],
							"winnerCardNum": playerCards[winner].length,
							"loserCardNum": playerCards[winner === 'p1' ? 'p2' : 'p1'].length
						}

						let tempResults = JSON.parse(localStorage.results);
						tempResults.push(JSONToStore);
						localStorage.results = JSON.stringify(tempResults);

						gameFinishedAfterResultsStored();
					}
				}, 450);
			}, 1000);
		}, 1000);
	}
});

const toggleLeaderboardMenu = force => {
	// Values for `force`: 'open' or 'close'

	if (force === 'close') {
		document.getElementById('leaderboardMenu').classList.remove('shown');
		document.getElementById('leaderboardMenu').classList.add('hidden');
	} else {
		document.getElementById('leaderboardMenu').classList.remove('hidden');
		document.getElementById('leaderboardMenu').classList.add('shown');
	}
}

const showLeaderboard = () => {
	toggleLeaderboardMenu('open');

	const highestScores = getPlayerWithHighestScore();

	highestScores.forEach((scoreArray, scoreIdx) => {
		if (scoreArray.toString() !== '0') {
			const userScore = scoreArray[0];
			const userName = scoreArray[1];

			document.getElementById(`leaderboardUser${scoreIdx + 1}`).innerText = userName;
			document.getElementById(`leaderboardScore${scoreIdx + 1}`).innerText = userScore;
		}
	});
}