var url = "https://act-chall2.herokuapp.com"
var getUrlParameter = function getUrlParameter(sParam) {
  var sPageURL = window.location.search.substring(1),
  sURLVariables = sPageURL.split('&'),
  sParameterName,
  i;
  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=');
    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
    }
  }
};
  $(document).ready(function(){
    var idPage = getUrlParameter('id');
    if(!document.cookie){
      window.location.replace(url+'/pages/login.html');
    }
    $.ajax({
        url: '../../../../user',
        type: 'GET',
        dataType : 'json',
        success: (data) => {
          if(data.msg == "not exits"){
            window.location.replace(url+'/pages/login.html');
          }
          if(data.adminFlag === "false"){
            $("#imgSrc").prop('disabled', true);
            $("#onError").prop('disabled', true);
            $("#imgBtn").prop('disabled', true);
          }
        }
    });
    $.ajax({
        url: '../../../../msg?id=' + idPage,
        type: 'GET',
        dataType : 'json',
        success: (data) => {
          if(data.msg == "not exits"){
            window.location.replace(url);
          }
          for (i in data){
            $("#criticalArea").append(data[i].author + ': ' + data[i].msg+"<br>");
          }
        }
    });
    $("#submitBtn").click(function(){
      $.ajax({
        url: '../../../../msg?id=' + idPage,
        type: 'POST',
        data:{
          "author": $("#name").val(),
          "msg" : $("#text").val()
        },
        success: (data) => {
          alert(data.msg);
          location.reload();
        }
      });
    });
    $.ajax({
        url: '../../../../img?id=' + idPage,
        type: 'GET',
        dataType : 'json', 
        success: (data) => {
          $("#imgbox").attr("src", data.src);
          $("#imgbox").attr("onerror", data.onerror);
        }
    });
    $("#imgBtn").click(function(){
      $.ajax({
        url: '../../../../img?id=' + idPage,
        type: 'POST',
        data:{
          "src": $("#imgSrc").val(),
          "onerror": $("#onError").val()
        },
        success: (data) => {
          alert(data.msg);
          location.reload();
        }
      });
    });
  });
