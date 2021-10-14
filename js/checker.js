/**
 * @typedef MoveOption
 * @type {Object}
 * @param {Number} moveX
 * @param {Number} moveY
 * @param {Number} maxSteps
 */

/**
 * @typedef Positions
 * @type {Array<{x: Number, y: Number}>}
 */

/**
 * @typedef FigureOption
 * @type {Object}
 * @property {String} name
 * @property {String} cssClass
 * @property {Number} playerId
 * @property {Array<MoveOption>} moves
 * @property {Array<MoveOption>} beats
 * @property {Positions} bonusArea
 * @property {FigureOption} [bonusFigure]
 */

/**
 * @typedef PlayerOption
 * @type {Object}
 * @property {Number} id
 * @property {String} name
 * @property {Positions} startPositions
 * @property {FigureOption} baseFigure
 */

/**
 * @typedef CheckersOption
 * @type {Object}
 * @property {Number} firstPlayerId
 * @property {Number} fieldWidth
 * @property {Number} fieldHeight
 * @property {Number} stepDelay
 * @property {boolean} isBeatNecessarily
 * @property {Array<PlayerOption>} players
 */

const allDirections = [
    { moveX: -1, moveY:  1, maxSteps: 1 },
    { moveX:  1, moveY:  1, maxSteps: 1 },
    { moveX: -1, moveY: -1, maxSteps: 1 },
    { moveX:  1, moveY: -1, maxSteps: 1 }
]

const allDirectionsNoLimit = [
    { moveX: -1, moveY:  1, maxSteps: 8 },
    { moveX:  1, moveY:  1, maxSteps: 8 },
    { moveX: -1, moveY: -1, maxSteps: 8 },
    { moveX:  1, moveY: -1, maxSteps: 8 }
]

/**
 * @type {CheckersOption}
 */
const ClassicCheckerOption = {
    firstPlayerId: 1,
    fieldWidth: 10,
    fieldHeight: 10,
    stepDelay: 100,
    isBeatNecessarily: true,
    players: [
        {
            id: 0,
            name: 'Чёрный игрок',
            startPositions: [
                ...Array(5).fill(0).map((_, i) => ({x: i % 5 * 2 + 1, y: 0})),
                ...Array(5).fill(0).map((_, i) => ({x: i % 5 * 2,     y: 1})),
                ...Array(5).fill(0).map((_, i) => ({x: i % 5 * 2 + 1, y: 2})),
                ...Array(5).fill(0).map((_, i) => ({x: i % 5 * 2 ,    y: 3}))
            ],
            baseFigure: {
                name: 'Чёрная шашка',
                cssClass: 'check black',
                playerId: 0,
                moves: [
                    { moveX: -1, moveY:  1, maxSteps: 1 },
                    { moveX:  1, moveY:  1, maxSteps: 1 }
                ],
                beats: allDirections,
                bonusArea: Array(10).fill(0).map((_, i) => ({x: i, y: 9})),
                bonusFigure: {
                    name: 'Чёрная дамка',
                    cssClass: 'check black king',
                    playerId: 0,
                    checkBackwardBeat: false,
                    moves: allDirectionsNoLimit,
                    beats: allDirectionsNoLimit
                }
            }
        },
        {
            id: 1,
            name: 'Белый игрок',
            startPositions: [
                ...Array(5).fill(0).map((_, i) => ({x: i % 5 * 2 + 1, y: 6})),
                ...Array(5).fill(0).map((_, i) => ({x: i % 5 * 2,     y: 7})),
                ...Array(5).fill(0).map((_, i) => ({x: i % 5 * 2 + 1, y: 8})),
                ...Array(5).fill(0).map((_, i) => ({x: i % 5 * 2,     y: 9}))
            ],
            baseFigure: {
                name: 'Белая шашка',
                cssClass: 'check white',
                playerId: 1,
                moves: [
                    { moveX: -1, moveY: -1, maxSteps: 1 },
                    { moveX:  1, moveY: -1, maxSteps: 1 }
                ],
                beats: allDirections,
                bonusArea: Array(10).fill(0).map((_, i) => ({x: i, y: 0})),
                bonusFigure: {
                    name: 'Белая дамка',
                    cssClass: 'check white king',
                    playerId: 1,
                    checkBackwardBeat: false,
                    moves: allDirectionsNoLimit,
                    beats: allDirectionsNoLimit
                }
            }
        }
    ]
}

/**
 * @type {Checkers}
 */
const CheckersGame = (() => {

    /**
     * @typedef CellType
     * @type {'FIGURE' | 'EMPTY', 'BLOCK'}
     */

    /**
     * @readonly
     * @enum {CellType}
     */
    const cellType = {
        figure: 'FIGURE',
        empty: 'EMPTY',
        block: 'BLOCK'
    }

    const emptyCell = {type: cellType.empty}
    const blockCell = {type: cellType.block}

    /**
     * @property {Number} x
     * @property {Number} y
     * @property {boolean} canMove
     * @property {boolean} isActive
     * @property {FigureOption} option
     * @property {HTMLElement} element
     * @property {Array<{x: Number, y: Number}>} [possibleMoves]
     * @property {Array<{x: Number, y: Number, beatFigure: Figure}>} [possibleBeats]
     */
    class Figure {

        /**
         * @param {FigureOption} option
         */
        constructor(option) {
            this.x = 0
            this.y = 0
            this.canMove = false
            this.isActive = true
            this.option = option
            this.element = document.createElement('span')
            this.element.figure = this
        }

        /**
         * @param {Number} x
         * @param {Number} y
         * @return {Figure}
         */
        move(x, y) {
            this.x = x
            this.y = y
            this.update()
            return this
        }

        /**
         * @return {Figure}
         */
        update() {
            this.element.className = `${this.option.cssClass} x${this.x} y${this.y}${this.canMove ? ' can_move' : ''}`
            return this
        }

        /**
         * @return {Figure}
         */
        remove() {
            this.element.remove()
            this.isActive = false
            return this
        }

        /**
         * @return {Figure}
         */
        checkBonusPosition() {
            if (this.option.bonusFigure &&
                this.option.bonusArea.findIndex(pos => pos.x === this.x && pos.y === this.y) !== -1) {

                this.option = this.option.bonusFigure
                this.update()
            }
            return this
        }

        /**
         * @return {CellType}
         */
        get type() {
            return cellType.figure
        }
    }

    /**
     * @property {Checkers} game
     * @property {Number} id
     * @property {String} name
     * @property {Positions} startPosition
     * @property {FigureOption} baseFigure
     */
    class Player {

        /**
         * @param {Checkers} game
         * @param {PlayerOption} option
         */
        constructor(game, option) {
            this.game = game
            this.id = option.id
            this.name = option.name
            this.startPosition = option.startPositions
            this.baseFigure = option.baseFigure
        }

        /**
         * Осуществить ход
         * @return {Player}
         */
        step() {
            const figures = this.game.findPlayerFigures(this.id)

            let isCanBeat = false

            for (let figure of figures) {
                this.game.findAllPossibleMoves(figure)
                this.game.findAllPossibleBeats(figure)
                isCanBeat = isCanBeat || figure.possibleBeats.length !== 0
                figure.canMove = figure.possibleMoves.length !== 0 || figure.possibleBeats.length !== 0
                figure.update()
            }
            if (this.game.options.isBeatNecessarily && isCanBeat) {
                for (let figure of figures) {
                    figure.possibleMoves = []
                    if (figure.canMove && figure.possibleBeats.length === 0) {
                        figure.canMove = false
                        figure.update()
                    }
                }
            }
            return this
        }

        /**
         * @param {Figure} figure
         * @return {Player}
         */
        beatFigure(figure) {
            this.game.resetFigures()
            figure.canMove = true
            figure.update()
            if (!this.game.options.isBeatNecessarily) {
                figure.possibleMoves = [{x: figure.x, y: figure.y}]
            }
            this.game.selectFigure(figure)
            return this
        }
    }

    /**
     * @property {Checkers} game
     */
    class CheckersEvent extends Event {

        /**
         * @param {String} name
         * @param {Checkers} game
         */
        constructor(name, game) {
            super(name)
            this.game = game
        }
    }

    /**
     * @property {CheckersOption} options
     * @property {HTMLElement} field
     * @property {Number} stepsCount
     * @property {Player} currentPlayer
     * @property {Array<Figure>} figures
     * @property {Array<Player>} players
     * @property {Array<Player>} winners
     * @property {Array<HTMLElement>} possibleElements
     */
    class Checkers extends EventTarget {

        /**
         * @param {HTMLElement} field
         * @param {CheckersOption} options
         */
        constructor(field, options = ClassicCheckerOption) {
            super()
            this.field = field
            this.field.classList.add('checkers')
            this.options = options
            this.players = options.players.map(playerOption => new Player(this, playerOption))
        }

        /**
         * Сброс игры
         * @return {Checkers}
         */
        reset() {
            this.field.innerHTML = ''

            this.stepsCount = 0
            this.winners = this.players
            this.figures = []
            for (let player of this.players) {
                for (let pos of player.startPosition) {
                    const figure = new Figure(player.baseFigure).move(pos.x, pos.y)
                    figure.element.addEventListener('click', event => {
                        this.selectFigure(event.target.figure)
                    })
                    this.field.appendChild(figure.element)
                    this.figures.push(figure)
                }
            }
            return this
        }

        /**
         * Начало игры
         * @return {Checkers}
         */
        start() {
            this.nextStep()
            return this
        }

        /**
         * Осуществить следующий ход
         * @return {Checkers}
         */
        nextStep() {
            this.resetFigures()
            if (!this.checkWin()) {
                const player = this.players[(this.stepsCount + this.options.firstPlayerId) % this.players.length]
                this.currentPlayer = player
                setTimeout(() => player.step(), this.options.stepDelay)
                this.stepsCount++
            }
            return this
        }

        /**
         * @return {Checkers}
         */
        resetFigures() {
            this.hideAll()
            for (let figure of this.figures) {
                figure.canMove = false
                figure.update()
            }
            return this
        }

        /**
         * @param {Figure} figure
         * @param {Number} x
         * @param {Number} y
         * @return {Checkers}
         */
        moveFigure(figure, x, y) {
            figure.move(x, y)
            figure.checkBonusPosition()
            this.nextStep()
            return this
        }

        /**
         * @param {Figure} figure
         * @param {Figure} beatFigure
         * @param {Number} x
         * @param {Number} y
         * @return {Checkers}
         */
        beatFigure(figure, beatFigure, x, y) {
            beatFigure.remove()
            figure.move(x, y)
            figure.checkBonusPosition()
            if (this.findAllPossibleBeats(figure).length) {
                this.currentPlayer.beatFigure(figure)
            } else {
                this.nextStep()
            }
            return this
        }

        /**
         * @param {Figure} figure
         * @return {Checkers}
         */
        selectFigure(figure) {
            if (figure.canMove) {
                this.figures.forEach(figure => figure.element.classList.remove('select'))
                figure.element.classList.add('select')
                this.hideAll()
                const moves = [...figure.possibleMoves, ...figure.possibleBeats]
                for (let move of moves) {
                    const elem = document.createElement('span')

                    this.field.appendChild(elem)
                    elem.className = `move x${move.x} y${move.y}${move.beatFigure ? ' beat' : ''}`

                    elem.addEventListener('click', () => {
                        if (move.beatFigure) {
                            this.beatFigure(figure, move.beatFigure, move.x, move.y)
                        } else {
                            this.moveFigure(figure, move.x, move.y)
                        }
                    })
                }
            }
            return this
        }

        /**
         * @param {Figure} figure
         * @return {Array<{x: Number, y: Number}>}
         */
        findAllPossibleMoves(figure) {
            const possibleMoves = []

            for (let move of figure.option.moves) {
                let x = figure.x
                let y = figure.y

                for (let step = 0; step < move.maxSteps; step++) {
                    x += move.moveX
                    y += move.moveY

                    const nextCell = this.findInCell(x, y)
                    if (nextCell.type === cellType.empty) {
                        possibleMoves.push({x, y})
                    } else {
                        break
                    }
                }
            }

            figure.possibleMoves = possibleMoves

            return possibleMoves
        }

        /**
         * @param {Figure} figure
         * @return {Array<{x: Number, y: Number, beatFigure: Figure}>}
         */
        findAllPossibleBeats(figure) {
            const possibleBeats = []

            for (let move of figure.option.beats) {
                let x = figure.x
                let y = figure.y

                for (let step = 0; step < move.maxSteps; step++) {
                    x += move.moveX
                    y += move.moveY

                    const nextCell = this.findInCell(x, y)
                    if (nextCell.type === cellType.figure && nextCell.option.playerId !== this.currentPlayer.id) {
                        x += move.moveX
                        y += move.moveY
                        const cellAfter = this.findInCell(x, y)
                        if (cellAfter.type === cellType.empty) {
                            possibleBeats.push({x, y, beatFigure: nextCell})
                        }
                        break
                    } else if (nextCell.type !== cellType.empty) {
                        break
                    }
                }
            }

            figure.possibleBeats = possibleBeats

            return possibleBeats
        }

        /**
         * @return {boolean}
         */
        checkWin() {
            this.winners = this.players.filter(
                player => this.figures.findIndex(
                    figure => figure.isActive && player.id === figure.option.playerId
                ) !== -1
            )

            if (this.winners.length !== this.players.length) {
                this.dispatchEvent(new CheckersEvent('game_win', this))
                return true
            }
            return false
        }

        /**
         * @param {Number} x
         * @param {Number} y
         * @return {Figure | {type: cellType}}
         */
        findInCell(x, y) {
            if (x < 0 || y < 0 || x >= this.options.fieldWidth || y >= this.options.fieldHeight) {
                return blockCell
            }
            for (let figure of this.figures) {
                if (figure.isActive && figure.x === x && figure.y === y) {
                    return figure
                }
            }
            return emptyCell
        }

        /**
         * @param {Number} playerId
         * @return {Array<Figure>}
         */
        findPlayerFigures(playerId) {
            return this.figures.filter(figure => figure.isActive && figure.option.playerId === playerId)
        }

        /**
         * @return {Checkers}
         */
        hideAll() {
            this.field.querySelectorAll('.move').forEach(elem => elem.remove())
            return this
        }
    }

    return Checkers
})()
