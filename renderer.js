const fs = require('fs');
const path = require('path');
const $ = require('jslite');
const moment = require('moment');
const _ = require('lodash');
const remote = require('electron').remote;
const buildEditorContextMenu = remote.require('electron-editor-context-menu');
const message = require('./src/util')

$(function() {

	let currentFilePath;
	let lastFilePath;

	function loadFileList(filePath) {
		$('#fileList').html('');
		$('#currentFilePath').val(filePath);
		lastFilePath = currentFilePath;
		currentFilePath = filePath;
		const scannerFile = [];
		const readyFileItems = fs.readdirSync(filePath);
		readyFileItems.forEach(function(filename, index) {
			fs.stat(path.join(filePath, filename), function(eror, stats) {
				if (eror) {
					return message.dialogBox('error', 'cannot get stat')
				}
				let fileType = "File";
				let fileIcon = "file-o";
				if (stats.isDirectory()) {
					fileType = "Folder";
					fileIcon = "folder-o";
				} else {
					if (filename.toLowerCase() === 'license') {
						fileIcon = 'id-card';
					}
				}
				scannerFile.push({
					name: filename,
					icon: fileIcon,
					type: fileType,
					size: stats.size,
					ctime: stats.ctime,
					mtime: stats.mtime
				});
				if (readyFileItems.length === scannerFile.length) {
					for (const item of _.sortBy(scannerFile, [(file) => file.type === 'File', 'name'])) {
						const elem = $(`<tr>
                            <td><i class='fa fa-${item.icon}' style='display:inline-block;width:21px'></i>${item.name}</td>
                            <td>${item.type}</td>
                            <td>${moment(item.ctime).format('YYYY-MM-DD')}</td>
                            <td>${moment(item.mtime).format('YYYY-MM-DD')}</td>
                            <td>${item.size || ''}</td>
                        </tr>`);
						if (item.type === 'Folder') {
							elem.click(function() {
								loadFileList(currentFilePath + '\\' + item.name);
							});
						}
						elem.appendTo('#fileList');
					}
				}
			})
		});
	}

	$("#fileNameSearch").keyup(function() {
		const searchText = $(this).val();
		const result = $('#dataContent>table tr').show().find('td:first-child');
		result.each(function() {
			if (!~$(this).text().indexOf(searchText)) {
				$(this).parent().hide();
			}
		});
	});

	$("#currentFilePath").keyup(function() {
		loadFileList($(this).val());
	});
	// layer.open({
	// 	content: '传入任意的文本或html'
	// });

	window.addEventListener('contextmenu', function(e) {
		if (e.target.closest('textarea, input, [contenteditable="true"]')) return;
		var menu = buildEditorContextMenu({
			isMisspelled: false,
			spellingSuggestions: [
				'men'
			]
		});
		setTimeout(function() {
			menu.popup(remote.getCurrentWindow());
		}, 30);
	});

	const toolbar = {
		back: {
			icon: 'caret-left',
			action: function() {
				const lastPoint = currentFilePath.lastIndexOf('\\');
				loadFileList(currentFilePath.substring(0, lastPoint));
			}
		},
		undo: {
			icon: 'caret-right',
			action: () => loadFileList(lastFilePath)
		},
		refresh: {
			action: () => loadFileList(currentFilePath)
		}
	};
	for (const item in toolbar) {
		const elem = $(`<button class="layui-btn layui-btn-sm">
            <i class="fa fa-${toolbar[item].icon || item}"></i>
        </button>`);
        elem.click(toolbar[item].action);
        elem.appendTo('#toolbar');
	}

	loadFileList(__dirname);
});
