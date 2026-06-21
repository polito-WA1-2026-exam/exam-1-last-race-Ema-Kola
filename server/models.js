function Event(id, description, effect) {
    this.id = id;
    this.description = description;
    this.effect = effect;
}

function Game(id, username, score, startStation, endStation, playedAt) {
    this.id = id;
    this.username = username;
    this.score = score;
    this.startStation = startStation;
    this.endStation = endStation;
    this.playedAt = playedAt;
}

export { Event, Game };
