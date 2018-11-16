import express from 'express'

// Data about the supported LOGO commands and documentation
import commandList from './CommandList'
import LOGODocs from './LogoDocumentation'
import { truncate } from 'fs';

// Make a router for the data API
let apiRouter = express.Router()

// Return a list of supported LOGO commands
apiRouter.get('/commands', (req, res) => {
  // Build a flat command array
  let commands = []
  commandList.chapters.forEach((chapter) => {
    chapter.sections.forEach((section) => {
      let supported = section.commands.filter((command) => {
        return command.supported
      })
      commands = commands.concat(supported)
    })
  })

  // Return those commands
  res.json(commands)
})

// Return commands filtered by chapter
apiRouter.get('/commands/:chapter', (req, res) => {
  // Build a flat command array
  let commands = []
  commandList.chapters.find((chapter) => {
    if (chapter.number === Number.parseInt(req.params.chapter)) {
      chapter.sections.forEach((section) => {
        let supported = section.commands.filter((command) => {
          return command.supported
        })
        commands = commands.concat(supported)
      })
      return true
    }
    return false
  })

  // Return those commands
  res.json(commands)
})

// Return commands filtered by chapter and section
apiRouter.get('/commands/:chapter/:section', (req, res) => {
  // Build a flat command array
  let commands = []
  commandList.chapters.find((chapter) => {
    if (chapter.number === Number.parseInt(req.params.chapter)) {
      let secNum = Number.parseInt(req.params.chapter) + Number.parseInt(req.params.section)/10
      chapter.sections.find((section) => {
        if (section.number === secNum) {
          let supported = section.commands.filter((command) => {
            return command.supported
          })
          commands = commands.concat(supported)
          return true
        }
        return false
      })
      return true
    }
    return false
  })

  // Return those commands
  res.json(commands)
})

// Return list of chapters
apiRouter.get('/chapters', (req, res) => {
  let chapters = commandList.chapters.map((chapter) => {
    return { number: chapter.number, title: chapter.title }
  })
  res.json(chapters)
})

// Return list of sections for given chapter
apiRouter.get('/sections/:chapter', (req, res) => {
  let sections = []
  commandList.chapters.forEach((chapter) => {
    if (chapter.number === Number.parseInt(req.params.chapter)) {
      sections = chapter.sections.map((section) => {
        return { number: section.number, title: section.title }
      })
    }
  })

  res.json(sections)
})

// Return documentation for a given command
apiRouter.get('/doc/:command', (req, res) => {
  let match = {}
  LOGODocs.find((chapter) => {
    let result = chapter.sections.find((section) => {
      let result = section.commands.find((command) => {
        if (command.command === req.params.command.toLowerCase()) {
          match = command
          return true
        }
        return false
      })
      return (result !== undefined)
    })
    return (result !== undefined)
  })

  res.json(match)
})

// Expose the router for use in other modules
export default apiRouter
