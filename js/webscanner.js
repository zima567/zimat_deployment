var securityCode ="";
var ticketHash ="";

$(document).ready(function(){

   if(getUrlParameter('th')!==false){
        //Show pop up modal for security code
        //$(".custom-model-main").addClass('model-open');
            ticketHash = getUrlParameter('th');
            //ticketHash = decodeURIComponent(ticketHash);    
            let dataObj ={hashcode:ticketHash};
            let destinationReq = "api_php/api_webscanner.php";
            console.log(dataObj);
            requestSender(destinationReq, dataObj, HTTPHashVerification, "Ticket verification...");
   }
   else{
       alert("Hash code not set");
   }

    //Handle scanning if security code and hashcode are set
    $("#btn-scan-ticket").on("click", function(){
        //Hide modal
        $(".custom-model-main").removeClass('model-open');
        securityCode = $("#security-code").val().trim();
        let destinationReq = "api_php/api_webscanner.php";
        let dataObj = {hashcode:ticketHash, scan_date_time:currentDateAndTime(), security_code:securityCode, scan_ticket:"SET"}
        console.log(dataObj);
        if(securityCode!="" && ticketHash!=""){
            requestSender(destinationReq, dataObj, HTTPResponseScanning, "Scanning ticket...");
            /*$.ajax({
                url: "api_php/api_webscanner.php",
                data: {hashcode:ticketHash, scan_date_time:currentDateAndTime(), security_code:securityCode, scan_ticket:"SET"},
                contentType: false,
                type: "POST",
                dataType : "json",
                cache: false,
                processData: false,
                beforeSend:function(){
                    $("#zima-loader").css("display","flex");
                    $("#text-loading").text("Scanning ticket...");
                }
            })
            .done(function( response ) {
                $("#zima-loader").css("display","none");
                //Unset security code and empty field
                securityCode="";  $("#security-code").val(securityCode);

                console.log(response);
                HTTPResponseScanning(response);
            })
            .fail(function( xhr, status, errorThrown ) {
                alert( "Sorry, there was a problem!" );
                console.log( "Error: " + errorThrown );
                console.log( "Status: " + status );
                console.dir( xhr );
            });*/

        }
        else{
            alert("Security code not provided or ticket hash not available");
            let htmlNodeText = '<span>Enter security code to be able to scan ticket</span>';
            $("#box-text-explanation").html(htmlNodeText);

            let htmlNodeBtns = '<button id="re-enter-sc">Enter security code</button>';
            $("#box-btn-actions").html(htmlNodeBtns);
        }
    });

    //Re-enter security code
    $("#box-btn-actions").on("click", "#re-enter-sc", function(e){
        e.preventDefault();
        //alert("show box to re-enter security code");
        $(".custom-model-main").addClass('model-open');

    });

    //POPUP Handling 
    $(".close-btn, .bg-overlay").click(function(){
        $(".custom-model-main").removeClass('model-open');
    });

    
});

//Get parameters from URL
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

function requestSender(destinationToRequest, obj, processorFunc, loadingMsg="Loading..."){
    $.ajax({
        url: destinationToRequest,
        data: obj,
        type: "POST",
        dataType : "json",
        beforeSend:function(){
            $("#zima-loader").css("display","flex");
            $("#text-loading").text(loadingMsg);
        }
    })
    .done(function( response ) {
        $("#zima-loader").css("display","none");
        console.log(response);
        processorFunc(response)
    })
    .fail(function( xhr, status, errorThrown ) {
        alert( "Sorry, there was a problem!" );
        console.log( "Error: " + errorThrown );
        console.log( "Status: " + status );
        console.dir( xhr );
    });
}

function MPScanner(res){
    if(res['scan_status']==1){
        //scan successful
        $("#response-illustration").attr("src", "media/icons/scan-success.gif");

        let htmlNodeText = '<span>Ticket has been successfuly scanned!</span>';
        $("#box-text-explanation").html(htmlNodeText);

        let htmlNodeBtns = '<a href="profile.html?e='+res['idUserOnline']+'"><button>Control pannel</button></a>';
        $("#box-btn-actions").html(htmlNodeBtns);

    }
    else{
        //Scan unsuccessful
        //Set failure message
        $("#response-illustration").attr("src", "media/icons/failure-scan.png");

        if(res['error']=="NO_USER_ONLINE"){
            let htmlNodeText = '<span>Log in first in order to successfully scan ticket</span>';
            $("#box-text-explanation").html(htmlNodeText);

            let htmlNodeBtns = '<a href="lsrs_login.html?lr=SET&or=webscanner.html&keyvar=th&ad='+encodeURIComponent(ticketHash)+'"><button>LOGIN NOW</button></a>';
            $("#box-btn-actions").html(htmlNodeBtns);
        }
        else if(res['error']=="INVALID_HASHCODE"){
            let htmlNodeText = '<span>Ticket code is not valid.</span>';
            $("#box-text-explanation").html(htmlNodeText);

            let htmlNodeBtns = '<a href="etc_home.html"><button>HOME PAGE</button></a>';
            $("#box-btn-actions").html(htmlNodeBtns);
        }
        else if(res['error']=="ALREADY_SCANNED"){
            let htmlNodeText = '<span>This ticket has been already scanned</span>';
            $("#box-text-explanation").html(htmlNodeText);

            let htmlNodeBtns = '<a href="etc_home.html"><button>HOME PAGE</button></a>';
            $("#box-btn-actions").html(htmlNodeBtns);
        }
        else if(res['error']=="NO_SCANNING_RIGHTS"){
            let htmlNodeText = '<span>You have no rights to scan this ticket</span>';
            $("#box-text-explanation").html(htmlNodeText);

            let htmlNodeBtns = '<a href="etc_home.html"><button>HOME PAGE</button></a>';
            $("#box-btn-actions").html(htmlNodeBtns);
        }
        else if(res['error']=="ID_CUSTOMER_NOT_FOUND"){
            let htmlNodeText = '<span>Unknown error - ID_CUSTOMER_NOT_FOUND</span>';
            $("#box-text-explanation").html(htmlNodeText);

            let htmlNodeBtns = '<a href="etc_home.html"><button>HOME PAGE</button></a>';
            $("#box-btn-actions").html(htmlNodeBtns);
        }
        else if(res['error']=="SECURITY_CODE_UNMATCHED"){
            let htmlNodeText = '<span>Wrong security code</span>';
            $("#box-text-explanation").html(htmlNodeText);

            let htmlNodeBtns = '<button id="re-enter-sc">Re-enter security code</button>';
            $("#box-btn-actions").html(htmlNodeBtns);
        }
        else{
            let htmlNodeText = '<span>'+res['error']+'</span>\
                                <span>You can copy this error message and send to our support team.</span>';
            $("#box-text-explanation").html(htmlNodeText);

            let htmlNodeBtns = '<a href="lsrs_support.html"><button>Request help</button></a>\
                                <a href="etc_home.html"><button>HOME PAGE</button></a>';
            $("#box-btn-actions").html(htmlNodeBtns);
        }
    }
}

function  VMPScanner(res){
    if(res['isUserOnline']==1 && res['valid_hash_code']==1 && res['user_has_right']==1 && res['is_scanned']==0 && res['scanner_status']=="TURN_ON"){
        //Pop up security box to enter security code for scanning
        $(".custom-model-main").addClass('model-open');
    }
    else{
        
        $("#response-illustration").attr("src", "media/icons/failure-scan.png");

        if(res['error']=="NO_USER_ONLINE"){
            let htmlNodeText = '<span>Log in first in order to successfully scan ticket</span>';
            $("#box-text-explanation").html(htmlNodeText);

            let htmlNodeBtns = '<a href="lsrs_login.html?lr=SET&or=webscanner.html&keyvar=th&ad='+encodeURIComponent(ticketHash)+'"><button>LOGIN NOW</button></a>';
            $("#box-btn-actions").html(htmlNodeBtns);
        }
        else if(res['error']=="INVALID_HASHCODE"){
            let htmlNodeText = '<span>Ticket code is not valid.</span>';
            $("#box-text-explanation").html(htmlNodeText);

            let htmlNodeBtns = '<a href="etc_home.html"><button>HOME PAGE</button></a>';
            $("#box-btn-actions").html(htmlNodeBtns);
        }
        else if(res['error']=="ALREADY_SCANNED"){
            let htmlNodeText = '<span>This ticket has been already scanned</span>';
            $("#box-text-explanation").html(htmlNodeText);

            let htmlNodeBtns = '<a href="etc_home.html"><button>HOME PAGE</button></a>';
            $("#box-btn-actions").html(htmlNodeBtns);
        }
        else if(res['error']=="NO_SCANNING_RIGHTS"){
            let htmlNodeText = '<span>You have no rights to scan this ticket</span>';
            $("#box-text-explanation").html(htmlNodeText);

            let htmlNodeBtns = '<a href="etc_home.html"><button>HOME PAGE</button></a>';
            $("#box-btn-actions").html(htmlNodeBtns);
        }
        else if(res['error']=="SCANNER_OFF"){
            let htmlNodeText = '<span>The scanner is turned off for this new event</span><span>Please pay service fees.</span>';
            for(let i=0; i<res.scanner_note.length; i++){
                htmlNodeText+="<span>["+res.scanner_note[0].title+" : "+res.scanner_note[0].location+" : "+res.scanner_note[0].dateTime+" (fees required)]</span><br/><br/>";
            }
            $("#box-text-explanation").html(htmlNodeText);

            let htmlNodeBtns = '<a href="etc_home.html"><button>HOME PAGE</button></a>';
            $("#box-btn-actions").html(htmlNodeBtns);
        }
        else{
            let htmlNodeText = '<span>'+res['error']+'</span>\
                                <span>You can copy this error message and send to our support team.</span>';
            $("#box-text-explanation").html(htmlNodeText);

            let htmlNodeBtns = '<a href="lsrs_support.html"><button>Request help</button></a>\
                                <a href="etc_home.html"><button>HOME PAGE</button></a>';
            $("#box-btn-actions").html(htmlNodeBtns);
        }
       
    }
}

function HTTPResponseScanning(res){
    let arr_stat = res['arr_status'];
    MPScanner(arr_stat);
}

function HTTPHashVerification(res){
    let arr_stat = res['arr_status'];
    VMPScanner(arr_stat);
}