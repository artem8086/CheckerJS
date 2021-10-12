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
 * @property {Array<MoveOptions>} moves
 */

/**
 * @type {Checkers}
 */
const CheckersGame = (() => {

    /**
     * @type {FigureOption}
     */
    const BlackCheckOption = {
        name: 'Чёрная шашка',
        cssClass: 'check black',
        playerId: 0,
        moves: [
            { moveX: -1, moveY:  1, maxSteps: 1 },
            { moveX:  1, moveY:  1, maxSteps: 1 }
        ]
    }

    /**
     * @type {FigureOption}
     */
    const WhiteCheckOption = {
        name: 'Белая шашка',
        cssClass: 'check white',
        playerId: 1,
        moves: [
            { moveX: -1, moveY: -1, maxSteps: 1 },
            { moveX:  1, moveY: -1, maxSteps: 1 }
        ]
    }

    /**
     * @type {FigureOption}
     */
    const WhiteKingCheckOption = {
        name: 'Белая дамка',
        cssClass: 'check white king',
        playerId: 1,
        moves: [
            { moveX: -1, moveY: -1, maxSteps: 8 },
            { moveX:  1, moveY: -1, maxSteps: 8 },
            { moveX: -1, moveY:  1, maxSteps: 8 },
            { moveX:  1, moveY:  1, maxSteps: 8 }
        ]
    }

    /**
     * @type {FigureOption}
     */
    const BlackKingCheckOption = {
        name: 'Чёрная дамка',
        cssClass: 'check black king',
        playerId: 0,
        moves: [
            { moveX: -1, moveY: -1, maxSteps: 8 },
            { moveX:  1, moveY: -1, maxSteps: 8 },
            { moveX: -1, moveY:  1, maxSteps: 8 },
            { moveX:  1, moveY:  1, maxSteps: 8 }
        ]
    }

    /**
     * @property {Number} x
     * @property {Number} y
     * @property {Boolean} canMove
     * @property {FigureOption} option
     * @property {HTMLElement} element
     */
    class Figure {

        constructor(option) {
            this.x = 0
            this.y = 0
            this.canMove = false
            this.option = option
            this.element = document.createElement('span')
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
            return this
        }
    }

    /**
     * @typedef BonusPositions
     * @type {Array<{x: Number, y: Number}>}
     */

    /**
     * @property {Number} id
     * @property {String} name
     * @property {BonusPositions} bonusPositions
     * @property {FigureOption} bonusCheckOption
     */
    class Player {

        /**
         * @param {Number} id
         * @param {String} name
         * @param {BonusPositions} bonusPositions
         * @param {FigureOption} bonusCheckOption
         */
        constructor(id, name, bonusPositions, bonusCheckOption) {
            this.id = id
            this.name = name
            this.bonusCheckOption = bonusCheckOption
            this.bonusPositions = bonusPositions
        }

        /**
         * @param {Figure} figure
         * @return {Boolean}
         */
        inBonusPosition(figure) {
            return this.bonusPositions.findIndex(pos => pos.x === figure.x && pos.y === figure.y) !== -1
        }
    }

    /**
     * @property {HTMLElement} field
     * @property {Array<figures>} figures
     * @property {Array<Player>} players
     * @property {Array<Player>} winners
     */
    class Checkers extends EventTarget {

        /**
         * @param {HTMLElement} field
         */
        constructor(field) {
            super()
            this.field = field
        }

        /**
         * Инициализация игрового поля
         * @return {Checkers}
         */
        init() {
            this.players = []
            this.winners = this.players
            this.figures = []
            return this
        }

        /**
         * Сброс игры
         * @return {Checkers}
         */
        reset() {
            return this
        }

        /**
         * Начало игры
         * @return {Checkers}
         */
        start() {
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
                this.dispatchEvent(new Event('game_win'))
                return true
            }
            return false
        }
    }

    return Checkers
})()
