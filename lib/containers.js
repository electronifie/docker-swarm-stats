const Docker = require('dockerode');
const async = require('async');

module.exports = function(nodes, port, cb) {
  let hosts = nodes.map((e) => e.hostname);
  var containers = [];

  async.eachLimit(hosts, 8, (e, cbLocal) => {
    let docker = Docker({ host: e, port: port });
    
    docker.listContainers((err, res) => {
      if (err) return cbLocal(err);

      if (res) {
        containers = containers.concat(res.map((i) => {
          return {
            name: i.Names[0],
            image: i.Image,
            state: i.State,
            status: i.Status
          };
        }).filter((i) => i.state == "running"));
      }

      return cbLocal();
    });
  }, (err) => cb(err, containers.sort((x, y) => x > y)));
};

