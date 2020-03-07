var url = "https://act-chall2.herokuapp.com"
$(document).ready(function(){
  $("#registerBtn").click(function(){
    $.ajax({
      url: '../../../../signup',
      type: 'POST',
      data:{
        "email": $("#email").val(),
        "password" : $("#password").val(),
        "adminFlag" :$("#admincheck").is(":checked"),
        "token" : $("#token").val()
      },
      success: function(result) {
        alert(result);
        if (result == "Registered"){
          location.reload();
        }
      }
    });
  });

  $("#logBtn").click(function(){
    $.ajax({
      url: '../../../../login',
      type: 'POST',
      data:{
        "email": $("#mail").val(),
        "password" : $("#psw").val()
      },
      success: function(result) {
        alert(result);
        if (result == "Logged in!"){
          window.location.replace(url);
        }
      }
    });
  });
});
