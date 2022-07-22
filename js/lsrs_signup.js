//IMPORTANT GLOBAL VARIABLES
    var emailVerified = false;
    var usernameVerified = false;
    var passwordVerified = false;
    var passwordConfVerified = false;
    var termsAndConditionsVerified = false;

$(document).ready(function(){

    $("#idBtnSignUp").on("click", function(){
        //EMAIL VALIDATION
        $("#errorEmail").text("");

        //Email regex
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

        //USERNAME VALIDATION
        $("#errorUsername").text("");

        //At least one lower case English letter, (?=.*?[a-z])
        //minimum 3
        //digit at the end
        let regexUsername = /^[a-zA-Z_]{3,}\d*$/;
        if($("#idUsername").val().trim().match(regexUsername)){
            verificationRequest(MRPSignup, "USERNAME", $("#idUsername").val());
        }
        else{

            if($("#idUsername").val().trim()!=""){
                $("#errorUsername").text("The three first characters must be letters, can have underscore, can have digit only at the end");
            }
            else{
                $("#errorUsername").text("This field is required");
            }

        }

        //PASSWORD VALIDATION
        //clean
        $("#errorPassword").text("");

        //At least one lower case English letter, (?=.*?[a-z])
        //At least one digit, (?=.*?[0-9])
        //At least one special character, (?=.*?[#?!@$%^&*-])
        //Minimum eight in length .{8,} (with the anchors)
        let regxPassword = /^(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

        if(!$("#idPassword").val().trim().match(regxPassword)){
            $("#errorPassword").text("Minimun 8 characters, at least one letter, one number and one special character");
            passwordVerified = false;
        }
        else{
            passwordVerified = true;
        }

        //CONFIRMATION PASSWORD VALIDATION
         //clean
         $("#errorPasswordConf").text("");

         if($("#idPasswordConf").val().trim() == $("#idPassword").val().trim()){
             passwordConfVerified = true;
         }
         else{
             $("#errorPasswordConf").text("password does not match");
             passwordConfVerified = false;
         }


        
        if($("#idTermsConditions").is(":checked")){
            $("#errorTermsAndConditions").text("");
            termsAndConditionsVerified = true;
        }
        else{
            $("#errorTermsAndConditions").text("You cannot proceed without accepting our terms and conditions");
            termsAndConditionsVerified = false;
        }

        //values from input fields
        if(emailVerified && usernameVerified && passwordConfVerified && termsAndConditionsVerified){
            let emailVar = $("#idEmail").val().trim();
            let usernameVar = $("#idUsername").val().trim();
            let passwordVar = $("#idPassword").val().trim();
    
            //Send the request to the api
            let destinationToRequest = 'api_php/api_lsrs_signup.php';
            let obj ={email: emailVar, username: usernameVar, password:passwordVar};

            //Add user reference
            if($("#refUsername").val().trim()!=""){
                obj.ambassador = $("#refUsername").val().trim();
            }
            
            requestSender(destinationToRequest, obj, FRPSignup);
        }


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
            }
            else if(inputField =="USERNAME"){
                $("#errorUsername").text("This username exists already, choose another one");
                usernameVerified = false;
            }
           
        }
        else{
            //No record found
            if(inputField == "EMAIL"){
                emailVerified = true;
            }
            else if(inputField == "USERNAME"){
                usernameVerified = true;
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

function FRPSignup(res){
    if(res['db_connection'] =="SUCCEED" && res['query_error']=="NONE"){
        if(res['sign_up_success'] ==1){
            let emailSend = -1;

            $("input").val("");
            emailVerified = false;
            usernameVerified = false;
            passwordVerified = false;
            passwordConfVerified = false;

            if(res['email_verification_sent'] == 1){
                emailSend = 1;
            }

            window.location.href = "lsrs_login.html?signup=success&emailsent="+emailSend;
            
        }
        else{
            alert("Sign up failed, please try again by paying carefull attention to the requirements");
        }
    }
}

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