import axios from 'axios'
import * as readline from 'readline'
const cliProgress = require('cli-progress');
var colors = require('colors');

const Downloader = require('nodejs-file-downloader')
const cheerio = require('cheerio')

const axiosins = axios.create()
var pubcode = ''
var array = []

const bar = new cliProgress.SingleBar(({
  format: colors.blue('Downloading: [{bar}] {percentage}% | {value}/{total} pages | ETA: {eta}s'),
  hideCursor: true
}))

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// main scraper and function
const first = new Promise((resolve) => {
  rl.question(colors.blue('Give me the code: '), (code) => {
    const url = 'https://nhentai.net/g/' + code
    pubcode = code
    axiosins.get(url)
      .then(
        async response => {
          var $ = cheerio.load(response.data)

          // get pages
          $('.lazyload').each(async (_index: any, value: any) => {
            var link = $(value).attr('data-src')

            // check what its going to download
            var linktoadd: any
            linktoadd = getLinks(link)
            if (linktoadd != undefined) array.push(linktoadd)
          })
          rl.close()
          await download()
          resolve()
        }).catch(console.error)
  })
})

const getLinks = (link: string) => {
  switch (true) {
    case (!link.includes('thumb') && !link.includes('cover')):
      // needed to get full resolution, 1st is the cover obviously
      var splitted = link.split('.', -1)
      splitted[0] = splitted[0].replace('https://t', 'https://i')
      splitted[2] = splitted[2].substring(0, splitted[2].length - 1)
      var last = splitted.join('.')
      return last
    default:
      // we don't need the suggestions etc, hence we do nothing when those are encountered
  }
}

const download = async () => {
  bar.start(array.length, 0);
    var i;
  for (i = 0; i < array.length; i++) {
    try {
      const downloader = new Downloader({
        url: array[i],
        directory: './' + pubcode
      })
      await downloader.download()
      bar.update(i + 1)
    } catch (error) {
      console.log('Error downloading -> ' + error)
      }
    }
    bar.stop()
  return
}

const flow = async () => {
  await Promise.all([first])
}

flow()
