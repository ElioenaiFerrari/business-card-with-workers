const users = require('../resources/users.json');

const { v1 } = require('uuid');
const { Cluster } = require('puppeteer-cluster');
const querystring = require('querystring');
const { join } = require('path');

const BASE_URL =
  'https://erickwendel.github.io/business-card-template/index.html';

function createQueryStringFromObject(data) {
  const separator = null;
  const keyDelimiter = null;
  const options = { encodeURIComponent: querystring.unescape };

  const qs = querystring.stringify(data, separator, keyDelimiter, options);
  return qs;
}

async function render({ page, data: { finalURI, name } }) {
  const output = join(__dirname, `./../output/${name}-${v1()}.pdf`);
  await page.goto(finalURI, { waitUntil: 'networkidle2' });
  await page.pdf({
    path: output,
    format: 'a4',
    landscape: true,
    printBackground: true,
  });

  console.log(`ended ${output}`);
}

async function main() {
  try {
    const cluster = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_CONTEXT,
      maxConcurrency: 10,
    });

    const pid = process.pid;

    await cluster.task(render);

    for (const user of users) {
      const qs = createQueryStringFromObject(user);
      const finalURI = `${BASE_URL}?${qs}`;
      await cluster.queue({ finalURI, name: user.name });
    }

    await cluster.idle();
    await cluster.close();
    console.log(`${pid} has finished!`);
  } catch ({ message }) {
    console.error(`${pid} has broken - ${message}!`);
  }
}

main();
