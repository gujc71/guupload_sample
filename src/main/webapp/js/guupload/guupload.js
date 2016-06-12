
var GUUpload = function (settings) {
	this.fileCount=0;
	this.fileList={};
	GUUpload.instances = this;

	this.settings = settings;
	this.initSettings();

	if (this.settings.fileTag!=""){
		var fileTag = document.getElementById(this.settings.fileTag);
		addEvent("change", fileTag, this.changeEvent);
	}

	var progressTarget = document.getElementById(this.customSettings.progressTarget);
	addEvent("dragover", progressTarget, this.dragoverEvent);
	addEvent("drop", progressTarget, this.dropEvent);
};

GUUpload.instances = null;

GUUpload.prototype.initSettings = function () {
	this.ensureDefault = function (settingName, defaultValue) {
		this.settings[settingName] = (this.settings[settingName] == undefined) ? defaultValue : this.settings[settingName];
	};
	
	// Upload backend settings
	this.ensureDefault("upload_url", "");
	this.ensureDefault("file_size_limit", 0);
	this.ensureDefault("fileTag", "");
	
	// Other settings
	this.ensureDefault("custom_settings", {});
	this.customSettings = this.settings.custom_settings;

	this.ensureDefault("upload_success_handler", null);
	this.ensureDefault("upload_progress_handler", null);
}

function fileRecord (oid, ofile){
	this.id="f"+oid;
	this.name=ofile.name;
	this.size=ofile.size;
	this.file=ofile;
	this.uploaded=0;		// 0:ready, 1: uploading, 2: uploaded
};


GUUpload.prototype.AddFiles = function (files) {
	if (this.fileCount==0){
		var progressTarget = document.getElementById(this.customSettings.progressTarget);
		progressTarget.innerHTML = "";
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
	var progress = new FileProgress(a, this.customSettings.progressTarget);
	progress.setFileSize(a.size);
	progress.toggleCancel(true, this);
	this.fileList[a.id] = a;
};


GUUpload.prototype.cancelUpload = function (fileID, triggerErrorEvent) {
	if (triggerErrorEvent !== false) {
		triggerErrorEvent = true;
	}
	var element = document.getElementById(fileID);
	element.parentNode.removeChild(element);
	delete this.fileList[fileID];
};

GUUpload.prototype.uploadFiles = function () {
	for(var f in this.fileList) {
		var file = this.fileList[f];
		if (file.uploaded !== 0) continue;
		file.uploaded = 1;		// uploading
		
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
};

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
};

GUUpload.prototype.getFileInfo = function (id) {
	return this.fileList[id]
};

GUUpload.prototype.queueEvent = function (handlerName, argumentArray) {
	if (argumentArray == undefined) {
		argumentArray = [];
	} else if (!(argumentArray instanceof Array)) {
		argumentArray = [argumentArray];
	}
	
	var self = this;
	if (typeof this.settings[handlerName] === "function") {
		// Queue the event
		//this.eventQueue.push(function () {
			this.settings[handlerName].apply(this, argumentArray);
		//});
		
		// Execute the next queued event
		//setTimeout(function () {self.executeNextEvent();}, 0);
		
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
};

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

		var progress = new FileProgress(file, this.customSettings.progressTarget);
		progress.setProgress(percent);
		progress.setStatus("Uploading...");
	} catch (ex) {
		this.debug(ex);
	}
}


