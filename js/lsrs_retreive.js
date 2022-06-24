var submitCodeTry = 0;
var passwordVerified = false;
var passwordVerifiedConf = false;

$(document).ready(function(){

    //At first hide code field and btn submit
    $("#idRequestCode").attr("disabled", true);
    $("#box-submit-code").css("display","none");
    $("#box-reset-fields").css("display","none");
    //$("#receiveNewCode").css("display", "none");
    //$(".block-pwd-reset").css("display", "none");
   
    $("#idEmail").on("change", function(){
        $("#errorEmail").text("");

        //Email validation
       let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
       if($("#idEmail").val().trim().match(regexEmail)){
           verificationRequest(MRPVerification, "EMAIL", $("#idEmail").val().trim());
       }
       else{
           if($("#idEmail").val().trim()!=""){
               $("#errorEmail").text("Incorrect email address");
           }
           else{
               $("#errorEmail").text("This field is required");
           }
       }

    });
    
    //On click on request code btn
    $("#idRequestCode").on("click", function(e){
        e.preventDefault();
        ResetRequest(MRPReset, "SEND_CODE", $("#idEmail").val().trim());
    });

    //On click on submit code btn
    $("#idBtnSubmitCode").on("click", function(e){
        e.preventDefault();
        //$("#errorCode").text("");
        //$("#receiveNewCode").css("display", "none");
        ResetRequest(MRPReset, "SUBMIT_CODE", $("#idEmail").val().trim(), $("#idCode").val().trim());
    });

    //On click on reset code btn
    $("#idBtnReset").on("click", function(e){
        e.preventDefault();

        //HANDLE PASSWORD
        $("#errorNewPwd").text("");
        $("#errorConfNewPwd").val("");

        //At least one lower case English letter, (?=.*?[a-z])
        //At least one digit, (?=.*?[0-9])
        //At least one special character, (?=.*?[#?!@$%^&*-])
        //Minimum eight in length .{8,} (with the anchors)
        let regxPassword = /^(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

        if(!$("#idNewPwd").val().trim().match(regxPassword)){
            $("#errorNewPwd").text("Minimun 8 characters, at least one letter, one number and one special character");
            passwordVerified = false;
            //activateBtnSubmit();
        }
        else{
            passwordVerified = true;
            //activateBtnSubmit();
        }

        //HANDLE CONFIRMATION PASSWORD
        //clean
        $("#errorConfNewPwd").text("");
        if($("#idConfNewPwd").val().trim() === $("#idNewPwd").val().trim()){
            passwordVerifiedConf = true;
            //activateBtnSubmit();
        }
        else{
            $("#errorConfNewPwd").text("password does not match");
            passwordVerifiedConf = false;
            //activateBtnSubmit();
        }

        if(passwordVerified && passwordVerifiedConf){
            ResetRequest(MRPReset, "RESET_PASSWORD", $("#idEmail").val().trim(), $("#idNewPwd").val().trim());
        }
        
    });

    //On click on resendCode after failed match code submission
    $("#receiveNewCode").on("click", function(){
        $("#errorCode").text("");
        $("#idCode").val("");
        $("#receiveNewCode").css("display","none");
        $("#idBtnSubmitCode").css("display","none");
        $("#idCode").css("display","none");
        $("#idRequestCode").css("display", "block");
        $("#idRequestCode").attr("disabled", true);
        $("#idEmail").attr("disabled", false);
    });

});

/********************REQUEST SENDER FUNCTION *******************/
function requestSender(destinationToRequest, obj, processorFunc){
    $.ajax({
        url: destinationToRequest,
        data: obj,
        type: "POST",
        dataType : "json",
        beforeSend:function(){
            $("#loading-circle").css("display","flex");
        }
    })
    .done(function( response ) {
        $("#loading-circle").css("display","none");
        //console.log(response);
        processorFunc(response)
    })
    .fail(function( xhr, status, errorThrown ) {
        alert( "Sorry, there was a problem!" );
        console.log( "Error: " + errorThrown );
        console.log( "Status: " + status );
        console.dir( xhr );
    });
}

function MRPVerification(res){
    if(res['db_connection'] =="SUCCEED" && res['query_error']=="NONE"){
        //connection succeed and no query error
        if(res['record_found'] == 1){
            //Record found
            $("#idRequestCode").attr("disabled", false);
           
        }
        else{
            //No record found
            $("#idRequestCode").attr("disabled", true);
            $("#errorEmail").text("No account matches this email address");
        }
     
    }
    else{
        //Connection error or query error
        alert("Failed connection to data base or wrong queries. Try again! \nIf this error persists make a screenshot an contact customer service.");
    }
}


function verificationRequest(myFunc, inputField, value){
    //inputField can be: EMAIL, USERNAME
    $.ajax({
        url: "api_php/api_fields_verification.php",
        data: {"field": inputField,"value": value},
        type: "POST",
        dataType : "json",
        beforeSend:function(){
            $("#loading-circle").css("display","flex");
        }
    })
    .done(function( response ) {
        $("#loading-circle").css("display","none");
        //console.log(response);
        myFunc(response, inputField);
    })
    .fail(function( xhr, status, errorThrown ) {
        $("#loading-circle").css("display","none");
        alert( "Sorry, there was a problem!" );
        console.log( "Error: " + errorThrown );
        console.log( "Status: " + status );
        console.dir( xhr );
    });
}

//This function will proccess the return from api_lsrs_retreive.php
function MRPReset(res, option){
    if(option == "SEND_CODE"){
        //Analize the response then do some action
        if(res['option_status'] ==1){
            //display field to insert code and btn to submit it
            $("#box-request-code").css("display","none");
            $("#box-submit-code").css("display","block");
        }
        else{
            //send a message that code failed to be sent
            $("#errorEmail").text("Code failed to be sent to that email address");
            $("#idRequestCode").text("Resend code");
            $("#idRequestCode").attr("disabled", true);

        }
    }
    else if(option =="SUBMIT_CODE"){
        //Analize the response then do some action
        if(res['option_status'] == 1){
            //display fields and btn to rest pwd
            $("#box-submit-code").css("display","none");
            ///$("#idBtnSubmitCode").css("display","none");
            $("#box-reset-fields").css("display", "block");
           // $("#idBtnReset").attr("disabled", true);
        }
        else{
            //Code did not match. cannot reset pwd.
            submitCodeTry = submitCodeTry +1;
            $("#errorCode").text("The code you entered did not match, you can ask for code to be resent by clicking below");

        }
    }
    else if(option =="RESET_PASSWORD"){
        //Hide the form
        $("#box-form").css("display","none");
        if(res['option_status'] ==1){
            //Password has been reset successfully
            let pwdAlert1 = '<div class="alert alert-success" role="alert">\
            <h4 class="alert-heading">Well done!</h4>\
            <p>You successfully changed your password. Now you can easily login into your account with those credentials.</p>\
            <hr>\
            <p class="mb-0">Do you want to login now? <a href="lsrs_login.html">Log in</a></p>\
          </div>';

           $("#box-alert-reset").html(pwdAlert1);
    
        }
        else{
            //password failed to be reset
            let pwdAlert2 = '<div class="alert alert-success" role="alert">\
            <h4 class="alert-heading">Well done!</h4>\
            <p>We are sorry, the reset of your password has been unsuccessful. Please try again.</p>\
            <hr>\
            <p class="mb-0">Cannot reset your password? <a href="lsrs_support.html">Contact our customer support</a></p>\
          </div>';

          $("#box-alert-reset").html(pwdAlert2);
        }
    }
    else{
        //Out put that something went wrong and action failed
        //refresh page
        location.reload();
        alert("Something went wrong. Try again. If it persits, contact customer service");
    }
}

//This function will send request to api_lsrs_retreive.php
function ResetRequest(myFunc, option, email, value=""){
    //inputField can be: EMAIL, USERNAME
    $.ajax({
        url: "api_php/api_lsrs_retreive.php",
        data: {"option": option, "email": email, "value":value},
        type: "POST",
        dataType : "json",
        beforeSend:function(){
           $("#loading-circle").css("display","flex");
        }
    })
    .done(function( response ) {
        $("#loading-circle").css("display","none");
        console.log(response);
        myFunc(response, option);
    })
    .fail(function( xhr, status, errorThrown ) {
        $("#loading-circle").css("display","none");
        alert( "Sorry, there was a problem!" );
        console.log( "Error: " + errorThrown );
        console.log( "Status: " + status );
        console.dir( xhr );
    });
}

function activateBtnSubmit(){
    if(passwordVerified && passwordVerifiedConf){
        $("#idBtnReset").attr("disabled", false);
    }
    else{
        $("#idBtnReset").attr("disabled", true);
    }
}
