<%@ page language="java" contentType="text/html; charset=UTF-8"	pageEncoding="UTF-8"%>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" >
<head>
<title>File Upload Demos</title>

</head>
<body>

<div id="content">
	<h2>Board</h2><br/>
      	<table width="700px">
        <colgroup>
        <col width="15%"/>
        <col/>
        </colgroup>
        <tr>
			<td>Title</td>
			<td><%=request.getParameter("brd_title")%></td>
		</tr>
        <tr>
			<td>Contents</td>
			<td><%=request.getParameter("brd_contents")%></td>
		</tr>
		<tr>
			<td>Attach File</td>
			<td>
			<% 
				String filename = request.getParameter("filename");
				String realname = request.getParameter("realname");
				String filesize = request.getParameter("filesize");
		    	String[] reallist = realname.split(",");
		    	String[] filelist = filename.split(",");
		    	String[] sizelist = filesize.split(",");
		    	
		    	for (int i=0; i<filelist.length; i++) {
		    	    out.println(filelist[i] + " : " + reallist[i] + " : " + sizelist[i] + "<br/>");
		    	}				
			%>
			</td>
		</tr>
		</table>
</div>
</body>
</html>
