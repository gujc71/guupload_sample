<%@ page language="java" contentType="text/html; charset=UTF-8"	pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" >
<head>
<title>GUUpload Demos</title>
<link href="js/guupload/css/guupload.css" rel="stylesheet" type="text/css" />

<script type="text/javascript" src="js/guupload/guUploadManager.js"></script>
<script type="text/javascript" src="js/guupload/guupload.js"></script>
<script type="text/javascript" src="js/guupload/fileprogress.js"></script>
<script type="text/javascript" src="js/guupload/swfupload/handlers.js"></script>
<script type="text/javascript" src="js/guupload/swfupload/swfupload.js"></script>


<script type="text/javascript">
var guManager=null;

window.onload = function() {
	var option = {
			fileid: "guupload",
			uploadURL: "upload.jsp",
			form: document.form1
	}
	guManager = new guUploadManager(option);
}	

function formSubmit(){
	guManager.uploadFiles();
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
			<td><input type="text" name="brd_title"/></td>
		</tr>
        <tr>
			<td>Contents</td>
			<td><textarea name="brd_contents" cols="55" rows="5" style="width: 500px;"></textarea></td>
		</tr>
		<tr>
			<td>Attach File</td>
			<td>
				<div id="guupload" style="width: 500px;">
				</div>
			</td>
		</tr>
		</table>
		<input type="button" value="Submit" onclick='formSubmit()' />
	</form>
</div>
</body>
</html>
