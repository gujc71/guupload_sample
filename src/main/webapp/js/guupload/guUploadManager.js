var uploader;
var realname="", filename="", filesize="";
var isrun_gu = true;

var guTool = {
	createElement: function (tag, parent, classname, style, initValue) {
		var ele = document.createElement(tag);
		parent.appendChild(ele); 
		if (classname) ele.className += classname;
		if (initValue) ele.innerText = initValue;
		if (style) this.setStyle(ele, style);
		return ele;
	},
	createTextBox: function (type, parent, id) {
		var ele = this.createElement("input", parent);
		parent.appendChild(ele);
		if (isrun_gu) {
			ele.type = type;
		} else { // ie8
			ele.setAttribute("type", type);
			this.setStyle(ele, {display:"none"});
		}
		ele.id=id;
		ele.setAttribute("name", id);
		return ele;
	},
	loadScript: function (filename){
		var js = document.createElement("script");
		js.type = "text/javascript";
		js.src = filename;
		document.head.appendChild(js);
		return js;
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
}		
var getScriptURL = (function() {
    var scripts = document.getElementsByTagName('script');
    var index = scripts.length - 1;
    var myScript = scripts[index];
    return function() { return myScript.src.substring(0, myScript.src.lastIndexOf('/')+1); };
})();

var guUploadManager = function(option) { // fileid, uploadURL, form
	guUploadManager.instances = this;			
	isrun_gu = typeof FormData !== "undefined"
	/*
	if(navigator.appName.indexOf("Internet Explorer")!=-1){
		if (navigator.appVersion.indexOf("MSIE 1")==-1) isrun_gu = false;  //v10, 11, 12, etc. is fine too
    };*/
	var scriptPath = getScriptURL();
	
	var guupload   = document.getElementById(option.fileid);
	var uploadHead = guTool.createElement("div", guupload, "uploadHead");
	var fileHead   = guTool.createElement("div", uploadHead, "uploadcolumn", {width: "75%"}, "File Name");
	var sizeHead   = guTool.createElement("div", uploadHead, "uploadcolumn", {width: "23%"}, "File Size");
	var guFileList = guTool.createElement("div", guupload, "guFileList", {height: "100px"});
	guFileList.id= "guFileList";
	
	//guTool.loadScript(scriptPath+"fileprogress.js");
	if (!isrun_gu){
		var controlButtons = guTool.createElement("div", guupload);
		var swfbutton = guTool.createElement("span", controlButtons);
		swfbutton.id="swfbutton";
		//guTool.loadScript(scriptPath+"handlers.js");
		//guTool.loadScript(scriptPath+"swfupload/swfupload.js");
	} else {
		//guTool.loadScript(scriptPath+"guupload.js");
	}
	var form  = guupload.parentNode;
	while (form && form.nodeName!=="FORM") { 
		form  = form.parentNode;
	}
	var realname1 = guTool.createTextBox("hidden", form, "realname");
	var filename1 = guTool.createTextBox("hidden", form, "filename");
	var filesize1 = guTool.createTextBox("hidden", form, "filesize");
	
	if (isrun_gu){
		var settings = {
				upload_url: option.uploadURL,
				file_size_limit : 20*1024*1024, 		// 20M
				//fileTag : "file1",					// if you want to use file tag, remove comments
				custom_settings : {progressTarget : "guFileList",cancelButtonId : "btnCancel"},
				upload_progress_handler: uploadProgress,
				upload_success_handler : this.uploadSuccess
		};
		guFileList.innerHTML = '<div style="width:99%; line-height: 99px;text-align: center;vertical-align: middle;">Drag files here.</div>';

		uploader = new GUUpload(settings);
	} else {
		var settings = {
			flash_url : scriptPath + "swfupload/swfupload.swf",
			upload_url: option.uploadURL,
			custom_settings : {progressTarget : "guFileList",cancelButtonId : "btnCancel"},
			file_size_limit : "20 MB",
			// Button settings
			button_placeholder_id: "swfbutton",
			button_image_url: scriptPath + "css/swfbutton.png",
			button_text: '<span class="theFont">Browse Files</span>',
			button_text_style: ".theFont { font-size: 11; background-color: #33FF66; text-align: center;}",
			
			// The event handler functions are defined in handlers.js
			file_queued_handler : fileQueued,
			file_queue_error_handler : fileQueueError,
			upload_error_handler : uploadError,
			upload_success_handler : uploadSuccess
		};

		uploader = new SWFUpload(settings);
	}
};

guUploadManager.prototype.uploadFiles = function() {
	if (isrun_gu){
		if (uploader.files_queued()>0) 
			 uploader.uploadFiles();
		else
		if (uploader.isUploaded()) document.form1.submit();
	} else {
		var stats = uploader.getStats();
		if (stats.files_queued>0) 
			 uploader.startUpload();
		else document.form1.submit();
	}
}

guUploadManager.prototype.uploadSuccess = function(file, serverData) {
	try {
		var progress = new FileProgress(file, uploader.customSettings.progressTarget);
		progress.setComplete();
		progress.setStatus("Complete.");
		progress.toggleCancel(false);
	} catch (ex) {
		this.debug(ex);
	}

	if (realname.length>0) realname += ",";
	if (filename.length>0) filename += ",";
	if (filesize.length>0) filesize += ",";
	
	filename += file.name;
	filesize += file.size;
	realname += serverData;
	document.getElementById('realname').value = realname;
	document.getElementById('filename').value = filename;
	document.getElementById('filesize').value = filesize;

	guUploadManager.instances.uploadFiles(); // until all files are uploaded
}