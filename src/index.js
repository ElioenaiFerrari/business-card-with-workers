const users = require('../resources/users.json');
const cp = require('child_process');

const modulePath = `${__dirname}/worker.js`;

(async function main() {
  for (const user of users) {
    const worker = cp.fork(modulePath, []);

    worker.on('message', console.log);
    worker.on('error', console.log);

    worker.send(user);
  }
})();
