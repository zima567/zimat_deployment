var submitCodeTry = 0;
var passwordVerified = false;
var passwordVerifiedConf = false;

$(document).ready(function(){

    //At first hide code field and btn submit
    $("#idBtnSubmitCode").css("display","none");
    $("#idCode").css("display","none");
    $("#idRequestCode").attr("disabled", true);
    $("#receiveNewCode").css("display", "none");
    $(".block-pwd-reset").css("display", "none");
   
    //Verified if email exist in our database
    $("#idEmail").focusout(function(){
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

    $("#idNewPwd").focusout(function(){
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
            activateBtnSubmit();
        }
        else{
            passwordVerified = true;
            activateBtnSubmit();
        }
    });

      //Focus out password configuration
      $("#idConfNewPwd").focusout(function(){
        //clean
        $("#errorConfNewPwd").text("");
        if($("#idConfNewPwd").val().trim() === $("#idNewPwd").val().trim()){
            passwordVerifiedConf = true;
            activateBtnSubmit();
        }
        else{
            $("#errorConfNewPwd").text("password does not match");
            passwordVerifiedConf = false;
            activateBtnSubmit();
        }
    });

    //On click on request code btn
    $("#idRequestCode").on("click", function(){
        ResetRequest(MRPReset, "SEND_CODE", $("#idEmail").val().trim());
    });

    //On click on submit code btn
    $("#idBtnSubmitCode").on("click", function(){
        $("#errorCode").text("");
        $("#receiveNewCode").css("display", "none");
        ResetRequest(MRPReset, "SUBMIT_CODE", $("#idEmail").val().trim(), $("#idCode").val().trim());
    });

    //On click on reset code btn
    $("#idBtnReset").on("click", function(){
        ResetRequest(MRPReset, "RESET_PASSWORD", $("#idEmail").val().trim(), $("#idNewPwd").val().trim());
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
    })
    .done(function( response ) {
        console.log(response);
        myFunc(response, inputField);
    })
    .fail(function( xhr, status, errorThrown ) {
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
            $("#idEmail").attr("disabled", true);
            $("#idRequestCode").css("display","none");
            $("#idCode").css("display","block");
            $("#idBtnSubmitCode").css("display","block");
        }
        else{
            //send a message that code failed to be sent
            $("#errorEmail").text("Code failed to be sent to that email address");
            $("#idRequestCode").text("Resend code");

        }
    }
    else if(option =="SUBMIT_CODE"){
        //Analize the response then do some action
        if(res['option_status'] == 1){
            //display fields and btn to rest pwd
            $("#idCode").css("display","none");
            $("#idBtnSubmitCode").css("display","none");
            $(".block-pwd-reset").css("display", "block");
            $("#idBtnReset").attr("disabled", true);
        }
        else{
            //Code did not match. cannot reset pwd.
            submitCodeTry = submitCodeTry +1;
            $("#errorCode").text("The code you entered did not match");
            $("#receiveNewCode").css("display", "block");

            if(submitCodeTry>4){
                //refresh page
                location.reload();
            }
        }
    }
    else if(option =="RESET_PASSWORD"){

        $(".block-pwd-reset").css("display", "none");
        if(res['option_status'] ==1){
            //Password has been reset successfully
            $("#main-msg").text("Password has been reset successfully! Now you can login your account with your new password.");
    
        }
        else{
            //password failed to be reset
            $("#main-msg").text("Password failed to be reset. Please try again. If you need help reach to our customer service");
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
    })
    .done(function( response ) {
        console.log(response);
        myFunc(response, option);
    })
    .fail(function( xhr, status, errorThrown ) {
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
