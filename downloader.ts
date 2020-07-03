import axios from 'axios'
import * as readline from 'readline'

const Downloader = require('nodejs-file-downloader')
const cheerio = require('cheerio')

const axiosins = axios.create()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.question('Give me the code: ', (code) => {
  const url = 'https://nhentai.net/g/' + code
  console.log('Downloading...')
  axiosins.get(url)
    .then(
      response => {
        var $ = cheerio.load(response.data)

        // get pages
        $('.lazyload').each((_index, value) => {
          var link = $(value).attr('data-src')

          // check what its going to download
          if (!link.includes('thumb') && !link.includes('cover')) {
            // needed to get full resolution, 1st is the cover obviously
            var splitted = link.split('.', -1)
            splitted[0] = splitted[0].replace('https://t', 'https://i', -1)
            splitted[2] = splitted[2].substring(0, splitted[2].length - 1)
            var last = splitted.join('.')
            downloadpage(last, code)
          } else {
            // we don't need the suggestions
            console.log('Skipping non needed')
          }
        })
        rl.close()
      }
    )
    .catch(console.error)
  const downloadpage = async (url, code) => {
    try {
      const downloader = new Downloader({
        url: url,
        directory: './' + code
      })
      downloader.download()
    } catch (err) {
      console.log(err)
    }
  }
})
