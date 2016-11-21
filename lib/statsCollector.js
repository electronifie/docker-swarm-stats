const es = require('event-stream');
const request = require('superagent');
const StatsStream = require('./statsStream');

class StatsCollector {
  constructor(url) {
    this.url = url;

    // keyed on container ID
    this.stats = {};

  }

  // for each new container, open up an HTTP stream for container stats
  add(containerId) {
    console.log("Adding %s", containerId);
    console.log("querying: %s", `${this.url}/containers/${containerId}/stats`);
    this.stats[containerId] = {
      stream: request.get(`${this.url}/containers/${containerId}/stats`)
    };

    this.stats[containerId].stream
      .pipe(es.split())
      .pipe(es.parse())
      .pipe(new StatsStream(this, containerId))
  }

  remove(containerId) {
    console.log("REMOVING: ", containerId);
    this.stats[containerId].stream.end();
    delete this.stats[containerId];
  }

  handle(data) {
    console.log("HANDLING %j", data);
    let prev = this.stats[data.id];

    this.stats[data.id] = data;
    this.stats[data.id].stream = prev.stream;

  }
}

module.exports = StatsCollector;

