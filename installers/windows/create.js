const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller
const path = require('path')

getInstallerConfig()
     .then(createWindowsInstaller)
     .catch((error) => {
     console.error(error.message || error)
     process.exit(1)
 })

function getInstallerConfig () {
    console.log('creating windows installer')
    const rootPath = path.join('./')
    const outPath = path.join(rootPath, 'release-builds')

    return Promise.resolve({
       appDirectory: path.join(outPath, 'Mantis-win32-ia32/'),
       authors: 'Mantis Dev Team',
       noMsi: true,
       outputDirectory: path.join(outPath, 'windows-installer'),
       exe: 'Mantis.exe',
       setupExe: 'MantisInstaller.exe',
       loadingGif: path.join(rootPath, 'assets/icons', 'loader.gif'),
       setupIcon: path.join(rootPath, 'assets/icons', 'logo256.ico')
   })
}
