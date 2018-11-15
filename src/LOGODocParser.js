import cheerio from 'cheerio'
import rp from 'request-promise'
import { parseChapterPage } from './ChapterParser'

// Range of chapters to process
const FIRST_CHAPTER = 2
const LAST_CHAPTER = 8

// Build an options object for a request-promise call
function getOptions (chapter) {
  return {
    uri: `https://people.eecs.berkeley.edu/~bh/docs/html/usermanual_${chapter}.html`,
    transform: (body) => {
      return cheerio.load(body)
    }
  }
}

// Retrieve data for a single category in a single bulletin
async function processChapter (chapter) {
  console.error(`Processing chapter ${chapter}`)
  try {
    let data = await rp(getOptions(chapter))
    return parseChapterPage(data)
  } catch (err) {
    console.error(`\tFailed to parse chapter ${chapter}:`)
    console.error(`\t${err}`)
  }

  // If we make it here something went wrong
  return []
}

// Main function looping over bulletins and categories
// NOTE: only the first bulletin is supported for now
async function doWork () {
  let data = []
  for (let i = FIRST_CHAPTER; i <= LAST_CHAPTER; i++) {
    let newList = await processChapter(i)
    data = data.concat(newList)
  }

  // Output the lists in a nice, readable format
  console.log(JSON.stringify(data, null, 2))
}

// Start the main function
doWork()
