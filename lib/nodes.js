module.exports = function(docker, cb) {
  
  docker.listNodes((err, res) => {
    if (err) return cb(err);

    let nodes = !res ? [] : res.map((e) => {
      return {
        hostname: e.Description.Hostname,
        memory: e.Description.Resources.MemoryBytes / 1024. / 1024.,
        labels: e.Description.Engine.Labels,
        role: e.Spec.Role
      };
    });

    return cb(null, nodes);
  });

};

