/* globals $ */
// @ts-nocheck

let examples = [
  { name: 'Square',
    code: `repeat 4 [FD 100 RT 90]`},
  { name: 'Koch Island',
    code: `; Koch Island (ABOP Fig 1.7a)
; F rule expansion
to F :len :lev
  IFELSE (:lev < 1) [ fd :len ] [
    (F (:len / 2) (:lev - 1))
    lt 90
    (F (:len / 2) (:lev - 1))
    (F (:len / 2) (:lev - 1))
    rt 90
    (F (:len / 2) (:lev - 1))
    (F (:len / 2) (:lev - 1))
    rt 90
    (F (:len / 2) (:lev - 1))
    rt 90
    (F (:len / 2) (:lev - 1))
    lt 90
    (F (:len / 2) (:lev - 1))
    lt 90
    (F (:len / 2) (:lev - 1))
    (F (:len / 2) (:lev - 1))
    rt 90
    (F (:len / 2) (:lev - 1))
    rt 90
    (F (:len / 2) (:lev - 1))
    lt 90
    (F (:len / 2) (:lev - 1))
    lt 90
    (F (:len / 2) (:lev - 1))
    (F (:len / 2) (:lev - 1))
    lt 90
    (F (:len / 2) (:lev - 1))
    (F (:len / 2) (:lev - 1))
    rt 90
    (F (:len / 2) (:lev - 1))
  ]
end

; Initial Rule
to start :len :iter
  (F :len :iter)
  lt 90 
  (F :len :iter)
  lt 90 
  (F :len :iter)
  lt 90 
  (F :len :iter)
end

; Better Starting Position
(setxy 90 90)

; Draw it
(start 20 2)
`},
  { name: 'Koch Snowflake',
    code: `; Koch Snowflake Variant (ABOP Fig 1.7b)
; F rule expansion
to F :len :lev
  IFELSE (:lev < 1) [ fd :len ] [
    (F (:len / 2) (:lev - 1))
    lt 90
    (F (:len / 2) (:lev - 1))
    rt 90
    (F (:len / 2) (:lev - 1))
    rt 90
    (F (:len / 2) (:lev - 1))
    lt 90
    (F (:len / 2) (:lev - 1))
  ]
end

; Move turtle to new start
setxy -200 100

; Initial rule
rt 90
(F 80 4)
`},
  { name: 'Dragon Curve',
    code: 
`; Dragon Curve (ABOP Fig 1.10a)
; FL rule expansion
to FL :len :lev
  IFELSE (:lev < 1) [ fd :len ] [
    (FL (:len / 2) (:lev - 1))
    rt 90
    (FR (:len / 2) (:lev - 1))
    rt 90
  ]
end

; FR rule expansion
to FR :len :lev
  IFELSE (:lev < 1) [ fd :len ] [
    lt 90
    (FL (:len / 2) (:lev - 1))
    lt 90
    (FR (:len / 2) (:lev - 1))
  ]
end

setxy -100 40

; Initial rule
(FL 8000 10)
`},
  { name: 'Serpinski Gasket',
    code:
`; Serpinski Gasket (ABOP Fig 1.10b)
; FL rule expansion
to FL :len :lev
  IFELSE (:lev < 1) [ fd :len ] [
    (FR (:len / 2) (:lev - 1))
    rt 60
    (FL (:len / 2) (:lev - 1))
    rt 60
    (FR (:len / 2) (:lev - 1))
  ]
end

; FR rule expansion
to FR :len :lev
  IFELSE (:lev < 1) [ fd :len ] [
    (FL (:len / 2) (:lev - 1))
    lt 60
    (FR (:len / 2) (:lev - 1))
    lt 60
    (FL (:len / 2) (:lev - 1))
  ]
end

; Better start pos
setxy 160 130

; Initial rule
LT 90
(FR 320 8)
`}
]

let updateNeeded = true
let prevSelection = 0

$(document).ready(() => {
  // Setup examples
  let exampSel = $('#inputExample')
  examples.forEach((examp) => {
    let opt = $('<option/>')
      .text(examp.name)
      .val(examp.code)
    exampSel[0].add(opt[0])
  })

  // Load examples
  let codeInput = $('#inputlogoCode')
  exampSel.on('change', () => {
    let overwrite = true

    // Check if the code is different from the previous selection
    let currentCode = codeInput.val()
    if (currentCode !== exampSel[0].options[prevSelection].value) {
      if (!window.confirm('Lose your changes?')) {
        overwrite = false
      }
    }

    // Load the example code if overwrite is true
    if (overwrite) {
      codeInput.val(exampSel.val())
      prevSelection = exampSel[0].selectedIndex    
      updateNeeded = true
    } else {
      exampSel[0].selectedIndex = prevSelection
    }
  })

  // Initialize to first example
  prevSelection = exampSel[0].selectedIndex
  codeInput.val(exampSel.val())

  // Initialize the canvas
  let canvas = $('#turtleCanvas')[0]
  canvas.width = canvas.clientWidth
  canvas.height = canvas.clientHeight

  // Respond to resize events
  $(window).on('resize', resizeCanvas)

  // Setup an event to detect changes in code
  $('#inputlogoCode').on('keyup', (event) => {
    updateNeeded = true
  })

  // Setup an event to detect chagnes in code
  $('#inputlogoCode').on('change', (event) => {
    updateNeeded = true
  })

  // Retrieve the commands and setup the command reference page
  retrieveChapterList()
  $('#chapterList').on('change', () => {
    retrieveSectionList($('#chapterList').val())
    retrieveCommandList()
  })

  $('#sectionList').on('change', () => {
    retrieveCommandList()
  })

  retrieveCommandList()
  $('#commandList').on('change', () => {
    retrieveCommandDoc($('#commandList').val())
  })

  // Check for code changes every second
  setInterval(parseCode, 1000)
})

function retrieveCommandDoc (command) {
  $.ajax({url: `/doc/${command}`, type: 'GET'})
    .done((data) => {
      if (data !== null && data.command !== null) {
        $('#commandTitle').text(data.command.toUpperCase())
        $('#commandDetails').html(data.description)
      } else {
        $('#commandTitle').text('')
        $('#commandDetails').html('')
      }
    })
    .fail(() => { console.error(`Failed to retrieve documentation for ${command}`) })
}

function retrieveChapterList () {
  clearChapters()
  clearSections()
  clearCommands()
  $.ajax({url: '/chapters', type: 'GET'})
    .done((data) => { rebuildChapterList(data) })
    .fail(() => { console.error('Failed to retrieve chapters') })
}

function retrieveSectionList (chapter) {
  clearSections()
  clearCommands()
  $.ajax({url: `/sections/${chapter}`, type: 'GET'})
    .done((data) => { rebuildSectionList(data) })
    .fail(() => { console.error('Failed to retrieve sections') })
}

function retrieveCommandList () {
  clearCommands()

  // Build the URL filtering by chapter and section
  let URL = '/commands'
  if ($('#chapterList')[0].selectedIndex !== -1) {
    let chapter = $('#chapterList').val()
    URL += `/${chapter}`

    if ($('#sectionList')[0].selectedIndex !== -1) {
      let section = $('#sectionList').val()
      URL += `/${section}`
    }
  }

  // Make ajax get request
  $.ajax({url: URL, type: 'GET'})
    .done((data) => { rebuildCommandList(data) })
    .fail(() => { console.error('Command GET request failed') })
}

function clearChapters () {
  // Clear list
  let list = $('#chapterList')[0]
  while (list.length > 0) {
    list.remove(0)
  }
  list.selectedIndex = -1
}

function clearSections () {
  // Clear list
  let list = $('#sectionList')[0]
  while (list.length > 0) {
    list.remove(0)
  }
  list.selectedIndex = -1
}

function clearCommands () {
  // Clear list
  let list = $('#commandList')[0]
  while (list.length > 0) {
    list.remove(0)
  }
  list.selectedIndex = -1
}

function rebuildChapterList (data) {
  let list = $('#chapterList')[0]

  // Add chapters
  data.forEach((chapter) => {
    let elem = $('<option/>')
      .text(`${chapter.number} - ${chapter.title}`)
      .val(chapter.number)
    list.add(elem[0])
  })
}

function rebuildSectionList (data) {
  let list = $('#sectionList')[0]

  // Add chapters
  data.forEach((section) => {
    let secNum = (section.number - Math.trunc(section.number)) * 10
    let elem = $('<option/>')
      .text(`${section.number} - ${section.title}`)
      .val(secNum.toFixed(0))
    list.add(elem[0])
  })
}

function rebuildCommandList (data) {
  let list = $('#commandList')[0]

  // Add commands
  data.forEach((command) => {
    let alias = (command.aliasFor || command.command)
    let elem = $('<option/>')
      .text(command.command)
      .val(alias)
    list.add(elem[0])
  })
}

function parseCode () {
  // Avoid sending an empty string
  if ($('#inputlogoCode').val().trim() === '') {
    $('#errorOutput').text('Type your commands above')
    return
  }

  // Update the commands if needed
  if (updateNeeded) {
    updateNeeded = false

    // Retrieve the code and attach to an object
    let payload = {
      commands: $('#inputlogoCode').val()
    }

    // Send an ajax post via jQuery
    $.ajax({
      url: '/parse',
      type: 'POST',
      data: JSON.stringify(payload),
      contentType: 'application/json',
      complete: executeCommands
    }).fail(() => { console.error('POST request failed') })
  }
}

function resizeCanvas () {
  let canvas = $('#turtleCanvas')[0]
  if (canvas.width !== canvas.clientWidth ||
      canvas.height !== canvas.clientHeight) {
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight
    updateNeeded = true
    parseCode()
  }
}

class Turtle {
  constructor (canvas) {
    // Setup the canvas context
    this.canvas = canvas
    this.ctx = this.canvas.getContext('2d')

    // Setup defaults for other internal variables
    this.x = this.canvas.width / 2
    this.y = this.canvas.height / 2
    this._heading = -Math.PI / 2
    this._color = 'white'
    this._background = 'black'
    this._draw = true
    this._outBuffer = ''
    this._width = 2
  }

  set width (width) {
    this._width = width + 1
    this.end()
    this.begin()
  }

  // 0 in LOGO is straight up so we offset by 90 degrees
  set heading (angle) {
    this._heading = (angle / 180 * Math.PI) - Math.PI / 2
  }

  set color (color) {
    if (!isNaN(Number.parseInt(color, 16))) {
      this._color = '#' + color
    } else {
      this._color = color
    }
    this.end()
    this.begin()
  }

  set background (color) {
    if (!isNaN(Number.parseInt(color, 16))) {
      this._background = '#' + color
    } else {
      this._background = color
    }
  }

  // Offset so that 0 is in the middle
  setX (x) {
    this.x = x + this.canvas.width / 2
    this.end()
    this.begin()
  }

  // Offset so that 0 is in the middle
  setY (y) {
    this.y = y + this.canvas.height / 2
    this.end()
    this.begin()
  }

  // Offset so (0, 0) is in the middle
  setXY (x, y) {
    this.x = x + this.canvas.width / 2
    this.y = y + this.canvas.height / 2
    this.end()
    this.begin()
  }

  home () {
    this.setXY(0, 0)
  }

  begin () {
    this.ctx.beginPath()
    this.ctx.lineWidth = this._width
    this.ctx.strokeStyle = this._color
    this.ctx.moveTo(this.x, this.y)
  }

  end () {
    this.ctx.stroke()
    if (this._outBuffer.trim() !== '') {
      this.print('\n') // Force buffer flush
    }
  }

  penup () {
    this._draw = false
  }

  pendown () {
    this._draw = true
  }

  move (len) {
    let newX = this.x + Math.cos(this._heading) * len
    let newY = this.y + Math.sin(this._heading) * len
    newX = +(newX.toFixed(2))
    newY = +(newY.toFixed(2))
    if (this._draw) {
      this.ctx.lineTo(newX, newY)
    } else {
      this.ctx.moveTo(newX, newY)
    }
    this.x = newX
    this.y = newY
  }

  turn (deg) {
    this._heading += deg / 180 * Math.PI
    while (this._heading > Math.PI) { this._heading -= 2 * Math.PI }
    while (this._heading <= Math.PI) { this._heading += 2 * Math.PI }
  }

  clear () {
    this.ctx.fillStyle = this._background
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  print (str) {
    this._outBuffer += str
    if (str.includes('\n')) {
      console.log(this._outBuffer)
      this._outBuffer = ''
    }
  }
}

// Receive the parsed commands and execute them
function executeCommands (data, status, jqXHR) {
  // Check the status and respond
  if (status === 'error' || data.responseJSON.error) {
    if (status === 'error') {
      $('#errorOutput').text('Failed to parse commands')
    } else {
      $('#errorOutput').text(data.responseJSON.error)
    }
  } else {
    // Clear any displayed error messages
    $('#errorOutput').text(`Received ${data.responseJSON.length} commands`)

    // Create a turtle and clear
    let turtle = new Turtle($('#turtleCanvas')[0])
    turtle.clear()

    // Execute each command
    data.responseJSON.forEach((command) => {
      switch (Object.keys(command)[0]) {
        case 'begin': turtle.begin(); break
        case 'end': turtle.end(); break
        case 'penup': turtle.penup(); break
        case 'pendown': turtle.pendown(); break
        case 'move': turtle.move(command.move[0]); break
        case 'turn': turtle.turn(command.turn[0]); break
        case 'home': turtle.home(); break
        case 'setheading': turtle.heading = command.heading[0]; break
        case 'setwidth': turtle.width = command.setwidth[0]; break
        case 'setpencolor': turtle.color = command.setcolor[0]; break
        case 'setscreencolor': turtle.background = command.setscreencolor[0]; break
        case 'setposition': turtle.setXY(command.setposition[0], command.setposition[1]); break
        case 'clear': turtle.clear(); break
        case 'print': turtle.print(command.print[0]); break

        // Not yet implemented
        case 'arc':
        case 'showturtle':
        case 'hideturtle':
        case 'clearscreen':
        case 'setpenmode':
        default: console.log(`Unsupported: ${command}`); break
      }
    })
  }
}
