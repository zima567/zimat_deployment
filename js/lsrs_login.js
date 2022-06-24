//IMPORTANT GLOBAL VARIABLES
var pageToRedirectTo = "";
var URLVarName = "";
var URLVarVal = "";

$(document).ready(function(){

    //Request for login from different pages than the login page itself
    if(getUrlParameter("lr")=="SET" && getUrlParameter("or")!=false){
        //Handle login and redirect back to where the login request came from
        //First check for existence of the login token in browser localStorage
        pageToRedirectTo = getUrlParameter("or");
        if(getUrlParameter("keyvar")!=false && getUrlParameter("ad")!=false){
            URLVarName = getUrlParameter("keyvar");
            URLVarVal = getUrlParameter("ad");
        }
        if(getLoginUserTokens()!=0){
            let destinationToRequest ='api_php/api_lsrs_login.php';
            let obj = getLoginUserTokens();
            requestSender(destinationToRequest, obj, TokenRPLogin);
        }
    }
    else{
        if(getLoginUserTokens()!=0){
            let destinationToRequest ='api_php/api_lsrs_login.php';
            let obj = getLoginUserTokens();
            requestSender(destinationToRequest, obj, TokenRPLogin);
        }
    }

    //Get potentential anouncements from url
    //Redirect to login page after signup
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
        let rememberMe = 0;
        if($("#idRemenber").is(":checked")){rememberMe=1;}

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
            let destinationToRequest ='api_php/api_lsrs_login.php';
            let obj = {email: emailVar, password:passwordVar, rememberMe:rememberMe, loginDateTime:currentDateAndTime()}
            requestSender(destinationToRequest, obj, RPLogin);
        }
    });
});

//Get variables from the URL
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

//Get login token saved to  local storage
function getLoginUserTokens(){
    if (typeof(Storage) !== "undefined") {
        // Code for localStorage
        let tokenHash = localStorage.getItem("tokenHash");
        let username = localStorage.getItem("username");
        if(tokenHash!=null && username!=null){
            let tokensObj = {tokenHash: tokenHash, username:username};
            return tokensObj;
        }    
    }
   return 0;
}

//Get current date and time
function currentDateAndTime(){
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var hours = today.getHours();
        if(hours<10) hours = "0"+hours;
    var minutes = today.getMinutes();
        if(minutes<10) minutes = "0"+minutes;
    var seconds = today.getSeconds();
        if(seconds<10) seconds = "0"+seconds;
    today = yyyy+'-'+ mm + '-' + dd +"T"+hours+":"+minutes+":"+ seconds;

    return today;
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

/****************************RETURN REQUEST PROCESSING FUNCTIONS */
//Handle return for request return from user token authenticity verification
function TokenRPLogin(res){
    if(res['db_connection']=="SUCCEED" && res['query_error']=="NONE"){
        if(res['username']!="NONE" && res['tokenHash'] =="MATCH"){
            //Login success
            //Here will implement the redirecting process
            if(pageToRedirectTo!="" && URLVarName!="" && URLVarVal!=""){
                let completeURL = pageToRedirectTo+"?"+URLVarName+"="+encodeURIComponent(URLVarVal);
                window.location.replace(completeURL);
            }
            else if(pageToRedirectTo!=""){
                window.location.replace(completeURL);
            }
            else{
                window.location.replace("etc_home.html");
            }
        }
        else{
            alert("Login token has been corrupted. Try to log in with your credentials");
        }
    }
    else{
         //Failed connection to db or error in queries
         alert("Failed connection to data base or wrong queries. Try again! \nIf this error persists make a screenshot an contact customer service.");
    }
}

//Handle request return for login 
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

        if(res['tokenHash']!="NONE" && res['username']!="NONE"){
            if (typeof(Storage) !== "undefined") {
                // Code for localStorage
                localStorage.setItem("tokenHash", res['tokenHash']);
                localStorage.setItem("username", res['username']);
              }
        }

        if(!accessDenied){
            //clean the input fields
            $("#idEmail").val("");
            $("#idPassword").val("");
            if(pageToRedirectTo!="" && URLVarName!="" && URLVarVal!=""){
                let completeURL = pageToRedirectTo+"?"+URLVarName+"="+encodeURIComponent(URLVarVal);
                window.location.replace(completeURL);
            }
            else if(pageToRedirectTo!=""){
                window.location.replace(completeURL);
            }
            else{
                window.location.replace("etc_home.html");
            }
        }
    }
    else{
        //Failed connection to db or error in queries
        alert("Failed connection to data base or wrong queries. Try again! \nIf this error persists make a screenshot an contact customer service.");
    }
}

