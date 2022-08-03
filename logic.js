const TILE_STATUS = {
	HIDDEN: "hidden",
	OPENED: "opened",
	MARKED: "marked",
	MINE: "mine",
}

const MINE_FLAG = 999

export function createBoard(boardSize, minesLeft) {
	let board = []

	board = createTiles(boardSize)
	board = createMines(board, boardSize, minesLeft)

	return board
}

export function openTile(board, position, boardSize) {
	if (
		isOpened(board, position) ||
		isMarked(board, position) ||
		isMine(board, position)
	) {
		return board
	}
	let newBoard = openCertainTile(board, position, TILE_STATUS.OPENED, boardSize)

	// setting position offsets by hand so it's less calculations + checked that they are only christ-alike
	const dxdyPositions = [
		{ dx: -1, dy: 0 },
		{ dx: 1, dy: 0 },
		{ dx: 0, dy: 1 },
		{ dx: 0, dy: -1 },
	]
	dxdyPositions.forEach((dxdyPosition) => {
		const newX = position.x + dxdyPosition.dx
		const newY = position.y + dxdyPosition.dy
		const nextPosition = { x: newX, y: newY }

		if (positionPossible(nextPosition, boardSize)) {
			newBoard = openTile(newBoard, nextPosition, boardSize)
		}
	})

	return newBoard
}

function openCertainTile(board, position, status, boardSize) {
	let newBoard = board

	const newTileElement = document.createElement("div")
	newTileElement.classList.add("tile")
	newTileElement.dataset.x = position.x
	newTileElement.dataset.y = position.y
	newTileElement.dataset.status = status

	const minesAroundCount = countMinesAround(board, position, boardSize)
	if (minesAroundCount >= 1) {
		newTileElement.textContent = minesAroundCount
	}

	const newTile = {
		...board[position.y][position.x],
		tileElement: newTileElement,
	}

	newBoard = replaceTile(newBoard, position, newTile)

	return newBoard
}

export function countMinesAround(board, position, boardSize) {
	const dxdyPositions = [
		{ dx: -1, dy: -1 },
		{ dx: -1, dy: 0 },
		{ dx: -1, dy: 1 },

		{ dx: 0, dy: -1 },
		{ dx: 0, dy: 0 },
		{ dx: 0, dy: 1 },

		{ dx: 1, dy: -1 },
		{ dx: 1, dy: 0 },
		{ dx: 1, dy: 1 },
	]

	const res = dxdyPositions.reduce((count, offset) => {
		const newPos = { x: position.x + offset.dx, y: position.y + offset.dy }
		if (positionPossible(newPos, boardSize) && isMine(board, newPos)) {
			return count + 1
		}
		return count
	}, 0)
	console.log(res)
	return res
}

function positionPossible(position, boardSize) {
	return (
		0 <= position.x &&
		position.x < boardSize &&
		0 <= position.y &&
		position.y < boardSize
	)
}

export function openAllTiles(board) {
	let newBoard = board
	newBoard.forEach((row, y) => {
		row.forEach((tile, x) => {
			if (tile.adjacentMinesCount === MINE_FLAG) {
				newBoard = openCertainTile(newBoard, { x, y }, TILE_STATUS.MINE)
			} else {
				newBoard = openCertainTile(newBoard, { x, y }, TILE_STATUS.OPENED)
			}
		})
	})

	return newBoard
}

export function markTile(board, position) {
	let newBoard = board

	const newTileElement = document.createElement("div")
	newTileElement.classList.add("tile")
	newTileElement.dataset.x = position.x
	newTileElement.dataset.y = position.y
	newTileElement.dataset.status = TILE_STATUS.MARKED

	const newTile = {
		...board[position.y][position.x],
		tileElement: newTileElement,
	}

	newBoard = replaceTile(board, position, newTile)

	return newBoard
}
export function unmarkTile(board, position) {
	let newBoard = board

	const newTileElement = document.createElement("div")
	newTileElement.classList.add("tile")
	newTileElement.dataset.x = position.x
	newTileElement.dataset.y = position.y
	newTileElement.dataset.status = TILE_STATUS.HIDDEN

	const newTile = {
		...board[position.y][position.x],
		tileElement: newTileElement,
	}

	newBoard = replaceTile(board, position, newTile)

	return newBoard
}

export function isMarked(board, position) {
	return (
		board[position.y][position.x].tileElement.dataset.status ===
		TILE_STATUS.MARKED
	)
}
export function isOpened(board, position) {
	return (
		board[position.y][position.x].tileElement.dataset.status ===
		TILE_STATUS.OPENED
	)
}
export function isMine(board, position) {
	return board[position.y][position.x].adjacentMinesCount === MINE_FLAG
}

export function countOpenedTiles(board) {
	return board.flat(2).reduce((count, tile) => {
		if (tile.tileElement.dataset.status === TILE_STATUS.OPENED) return count + 1
		return count
	}, 0)
}

function createTiles(boardSize) {
	const newBoard = []
	for (let y = 0; y < boardSize; y++) {
		newBoard[y] = []
		for (let x = 0; x < boardSize; x++) {
			const tileElement = document.createElement("div")
			tileElement.classList.add("tile")
			tileElement.dataset.status = TILE_STATUS.HIDDEN
			tileElement.dataset.x = x
			tileElement.dataset.y = y
			const tile = {
				x,
				y,
				adjacentMinesCount: 0,
				tileElement,
			}
			newBoard[y][x] = tile
		}
	}

	return newBoard
}

function createMines(board, boardSize, minesLeft) {
	let minesPositions = []
	let newBoard = board

	while (minesLeft > minesPositions.length) {
		const x = randomNumber(boardSize - 1)
		const y = randomNumber(boardSize - 1)

		const position = { x, y }
		const isUniquePosition = !minesPositions.some((el) =>
			positionSame(el, position)
		)
		if (isUniquePosition) {
			minesPositions = addElement(minesPositions, position)
		}
	}

	console.log("new positions")
	minesPositions.forEach((pos) => {
		console.log(pos)
		const newTile = {
			...newBoard[pos.y][pos.x],
			adjacentMinesCount: MINE_FLAG,
		}
		newBoard = replaceTile(newBoard, pos, newTile)
	})

	return newBoard
}

function replaceTile(board, position, newTile) {
	return board.map((row, y) => {
		return row.map((tile, x) => {
			if (positionSame(position, { x, y })) {
				return newTile
			}
			return tile
		})
	})
}

function addElement(array, element) {
	return [...array, element]
}

function randomNumber(top) {
	return Math.floor(Math.random() * (top + 0.9))
}

function positionSame(a, b) {
	return a.x == b.x && a.y == b.y
}
