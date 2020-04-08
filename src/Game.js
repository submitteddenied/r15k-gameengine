const StateMachine = require('javascript-state-machine')

const GAME_STATES = {
  'READY': Symbol('READY'),
  'DEPLOYMENT': Symbol('DEPLOYMENT'),
  'PLAYING': Symbol('PLAYING'),
  'COMPLETE': Symbol('COMPLETE')
}

const TURN_PHASES = {
  'PLAY_CARDS': Symbol('PLAY_CARDS'),
  'DEPLOYMENT': Symbol('DEPLOYMENT'),
  'ATTACK': Symbol('ATTACK'),
  'FORTIFY': Symbol('FORTIFY')
}

const STATES = {
  init: 'ready',
  transitions: [
    { name: 'start', from: 'ready', to: 'deployment' },
    { name: 'completeDeployment', from: 'deployment', to: 'playing' },
    { name: 'startTurn', from: 'playing', to: 'playing/cards' },
    { name: 'continue', from: 'playing/cards', to: 'playing/deployment' },
    { name: 'continue', from: 'playing/deployment', to: 'playing/attacking' },
    { name: 'continue', from: 'playing/attacking', to: 'playing/defending' },
    { name: 'continue', from: 'playing/defending', to: 'playing/attacking' },
    { name: 'endAttack', from: 'playing/attacking', to: 'playing/fortifying' },
    { name: 'done', from: 'playing/fortifying', to: 'playing' }
  ],
  methods: {}
}

class Game {
  constructor(players, map, die) {
    this.players = players
    this.map = map
    this.fsm = new StateMachine(STATES)
    // TODO Wire up state transitions to methods in this instance
    this.die = die
    this.turnIndex = 0
    this.turnPhase = undefined
    this.log = [{
      type: 'created',
      time: new Date().getTime()
    }]
  }

  startGame() {
    if(this.state === GAME_STATES.READY) {
      this.state = GAME_STATES.DEPLOYMENT
      this.setTurnOrder()
    }
  }

  getMap() {
    return this.map
  }

  setTurnOrder() {
    const rolls = this.players.map((p) => { 
      return {player: p, roll: this.die.roll()}
    })
    rolls.sort((a, b) => b.roll - a.roll)
    // TODO: handle the case where two (or more) players roll the same number

    this.log.push({
      type: 'initiative_roll',
      rolls
    })
    this.players = rolls.map(i => i.player)
  }

  getAvailableActions(player) {

  }
}

module.exports = Game