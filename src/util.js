const { app, dialog } = require('electron');

console.log(app);

module.exports.dialogBox = (title, e) => dialog.showMessageBox({
	title: title,
	type: 'info',
	message: e
});
