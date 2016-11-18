module.exports = function(docker, cb) {
  docker.listServices((err, res) => {
    if (err) return cb(err);

    let services = !res ? [] : res.map((e) => {
      return {
        id: e.ID,
        name: e.Spec.Name,
        replicas: e.Spec.Mode.Replicated.Replicas
      };
    });

    return cb(null, services);
  });
};

