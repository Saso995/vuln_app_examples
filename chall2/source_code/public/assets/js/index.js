var url = "https://act-chall2.herokuapp.com"

$(document).ready(function(){
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
        $("#email").append(data.email);
      }
  });
  $.ajax({
      url: '../../../../discussions',
      type: 'GET',
      dataType : 'json', 
      success: (data) => {
        console.log(data)
        for (i in data){
          let linkPage = url+'/pages/topicPage.html?id=' + data[i]._id;
          $("#criticalArea").append(data[i].author + ': ' + `<a href=${linkPage}>`+data[i].title+"</a><br>");
        }
      }
  });
  $("#submitBtn").click(function(){
    $.ajax({
      url: '../../../../discussions',
      type: 'POST',
      data:{
        "author": $("#name").val(),
        "title" : $("#text").val()
      },
      success: (data) => {
        alert(data.msg);
        location.reload();
      }
    });
  });
});
