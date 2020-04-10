const StateMachine = require('javascript-state-machine')
const OutOfTurnError = require('./errors/OutOfTurnError')
const UnavailableNodeError = require('./errors/UnavailableNodeError')

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
    
    this.fsm.observe('onStart', () => this.setTurnOrder())
    this.fsm.observe('onCompleteDeployment', () => this.turnIndex = 0)

    this.die = die
    this.turnIndex = 0
    this.log = [{
      type: 'created',
      time: new Date().getTime()
    }]
  }

  incrementTurnIndex() {
    this.turnIndex = (this.turnIndex + 1) % this.players.length
  }

  start() {
    this.fsm.start()
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

  isPlayersTurn(playerName) {
    return this.players[this.turnIndex] === playerName
  }

  getActionsForPlayer(playerName) {
    switch(this.fsm.state) {
      case 'deployment':
        return this.deploymentActions(playerName)
    }
  }

  deploymentActions(playerName) {
    //if it's my turn, list the available map nodes that can be claimed
    // if not, no available actions
    if(this.isPlayersTurn(playerName)) {  
      return this.map.getUnownedNodes().map((nodeName) => ({
        type: 'deploy',
        mapNode: nodeName
      }))
    } else {
      return []
    }
  }

  takeAction(playerName, action) {
    switch(action.type) {
      case 'deploy':
        return this.doDeploymentAction(playerName, action)
    }
  }

  doDeploymentAction(playerName, action) {
    if(this.isPlayersTurn(playerName)) {
      const available = this.map.getUnownedNodes().includes(action.mapNode)
      if(!available) {
        throw new UnavailableNodeError('This node is not available to be claimed')
      }
      this.map.claim(action.mapNode, playerName, 1)
      this.incrementTurnIndex()

      if(this.map.getUnownedNodes().length === 0) {
        this.fsm.completeDeployment()
      }
    } else {
      throw new OutOfTurnError('Not allowed to deploy now!')
    }
  }
}

module.exports = Game