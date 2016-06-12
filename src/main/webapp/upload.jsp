<%@page language="java" contentType="text/html; charset=UTF-8"	pageEncoding="UTF-8"%>
<%@page import="java.text.SimpleDateFormat"%>
<%@page import="java.util.Date"%>

<%
   	SimpleDateFormat df = new SimpleDateFormat("yyyyMMddHHmmssSSS");
   	String newfilename = df.format(new Date());
   	response.getWriter().write(newfilename);
%>    	