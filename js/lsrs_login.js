$(document).ready(function(){

    //Get potentential anouncements from url
    if(getUrlParameter("signup")!=false && getUrlParameter("emailsent")!=false){
        if(getUrlParameter("signup")=="success" && getUrlParameter("emailsent")==1){
            let elementAlert1 = '<div class="alert alert-warning alert-dismissible fade show" role="alert">\
            <strong>Dear user!</strong> You have successfully registered to our platform. Congratulations!<br>\
            An email have been successfully sent to your registered email address. Please go to your inbox to confirm your account.<br>\
            If ever you encounter a problem of any sort, kindly reach to our <a href="#">support team</a>.\
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>\
          </div>';
            $("#login-page-alert").html(elementAlert1);
        }
        else{
            let elementAlert2 = '<div class="alert alert-warning alert-dismissible fade show" role="alert">\
            <strong>Dear user!</strong> You have successfully registered to our platform. Congratulations!<br>\
            But the confirmation email could not be sent to your registered email address.<br>\
            Do not worry you will have the possibility to request for email confirmation in your account settings.\
            If ever you encounter another problem, kindly reach to our <a href="#">support team</a>.\
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>\
          </div>';
            $("#login-page-alert").html(elementAlert2);
        }
    }

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
    return false;
};


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