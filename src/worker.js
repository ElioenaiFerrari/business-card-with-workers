const { v1 } = require('uuid');
const puppeteer = require('puppeteer');
const querystring = require('querystring');
const { join } = require('path');
const locateChrome = require('locate-chrome');

const BASE_URL =
  'https://erickwendel.github.io/business-card-template/index.html';

function createQueryStringFromObject(data) {
  const separator = null;
  const keyDelimiter = null;
  const options = { encodeURIComponent: querystring.unescape };

  const qs = querystring.stringify(data, separator, keyDelimiter, options);
  return qs;
}

async function render({ finalURI, name }) {
  const executablePath = await locateChrome();

  const output = join(__dirname, `./../output/${name}-${v1()}.pdf`);
  const browser = await puppeteer.launch({
    executablePath,
  });
  const page = await browser.newPage();
  await page.goto(finalURI, { waitUntil: 'networkidle2' });
  await page.pdf({
    path: output,
    format: 'a4',
    landscape: true,
    printBackground: true,
  });

  await browser.close();
}

async function main(message) {
  const pid = process.pid;

  try {
    const qs = createQueryStringFromObject(message);
    const finalURI = `${BASE_URL}?${qs}`;

    await render({ finalURI, name: message.name });
    process.send(`${pid} has finished!`);
  } catch ({ message }) {
    process.send(`${pid} has broken - ${message}!`);
  }
}

process.once('message', main);
