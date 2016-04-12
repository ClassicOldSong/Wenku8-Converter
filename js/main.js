/* global JSZip, saveAs */
"use strict";
{
	let zipBtn = document.querySelector('#zipBtn');
	let txtBtn = document.querySelector('#txtBtn');
	let mergeFile = document.querySelector('#mergeFile');
	let zipFile = document.querySelector('#zipFile');

	let sortNumber = function(a, b) {
		return a - b;
	};

	mergeFile.onchange = () => {
		if (!mergeFile.checked) {
			zipFile.checked = true;
		}
	};
	zipFile.onchange = () => {
		if (!zipFile.checked) {
			mergeFile.checked = true;
		}
	};

	zipBtn.onclick = () => {
		let zipLoader = document.createElement('input');
		zipLoader.type = 'file';
		zipLoader.accept = '.zip';
		zipLoader.addEventListener('change', function(e) {
			let fileReader = new FileReader();
			fileReader.onload = event => {
				let title = '';
				let chapters = [];
				let contentZip = new JSZip(event.target.result);
				let indexPage = document.createElement('div');
				indexPage.innerHTML = new TextDecoder('gb18030').decode(contentZip.file('index.htm').asUint8Array());
				title = indexPage.querySelector('#title').innerText.replace(/[ ~!@#$%\^\+\*&\\\/\?\|:\.<>{}()';="\u200f\u200e]/g, ' ');
				for (let i in contentZip.files) {
					if (i !== 'index.htm' && i !== 'page.css') {
						chapters.push(i.split('.')[0]);
					}
				}
				chapters.sort(sortNumber);
				if (mergeFile.checked) {
					let content = '';
					for (let i in chapters) {
						let page = document.createElement('div');
						page.innerHTML = new TextDecoder('gb18030').decode(contentZip.file(chapters[i]+'.htm').asUint8Array());
						content += page.querySelector('#contentmain').innerText.replace(/\n\n\n/g, '');
					}
					if (zipFile.checked) {
						let outputZip = new JSZip();
						outputZip.file(title + '.txt', content);
						saveAs(outputZip.generate({
							type: 'blob',
							compression: 'DEFLATE',
							compressionOptions: {
								level: 9
							}
						}), title + '_converted');
					} else {
						saveAs(new Blob([content], {type: '.txt'}), title + '_converted.txt');
					}
				} else {
					let outputZip = new JSZip();
					let chapterCount = (function() {
						let string = chapters.length.toString();
						return string.length - 1;
					})();
					for (let i in chapters) {
						let page = document.createElement('div');
						page.innerHTML = new TextDecoder('gb18030').decode(contentZip.file(chapters[i]+'.htm').asUint8Array());
						let filename = '';
						let chapterNumber = parseInt(i) + 1;
						filename = chapterNumber + ' ' + page.querySelector('#title').innerText.replace(/[ ~!@#$%\^\+\*&\\\/\?\|:\.<>{}()';="\u200f\u200e]/g, ' ') + '.txt';
						if (chapterNumber <= Math.pow(10, chapterCount)) {
							let numString = chapterNumber.toString();
							let diff = chapterCount - numString.length + 1;
							for (let j = 0; j < diff; j++) {
								filename = '0' + filename;
							}
						}
						outputZip.file(filename, page.querySelector('#contentmain').innerText.replace(/\n\n\n/g, ''));
					}
					saveAs(outputZip.generate({
						type: 'blob',
						compression: 'DEFLATE',
						compressionOptions: {
							level: 9
						}
					}), title + '_converted');
				}
			};
			fileReader.readAsArrayBuffer(e.target.files[0]);
		});
		zipLoader.click();
	};

	txtBtn.onclick = () => {
		let txtLoader = document.createElement('input');
		txtLoader.type = 'file';
		txtLoader.accept = '.txt';
		txtLoader.addEventListener('change', function(e) {
			let fileReader = new FileReader();
			let fileName = e.target.files[0].name.split('.')[0];
			fileReader.onload = event => {
				let u8arr = new Uint8Array(event.target.result);
				if (zipFile.checked) {
					let outputZip = new JSZip();
					outputZip.file(fileName + '.txt', new TextDecoder('gb18030').decode(u8arr));
					saveAs(outputZip.generate({
						type: 'blob',
						compression: 'DEFLATE',
						compressionOptions: {
							level: 9
						}
					}), fileName + '_converted');
				} else {
					saveAs(new Blob([new TextDecoder('gb18030').decode(u8arr)], {type: '.txt'}), fileName + '_converted.txt');
				}
			};
			fileReader.readAsArrayBuffer(e.target.files[0]);
		});
		txtLoader.click();
	};
}