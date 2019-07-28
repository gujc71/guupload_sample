<%@ page language="java" contentType="text/html; charset=UTF-8"	pageEncoding="UTF-8"%>

<!DOCTYPE html>
<html>
<head>
<title>GUUpload Demos</title>
<link rel="stylesheet" type="text/css" href="js/guupload/css/guupload.css"/>
<script type="text/javascript" src="js/guupload/guuploadManager.js"></script>
<script type="text/javascript">
var guManager=null;

window.onload = function() {
	var option = {
		listtype: "thumbnail",
		fileid: "attachFile",
		uploadURL: "upload",
		afterFileTransfer: afterFileTransfer
	}
	guManager = new guUploadManager(option);
}	

function formSubmit(){
	var brd_title = document.getElementById( 'brd_title' );
	if (brd_title.value==="") {
		alert("input!");
		return;
	}
	
	guManager.uploadFiles();
}

function afterFileTransfer(realname, filename, filesize){

	var realname9 = document.getElementById( 'realname' );
	var filename9 = document.getElementById( 'filename' );
	var filesize9 = document.getElementById( 'filesize' );
	
	realname9.value = realname;
	filename9.value = filename;
	filesize9.value = filesize;
	
	document.form1.submit();
}

</script>
</head>
<body>
 
<div id="content">
	<h2>Board</h2><br/>
	<form id="form1" name="form1" action="upload_save.jsp" method="post">
      	<table cellspacing="0" cellpadding="0"   width="700px">
        <colgroup>
        <col width="15%"/>
        <col/>
        </colgroup>
        <tr>
			<td>Title</td>
			<td><input type="text" id="brd_title" name="brd_title"/></td>
		</tr>
        <tr>
			<td>Contents</td>
			<td><textarea name="brd_contents" cols="55" rows="5" style="width: 500px;"></textarea></td>
		</tr>
		<tr>
			<td>Attach File</td>
			<td>
				<div id="attachFile" style="width: 500px;"></div>
			</td>
		</tr>
		</table>
		<input type="button" value="Submit" onclick='formSubmit()'  />
		<input type="hidden" id="realname" name="realname"/>
		<input type="hidden" id="filename" name="filename"/>
		<input type="hidden" id="filesize" name="filesize"/>		
	</form>
</div>
</body>
</html>
