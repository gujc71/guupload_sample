/**
 * guupload: https://github.com/gujc71/gu-upload
 * 
 * guupload is a JavaScript Library that wraps the HTML5(AJAX) upload function
 * 
 * guupload 0.1 is (c) 2014 gujc and is released under the MIT License
 *
 * guupload 0.2 is (c) 2016 gujc and is released under the MIT License: added thumbnail view
 *
 */

var GUUpload = function (settings) {
	this.fileCount=0;
	this.fileList={};
	this.settings = settings;

	GUUpload.instances = this;

	if (this.settings.fileTag){
		addEvent("change", this.settings.fileTag, this.changeEvent);
	}

	var filelist = document.getElementById(this.settings.fileListview);
	addEvent("dragover", filelist, this.dragoverEvent);
	addEvent("drop", filelist, this.dropEvent);
};
 
function fileRecord (oid, ofile){
	this.id="f"+oid;
	this.name=ofile.name;
	this.size=ofile.size;
	this.file=ofile;
	this.uploaded=0;		// 0:ready, 1: uploading, 2: uploaded
	this.progressbar=null;
}


GUUpload.prototype.AddFiles = function (files) {
	if (this.fileCount===0){
		var fileListview = document.getElementById(this.settings.fileListview);
		fileListview.innerHTML = "";
	}

    for (var i = 0; i < files.length; i++) {
		this.AddFile(files[i]);
	}
};

GUUpload.prototype.AddFile = function (file) {
	if (this.settings.file_size_limit>0 & file.size > this.settings.file_size_limit){
		alert(file.name + " is too big to upload!");
		return;
	}
	
	var a = new fileRecord(this.fileCount++, file);
	if (this.settings.listtype==="thumbnail")
		 this.AddRowThunbnail(a);
	else this.AddRow(a);
	
	this.fileList[a.id] = a;
};

GUUpload.prototype.AddRow = function (file) {
	var parent = document.getElementById(this.settings.fileListview);
	
	var row = guTool.createElement("div", parent, "filerow");
	row.id = file.id;

	var filename = guTool.createElement("div", row, "filename");
	filename.appendChild(document.createTextNode(file.name));

	var filesizeContainer = guTool.createElement("div", row, "filesizeContainer");

	var fileremove = guTool.createElement("div", filesizeContainer, "fileremove");
	fileremove.id = "r" + file.id;
	fileremove.appendChild(document.createTextNode(" "));
	addEvent("click", fileremove, this.fileRemoveClick);

	var filesize = guTool.createElement("div", filesizeContainer, "filesize");
	filesize.innerHTML = formatFileSize(file.size);
	file.progressbar = filesize;
	
};


GUUpload.prototype.AddRowThunbnail = function (file) {
	var parent = document.getElementById(this.settings.fileListview);
	
	var row = guTool.createElement("div", parent, "filerow");
	row.id = file.id;

	var filename = null;
	var ext = file.name.split('.').pop().toLowerCase();
	if ("jpgjpefgifpng".indexOf(ext)>-1) {
		filename = guTool.createElement("img", row, "filename");
		this.readImage(file.file, filename);
	} else {
		filename = guTool.createElement("div", row, "filename noimage");
		filename.innerHTML = ext.toUpperCase();
	}
	filename.setAttribute("title", formatFileSize(file.size));

	var filesizeContainer = guTool.createElement("div", row, "filesizeContainer");

	var fileremove = guTool.createElement("div", filesizeContainer, "fileremove");
	fileremove.id = "r" + file.id;
	fileremove.appendChild(document.createTextNode(" "));
	addEvent("click", fileremove, this.fileRemoveClick);

	var filesize = guTool.createElement("div", filesizeContainer, "filesize");
	filesize.innerHTML = file.name;//formatFileSize(file.size);
	file.progressbar = filesize;
	
};


GUUpload.prototype.readImage = function (file, img) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) {
    	img.setAttribute("src", e.target.result);
    };

    reader.readAsDataURL(file);
};


GUUpload.prototype.fileRemoveClick = function () {
	var fileid = this.id;
	fileid = fileid.substring(1, fileid.length); 
	var element = document.getElementById(fileid);
	element.parentNode.removeChild(element);
	delete GUUpload.instances.fileList[fileid];
};

GUUpload.prototype.uploadFiles = function () {
	for(var f in this.fileList) {
		var file = this.fileList[f];
		if (file.uploaded !== 0) continue;
		file.uploaded = 1;		// uploading
		file.progressbar.className += " progressBar";
		
		var formData = new FormData();
		formData.append("Filedata", file.file, file.name);  
		
		var xhr = new XMLHttpRequest();
		xhr.id=file.id;
		xhr.open("POST", this.settings.upload_url, true);
		xhr.setRequestHeader("Cache-Control", "no-cache");
		xhr.onreadystatechange = ajaxReadyStateChange;
		if (typeof this.settings["upload_progress_handler"] === "function") {
			xhr.upload.id = xhr.id;
			xhr.upload.addEventListener("progress", ajaxProgress, false);
		}
		xhr.send(formData);
	}
};

GUUpload.prototype.files_queued = function () {
	var cnt=0;
	for(var f in this.fileList){
		var file = this.fileList[f];
		if (file.uploaded === 0) cnt++;
	}
	return cnt;
};

GUUpload.prototype.isUploaded = function () {
	var cnt1=0, cnt2=0;
	for(var f in this.fileList){
		var file = this.fileList[f];
		if (file.uploaded === 2) cnt2++;
		cnt1++;
	}
	return cnt1===cnt2;
};

function ajaxProgress(evt) {
	if (evt.lengthComputable) {
		var file = GUUpload.instances.getFileInfo(this.id);
		GUUpload.instances.queueEvent("upload_progress_handler", [file, evt.loaded, evt.total]);
	}
}


function ajaxReadyStateChange() {
    if (this.readyState === 4) {
		if (this.status === 200) {
			var file = GUUpload.instances.getFileInfo(this.id);
			file.uploaded=2;	//uploaded
			GUUpload.instances.queueEvent("upload_success_handler", [file, this.responseText]);
		} else {
			alert('There was a problem with the request.');
		}
    }
}


GUUpload.prototype.getFileInfo = function (id) {
	return this.fileList[id];
};

GUUpload.prototype.queueEvent = function (handlerName, argumentArray) {
	if (argumentArray === undefined) {
		argumentArray = [];
	} else if (!(argumentArray instanceof Array)) {
		argumentArray = [argumentArray];
	}
	
	var self = this;
	if (typeof this.settings[handlerName] === "function") {
		this.settings[handlerName].apply(this, argumentArray);
	} else if (this.settings[handlerName] !== null) {
		throw "Event handler " + handlerName + " is unknown or is not a function";
	}
};

function addEvent(evnt, elem, func) {
   if (elem.addEventListener)  // W3C DOM
      elem.addEventListener(evnt,func,false);
   else if (elem.attachEvent) { // IE DOM
      elem.attachEvent("on"+evnt, func);
   } else { // No much to do
      elem[evnt] = func;
   }
}


GUUpload.prototype.changeEvent = function (event) {
	GUUpload.instances.AddFiles(event.target.files);
};

GUUpload.prototype.dragoverEvent = function (event) {
	if(event.preventDefault) event.preventDefault();
	else event.returnValue = false;
};

GUUpload.prototype.dropEvent = function (event) {
	if(event.preventDefault) event.preventDefault();
	else event.returnValue = false;

    GUUpload.instances.AddFiles(event.dataTransfer.files);
};

function uploadProgress(file, bytesLoaded, bytesTotal) {
	try {
		var percent = Math.ceil((bytesLoaded / bytesTotal) * 100);
		file.progressbar.style.width = percent + "%";
	} catch (ex) {
		this.debug(ex);
	}
}

function formatFileSize(bytes) {
	if (bytes === 0) { return "0 B"; }
	var e = Math.floor(Math.log(bytes) / Math.log(1024));
	return (bytes/Math.pow(1024, e)).toFixed(2)+' '+' KMGTP'.charAt(e)+'B';
}

