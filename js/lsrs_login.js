$(document).ready(function(){

    //Get data from input fields
    $("#idBtnLogin").on("click", function(){
        let emailVar = $("#idEmail").val().trim();
        let passwordVar = $("#idPassword").val().trim();
        let fieldsError = false;
        let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        $("#errorEmail").text("");
        $("#errorPassword").text("");
        
        if(emailVar==""){
            fieldsError = true;
            $("#errorEmail").text("This field is required.");
        }

        if(!emailVar.match(regexEmail)){
            fieldsError = true;
            $("#errorEmail").text("Incorrect email address");
        }

        if(passwordVar==""){
            fieldsError = true;
            $("#errorPassword").text("This field is required.");
        }

        if(!fieldsError){

            $.ajax({
                url: "api_php/api_lsrs_login.php",
                data: {"email": emailVar, "password":passwordVar},
                type: "POST",
                dataType : "json",
                beforeSend:function(){
                    $("#loading-circle").css("display","flex");
                }
            })
            .done(function( response ) {
                $("#loading-circle").css("display","none");
                console.log(response);
                RPLogin(response);
            })
            .fail(function( xhr, status, errorThrown ) {
                $("#loading-circle").css("display","none");
                alert( "Sorry, there was a problem!" );
                console.log( "Error: " + errorThrown );
                console.log( "Status: " + status );
                console.dir( xhr );
            });
        }
    });
});

function RPLogin(res){
    let accessDenied = false;
    if(res['db_connection']=="SUCCEED" && res['query_error']=="NONE"){
        //connection to db successful and no error in queries
        if(res['email']==0){
            accessDenied = true;
            $("#errorEmail").text("No user with such email address");
        }
        
        if(res['password'] ==0){
            accessDenied = true;
            $("#errorPassword").text("Wrong password");
        }

        if(!accessDenied){
            //alert("@"+res['username']+" you have logged in successfully");
            //clean the input fields
            $("#idEmail").val("");
            $("#idPassword").val("");
            window.location.replace("etc_home.html");
        }
    }
    else{
        //Failed connection to db or error in queries
        alert("Failed connection to data base or wrong queries. Try again! \nIf this error persists make a screenshot an contact customer service.");
    }
}