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
       appDirectory: path.join(outPath, 'Spark-win32-ia32/'),
       authors: 'Diego Villagrasa',
       noMsi: true,
       outputDirectory: path.join(outPath, 'windows-installer'),
       exe: 'Spark.exe',
       setupExe: 'SparkInstaller.exe',
       setupIcon: path.join(rootPath, 'assets', 'logo256.ico')
   })
}
