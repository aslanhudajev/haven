import fs from 'fs'
import path from 'path'

// args: --profile production --platform ios|android
const args = process.argv.slice(2)
const getArg = (name) => {
  const i = args.indexOf(`--${name}`)
  return i !== -1 ? args[i + 1] : undefined
}

const profile = getArg('profile')
const platform = getArg('platform') // ios | android

if (!profile || !platform) {
  console.error(
    'Usage: node scripts/force-remote-credentials.js --profile <name> --platform ios|android'
  )
  process.exit(1)
}

const file = path.resolve('eas.json')
const json = JSON.parse(fs.readFileSync(file, 'utf8'))

if (!json.build || !json.build[profile]) {
  console.error(`Profile "${profile}" not found in eas.json`)
  process.exit(1)
}

// гарантируем, что секция платформы есть
json.build[profile][platform] = {
  ...(json.build[profile][platform] || {}),
  credentialsSource: 'remote',
}

// (необязательно) подстрахуемся, чтобы случайные локальные флаги не просочились
// если вы где-то оставляете credentialsSource на верхнем уровне — тоже норм
// но EAS читает платформенные поля в приоритете
fs.writeFileSync(file, JSON.stringify(json, null, 2))
console.log(`Set build.${profile}.${platform}.credentialsSource = "remote"`)
