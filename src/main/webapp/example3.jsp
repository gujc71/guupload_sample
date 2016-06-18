<%@ page language="java" contentType="text/html; charset=UTF-8"	pageEncoding="UTF-8"%>

<!DOCTYPE html>
<html>
<head>
<title>GUUpload Demos</title>
<link rel="stylesheet" type="text/css" href="js/guupload/css/guupload.css"/>
<script type="text/javascript" src="js/guupload/guUploadManager.js"></script>
<script type="text/javascript">
var guManager=null;

window.onload = function() {
	var option = {
			listtype: "thumbnail",
			fileid: "guupload",
			uploadURL: "upload",
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
				<div id="guupload" class="guupload" style="width: 500px; height: 120px;">
				</div>
			</td>
		</tr>
		</table>
		<input type="button" value="Submit" onclick='formSubmit()'  />
	</form>
</div>
</body>
</html>
