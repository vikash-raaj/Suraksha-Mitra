var submit = document.getElementById('login_btn');
submit.onclick = function(){
    var request = new XMLHttpRequest();
    request.onreadystatechange = function(){
       if(request.readyState === XMLHttpRequest.DONE){
            if(request.status===200){
                window.location = "/loginpage";
            }else{
                alert(request.responseText.toString());
            }
        }
    };
    var username=document.getElementById('username').value;
    var password=document.getElementById('password').value;
    request.open('POST','/adminlogin', true );
    request.setRequestHeader('Content-Type','application/json');
    request.send(JSON.stringify({"username":username , "password":password }));
};
