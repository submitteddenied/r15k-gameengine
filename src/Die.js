class Die {
  constructor(random) {
    this.random = random
  }

  roll() {
    return Math.floor(this.random() * 6) + 1
  }
}

module.exports = Die