// Parse details for a single command from the Berkley LOGO
// HTML doc pages

/**
 * Parse details for a single command from the Berkley LOGO
 * HTML doc pages
 * @param {CheerioStatic} $ The jQuery-like cheerio DOM object
 * @param {*} root The .section element that starts this command
 */
function parseCommandDetails ($, root) {
  // Initialize variables
  let description = ''
  let seeAlso = []

  // Parse out the full description and see also
  $(root).nextUntil('hr').each((i, elem) => {
    if ($(elem).find('.example').length > 0) {
      description += $.html($(elem).find('.example'))
    } else if ($(elem).text().trim().startsWith('See section')) {
      // Look for and parse the 'see also' section
      $(elem).find('a').each((i, alsoElem) => {
        seeAlso.push($(alsoElem).text().trim())
      })
    } else {
      // Build up the HTML description
      description += $.html(elem).replace(/\n/g, ' ')
    }
  })

  // Find and remove the 'library procedure' tag
  description = description.replace(/\s*\(library procedure\)/g, '')

  // Clean out whitespace that comes before a closing tag
  description = description.replace(/\s<\/\w+>/g, (match) => { return match.trim() })

  // Return the command with all its details
  return {
    command: $(root).text().trim(),
    description: description,
    seeAlso: seeAlso
  }
}

// Parse a single chapter from the Barkley LOGO docs and return
// as an organized JSON object
export function parseChapterPage ($) {
  // Get raw title for later parsing
  let rawTitle = $('.chapter').text().trim()

  // Build the section lists
  let sections = []
  $('.section').each((i, elem) => {
    // Get section name text
    let rawSection = $(elem).text().trim()

    // Get command elements for this section
    let commands = []
    $(elem).nextUntil('.section', '.unnumberedsubsec').each((i, elem) => {
      // Make and store the command object
      commands.push(parseCommandDetails($, elem))
    })

    // Make and store the section object
    sections.push({
      number: Number.parseFloat(rawSection),
      title: rawSection.substring(rawSection.search(/[a-zA-Z]/)),
      commands: commands
    })
  })

  // Combine and return chapter data
  return {
    number: Number.parseInt(rawTitle),
    title: rawTitle.substring(rawTitle.search(/[a-zA-Z]/)),
    sections: sections
  }
}
