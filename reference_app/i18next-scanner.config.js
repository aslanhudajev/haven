const fs = require('fs')
const chalk = require('chalk')

const deviceLanguage = 'en'
const defaultLanguage = ['en', 'ru', 'es', 'de', 'pt', 'fr'].includes(deviceLanguage)
  ? deviceLanguage
  : 'en'

const i18nextScannerConfig = {
  input: ['app/**/*.{ts,tsx}', 'src/**/*.{ts,tsx}', '!**/node_modules/**'],
  output: './',
  options: {
    removeUnusedKeys: true,
    sort: true,
    attr: false,
    func: {
      list: ['t'],
    },
    trans: false,
    lngs: ['en', 'ru', 'es', 'de', 'pt', 'fr'],
    fallbackLng: defaultLanguage,
    defaultLng: defaultLanguage,
    defaultValue: customDefaultName,
    resource: {
      loadPath: 'src/shared/assets/locales/{{lng}}.json',
      savePath: 'src/shared/assets/locales/{{lng}}.json',
    },
    keySeparator: false,
  },
  transform: customTransform,
}

module.exports = i18nextScannerConfig

// PARTS

function customDefaultName(lng, ns, key) {
  return `{${key}}`
}

function customTransform(file, enc, done) {
  const parser = this.parser
  const content = fs.readFileSync(file.path, enc)
  const filePath = file.relative
  const extension = file.extname.slice(1)
  const keysParser = getKeysParser(extension)
  const keyPrefixParser = getKeyPrefixParser(extension)
  const keyPrefix = keyPrefixParser(content, filePath)
  let keysFound = 0

  keysParser.call(this, content, (key) => {
    const extendedKey = keyPrefix ? keyPrefix + '.' + key : key
    parser.set(extendedKey)
    keysFound++
  })

  if (keysFound > 0) {
    report(filePath, keysFound)
  }

  done()
}

function getKeysParser() {
  return parseTs

  function parseTs(content, callback = () => {}) {
    const parser = this.parser
    parser.parseFuncFromString(content, (key) => {
      callback(key)
    })
  }
}

function getKeyPrefixParser() {
  return parseTs

  function parseTs(content, filePath) {
    const regex = /useTranslation\(['"](.+?)['"]\)/g
    const prefixesAll = Array.from(content.matchAll(regex), (m) => m[1])
    const prefixesUnique = [...new Set(prefixesAll)]
    const prefixesUniqueNumber = prefixesUnique.length

    if (prefixesUniqueNumber > 1) {
      throw new Error(
        `Found multiple declaration of the key prefix [${prefixesUnique}] in the file "${filePath}". Please make a refactoring.`
      )
    }

    return prefixesAll[0]
  }
}

function report(fileName, keysFound = 0) {
  const keysNumberFormatted = chalk.cyan((keysFound + '   ').slice(0, 3))
  const fileNameFormatted = chalk.yellow(JSON.stringify(fileName))
  console.log(`  ${keysNumberFormatted} ${fileNameFormatted}`)
}
