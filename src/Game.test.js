const Game = require('./Game')
const Die = require('./Die')

jest.mock('./Die')

describe('Game', () => {
  let die
  beforeEach(() => {
    die = new Die(Math.random)
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
})