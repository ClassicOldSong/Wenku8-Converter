/* global JSZip, saveAs */
"use strict";
{
	let zipBtn = document.querySelector('#zipBtn');
	let txtBtn = document.querySelector('#txtBtn');
	let mergeFile = document.querySelector('#mergeFile');
	let zipFile = document.querySelector('#zipFile');
	let outPut = document.querySelector('#outPut');

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

	let sortNumber = function(a, b) {
		return a - b;
	};

	let pageCreation = function(content) {
		let tempPage = document.createElement('div');
		tempPage.innerHTML = new TextDecoder('gb18030').decode(content).replace(/<img(.*)??>/ig, '');
		return tempPage;
	};

	let logger = {
		log(content) {
			outPut.textContent = `[Log] ${content}\n` + outPut.textContent;
		},
		err(content) {
			outPut.textContent = `[Error] ${content}\n` + outPut.textContent;
		},
		clear() {
			outPut.textContent = '';
		}
	};

	zipBtn.onclick = () => {
		let zipLoader = document.createElement('input');
		zipLoader.type = 'file';
		zipLoader.accept = '.zip';
		zipLoader.addEventListener('change', function(e) {
			logger.clear();
			logger.log('Starting conversion...');
			let fileReader = new FileReader();
			fileReader.onload = event => {
				let title = '';
				let chapters = [];
				try {
					let contentZip = new JSZip(event.target.result);
					let indexPage = pageCreation(contentZip.file('index.htm').asUint8Array());
					title = indexPage.querySelector('#title').textContent.replace(/[ ~!@#$%\^\+\*&\\\/\?\|:\.<>{}()';="\u200f\u200e]/g, ' ');
					indexPage = null;
					logger.log(`Book Name: ${title}`);
					for (let i in contentZip.files) {
						if (i !== 'index.htm' && i !== 'page.css') {
							chapters.push(i.split('.')[0]);
						}
					}
					logger.log(`Chapters read: ${chapters.length}`);
					chapters.sort(sortNumber);
					if (mergeFile.checked) {
						let content = '';
						for (let i in chapters) {
							let page = pageCreation(contentZip.file(chapters[i]+'.htm').asUint8Array());
							content += page.querySelector('#contentmain').textContent.replace(/\n\n\n/g, '');
							page = null;
						}
						if (zipFile.checked) {
							logger.log('Packaging...');
							let outputZip = new JSZip();
							outputZip.file(title + '.txt', content);
							saveAs(outputZip.generate({
								type: 'blob',
								compression: 'DEFLATE',
								compressionOptions: {
									level: 9
								}
							}), title + '_converted.zip');
						} else {
							saveAs(new Blob([content], {type: 'plain/text'}), title + '_converted.txt');
						}
					} else {
						let outputZip = new JSZip();
						let chapterCount = (function() {
							let string = chapters.length.toString();
							return string.length - 1;
						})();
						for (let i in chapters) {
							let chapterNumber = parseInt(i) + 1;
							let page = pageCreation(contentZip.file(chapters[i]+'.htm').asUint8Array());
							let filename = '';
							filename = chapterNumber + ' ' + page.querySelector('#title').textContent.replace(/[ ~!@#$%\^\+\*&\\\/\?\|:\.<>{}()';="\u200f\u200e]/g, ' ') + '.txt';
							if (chapterNumber <= Math.pow(10, chapterCount)) {
								let numString = chapterNumber.toString();
								let diff = chapterCount - numString.length + 1;
								for (let j = 0; j < diff; j++) {
									filename = '0' + filename;
								}
							}
							outputZip.file(filename, page.querySelector('#contentmain').textContent.replace(/\n\n\n/g, ''));
							page = null;
						}
						logger.log('Packaging...');
						saveAs(outputZip.generate({
							type: 'blob',
							compression: 'DEFLATE',
							compressionOptions: {
								level: 9
							}
						}), title + '_converted.zip');
					}
					logger.log('Conversion complete!');
				} catch(err) {
					logger.err('An error occurred.');
					logger.log('Conversion aborted.');
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
			logger.clear();
			logger.log('Starting conversion...');
			let fileReader = new FileReader();
			let fileName = e.target.files[0].name.split('.')[0];
			fileReader.onload = event => {
				try {
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
						}), fileName + '_converted.zip');
					} else {
						saveAs(new Blob([new TextDecoder('gb18030').decode(u8arr)], {type: 'plain/text'}), fileName + '_converted.txt');
					}
					logger.log('Conversion complete!');
				} catch(err) {
					logger.err('An error occurred.');
					logger.log('Conversion aborted.');
				}
			};
			fileReader.readAsArrayBuffer(e.target.files[0]);
		});
		txtLoader.click();
	};
}