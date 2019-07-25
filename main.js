// Modules to control application life and create native browser window
const { app, dialog, Menu, BrowserWindow } = require('electron')
const path = require('path')

let mainWindow

global.dialogBox = (title, e) => dialog.showMessageBox({
	title: title,
	type: 'info',
	message: e
})

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1200,
		height: 700,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js')
		}
	})
	mainWindow.loadFile('index.html')
	mainWindow.on('closed', function() {
		mainWindow = null
	})
}

app.on('ready', createWindow)

app.on('window-all-closed', function() {
	if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function() {
	if (mainWindow === null) createWindow()
})


const menu = Menu.buildFromTemplate([{
	label: "Main",
	submenu: [
		{ role: 'services' },
		{ role: 'hide' },
		{ role: 'hideothers' },
		{ role: 'unhide' },
		{ type: 'separator' },
		{ role: 'quit' }
	]
}, {
	label: 'Dev Tool',
	accelerator: (() => {
		if (process.platform === 'darwin') {
			return 'Alt+Command+I'
		} else {
			return 'Ctrl+Shift+I'
		}
	})(),
	click: (item, focusedWindow) => {
		if (focusedWindow) {
			focusedWindow.toggleDevTools()
		}
	}
}, {
	label: 'Reload',
	accelerator: 'CmdOrCtrl+R',
	click: (item, focusedWindow) => {
		if (focusedWindow) {
			if (focusedWindow.id === 1) {
				BrowserWindow.getAllWindows().forEach(win => {
					if (win.id > 1) win.close()
				})
			}
			focusedWindow.reload()
		}
	}
}, {
	label: 'Full screen',
	accelerator: 'F11',
	click: (item, focusedWindow) => {
		if (focusedWindow) {
			focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
		}
	}
}, {
	label: "About",
	submenu: [{
		role: 'about',
		click: () => global.dialogBox('about', 'lyrieek')
	}]
}])
Menu.setApplicationMenu(menu)
