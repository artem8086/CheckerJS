/**
 * @typedef MoveOptions
 * @type {Object}
 * @param {Number} moveX
 * @param {Number} moveY
 * @param {Number} maxSteps
 */

/**
 * @typedef FigureOption
 * @type {Object}
 * @property {String} name
 * @property {String} cssClass
 * @property {Number} playerId
 * @property {FigureOption} bonusOption
 * @property {boolean} checkBackwardBeat
 * @property {Array<MoveOptions>} moves
 */

/**
 * @typedef CheckersOption
 * @type {Object}
 * @property {boolean} whiteIsFirst
 * @property {Number} fieldWidth
 * @property {Number} fieldHeight
 * @property {Array<{x: Number, y: Number}>} blackBonusCells
 * @property {Array<{x: Number, y: Number}>} whiteBonusCells
 * @property {Array<{x: Number, y: Number}>} blackStartPositions
 * @property {Array<{x: Number, y: Number}>} whiteStartPositions
 * @property {FigureOption} blackCheckOption
 * @property {FigureOption} whiteCheckOption
 * @property {FigureOption} blackKingCheckOption
 * @property {FigureOption} whiteKingCheckOption
 * @property {boolean} isBeatBackAllowed
 * @property {boolean} isCancelBeatAllowed
 */

/**
 * @type {CheckersOption}
 */
const ClassicCheckerOption = {
    whiteIsFirst: true,
    fieldWidth: 10,
    fieldHeight: 10,
    blackBonusCells: Array(8).fill(0).map((_, i) => ({x: i, y: 9})),
    whiteBonusCells: Array(8).fill(0).map((_, i) => ({x: i, y: 0})),
    blackStartPositions: [
        ...Array(5).fill(0).map((_, i) => ({x: i % 5 * 2 + 1, y: 0})),
        ...Array(5).fill(0).map((_, i) => ({x: i % 5 * 2,     y: 1})),
        ...Array(5).fill(0).map((_, i) => ({x: i % 5 * 2 + 1, y: 2})),
        ...Array(5).fill(0).map((_, i) => ({x: i % 5 * 2 ,    y: 3}))
    ],
    whiteStartPositions: [
        ...Array(5).fill(0).map((_, i) => ({x: i % 5 * 2 + 1, y: 6})),
        ...Array(5).fill(0).map((_, i) => ({x: i % 5 * 2,     y: 7})),
        ...Array(5).fill(0).map((_, i) => ({x: i % 5 * 2 + 1, y: 8})),
        ...Array(5).fill(0).map((_, i) => ({x: i % 5 * 2,     y: 9}))
    ],
    blackCheckOption: {
        name: 'Чёрная шашка',
        cssClass: 'check black',
        playerId: 0,
        checkBackwardBeat: true,
        moves: [
            { moveX: -1, moveY:  1, maxSteps: 1 },
            { moveX:  1, moveY:  1, maxSteps: 1 }
        ]
    },
    whiteCheckOption: {
        name: 'Белая шашка',
        cssClass: 'check white',
        playerId: 1,
        checkBackwardBeat: true,
        moves: [
            { moveX: -1, moveY: -1, maxSteps: 1 },
            { moveX:  1, moveY: -1, maxSteps: 1 }
        ]
    },
    blackKingCheckOption: {
        name: 'Чёрная дамка',
        cssClass: 'check black king',
        playerId: 0,
        checkBackwardBeat: false,
        moves: [
            { moveX: -1, moveY: -1, maxSteps: 8 },
            { moveX:  1, moveY: -1, maxSteps: 8 },
            { moveX: -1, moveY:  1, maxSteps: 8 },
            { moveX:  1, moveY:  1, maxSteps: 8 }
        ]
    },
    whiteKingCheckOption: {
        name: 'Белая дамка',
        cssClass: 'check white king',
        playerId: 1,
        checkBackwardBeat: false,
        moves: [
            { moveX: -1, moveY: -1, maxSteps: 8 },
            { moveX:  1, moveY: -1, maxSteps: 8 },
            { moveX: -1, moveY:  1, maxSteps: 8 },
            { moveX:  1, moveY:  1, maxSteps: 8 }
        ]
    },
    isBeatBackAllowed: true,
    isBeatNecessarily: false
}

ClassicCheckerOption.blackCheckOption.bonusOption = ClassicCheckerOption.blackKingCheckOption
ClassicCheckerOption.blackKingCheckOption.bonusOption = ClassicCheckerOption.blackKingCheckOption
ClassicCheckerOption.whiteCheckOption.bonusOption = ClassicCheckerOption.whiteKingCheckOption
ClassicCheckerOption.whiteKingCheckOption.bonusOption = ClassicCheckerOption.whiteKingCheckOption

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
     * @property {Checkers} game
     * @property {Number} x
     * @property {Number} y
     * @property {boolean} canMove
     * @property {boolean} isActive
     * @property {FigureOption} option
     * @property {HTMLElement} element
     */
    class Figure {

        /**
         * @param {Checkers} game
         * @param {FigureOption} option
         * @param {HTMLElement} field
         */
        constructor(game, option) {
            this.game = game
            this.x = 0
            this.y = 0
            this.canMove = false
            this.isActive = true
            this.option = option
            this.element = document.createElement('span')
            this.element.addEventListener('click', this.select.bind(this))
            game.field.appendChild(this.element)
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

        select() {
            if (this.canMove) {
                this.game.figures.forEach(figure => figure.element.classList.remove('select'))
                this.element.classList.add('select')
                this.game.hideAll()
                this.possibleMoves.forEach(move => {
                    const elem = document.createElement('span')
                    this.game.field.appendChild(elem)
                    elem.className = `move x${move.x} y${move.y}${move.beatFigure ? ' beat' : ''}`
                    elem.addEventListener('click', () => {
                        if (move.beatFigure) {
                            this.game.beatFigure(this, move.beatFigure, move.x, move.y)
                        } else {
                            this.game.moveFigure(this, move.x, move.y)
                        }
                    })
                })
            }
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
         * @param {Checkers} game
         * @return {Array<{x: Number, y: Number} | {x: Number, y: Number, beatFigure: Figure}>}
         */
        findAllPossibleMoves(game) {
            // TODO: Отрефакторить
            let possibleMoves = []

            for (let move of this.option.moves) {
                let x = this.x
                let y = this.y

                for (let step = 0; step < move.maxSteps; step++) {
                    x += move.moveX
                    y += move.moveY

                    const nextCell = game.findInCell(x, y)
                    if (nextCell.type === cellType.figure && nextCell.option.playerId !== game.currentPlayer.id) {
                        x += move.moveX
                        y += move.moveY
                        const cellAfter = game.findInCell(x, y)
                        if (cellAfter.type === cellType.empty) {
                            possibleMoves.push({x, y, beatFigure: nextCell})
                        }
                        break
                    } else if (nextCell.type === cellType.empty) {
                        possibleMoves.push({x, y})
                    } else {
                        break
                    }
                }
            }

            if (this.option.checkBackwardBeat && game.options.isBeatBackAllowed) {
                for (let move of this.option.moves) {
                    let x = this.x
                    let y = this.y

                    for (let step = 0; step < move.maxSteps; step++) {
                        x -= move.moveX
                        y -= move.moveY

                        const nextCell = game.findInCell(x, y)
                        if (nextCell.type === cellType.figure && nextCell.option.playerId !== game.currentPlayer.id) {
                            x -= move.moveX
                            y -= move.moveY
                            const cellAfter = game.findInCell(x, y)
                            if (cellAfter.type === cellType.empty) {
                                possibleMoves.push({x, y, beatFigure: nextCell})
                            }
                            break
                        } else if (nextCell.type !== cellType.empty) {
                            break
                        }
                    }
                }
            }

            this.possibleMoves = possibleMoves

            return possibleMoves
        }

        /**
         * @return {CellType}
         */
        get type() {
            return cellType.figure
        }
    }

    /**
     * @typedef BonusPositions
     * @type {Array<{x: Number, y: Number}>}
     */

    /**
     * @property {Checkers} game
     * @property {Number} id
     * @property {String} name
     * @property {BonusPositions} bonusPositions
     * @property {FigureOption} bonusCheckOption
     */
    class Player {

        /**
         * @param {Checkers} game
         * @param {Number} id
         * @param {String} name
         * @param {BonusPositions} bonusPositions
         */
        constructor(game, id, name, bonusPositions) {
            this.game = game
            this.id = id
            this.name = name
            this.bonusPositions = bonusPositions
        }

        /**
         * @param {Figure} figure
         * @return {Boolean}
         */
        inBonusPosition(figure) {
            return this.bonusPositions.findIndex(pos => pos.x === figure.x && pos.y === figure.y) !== -1
        }

        /**
         * Осуществить ход
         * @return {Player}
         */
        step() {
            const figures = this.game.findPlayerFigures(this.id)

            for (let figure of figures) {
                figure.canMove = figure.findAllPossibleMoves(this.game).length !== 0
                figure.update()
            }
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
     * @property {Number} playerSteps
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
        }

        /**
         * Сброс игры
         * @return {Checkers}
         */
        reset() {
            this.field.innerHTML = ''

            this.players = [
                new Player(this, 0,'Чёрный игрок', this.options.blackBonusCells),
                new Player(this, 1,'Белый игрок', this.options.whiteBonusCells)
            ]
            this.playerSteps = this.options.whiteIsFirst ? 1 : 0
            this.winners = this.players
            this.figures = [
                ...this.options.blackStartPositions.map(
                    pos => new Figure(this, this.options.blackCheckOption).move(pos.x, pos.y)
                ),
                ...this.options.whiteStartPositions.map(
                    pos => new Figure(this, this.options.whiteCheckOption).move(pos.x, pos.y)
                )
            ]
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
            this.hideAll()
            for (let figure of this.figures) {
                figure.canMove = false
                figure.update()
            }
            this.checkWin()
            this.currentPlayer = this.players[this.playerSteps % this.players.length]
            this.currentPlayer.step()
            this.playerSteps++
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
            this.nextStep()
            if (this.currentPlayer.inBonusPosition(figure)) {
                figure.option = figure.option.bonusOption
                figure.update()
            }
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
            this.moveFigure(figure, x, y)
            return this
        }

        /**
         * @return {boolean}
         */
        checkWin() {
            this.winners = this.players.filter(
                player => this.figures.findIndex(figure => player.id === figure.option.playerId) !== -1
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
