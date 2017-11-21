#!/usr/bin/env node

/*!
 * Script to find unused Sass variables.
 *
 * Copyright 2017 The Bootstrap Authors
 * Copyright 2017 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */

'use strict'

const path = require('path')
const sh = require('shelljs')

sh.config.fatal = true

// Blame TC39... https://github.com/benjamingr/RegExp.escape/issues/37
RegExp.quote = (string) => string.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&')

let globalSuccess = true

function findUnusedVars(dir) {
  if (!sh.test('-d', dir)) {
    console.log(`"${dir}": Not a valid directory!`)
    process.exit(1)
  }

  console.log(`Finding unused variables in "${dir}"...`)

  // A variable to handle success/failure message in this function
  let unusedVarsFound = false

  // String of all Sass files' content
  const sassFiles = sh.cat(path.join(dir, '**/*.scss'))
  // String of all Sass variables
  const variables = sassFiles.grep(/^\$[a-zA-Z0-9_-][^:]*/g)
                             .replace(/(\$[a-zA-Z0-9_-][^:]*).*/g, '$1')
                             .trim()

  // Convert string into an array
  const variablesArr = Array.from(variables.split('\n'))

  console.log(`There's a total of ${variablesArr.length} variables.`)

  // Loop through each variable
  variablesArr.forEach((variable) => {
    const re = new RegExp(RegExp.quote(variable), 'g')
    const count = (sassFiles.match(re) || []).length

    if (count === 1) {
      console.log(`Variable "${variable}" is only used once!`)
      unusedVarsFound = true
      globalSuccess = false
    }
  })

  if (unusedVarsFound === false) {
    console.log(`No unused variables found in "${dir}".`)
  }
}

function main(args) {
  if (args.length < 1) {
    console.log('Wrong arguments!')
    console.log('Usage: lint-vars.js folder [, folder2...]')
    process.exit(1)
  }

  args.forEach((arg) => {
    findUnusedVars(arg)
  })

  if (globalSuccess === false) {
    process.exit(1)
  }
}

// The first and second args are: path/to/node script.js
main(process.argv.slice(2))
