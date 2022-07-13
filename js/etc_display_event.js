//Be careful with get id data direct to the database.
//Detect mobile browser or not

var slideIndex = 1;
var ticketPrice =0.00;
var ticketCurrency ="USD";
var nbrOfTicket =1;
var totprice =0;
var eventID = null;
var onlinePayment=1;
var userAppendedUsername="";

//Card details
var cardNumber ="";
var securityCode="";
var cardHolder ="";
var expirationMonth ="";
var expirationYear ="";

//Browser mobile detection
var whatsappPrefix ="";


$(document).ready(function(){
 
     //Test api
     //Get the event ID from the URL
     let eventID = getParameter('e');
     $.ajax({
        url: "api_php/api_etc_display_one.php",
        data: {"idEvent":eventID},
        type: "POST",
        dataType : "json",
    })
    .done(function( response ) {
        console.log(response);
        MPREvent(response);
    })
    .fail(function( xhr, status, errorThrown ) {
        alert( "Sorry, there was a problem!" );
        console.log( "Error: " + errorThrown );
        console.log( "Status: " + status );
        console.dir( xhr );
    });

    //Handle click on iconLR for slide show
    $("#wrapper-event-to-display").on("click", "#plusSlidesMinus1", function(){
        plusSlides(-1);
    });

    $("#wrapper-event-to-display").on("click", "#plusSlidesPlus1", function(){
        plusSlides(1);
    });

    //Take care of showing and hiding text
    $("#wrapper-event-to-display").on("click", "#read-more", function(){
        let elementDetailedText = $("#wrapper-event-to-display").find("#elaboration_1");
        toggleDisplay(elementDetailedText,this);
    });

    //Handle payment if online payment enable
    $("#wrapper-event-to-display").on("click", "#buy-event-ticket", function(){
        
         // Get the modal and display it
         $("#myModal-payment-card").css("display","block");
         //Initiate input inc/dec
         document.getElementById('inc-dec-nbr-ticket').stepUp();
         //Calculate total price
         calculatePrice();

    });

    //Handling of user suggestion in pop-up user-appended box
    //MANAGE USER APPEND---START-----
    $("#ticket-user-appended").on("keyup", function(){
        let resultDisplayDestination = "box-suggestion-users";
        if($("#"+resultDisplayDestination).css("display")!="flex"){
            $("#"+resultDisplayDestination).css("display","flex");
        }

        //Get data entered
        let inputValueToQuery = $("#ticket-user-appended").val();
        //Function suggestion + request function
        if(inputValueToQuery!=""){
            let dataObj ={family_suggest:"USERS_PLATFORM", query_data:inputValueToQuery};
            let destinationReq = "api_php/api_etc_suggestion_v2.php";
            requestSender(destinationReq, dataObj, PRUserSuggestions, "NONE", "Searching user...", "box-suggestion-users");
    
        }
        else{
            $("#box-suggestion-users").empty();
            $("#box-suggestion-users").css("display", "none");
        }
    
    });
     //On click on suggested element in box-suggestion
     $("#box-suggestion-users").on("click", "span", function(e){
        e.preventDefault();
        let choosenUser = $(this).find("strong").text();
       
        $("#ticket-user-appended").val(choosenUser);
        //Set input read only
        //display edit button
        $("#ticket-user-appended").attr("readonly", true);
        $("#box-suggestion-users").css("display", "none");
        $("#edit-user-appended").css("display","block");
    });
    //On click on Edit user button
    $("#edit-user-appended").on("click", function(){
        $("#ticket-user-appended").attr("readonly", false); 
        $("#ticket-user-appended").val("");
        $("#edit-user-appended").css("display", "none");
    });
    //MANAGE User CHOICE---END----


    //Close modal
    $("#close-modal").on("click", function(){
        $("#myModal-payment-card").css("display","none");
        //Clean the modal
        cleanPaymentForm()
        
        
    });

    //On click on checkout button
    $("#check-out-purchase").on("click", function(){
        if(nbrOfTicket!=0 && nbrOfTicket<=5 && eventID!=null){
            var objRequest ={onlinePayment:onlinePayment, eventID:eventID, nbrTicket:nbrOfTicket, orderDateTime:currentDateAndTime(), user_ticket_append:"NONE"};
            if(onlinePayment){
                //Get card info
                cardNumber = $("#card-number").val();
                securityCode = $("#card-security-code").val();
                cardHolder = $("#card-holder-name").val();
                expirationMonth = $("#exp-month").val();
                expirationYear = $("#exp-year").val();
                //Create a function to validate card details
                let checkCardInfo = validateCardInfo(cardNumber, cardHolder, securityCode, expirationMonth, expirationYear);
                if(checkCardInfo){
                    //Information are ok
                    objRequest.cardNumber = cardNumber;
                    objRequest.securityCode = securityCode;
                    objRequest.cardHolder = cardHolder;
                    objRequest.expirationMonth = expirationMonth;
                    objRequest.expirationYear = expirationYear;
                }
            
            }

            if(!onlinePayment){
                //Check if ticket is appended to someone else than agent set it below
                userAppendedUsername = $("#ticket-user-appended").val().trim();
                if(userAppendedUsername!=""){
                    objRequest.user_ticket_append = userAppendedUsername;
                }
            }

                //Send the request
                //A genius way to handle request is to create object data outside and returnProcessing func than pass them to one request function
                //If it is online payment and card infos are correct proceed.(Condition to add)
                $.ajax({
                    url: "api_php/api_etc_purchase.php",
                    data: objRequest,
                    type: "POST",
                    dataType : "json",
                    beforeSend: function(){
                        $("#zima-loader").css("display","flex");
                        $("#text-loading").text("Purchase processing...");
                    }
                })
                .done(function( response ) {
                    $("#zima-loader").css("display","none");
                    console.log(response);
                    MPPurchaseResult(response);
                
                })
                .fail(function( xhr, status, errorThrown ) {
                    alert( "Sorry, there was a problem!" );
                    console.log( "Error: " + errorThrown );
                    console.log( "Status: " + status );
                    console.dir( xhr );
                });

            
        } 
    });


});

//TEST PURPOSE FUNCTION
function voidFunction(res){}

//Get parameters from URL
function getParameter(p)
{
    var url = window.location.search.substring(1);
    var varUrl = url.split('&');
    for (var i = 0; i < varUrl.length; i++)
    {
        var parameter = varUrl[i].split('=');
        if (parameter[0] == p)
        {
            return parameter[1];
        }
    }
}

window.mobileCheck = function() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
  }


function calculatePrice(){
    totprice = ticketPrice*nbrOfTicket;
    $("#display-tot-price").text(totprice+" "+ticketCurrency);
}

function cleanPaymentForm(){
    totprice = ticketPrice;
    nbrOfTicket =1;
    $("#inc-dec-nbr-ticket").val(1);
    $("#nbr-ticket-inc-dec").text("1");
    $("#card-number").val("");
    $("#card-security-code").val("");
    $("#card-holder-name").val("");
    $("#exp-month").val("");
    $("#exp-year").val("");
}

function increment() {//Don't forget to increment the input inc/dec field on button pressed
    document.getElementById('inc-dec-nbr-ticket').stepUp();
    $("#nbr-ticket-inc-dec").text($("#inc-dec-nbr-ticket").val());
    nbrOfTicket = $("#inc-dec-nbr-ticket").val();
    calculatePrice();
 }

function decrement() {
    //console.log($("#inc-dec-nbr-ticket").val());
    if($("#nbr-ticket-inc-dec").text()==1) return;
    document.getElementById('inc-dec-nbr-ticket').stepDown();
    $("#nbr-ticket-inc-dec").text($("#inc-dec-nbr-ticket").val());
    nbrOfTicket = $("#inc-dec-nbr-ticket").val();
    calculatePrice();
 }


function toggleDisplay(d,b)
{
    if($(d).css("display")=="block"){
        $(d).css("display", "none");
        if(b){
            b.innerHTML="Read more...";
        }
    }else{
        $(d).css("display", "block");
        if(b){
            b.innerHTML="Fold in..."
        }
    }
}

// Next/previous controls
function plusSlides(n) {
        showSlides(slideIndex += n);
    }

function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("mySlides");
    if (n > slides.length) {slideIndex = 1}
    if (n < 1) {slideIndex = slides.length}
    for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
    }

    slides[slideIndex-1].style.display = "block";
}

//Function for requests
function requestSender(destinationToRequest, obj, processorFunc, msgLoader="NONE", msgSearch="MSG-SEARCH", pointerEl="ID-EL"){
    $.ajax({
        url: destinationToRequest,
        data: obj,
        type: "POST",
        dataType : "json",
        beforeSend:function(){
            //Launch  custom zima loader
            if(msgLoader!="NONE"){
                $("#zima-loader").css("display","flex");
                $("#text-loading").text(msgLoader);
            }
            else if(msgLoader=="NONE" && msgSearch!="MSG-SEARCH" && pointerEl!="ID-EL"){
                $("#"+pointerEl).text(msgSearch);
            }
        }
    })
    .done(function( response ) {
        $("#zima-loader").css("display","none");
        console.log(response);
        processorFunc(response)
    })
    .fail(function( xhr, status, errorThrown ) {
        $("#zima-loader").css("display","none");
        alert( "Sorry, there was a problem!" );
        console.log( "Error: " + errorThrown );
        console.log( "Status: " + status );
        console.dir( xhr );
    });
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

function MPREvent(res){
    let arrEvent = res['arr_event'];
    if(Object.keys(arrEvent).length!=0){
        //let us build the HTNL element
        let HTMLElement ='<div class="wrapper">\
        <div class="product-img">\
            <div class="slideshow-container">';
        
        //Take care of event posters
        let postersLink = arrEvent['linkPosters'];
        postersLink.length>0?void(0):( HTMLElement+= '<div class="mySlides fade">\
                                                        <img src="media/icons/no-bg-post.jpg" style="width:100%">\
                                                      </div>');
        for(let i=0; i<postersLink.length;i++){
            HTMLElement+= ' <div class="mySlides fade">\
            <img src="'+postersLink[i]+'" style="width:100%">\
            </div>';
        }

        //continue Continue concatination
        //Add right and left indicators
        if(postersLink.length>1){
            HTMLElement+= ' <a class="prev" id="plusSlidesMinus1">&#10094;</a>\
            <a class="next" id="plusSlidesPlus1">&#10095;</a>';
        }
        
        //concatinue concatination
        HTMLElement+='</div></div>\
            <div class="product-info">\
            <div class="product-text">\
            <h1>'+arrEvent['title']+'</h1>\
            <h2>by '+arrEvent['username']+'</h2>';
               
        //Control display of description
        let descrip = arrEvent['description'];
        let displayChars = 250;
        if(descrip.length>displayChars){//For the read more you need to delegate event click
            HTMLElement +=' <p>'+descrip.substring(0,displayChars)+'<span class="toggleLink" id="read-more">Read more...</span> <span class="elaboration" id="elaboration_1">'+descrip.substring(displayChars,descrip.length-1)+'</span>\</p>';
        }
        else{
            HTMLElement+='<p>'+descrip+'</p>';
        }
        
        //Continue concatination
        //Get array prices
        let arrPrices = arrEvent['prices'];
        let lastPrice = {onlinePayment:0, offlinePayment:0, price:"FREE", currency:""};
        if(arrPrices.length>0){
            lastPrice = arrPrices[0];
        }

        HTMLElement+='</div>\
        <div class="location-date-time-etc">\
          <span><img src="media/icons/location.png"/><span>'+arrEvent['location']+'</span></span>\
          <span><img src="media/icons/clock.png"/><span>'+arrEvent['dateTime']+'</span></span>\
          <span><img src="media/icons/price.png"/><span>'+lastPrice['price']+lastPrice['currency']+'</span></span>\
        </div>';

        //Check status to display corresponding info
        if(arrEvent['status'] =="OUTDATED"){
            HTMLElement+='<div class="outdated-notification"><span class="notification-msg">Event is outdated</span>\
                                <span class="notification-msg-details">This event has started or it had already happened.</span>\
                          </div>';
        }

        HTMLElement+='<div class="product-price-btn">';

        //Handle event diplay for agent, simple user, online, offline
        if(lastPrice.price!="FREE"){
            if(lastPrice['onlinePayment'] ==1){
                if(arrEvent['isOnline']==1){
                    HTMLElement+=((arrEvent['sell_status'] !="SOLDOUT")? '<button type="button" id="buy-event-ticket">buy now</button>':'<button type="button" >EVENT SOLDOUT</button>');
                }
                else{
                    HTMLElement+='<button type="button" id="login-buy-btn">Login to purchase</button>';
                }
            }
            else{
                if(arrEvent['isSellingAgent'] ==1){
                    HTMLElement+=((arrEvent['sell_status'] !="SOLDOUT")? '<button type="button" id="buy-event-ticket">Sell ticket</button>':'<button type="button">EVENT SOLDOUT</button>');
                }
                else{
                    //HTMLElement+='<div class="info-about-agent"><span><img src="#"/></span>Agent_user_name</div>';
                    if(arrEvent['agents'].length>0)
                    {
                        arrEvent['agents'].forEach(element => {
                            var agentUnit = ' <div class="agent-unit">\
                                               <div class="info-unit">\
                                                <span>'+element['username']+'</span>\
                                                <span>Authorized agent  | '+((arrEvent['sell_status'] != "SOLDOUT")?"<b style='color:green'>SELL OPEN</b>":"<b style='color:red'>EVENT SOLDOUT</b>")+'</span>\
                                                </div>\
                                                <div class="link-unit">\
                                                <a href="'+element['facebook']+'"><i class="bi bi-facebook"></i></a>\
                                                <a href="'+element['instagram']+'"><i class="bi bi-instagram"></i></a>';
                            //Take care of the whatsapp link
                            //Detect if user is using phone or laptop
                                //Detect if user is using phone or laptop
                                if(mobileCheck()){
                                    //whatsappPrefix="https//wa.me/phone=";
                                    let preMsg = "I want to buy this ticket https://www.zimaware.com/zimat_deployment/etc_display_event.html?e="+res.arr_event.idEvent;
                                    //href="https://wa.me/79961604211?text=Hi%27,%20like%20to%20chat%20with%20you"
                                    let whatsappLink ="https://wa.me/"+element['whatsApp']+"?text="+encodeURIComponent(preMsg);
                                    agentUnit+='<a href="'+whatsappLink+'"><i class="bi bi-whatsapp"></i></a>';
                                }
                                else{
                                    let preMsg = "I want to buy this ticket https://www.zimaware.com/zimat_deployment/etc_display_event.html?e="+res.arr_event.idEvent;
                                    let whatsappLink ="https://wa.me/79961604211?text="+encodeURIComponent(preMsg);
                                    agentUnit+='<a href="'+whatsappLink+'"><i class="bi bi-whatsapp"></i></a>';
                                }
                                
                                //Finish concatination
                                agentUnit+='</div>';
                                        
                            $("#wrapper-agents").append(agentUnit);
                        });
                    }
                    else{
                        var agentUnitNone = ' <div class="agent-unit">\
                                               <div class="info-unit">\
                                                <span>You are offline</span>\
                                                </div>\
                                                <div class="link-unit">\
                                                <a href="lsrs_login.html">Log in</a>\
                                                <a href="lsrs_signup.html">Create account</a>\
                                                </div>';
                            $("#wrapper-agents").append(agentUnitNone);
                    }
                }
            }
        }
        else{
            HTMLElement+='<button type="button"><a href="etc_home.html">Home page</a></button>';
        }

        //Finish concatination
        HTMLElement+=' </div></div></div>';
          
        //Append this to HTML DOM of page
        $("#wrapper-event-to-display").append(HTMLElement);
         //Slide show test
        showSlides(slideIndex);

        //Feel the payment pop up
        ticketPrice =lastPrice['price'];
        ticketCurrency =lastPrice['currency'];
        postersLink.length>0?$("#img-event-mini-preview").attr("src", postersLink[0]): $("#img-event-mini-preview").attr("src", "media/icons/no-bg-post.jpg")

        //Control display of payment checkout modal
        if(lastPrice['onlinePayment']==0){
            onlinePayment=0;

            $("#diff-online-payments").css("display", "none");
            $("#opt-bank-card").css("display", "none");

            $("#opt-offline-payment").css("display", "block");
            $("#diff-offline-payments").css("display", "flex");
        }
        //Get event ID
        eventID = arrEvent['idEvent'];
        

    }
    else{
        console.log(arrEvent);
    }
}

//Function to handle purchase response
function MPPurchaseResult(res){
    // Get the modal and hide it it
    $("#myModal-payment-card").css("display","none");
    //Reset user suggestion appended
    $("#ticket-user-appended").attr("readonly", false); 
    $("#ticket-user-appended").val("");
    $("#edit-user-appended").css("display", "none");

    if(res['status']==1){
        alert("Congrats! Ticket has been sold.");
    }
    else{
        if(res['error_msg'] == "SOLD_OUT"){
            alert("Oops! Sorry, no more tickets, The event is sold out.");
        }
        else{
            alert("Oops! something wrong happened. Ticket has failed to be sold");
        }
        
    }
}

//Function to display users into box-suggestion-users
function displaySuggestionsUser(arr, desDis){
    if(arr.length>0){
        for(let i=0; i<arr.length; i++){
            let unitSuggest = arr[i];
            let HTMLUnitSuggest = '<span>@<strong>'+unitSuggest['username']+'</strong></span>';
            $("#"+desDis).append(HTMLUnitSuggest);
        }
        return 1;
    }
    return 0;
}
//Function to handle user display in pop-up suggestion box HTTP part
function PRUserSuggestions(res){
    let arrUsers = res['arr_users'];
        $("#box-suggestion-users").empty();
        let resultArrUsers = displaySuggestionsUser(arrUsers,"box-suggestion-users");
        if(!resultArrUsers){
            $("#box-suggestion-users").append("<strong>No user found</strong");
        }  

}

function validateCardInfo(cardNumber, cardHolder, securityCode, expirationMoth, expirationYear){
    if(cardNumber!="" && cardHolder!="" && securityCode!="" && expirationMoth!="" && expirationYear!=""){
        return 1;
    }

    return 0;
}

/*SOMETHING IMPORTANT TO TAKE CARE IN YOUR PHP-JS CODE. IT'S LIKE THE RETURN API IN JSON FORMAT IS AN OBJECT ONLY AND NOT AN ARRAY
REVISE YOUR CODE WITH THAT IN MIND TO AVOID BUGS */

/*

<div class="wrapper">
          <div class="product-img">
            <!--img src="img/cover 1.png" width="100%"-->
              <!-- Slideshow container -->
              <div class="slideshow-container">

                  <!-- Full-width images with number and caption text -->
                  <div class="mySlides fade">
                    <img src="media/icons/cover 1.png" style="width:100%">
                  </div>

                  <div class="mySlides fade">
                    <img src="media/icons/cover 2.png" style="width:100%">
                  </div>

                  <div class="mySlides fade">
                    <img src="media/icons/cover 3.png" style="width:100%">
                  </div>

                  <!-- Next and previous buttons -->
                  <a class="prev" id="plusSlidesMinus1">&#10094;</a>
                  <a class="next" id="plusSlidesPlus1">&#10095;</a>
              </div>
            
          </div>
          <div class="product-info">
            <div class="product-text">
              <h1>Event title</h1>
              <h2>by zimaware</h2>
              <p>
                  Harvest Vases are a reinterpretation of peeled fruits and vegetables as functional objects. The surfaces appear to be sliced and pulled aside, allowing room for growth.
                  Harvest Vases are a reinterpretation of peeled fruits and vegetables as functional objects.<span class="toggleLink" id="read-more">Read more...</span> <span class="elaboration" id="elaboration_1">surfaces appear to be sliced and pulled aside, allowing room for growth.
                  Harvest Vases are a reinterpretation of peeled fruits and vegetables as functional objects. The surfaces appear to be sliced and pulled aside, allowing room for growth.
                  Harvest Vases are a reinterpretation of peeled fruits and vegetables as functional objects. The surfaces appear to be sliced and pulled aside, allowing room for growth.</span>
              </p>
            </div>
            <div class="location-date-time-etc">
              <span><img src="media/icons/location.png"/><span>Ул. Пушкина 80, Орел</span></span>
              <span><img src="media/icons/clock.png"/><span>15.04.2022 20:00</span></span>
            </div>
            <div class="product-price-btn">
              <p><span>78</span>$</p>
              <button type="button">buy now</button>
            </div>
          </div>
      </div>

*/