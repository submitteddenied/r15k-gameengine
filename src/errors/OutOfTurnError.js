class OutOfTurnError extends Error {
  constructor(message) {
    super(message)
  }
}

module.exports = OutOfTurnError