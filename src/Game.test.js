const Game = require('./Game')
const Map = require('./Map')
const Die = require('./Die')

jest.mock('./Die')

describe('Game', () => {
  let die
  beforeEach(() => {
    die = new Die(Math.random)
  })

  describe('start game', () => {
    const map = {}
    const players = []
    const game = new Game(players, map, die)
    jest.spyOn(game, 'setTurnOrder')

    game.start()
    expect(game.setTurnOrder).toHaveBeenCalled()
  })

  describe('Initiative roll', () => {
    let map = {}
    let players
    beforeEach(() => {
      // Careful, the order of players here must match the order of mocked return values
      players = ['a', 'b', 'c']
      die.roll.mockReturnValueOnce(2).mockReturnValueOnce(5).mockReturnValueOnce(3)
    })

    test('Turn order', () => {
      const game = new Game(players, map, die)
      game.setTurnOrder()

      expect(game.players).toEqual(['b','c','a'])
    })

    test('Initiative roll log', () => {
      const game = new Game(players, map, die)
      game.setTurnOrder()

      const entries = game.log.filter(e => e.type === 'initiative_roll')
      expect(entries.length).toBe(1)
      expect(entries[0].rolls).toEqual([
        {player: 'b', roll: 5},
        {player: 'c', roll: 3},
        {player: 'a', roll: 2}
      ])
    })
  })
  describe('Turn Management', () => {
    let map
    let players
    let game
    beforeEach(() => {
      map = new Map()
      map.addNode('a')
      map.addNode('b')
      map.addNode('c')
      map.connectNodes('a', 'b')
      map.connectNodes('c', 'b')
      // a <-> b <-> c

      players = ['p1', 'p2']
      die.roll.mockReturnValueOnce(5).mockReturnValueOnce(2)
      
      game = new Game(players, map, die)
    })

    describe('deployment actions', () => {
      beforeEach(() => {
        game.start()
      })

      test('available actions are correct for current player', () => {
        const actions = game.deploymentActions('p1')
        expect(actions).toEqual([
          {type: 'deploy', mapNode: 'a'},
          {type: 'deploy', mapNode: 'b'},
          {type: 'deploy', mapNode: 'c'}
        ])
      })

      test('no available actions for other players', () => {
        expect(game.deploymentActions('p2')).toEqual([])
      })

      test('do deployment', () => {
        jest.spyOn(map, 'claim')
        game.doDeploymentAction('p1', {type: 'deploy', mapNode: 'a'})
        expect(map.claim).toHaveBeenCalledWith('a', 'p1', 1)
      })

      test('disallow out of turn deployment', () => {
        expect(() => {
          game.doDeploymentAction('p2', {type: 'deploy', mapNode: 'a'})
        }).toThrow()
      })

      test('disallow non-existant node deployment', () => {
        expect(() => {
          game.doDeploymentAction('p1', {type: 'deploy', mapNode: 'd'})
        }).toThrow()
      })

      test('disallow repeated node deployment', () => {
        game.doDeploymentAction('p1', {type: 'deploy', mapNode: 'a'})
        game.turnIndex = 0
        expect(() => {
          game.doDeploymentAction('p1', {type: 'deploy', mapNode: 'a'})
        }).toThrow()
      })

      test('automatically increments the turn index after deployment', () => {
        game.doDeploymentAction('p1', {type: 'deploy', mapNode: 'a'})
        expect(game.turnIndex).toEqual(1)
        game.doDeploymentAction('p2', {type: 'deploy', mapNode: 'b'})
        expect(game.turnIndex).toEqual(0)
      })

      test('automatically proceeds to playing after deployment', () => {
        game.doDeploymentAction('p1', {type: 'deploy', mapNode: 'a'})
        game.doDeploymentAction('p2', {type: 'deploy', mapNode: 'b'})
        game.doDeploymentAction('p1', {type: 'deploy', mapNode: 'c'})

        expect(game.fsm.state).toEqual('playing')
        expect(game.turnIndex).toEqual(0)
      })
    })
  })
})