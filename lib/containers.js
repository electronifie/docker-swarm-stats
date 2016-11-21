const Docker = require('dockerode');
const async = require('async');

module.exports = function(nodes, port, cb) {
  let hosts = [ "localhost" ]; //nodes.map((e) => e.hostname);
  var containers = [];

  async.eachLimit(hosts, 8, (hostname, cbLocal) => {
    let docker = Docker({ host: hostname, port: port });
    
    docker.listContainers((err, res) => {
      if (err) return cbLocal(err);

      if (res) {
        containers = containers.concat(res.map((i) => {
          return {
            id: i.Id,
            name: i.Names[0].slice(1), // trim off leading '/'
            hostname: hostname,
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

