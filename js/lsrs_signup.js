    var emailVerified = false;
    var usernameVerified = false;
    var passwordVerified = false;
    var passwordConfVerified = false;

$(document).ready(function(){

    //Disable sign up button
    $("#idBtnSignUp").attr("disabled", true);

    //Focus out email
    $("#idEmail").focusout(function(){
        //clean
        $("#errorEmail").text("");

        //Email validation
        let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if($("#idEmail").val().trim().match(regexEmail)){
            verificationRequest(MRPSignup, "EMAIL", $("#idEmail").val().trim());
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

    //Focus out username
    $("#idUsername").focusout(function(){
        //clean
        $("#errorUsername").text("");

        //At least one lower case English letter, (?=.*?[a-z])
        //minimum 3
        //digit at the end
        let regexUsername = /^[a-z]{3,}\d*$/;
        if($("#idUsername").val().trim().match(regexUsername)){
            verificationRequest(MRPSignup, "USERNAME", $("#idUsername").val());
        }
        else{

            if($("#idUsername").val().trim()!=""){
                $("#errorUsername").text("username must have at least three characters, must have letters(lower case), can have digit at the end");
            }
            else{
                $("#errorUsername").text("This field is required");
            }

        }
        
    });

    //Focus out password
    $("#idPassword").focusout(function(){
        //clean
        $("#errorPassword").text("");
        $("#idPasswordConf").val("");

        //At least one lower case English letter, (?=.*?[a-z])
        //At least one digit, (?=.*?[0-9])
        //At least one special character, (?=.*?[#?!@$%^&*-])
        //Minimum eight in length .{8,} (with the anchors)
        let regxPassword = /^(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

        if(!$("#idPassword").val().trim().match(regxPassword)){
            $("#errorPassword").text("Minimun 8 characters, at least one letter, one number and one special character");
            passwordVerified = false;
            activateBtnSubmit();
        }
        else{
            passwordVerified = true;
            activateBtnSubmit();
        }
    });

    //Focus out password configuration
    $("#idPasswordConf").focusout(function(){
        //clean
        $("#errorPasswordConf").text("");
        if($("#idPasswordConf").val().trim() === $("#idPassword").val().trim()){
            passwordConfVerified = true;
            activateBtnSubmit();
        }
        else{
            $("#errorPasswordConf").text("password does not match");
            passwordConfVerified = false;
            activateBtnSubmit();
        }
    });

    $("#idBtnSignUp").on("click", function(){
        //values from input fields
        let emailVar = $("#idEmail").val().trim();
        let usernameVar = $("#idUsername").val().trim();
        let passwordVar = $("#idPassword").val().trim();

        //Send the request to the api
        $.ajax({
            url: "api_php/api_lsrs_signup.php",
            data: {"email": emailVar, "username": usernameVar, "password":passwordVar},
            type: "POST",
            dataType : "json",
        })
        .done(function( response ) {
            console.log(response);
            FRPSignup(response);
        })
        .fail(function( xhr, status, errorThrown ) {
            alert( "Sorry, there was a problem!" );
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + status );
            console.dir( xhr );
        });

    });
});

function MRPSignup(res, inputField){
    if(res['db_connection'] =="SUCCEED" && res['query_error']=="NONE"){
        //connection succeed and no query error
        if(res['record_found'] == 1){
            //Record found
            if(inputField =="EMAIL"){
                $("#errorEmail").text("This email exists already, signup with another one");
                emailVerified = false;
                activateBtnSubmit();
            }
            else if(inputField =="USERNAME"){
                $("#errorUsername").text("This username exists already, choose another one");
                usernameVerified = false;
                activateBtnSubmit();
            }
           
        }
        else{
            //No record found
            if(inputField == "EMAIL"){
                emailVerified = true;
                activateBtnSubmit();
            }
            else if(inputField == "USERNAME"){
                usernameVerified = true;
                activateBtnSubmit();
            }
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

function activateBtnSubmit(){
     if(emailVerified && usernameVerified && passwordVerified && passwordConfVerified){
        $("#idBtnSignUp").attr("disabled", false);
     }
     else{
        $("#idBtnSignUp").attr("disabled", true);
     }
}

function FRPSignup(res){
    if(res['db_connection'] =="SUCCEED" && res['query_error']=="NONE"){
        if(res['sign_up_success'] ==1){
            $("input").val("");
            emailVerified = false;
            usernameVerified = false;
            passwordVerified = false;
            passwordConfVerified = false;
            activateBtnSubmit();
            alert("Successfully registered");
        }
        else{
            alert("Sign up failed, please try again by paying carefull attention to the requirements");
        }

        if(res['email_verification_sent'] == 1){
            alert("verification link has been sent to your email address");
        }
        else{
            alert("Verification link failed to be sent. Try request for verification in your profile account");
        }
    }
}