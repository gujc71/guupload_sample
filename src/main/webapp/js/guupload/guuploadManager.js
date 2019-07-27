/*
	A simple class for manager gu-upload and SWFUpload
*/

var isrun_gu = typeof FormData !== "undefined";

var getScriptURL = (function() {
    var scripts = document.getElementsByTagName('script');
    var index = scripts.length - 1;
    var myScript = scripts[index];
    return function() { return myScript.src.substring(0, myScript.src.lastIndexOf('/')+1); };
})();

function loadScript(filename){
	document.write('<script type="text/javascript" src="' + filename + '"></script>');
}

function loadScripts(){
	var scriptPath = getScriptURL();
	if (isrun_gu){
		loadScript(scriptPath+"guupload.js");
	} else { 
		loadScript(scriptPath+"swfupload/handlers.js");
		loadScript(scriptPath+"swfupload/fileprogress.js");
		loadScript(scriptPath+"swfupload/swfupload.js");
	}
}
loadScripts();

var guTool = {
	createElement: function (tag, parent, classname, style, initValue) {
		var ele = document.createElement(tag);
		parent.appendChild(ele); 
		if (classname) ele.className += classname;
		if (initValue) ele.innerHTML = initValue;
		if (style) this.setStyle(ele, style);
		return ele;
	},
	createTextBox: function (type, parent, id, visible) {
		var ele = this.createElement("input", parent);
		parent.appendChild(ele);
		if (isrun_gu) {
			ele.type = type;
		} else { // ie8
			ele.setAttribute("type", type);
		}
		if (!visible) this.setStyle(ele, {display:"none"});
		ele.id=id;
		ele.setAttribute("name", id);
		return ele;
	},
	getStyle: function (src, style) {
		if(document.defaultView && document.defaultView.getComputedStyle){
		    return document.defaultView.getComputedStyle(src, null).getPropertyValue(style);
	    }else if(src.currentStyle){
		    return src.currentStyle[style];
		}    
	    return null;
	},
	setStyle: function (src, styles) {
	    var s = src.style;
	    for (var item in styles) s[item] = styles[item];
	}
};		

/*
 * param
 * 	 - option: fileid, uploadURL, callback function(afterFileTransfer), maxFileSize, maxFileCount
 */ 
var guUploadManager = function(option) {
	guUploadManager.instances = this;

	this.filename = "";
	this.filesize = "";
	this.realname = "";	
	
	this.afterFileTransfer = option.afterFileTransfer;
	if (!option.maxFileSize) option.maxFileSize=20;
	if (!option.maxFileCount) option.maxFileCount=10;
		
	var guupload = document.getElementById(option.fileid);
	guupload.className += "guupload";
	
	var guFileList = null;
	if (option.listtype!=="thumbnail" || !isrun_gu) {
		var uploadHead = guTool.createElement("div", guupload, "uploadHead");
		var fileHead   = guTool.createElement("div", uploadHead, "filenameColumn", {}, "File Name");
		var sizeHead   = guTool.createElement("div", uploadHead, "filesizeColumn", {}, "File Size");
		guFileList = guTool.createElement("div", guupload, "guFileList");
	} else {	
		guFileList = guTool.createElement("div", guupload, "guFileList_thumbnail");
	}
	guFileList.id = "guFileList";
	
	var scriptPath = getScriptURL();
	
	if (isrun_gu){
		var filetag   = guTool.createTextBox("file", guupload);
		filetag.setAttribute("multiple", "multiple");
		
		if (option.useButtons!==false) {
			var browseBtn = guTool.createTextBox("button", guupload, "browseBtn", true);
			browseBtn.setAttribute("value", "Browse");
			addEvent("click", browseBtn, function(){filetag.click();});
		}
		addEvent("dblclick", guFileList, function(){filetag.click();});
		
		var settings = {
				listtype: option.listtype,		// list, thumbnail
				upload_url: option.uploadURL,
				file_size_limit : option.maxFileSize*1024*1024, 		// 20M
				file_size_limit_str: option.maxFileSize,
				maxFileCount: option.maxFileCount,
				fileTag : filetag,
				fileListview: "guFileList",
				upload_progress_handler: uploadProgress,
				upload_success_handler : this.uploadSuccess
		};
		guFileList.innerHTML = '<div class="dragMessage">Drag files here.</div>';

		this.uploader = new GUUpload(settings);
	} else {
		var controlButtons = guTool.createElement("div", guupload);
		var swfbutton = guTool.createElement("span", controlButtons);
		swfbutton.id="swfbutton";
		
		var settings = {
			flash_url : scriptPath + "swfupload/swfupload.swf",
			upload_url: option.uploadURL,
			custom_settings : {progressTarget : "guFileList",cancelButtonId : "btnCancel"},
			file_size_limit : option.maxFileSize + " MB",
			// Button settings
			button_placeholder_id: "swfbutton",
			button_image_url: scriptPath + "css/swfbutton.png",
			button_text: '<span class="theFont">Browse Files</span>',
			button_text_style: ".theFont { font-size: 11; background-color: #33FF66; text-align: center;}",
			
			// The event handler functions are defined in handlers.js
			file_queued_handler : fileQueued,
			file_queue_error_handler : fileQueueError,
			upload_error_handler : uploadError,
			upload_success_handler : this.uploadSuccessSWF
		};

		this.uploader = new SWFUpload(settings);
	}
	return this;
};

guUploadManager.prototype.transferComplete = function() {
	if (this.realname.length > 0) {
		this.realname = this.realname.substring(0, this.realname.length-1);
		this.filename = this.filename.substring(0, this.filename.length-1);
		this.filesize = this.filesize.substring(0, this.filesize.length-1);
	}
	
	if (this.afterFileTransfer) this.afterFileTransfer(this.realname, this.filename, this.filesize);
};

guUploadManager.prototype.uploadFiles = function() {
	if (isrun_gu){
		if (this.uploader.files_queued()>0) 
			 this.uploader.uploadFiles();
		else
		if (this.uploader.isUploaded()) this.transferComplete();
	} else {
		var stats = this.uploader.getStats();
		if (stats.files_queued>0) 
			 this.uploader.startUpload();
		else this.transferComplete();
	}
};

guUploadManager.prototype.setUploadedFileInfo = function(filename, realname, filesize) {
	this.filename += filename + ",";
	this.filesize += filesize + ",";
	this.realname += realname + ",";	
};

guUploadManager.prototype.uploadSuccess = function(file, serverData) {
	guUploadManager.instances.setUploadedFileInfo(file.name, file.size, serverData);
	guUploadManager.instances.uploadFiles(); // until all files are uploaded
};

guUploadManager.prototype.uploadSuccessSWF = function(file, serverData) {
	var progress = new FileProgress(file, guUploadManager.instances.uploader.customSettings.progressTarget);
	progress.setComplete();
	progress.setStatus("Complete.");
	progress.toggleCancel(false);

	guUploadManager.instances.setUploadedFileInfo(file.name, file.size, serverData);
	guUploadManager.instances.uploadFiles(); // until all files are uploaded
};

