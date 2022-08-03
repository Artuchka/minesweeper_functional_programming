import {
	createBoard,
	markTile,
	openTile,
	openAllTiles,
	unmarkTile,
	isMine,
	isMarked,
	isOpened,
	countOpenedTiles,
} from "./logic"

const boardElement = document.querySelector("#board")
const minesLeftElement = document.querySelector("#minesLeft > span")
const modalEndgameElement = document.querySelector("#modalEndgame")

const inputMinesLeftElement = document.querySelector("#minesLeftInput")
const inputTileSizeElement = document.querySelector("#tileSizeInput")
const inputBoardSizeElement = document.querySelector("#boardSizeInput")

const savedSettings = getSavedSettings()
console.log(savedSettings)
let tileSize = savedSettings.tileSize
let boardSize = parseFloat(savedSettings.boardSize)
let minesLeft = parseFloat(savedSettings.minesLeft)

inputBoardSizeElement.value = boardSize
inputTileSizeElement.value = tileSize
inputMinesLeftElement.value = minesLeft

let board = createBoard(boardSize, minesLeft)

console.log("board is ready!")
console.log(board)

setCSSProperties(boardSize, tileSize)
setMinesLeftTitle(minesLeft)

render()

const onchangeMinesLeftEventListener = (e) => {
	minesLeft =
		Math.min(parseFloat(inputMinesLeftElement.value), boardSize ** 2 - 1) ?? 3
	board = createBoard(boardSize, minesLeft)
	setMinesLeftTitle(minesLeft)
	updateSavedSettings(minesLeft, boardSize, tileSize)

	render()
}

const onchangeTileSizeEventListener = (e) => {
	tileSize = inputTileSizeElement.value.toString() + "px"
	setCSSProperties(boardSize, tileSize)
	console.log(minesLeft, boardSize, tileSize)
	updateSavedSettings(minesLeft, boardSize, tileSize)

	render()
}

const onchangeBoardSizeEventListener = (e) => {
	boardSize =
		Math.max(parseFloat(inputBoardSizeElement.value), 3).toString() ?? 5
	board = createBoard(boardSize, minesLeft)
	setCSSProperties(boardSize, tileSize)
	updateSavedSettings(minesLeft, boardSize, tileSize)

	render()
}

inputMinesLeftElement.addEventListener(
	"change",
	onchangeMinesLeftEventListener,
	false
)
inputTileSizeElement.addEventListener(
	"change",
	onchangeTileSizeEventListener,
	false
)
inputBoardSizeElement.addEventListener(
	"change",
	onchangeBoardSizeEventListener,
	false
)

const clickEventListener = (e) => {
	if (!e.target.matches("[data-status]")) return

	const x = parseFloat(e.target.dataset.x)
	const y = parseFloat(e.target.dataset.y)

	if (isMine(board, { x, y })) {
		board = openAllTiles(board)
		render()
		showModalLose()
		turnOffBoard()
		return
	}

	if (!isOpened(board, { x, y })) {
		board = openTile(board, { x, y }, boardSize)
		render()
		if (isWin(board)) {
			showModalWin()
			turnOffBoard()
		}
	}
}

const contextmenuEventListener = (e) => {
	e.preventDefault()
	if (!e.target.matches("[data-status]")) return

	const x = e.target.dataset.x
	const y = e.target.dataset.y

	if (isMarked(board, { x, y })) {
		board = unmarkTile(board, { x, y })
	} else {
		board = markTile(board, { x, y })
	}

	render()
}

boardElement.addEventListener("click", clickEventListener, false)
boardElement.addEventListener("contextmenu", contextmenuEventListener, false)
render()

function render() {
	boardElement.textContent = ""
	board.forEach((row) => {
		row.forEach((tile) => {
			boardElement.appendChild(tile.tileElement)
		})
	})
}

function setCSSProperties(boardSize, tileSize) {
	document.documentElement.style.setProperty("--tileSize", tileSize.toString())
	document.documentElement.style.setProperty(
		"--boardSize",
		boardSize.toString()
	)
}

function setMinesLeftTitle(minesLeft) {
	minesLeftElement.textContent = minesLeft.toString()
}

function isWin(board) {
	const openedTiles = countOpenedTiles(board)
	console.log(openedTiles)
	return openedTiles === boardSize ** 2 - minesLeft
}

function showModalWin() {
	modalEndgameElement.textContent = "YOU HAVE WON!!!"
	modalEndgameElement.classList.add("show")
}
function showModalLose() {
	modalEndgameElement.textContent = "YOU HAVE LOST... LOSER!!!"
	modalEndgameElement.classList.add("show")
}

function turnOffBoard() {
	boardElement.removeEventListener("click", clickEventListener, false)
	boardElement.removeEventListener(
		"contextmenu",
		contextmenuEventListener,
		false
	)

	inputMinesLeftElement.removeEventListener(
		"onchange",
		onchangeMinesLeftEventListener,
		false
	)
	inputTileSizeElement.removeEventListener(
		"onchange",
		onchangeTileSizeEventListener,
		false
	)
	inputBoardSizeElement.removeEventListener(
		"onchange",
		onchangeBoardSizeEventListener,
		false
	)
}

function updateSavedSettings(minesLeft, boardSize, tileSize) {
	localStorage.setItem("tileSize", tileSize.toString())
	localStorage.setItem("boardSize", boardSize.toString())
	localStorage.setItem("minesLeft", minesLeft.toString())
	console.log("updating!")
}

function getSavedSettings() {
	return {
		tileSize: localStorage.getItem("tileSize") ?? "60px",
		boardSize: localStorage.getItem("boardSize") ?? "6",
		minesLeft: localStorage.getItem("minesLeft") ?? "3",
	}
}
