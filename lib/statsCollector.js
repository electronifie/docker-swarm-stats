const es = require('event-stream');
const request = require('superagent');
const StatsStream = require('./statsStream');

class StatsCollector {
  constructor(url) {
    this.url = url;

    // keyed on container ID
    this.stats = {};
  }

  // add/remove containers from this.stats
  updateContainerIds(containerIds) {
    let newSet = new Set(containerIds);

    containerIds.forEach((e) => {
      if (!this.stats[e]) {
        this.add(e);
      }
    });

    Object.keys(this.stats).forEach((e) => {
      if (!newSet.has(e)) {
        this.remove(e);
      }
    });
  }

  // for each new container, open up an HTTP stream for container stats
  add(containerId) {
    this.stats[containerId] = {
      stream: request.get(`${this.url}/containers/${containerId}/stats`)
    };

    this.stats[containerId].stream
      .pipe(es.split())
      .pipe(es.parse())
      .pipe(new StatsStream(this, containerId))
  }

  remove(containerId) {
    this.stats[containerId].stream.end();
    delete this.stats[containerId];
  }

  handle(data) {
    let prev = this.stats[data.id];

    this.stats[data.id] = data;
    this.stats[data.id].stream = prev.stream;

    // calculate cpu percentages
    let cpuDelta = data.cpu.total - data.cpu.totalPre;
    let systemDelta = data.cpu.system - data.cpu.systemPre;

    //console.log(cpuDelta, systemDelta, data.cpu.cpus)

    if (cpuDelta > 0 && systemDelta > 0) {
      this.stats[data.id].cpuPercent = ((cpuDelta / systemDelta) * data.cpu.cpus * 100).toFixed(2);
    } else {
      this.stats[data.id].cpuPercent = (0.0).toFixed(2);
    }
    console.log(data.id, this.stats[data.id].cpuPercent);
  }
}

module.exports = StatsCollector;

