$(document).ready(function(){
        //data variables
        var emailVar="";
        var texAreaVal ="";

        //Focus out email
        $("#idEmail").focusout(function(){
            //clean
            $("#errorEmail").text("");
    
            //Email validation
            let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            if($("#idEmail").val().trim().match(regexEmail)){
                emailVar = $("#idEmail").val().trim();
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

        //On click on button send issue
        $("#idBtnSend").on("click", function(){
            texAreaVal = $("#support-msg").val().trim();
            if(emailVar!="" && texAreaVal!=""){
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
                $("#idEmail").attr("disabled", true);
                $("#support-msg").attr("readonly", true);
                $("#idBtnSend").css("display", "none");
                $("#msg-prompt").text("Message has been sent successfully to our team. We will come back to you as soon as possible.");
            }
            else{
                //message was not sent
                $("#errorSupport").text("Sorry message could not be sent. Please try again after a while");
            }
        }
        else{
            //Something went wrong
            $("#errorSupport").text("Something went wrong. If this error persists contact us on INTENDED_CONTACT");
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
    })
    .done(function( response ) {
        console.log(response);
        myFunc(response, support_type);
    })
    .fail(function( xhr, status, errorThrown ) {
        alert( "Sorry, there was a problem!" );
        console.log( "Error: " + errorThrown );
        console.log( "Status: " + status );
        console.dir( xhr );
    });
}


/*
check for INTENDED_CONTACT literals to be replace it by a proper phone/e-mail address
 */