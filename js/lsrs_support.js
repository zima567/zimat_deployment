//IMPORTANT GLOABAL VARIABLES
var emailVar="";
var texAreaVal ="";
var emailVerified = false;

$(document).ready(function(){

        //Focus out email
        $("#idEmail").focusout(function(){
            //clean
            $("#errorEmail").text("");
    
            //Email validation
            let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            if($("#idEmail").val().trim().match(regexEmail)){
                emailVar = $("#idEmail").val().trim();
                emailVerified = true;
            }
            else{
                emailVerified = false;
                if($("#idEmail").val().trim()!=""){
                    $("#errorEmail").text("Incorrect email address");
                }
                else{
                    $("#errorEmail").text("This field is required");
                }
            }
            
        });

        //On click on button send issue
        $("#idBtnSend").on("click", function(e){
            e.preventDefault();

            //clean
            $("#errorSupport").val("");
            texAreaVal = $("#support-msg").val().trim();
            if(emailVar!="" && texAreaVal!="" && emailVerified){
                supportRequest(MRPSupport, emailVar, texAreaVal, "DIVERS");
            }

        });
});

//function proccessor
function MRPSupport(res, support_type){
    if(res['db_connection'] =="SUCCEED" && res['query_error']=="NONE"){
        //connection succeed and no query error
        if(support_type == "DIVERS"){
            if(res['support'] ==1){
                //message sent to team and save to db
                //make the email and text field readoly
                //hide button
                //chage text in headlie
                $("#box-form").css("display", "none");
                
                let supportAlert1 = '<div class="alert alert-success" role="alert">\
                <h4 class="alert-heading">Well done!</h4>\
                <p>We have successfully received your message. Our team will be reviewing it and we will answer you as soon as possible.</p>\
                <hr>\
                <p class="mb-0">You can still contact us directly via our contacts below.</p>\
                </div>';

                $("#alert-support-page").html(supportAlert1);
            }
            else{
                //message was not sent
                $("#errorSupport").text("Sorry message could not be sent. Please try again after a while");
            }
        }
        else{
            //Something went wrong
            $("#errorSupport").text("Something went wrong. If this error persists contact us on zimaware@gmail.com");
        }
    }
    else{
        $("#errorSupport").text("Connection/query error. Please try again later. If this error persists contact INTENDED_CONTACT");
    }
}
//function request
//This function will send request to api_lsrs_support.php
function supportRequest(myFunc, email, support_msg, support_type){
    
    $.ajax({
        url: "api_php/api_lsrs_support.php",
        data: {"email": email, "support_msg":support_msg, "support_type":support_type},
        type: "POST",
        dataType : "json",
        beforeSend:function(){
            $("#loading-circle").css("display","flex");
        }
    })
    .done(function( response ) {
        $("#loading-circle").css("display","none");
        console.log(response);
        myFunc(response, support_type);
    })
    .fail(function( xhr, status, errorThrown ) {
        $("#loading-circle").css("display","none");
        alert( "Sorry, there was a problem!" );
        console.log( "Error: " + errorThrown );
        console.log( "Status: " + status );
        console.dir( xhr );
    });
}

/*
check for INTENDED_CONTACT literals to be replace it by a proper phone/e-mail address
 */