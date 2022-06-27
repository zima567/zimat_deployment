
$(document).ready(function(){
    //array categ
    var arrUserCateg=[];

    //Bottom menu jquery
   $('.app-navigation-toggle').click(function() {

    $('.app-navigation-container').toggleClass('open', 300);

    $(this).toggleClass('active');

    });
    
    let pastLimit = get2daysagoDate();
    
    //Unfold events to catalogue //To be modified
    //************************************ */
    let dataObj_uetc ={pastLimit: pastLimit};
    let destinationReq_uetc = "api_php/api_etc_display.php";
    requestSender(destinationReq_uetc, dataObj_uetc, eventsRequestHandler);

    /************************************** */

    /**************USER SUGGESTION START************* */
    let dataObj_us ={};
    let destinationReq_us = "api_php/api_etc_suggestion.php";
    requestSender(destinationReq_us, dataObj_us, usersRequestHandler);
     /**************USER SUGGESTION END************* */

     /*EVENT SUGGESTION BASED ON CATEG OF PREFERENCE QUERIED BY CITY AND COUNTRY --- START */
       //This code has successfully passed the tests now it's certified
       let todayDate = currentDateAndTime();
       let dataObj_eboc ={myCategEvents:"VAR_SET", pastLimit:todayDate};
       let destinationReq_eboc = "api_php/api_etc_display.php";
       requestSender(destinationReq_eboc, dataObj_eboc, suggestionEventHandler);
       /*END */

     /*Dislay my Events into subCatalogue */
    $("#btn-my-events").on("click", function(){
        //Show sub-catalogue
        $("#catalogue-my-events-tickets").css("display","flex");
        //Launch small-text loader
        $("#mini-text-loader").css("display", "block");

        $.ajax({
            url: "api_php/api_etc_display.php",
            data: {myEvent:"VAR_SET"},
            type: "POST",
            dataType : "json",
        })
        .done(function( response ) {
            $("#mini-text-loader").css("display", "none");
            console.log(response);
            myEventsRequestHandler(response);
        })
        .fail(function( xhr, status, errorThrown ) {
            alert( "Sorry, there was a problem!" );
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + status );
            console.dir( xhr );
        });

    });

    /*Display my purchase tickets */
    $("#btn-my-tickets").on("click", function(){
       //Show sub-catalogue
        $("#catalogue-my-events-tickets").css("display","flex");
        //Display small text-loader
        $("#mini-text-loader").css("display", "block");
        
        $.ajax({
            url: "api_php/api_etc_display.php",
            data: {myTicket:"VAR_SET"},
            type: "POST",
            dataType : "json",
        })
        .done(function( response ){
            $("#mini-text-loader").css("display", "none");
            //console.log(response);
            myTicketsRequestHandler(response);
        })
        .fail(function( xhr, status, errorThrown ) {
            alert( "Sorry, there was a problem!" );
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + status );
            console.dir( xhr );
        });

    });

    //Handle options (three dots) event (Not yet implemented)
    $("#idCatalogue").on("click", ".options", function(event){
        event.preventDefault();
        //let eventID = event.target.id;
        alert("Sorry! That functionality is not yet completely implemented.");  
    });

    //Handle report event (Not yet implemented)
    $("#idCatalogue").on("click", ".report", function(event){
        event.preventDefault();
        //let eventID = event.target.id;
        alert("Sorry! That functionality is not yet completely implemented.");  
    });

    $("#catalogue-my-events-tickets").on("click", ".generate-ticket-action-btn", function(e){
        e.preventDefault();
        //Launch  custom zima loader
        $("#zima-loader").css("display","flex");
        $("#text-loading").text("Generating ticket...");
        let ticketID = e.target.id;
        let thisCard = $(this).closest(".ticketCard");
        let idCard = $(thisCard).prop("id");
        let eventTitle = $("#"+idCard).find(".info-ticket").find("h1").text();
        let postImgLink = $("#"+idCard).find(".post-image").attr("src");
        let eventLocation = $("#"+idCard).find(".this-event-location").text();
        let eventDateTime = $("#"+idCard).find(".this-event-dateTime").text();
        let eventPrice = $("#"+idCard).find(".this-event-price").text();
        let hashCode = $("#"+idCard).find("input").val();
        let eventCreator = $("#"+idCard).find(".this-event-creator").text();
        let eventOrderDate = $("#"+idCard).find(".this-event-orderDate").text();

        //Complete the template ticket card
        $("#id-title-event").text(eventTitle);
        $("#id-img-poster").attr("src", postImgLink);
        $("#id-address-event").text(eventLocation); 
        $("#id-date-time-event").text(eventDateTime); 
        $("#id-price").text(eventPrice);
        $("#id-creator").text(eventCreator);  
        $("#id-purchase-date").text(eventOrderDate); 
        
        //Generate the ticket
        //Create URL + Hash
        let urlHash = "localhost/zimat_deployment/webscanner.html?th="+ encodeURIComponent(hashCode);
        console.log(urlHash);
        createQRcode(urlHash);
        //Hide loader after the end of the process

    });

    $("#bottom-show-hide").on("click", function(){
        if($("#catalogue-my-events-tickets").css("display") =="flex"){
            $("#catalogue-my-events-tickets").css("display","none");
            //Click box-my-event-my-ticket
            $("#catalogue-my-events-tickets").children().not(':first-child').remove();
        } 
    });

    //Handle share button functionality
    $("#idCatalogue").on("click", ".btn-share", function(event){
        let idEToShare = event.target.id;
        idEToShare = idEToShare.replace("id-share-","");
        let linkToShare = "https://www.zimaccess.com/etc_display_event.html?e="+idEToShare;
        $("#event-link-val").val(linkToShare);
        $("#pop-up-box3").addClass('model-open');
        
    });

    //Handle the copy of the link once click on the copy link btn
    $("#id-content-popup3").on("click", "#btn-cpy-link", function(event){
        event.preventDefault();
        CopyToClipboard($("#event-link-val").val(), true, "link copied");
        $("#pop-up-box3").removeClass('model-open');
    });

    //logout of the system
    $("#logout").on("click", function(){
        let dataObj ={};
        let destinationReq = "api_php/api_lsrs_logout.php";
        requestSender(destinationReq, dataObj, logoutHelper,"Logging out...");
    });

    //Create event on the platform
    $("#create-event-btn").on("click", function(){
        //Write code to check if user is online
        window.location.href = "etc_create_event.html";
    });

    //Go to display event page
    $("#idCatalogue").on("click", ".btn-get-your-ticket", function(event){
        event.preventDefault();
        let eventID = event.target.id;
        eventID = eventID.replace("id-main-action-btn-","");
        let url = "etc_display_event.html?e=" +eventID;
        window.location.href = url;   
    });

    //Handle like event btn
    $("#idCatalogue").on("click", ".heart-icon", function(event){
        event.preventDefault();
        //alert($("#"+event.target.id).prop("tagName").toLowerCase());
        //alert($(this).closest(".post-content").prop("id"));
        let eventID = event.target.id;
        eventID = eventID.replace("event-like-btn-","");
        let pointerParent = $(this).closest(".post-content");
        let imgLikeElement = this;
        let actionType = "EVENT_LIKE";

        $.ajax({
            url: "api_php/api_btn_action.php",
            data: {actionType: actionType, eventID: eventID, actionDateTime: currentDateAndTime()},
            type: "POST",
            dataType : "json",
        })
        .done(function( response ) {
            //console.log(response);
            likeActionHandler(response, eventID, pointerParent, imgLikeElement);
        })
        .fail(function( xhr, status, errorThrown ) {
            alert( "Sorry, there was a problem!" );
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + status );
            console.dir( xhr );
        });

    })

    //Handling of city suggestion in pop-up configuration box
    //MANAGE CITY CHOICE---START-----
    $("#user-city").on("keyup", function(){
        let resultDisplayDestination = "box-suggestion-cities";
        if($("#"+resultDisplayDestination).css("display")!="flex"){
            $("#"+resultDisplayDestination).css("display","flex");
        }

        //Get data entered
        let inputValueToQuery = $("#user-city").val();
        //Function suggestion + request function
        if(inputValueToQuery!=""){
            let dataObj ={family_suggest:"USER_CITY", query_data:inputValueToQuery};
            let destinationReq = "api_php/api_etc_suggestion_v2.php";
            requestSender(destinationReq, dataObj, PRCitySuggestions);
    
        }
        else{
            $("#box-suggestion-cities").empty();
            $("#box-suggestion-cities").css("display", "none");
        }
    
    });

    //On click on suggested element in box-suggestion
    $("#box-suggestion-cities").on("click", "span", function(e){
        e.preventDefault();
        let choosenCountry = $(this).find("strong").text();
       
        $("#user-city").val(choosenCountry);
        //Set input read only
        //display edit button
        $("#user-city").attr("readonly", true);
        $("#box-suggestion-cities").css("display", "none");
        $("#edit-city-btn").css("display","block");
    });

    //On click on Edit country button
    $("#edit-city-btn").on("click", function(){
        $("#user-city").attr("readonly", false); 
        $("#user-city").val("");
        $("#edit-city-btn").css("display", "none");
    });
    //MANAGE CITY CHOICE---END----

    //HANDLE CLICK ON CATEGORIES
    $("#box-categories").on("click", "span", function(e){
        e.preventDefault();

        if($(this).hasClass('background-selected')){
           $(this).removeClass('background-selected').addClass('categ-unit');
        }
        else{
            $(this).removeClass('categ-unit').addClass('background-selected');
        }
        
    });

    //ON CLICK ON SAVE CHANGES
    $("#save-changes").on("click", function(){
        //Get selected categories
        var userChosenCategs = $("#box-categories").find(".background-selected");
        for(let i=0; i<userChosenCategs.length;i++){
            arrUserCateg.push($(userChosenCategs[i]).text().trim());
        }

        //Get the city name
        let cityName = $("#user-city").val().trim();
        if(cityName!=""){
            //Send request for configuration
            let dataObj ={action_type:"T_UPDATE", config_type:"update_user_location", city_name:cityName};
            let destinationReq = "api_php/api_configuration_module1.php";
            requestSender(destinationReq, dataObj, voidHandler);
        }

        if(arrUserCateg.length>0){
            //send request for configuration
            let dataObj ={action_type:"T_UPDATE", config_type:"update_user_categories", arr_user_categs:arrUserCateg};
            let destinationReq = "api_php/api_configuration_module1.php";
            requestSender(destinationReq, dataObj, voidHandler);
        }

        if(arrUserCateg.length>0 || cityName!=""){
            $("#pop-up-box2").removeClass('model-open');
        }
        
    });

    //POPUP Handling 
    $(".close-btn, .bg-overlay").click(function(){
      $("#pop-up-box1").removeClass('model-open');
      $("#pop-up-box2").removeClass('model-open');
      $("#pop-up-box3").removeClass('model-open');
    });


    //End of hadling page complete load with jquery
});


function get2daysagoDate() {
    return new Date(new Date().getTime() - 2*(24*60*60*1000)).toUTCString();
  }

//Print formats seconds, minutes, days, years ago
function timeSince(date) {

    var seconds = Math.floor((new Date() - date) / 1000);
  
    var interval = seconds / 31536000;
  
    if (interval > 1) {
      return Math.floor(interval) + " years";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + " months";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + " days";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + " hours";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + " minutes";
    }
    return Math.floor(seconds) + " seconds";
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

function requestSender(destinationToRequest, obj, processorFunc, msgLoader="NONE"){
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

/*Function to copy to clipboard */
function CopyToClipboard(value, showNotification, notificationText) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val(value).select();
    document.execCommand("copy");
    $temp.remove();

    if (typeof showNotification === 'undefined') {
        showNotification = true;
    }
    if (typeof notificationText === 'undefined') {
        notificationText = "Copied to clipboard";
    }

    var notificationTag = $("div.copy-notification");
    if (showNotification && notificationTag.length == 0) {
        notificationTag = $("<div/>", { "class": "copy-notification", text: notificationText });
        $("body").append(notificationTag);

        notificationTag.fadeIn("slow", function () {
            setTimeout(function () {
                notificationTag.fadeOut("slow", function () {
                    notificationTag.remove();
                });
            }, 1000);
        });
    }
}

/************* */
//Simple function to display categories
function displayCategs(res){
    $("#box-categories").empty();
    let arrCategs = res['arr_return'].arr_all_categ;

    if(arrCategs.length>0){
        for(let i=0; i<arrCategs.length;i++){
            let unitCateg = arrCategs[i];
            let HTMLElementCateg = '<span class="categ-unit">'+unitCateg['title']+'</span>';
            $("#box-categories").append(HTMLElementCateg);
        }
    }
    else{
        let HTMLElementCateg = '<strong>No categories available</strong>';
        $("#box-categories").append(HTMLElementCateg);
    }
}
//Function to display categories when config pop-up appear to user
function queryAndDisplayCategories(){
    let dataObj ={action_type:"T_SELECT", config_type:"select_categ_of_users"};
    let destinationReq = "api_php/api_configuration_module1.php";
    requestSender(destinationReq, dataObj, displayCategs);
}

function voidHandler(res){
    /*Empty function body */
}
/*************** */

function createQRcode(codeTicket,logoLink="media/icons/user-temp.png"){

    //TEST QRCODE
    $.getScript("easyqrcodejs/src/easy.qrcode.js", function() {
        //show template of ticket
        $("#ticketCard-template").css("display","block");

        var qrcode = new QRCode(document.getElementById("qrcode-template"), {
            text: codeTicket,
            logo: logoLink,
            logoWidth: undefined,
            logoHeight: undefined,
            logoBackgroundColor: '#f1f1f1',
            logoBackgroundTransparent: false,
            backgroundImage: undefined,
            width: 100,
            height: 100,
        });

        html2canvas(document.getElementById("ticketCard-template"),		{
            allowTaint: true,
            useCORS: true
        }).then(function (canvas) {
            var anchorTag = document.createElement("a");
            document.body.appendChild(anchorTag);
            anchorTag.download = "filename.jpg";
            anchorTag.href = canvas.toDataURL();
            anchorTag.target = '_blank';
            $("#zima-loader").css("display","none"); //Close the loading circle to save ticket generated
            anchorTag.click();
        });

        //clear
        qrcode.clear();
        $("#ticketCard-template").css("display","none");
       
    });

}

function logoutHelper(res){
    if(res['succ_logout']==1){
        //Remove tokens
        if (typeof(Storage) !== "undefined") {
            // Code for localStorage
            localStorage.removeItem("tokenHash");
            localStorage.removeItem("username");
        } 
        window.location.replace("lsrs_login.html");
    }
}

function appendEventsToCatalogue(arrEventSelection, catalogue="idCatalogue"){
    if(arrEventSelection.length>0){
        for(let i = 0; i<arrEventSelection.length; i++){
            let arrEF = arrEventSelection[i];
            let event_unit = '<div class="post">\
            <div class="info">\
                <div class="user">';
            
            //Take care of profile picture
             //Take care of profile picture
             if(arrEF['avatar']!="NONE"){
                event_unit+=' <div class="profile-pic"><a href="profile.html?e='+arrEF['idUser']+'"><img src="'+arrEF['avatar']+'" alt=""/></a></div>';
            }
            else{
                event_unit+=' <div class="profile-pic"><a href="profile.html?e='+arrEF['idUser']+'"><img src="media/icons/user-icon.png" alt=""/></a></div>';
            }

            //continue concatination
            event_unit+=' <p class="username">'+arrEF['username']+'</p>';
            
            //Check if user if verified
            if(arrEF['verified']==1){
                event_unit+='<span class="username"><img src="media/icons/verified.png" width="20"/></span>';
            }

            //continue concatination
            event_unit+='</div><img src="media/icons/option.PNG" class="options" alt=""/></div>';
            
            //Add post image post
            let arrPosters = arrEF['posters'];
            if(arrPosters.length>0){
                event_unit+='<img src="media/icons/loadingSpinner.gif" class="lazy post-image" alt="" data-src="'+arrPosters[0]+'" data-srcset="'+arrPosters[0]+'" >';
            }
            else{
                event_unit+='<img src="media/icons/loadingSpinner.gif" class="lazy post-image" alt="" data-src="media/icons/no-bg-post.jpg" data-srcset="media/icons/no-bg-post.jpg">';
            }
                
            
            //Continue concatination
            let imgLink ="media/icons/like.PNG";
            if(arrEF['userLiked']==1){
                imgLink = "media/icons/iconsRed.png";
            }
            event_unit+='<div class="post-content" id="id-post-content-'+arrEF['idEvent']+'">\
            <div class="reaction-wrapper">\
                <img src="'+imgLink+'" class="heart-icon icon" id="event-like-btn-'+arrEF['idEvent']+'" alt=""/>\
                <img src="media/icons/report.png" class="report icon" alt=""/>\
            </div>';
            
            //Add the number of likes
            let bg_event_status ="";
            if(arrEF['status']=="SCHEDULED"){
                bg_event_status = "event-scheduled";
            }
            else if(arrEF['status']=="RESCHEDULED"){
                bg_event_status = "event-rescheduled";
            }
            else{
                bg_event_status = "event-outdated";
            }

            event_unit+='<p class="likes" id="event-like-nbr-'+arrEF['idEvent']+'">'+arrEF['nbrLike']+' likes</p>\
            <p class="description"><span>'+arrEF['username']+'</span>'+arrEF['postMessage']+'</p>\
            <p class="description"><span>'+arrEF['title']+'</span><span class="event-status '+bg_event_status+'">'+arrEF['status']+'<span><p>\
                <div class="main-info description">\
                    <span><img src="media/icons/location.png"/><span>'+arrEF['location']+'</span></span>\
                    <span><img src="media/icons/clock.png"/><span>'+arrEF['dateTime']+'</span></span>';

            //Take care of prices
             let priceArr = arrEF['prices'];
             if(priceArr.length>0){
                 //There is price for that event
                 if(priceArr.length>1){
                     event_unit+='<span><img src="media/icons/price.png"/><span>'+priceArr[0]+' | <span class="expired-price">'+priceArr[1]+'</span></span></span>';
                 }
                 else{
                    event_unit+='<span><img src="media/icons/price.png"/><span>'+priceArr[0]+'</span></span>';
                 }
             }

             //Continue concatination
             event_unit+='</div>\
                <p class="post-time">'+timeSince((new Date(arrEF['postDateTime'])).getTime())+' ago</p>\
                </div>\
                <div class="comment-wrapper">\
                <button class="main-action-btn btn-get-your-ticket" id="id-main-action-btn-'+arrEF['idEvent']+'">Get your ticket</button>\
                <button class="btn-share comment-btn" id="id-share-'+arrEF['idEvent']+'">share</button>\
                </div>\
                </div>';
    
            //Append this event
            $("#"+catalogue).append(event_unit);
        }

    }else{
        //No events from following
        //$("#idCatalogue").append("<h4>No events</h4>");
        return 0;
    }
    //Events have been displayed to catalogue
    return 1;

}

function appendUserCard(arr, suggest_why){
    if(arr.length>0){
        for(let i=0; i<arr.length;i++){
            let userUnit = arr[i];
            let tempAvatar = userUnit['avatar'];
            if(userUnit['avatar']=="NONE"){
                tempAvatar = "media/icons/user-icon.png";
            }
            
            let elToAppend ='<div class="status-card">\
                <div class="profile-pic"><a href="profile.html?e='+userUnit['idUser']+'"><img src="media/icons/ripple.gif" class="lazy-user" alt="" data-src="'+tempAvatar+'" data-srcset="'+tempAvatar+'"></a></div>\
                <p class="username">'+userUnit['username']+'</p>\
                <p class="infoplus">'+suggest_why+'</p>\
                </div>';
            
            $("#status-wrapper").append(elToAppend);
        }
        return 1;
    }
    return 0;
}

function appendMyTickets(arr){
    if(arr.length>0){
        for(let i=0;i<arr.length;i++){
            let unitTicket = arr[i];
            let HTMLTicketCard = '<div class="post ticketCard" id="ticketCard-id-'+unitTicket['idTicket']+'" >\
            <div class="info-ticket">\
                <h1>'+unitTicket['title']+'</h1>\
                <span>Ticket No '+(i+1)+'</span>\
            </div>';

            //Take care of poster image
            let arrPosters = unitTicket['posters'];
            if(arrPosters.length>0){
                HTMLTicketCard+='<img src="media/icons/loadingSpinner.gif" class="lazy post-image" alt="" data-src="'+arrPosters[0]+'" data-srcset="'+arrPosters[0]+'"/>';
            }
            else{
                HTMLTicketCard+='<img src="media/icons/loadingSpinner.gif" class="lazy post-image" alt="" data-src="media/icons/no-bg-ticket.jpg" data-srcset="media/icons/no-bg-ticket.jpg"/>'; 
            }
            
            //Continue concatination
            HTMLTicketCard+='<div class="section-info-qrcode">\
            <div class="main-info description">\
                <span><img src="media/icons/location.png"/><span class="this-event-location">'+unitTicket['location']+'</span></span>\
                <span><img src="media/icons/clock.png"/><span class="this-event-dateTime">'+unitTicket['dateTime']+'</span></span>';
            
            //Handle price
            let arrPrices = unitTicket['prices'];
            HTMLTicketCard+='<span><img src="media/icons/price.png"/><span class="this-event-price">'+arrPrices[0]+'</span></span>\
                </div>\
                <div class="qrcode" id="qrcode-'+unitTicket['idTicket']+'">QRCODE</div>\
                <input id="hashCode-id-'+unitTicket['idTicket']+'" type="text" style="display:none;" value="'+unitTicket['ticketHash']+'"/>\
                </div>\
                <div class="main-info" style="font-style: italic; font-size: 11px; padding: 4px;">\
                    <span style="margin: 4px;">Creator: <span class="this-event-creator">@'+unitTicket['username']+'</span></span>\
                    <!--span style="margin: 4px;">Seller: <span>@zima</span></span-->\
                    <span style="margin: 4px;">Purchase date: <span class="this-event-orderDate">'+unitTicket['orderDate']+'</span></span>\
                    <span style="margin: 4px;">Security code: <span class="this-event-secureCode">'+unitTicket['securityCode']+'</span></span>\
                </div>\
                <div class="comment-wrapper">\
                <button class="main-action-btn generate-ticket-action-btn" id="generate-ticket-id-'+unitTicket['idTicket']+'">Generate ticket</button>\
                </div>\
                </div>';
            
            //Append this ticket to catalogue
            $("#catalogue-my-events-tickets").append(HTMLTicketCard);

        }
        return 1;
    }
    return 0;
}

function usersRequestHandler(res){
    //Set profile image and link to user page
    let userProfileData = res['arr_status'];
    if(userProfileData['user_online']!=0){
        let userLink = "profile.html?e="+userProfileData['idUserOnline'];
        $("#profile-link").attr("href", userLink);
        //Set profile link for bottom menu
        $("#profile-link2").attr("href", userLink);
        if(userProfileData['user_avatar']!="NONE"){
            $("#profile-img").attr("src", userProfileData['user_avatar']);
        }
    }
    else{
        let loginIcon = '<a href="lsrs_login.html"><img src="media/icons/login.png" alt="login-icon"/></a>'
        $("#logout").html(loginIcon);
        //For bottom menu
        $("#profile-link2").attr("href", "lsrs_login.html");
    }

    let arrUsersFY = res['arr_users_FY'];
    let resultArrUsersFY = appendUserCard(arrUsersFY, "Follows you");
    //if(!resultArrUsersFY){alert("No user from from following");}

    let arrUsersMTF = res['arr_users_MTF'];
    let resultArrUsersMTF = appendUserCard(arrUsersMTF, "official account");
    //if(!resultArrUsersMTF){alert("No user from mandatory");}

            //Lazy load handling
            let Lazyimages = [].slice.call($(".lazy-user"));
    
            if("IntersectionObserver" in window){
                let observer = new IntersectionObserver((entries, observer)=>{
                    entries.forEach(function(entry){
                        if(entry.isIntersecting){
                            let lazyimage = entry.target;
                            lazyimage.src = lazyimage.dataset.src;
                            lazyimage.srcset = lazyimage.dataset.srcset;
                            lazyimage.classList.remove("lazy-user");
                            observer.unobserve(lazyimage);
                        }
                    })
                });
                //Loop through all images
                Lazyimages.forEach((lazyimage)=>{
                    observer.observe(lazyimage);
                })
            }

}

function eventsRequestHandler(res){
    //Show or Hide menu myEvents & myTickets depending on online status
    let arrStatus = res['arr_status'];
    if(arrStatus['user_online']==0){
        $("#box-menu-events-tickets").css("display","none");
    }

    //Handle return of events from user following
    let arrEventFollowing = res['arr_events_following'];
    let resultEventFollowing = appendEventsToCatalogue(arrEventFollowing);
    //if(!resultEventFollowing){alert("No events from following");}

    let arrEventDefault = res['arr_event_default'];
    let resultEventDefault = appendEventsToCatalogue(arrEventDefault);
    //if(!resultEventDefault){alert("No events from Default");}

    if(!resultEventFollowing && !resultEventDefault){
        let NoEventsTodisplay = '<div class="no-event-ofyours" style="margin-top:40px">\
            <img src="media/icons/nothing1.gif"/>\
            <p> Nothing from followings,<br>\
            Make sure you follow people to know what they are planning<br>\
            </div>';

        $("#idCatalogue").append(NoEventsTodisplay);
    }

    

        //Lazy load handling
        let Lazyimages = [].slice.call($(".lazy"));
    
        if("IntersectionObserver" in window){
            let observer = new IntersectionObserver((entries, observer)=>{
                entries.forEach(function(entry){
                    if(entry.isIntersecting){
                        let lazyimage = entry.target;
                        lazyimage.src = lazyimage.dataset.src;
                        lazyimage.srcset = lazyimage.dataset.srcset;
                        lazyimage.classList.remove("lazy");
                        observer.unobserve(lazyimage);
                    }
                })
            });
            //Loop through all images
            Lazyimages.forEach((lazyimage)=>{
                observer.observe(lazyimage);
            })
        }
}

function myEventsRequestHandler(res){
    let myEventArr = res['arr_my_event'];
    //Empty catalogue before appending elements
    //$("#catalogue-my-events-tickets").empty();
    $("#catalogue-my-events-tickets").children().not(':first-child').remove();
    let resultMyEventArr = appendEventsToCatalogue(myEventArr, "catalogue-my-events-tickets");

    if(!resultMyEventArr){
        let NothingTodisplay = '<div class="no-event-ofyours">\
            <img src="media/icons/nothing1.gif"/>\
            <p> No event created yet,<br>\
            Want to create an event? <a href="etc_create_event.html">Create a new event</a><br>\
            </div>';

        $("#catalogue-my-events-tickets").append(NothingTodisplay);
    }

            //Lazy load handling
            let Lazyimages = [].slice.call($(".lazy"));
    
            if("IntersectionObserver" in window){
                let observer = new IntersectionObserver((entries, observer)=>{
                    entries.forEach(function(entry){
                        if(entry.isIntersecting){
                            let lazyimage = entry.target;
                            lazyimage.src = lazyimage.dataset.src;
                            lazyimage.srcset = lazyimage.dataset.srcset;
                            lazyimage.classList.remove("lazy");
                            observer.unobserve(lazyimage);
                        }
                    })
                });
                //Loop through all images
                Lazyimages.forEach((lazyimage)=>{
                    observer.observe(lazyimage);
                })
            }
}

function myTicketsRequestHandler(res){
    let myTicketArr = res['arr_my_ticket'];
    //$("#catalogue-my-events-tickets").empty();
    $("#catalogue-my-events-tickets").children().not(':first-child').remove();
    let resultMyTicketArr = appendMyTickets(myTicketArr);
    if(!resultMyTicketArr){
        let NothingTodisplay = '<div class="no-event-ofyours">\
            <img src="media/icons/nothing1.gif"/>\
            <p> Your ticket wallet is empty<br>\
            </div>';

        $("#catalogue-my-events-tickets").append(NothingTodisplay);
    }

            //Lazy load handling
            let Lazyimages = [].slice.call($(".lazy"));
    
            if("IntersectionObserver" in window){
                let observer = new IntersectionObserver((entries, observer)=>{
                    entries.forEach(function(entry){
                        if(entry.isIntersecting){
                            let lazyimage = entry.target;
                            lazyimage.src = lazyimage.dataset.src;
                            lazyimage.srcset = lazyimage.dataset.srcset;
                            lazyimage.classList.remove("lazy");
                            observer.unobserve(lazyimage);
                        }
                    })
                });
                //Loop through all images
                Lazyimages.forEach((lazyimage)=>{
                    observer.observe(lazyimage);
                })
            }
}

function suggestionEventHandler(res){

    let suggest_city = res['arr_event_my_categ_city'];
    if(suggest_city.length>0) $("#idCatalogue").append("<h1 class='suggestion-title'>Upcoming events in your city you may like</h1>");
    let resultSuggestCity = appendEventsToCatalogue(suggest_city);

    let suggest_country = res['arr_event_my_categ_country'];
    if(suggest_country.length>0) $("#idCatalogue").append("<h1 class='suggestion-title'>Other upcoming events</h1>");
    let resultSuggestCountry = appendEventsToCatalogue(suggest_country);

    let arrUserCateg = res['arr_categ_user'];
    let arrStatus = res['arr_status'];
    if(!arrUserCateg.length>0 && arrStatus['user_online']==1){
        $("#pop-up-box2").addClass('model-open');
        queryAndDisplayCategories();
    }

    if(arrStatus['is_user_location_set']==1){
        $("#user-city-configuration").css("display","none");
    }
    

            //Lazy load handling
            let Lazyimages = [].slice.call($(".lazy"));
    
            if("IntersectionObserver" in window){
                let observer = new IntersectionObserver((entries, observer)=>{
                    entries.forEach(function(entry){
                        if(entry.isIntersecting){
                            let lazyimage = entry.target;
                            lazyimage.src = lazyimage.dataset.src;
                            lazyimage.srcset = lazyimage.dataset.srcset;
                            lazyimage.classList.remove("lazy");
                            observer.unobserve(lazyimage);
                        }
                    })
                });
                //Loop through all images
                Lazyimages.forEach((lazyimage)=>{
                    observer.observe(lazyimage);
                })
            }
}

//Display suggested cities function
function displaySuggestionsCity(arr, desDis){
    if(arr.length>0){
        for(let i=0; i<arr.length; i++){
            let unitSuggest = arr[i];
            let HTMLUnitSuggest = '<span><strong>'+unitSuggest['city_name']+'</strong> ('+unitSuggest['country_name']+')</span>';
            $("#"+desDis).append(HTMLUnitSuggest);
        }
        return 1;
    }
    return 0;
}

//Function to handle city display in pop configuration box
function PRCitySuggestions(res){
    let arrCities = res['arr_cities'];
        $("#box-suggestion-cities").empty();
        let resultArrCities = displaySuggestionsCity(arrCities,"box-suggestion-cities");
        if(!resultArrCities){
            $("#box-suggestion-cities").append("<strong>No city found</strong");
        }  

}

//Function to handle number of likes displayed
function likeActionHandler(res, eventID, element, imgLikeElement){

    if(res['db_connection'] =="SUCCEED" && res['status']!=0){

        let parentNodeID = $(element).closest(".post-content").prop("id");
       
        if(res['total']>1){
        
            $('#'+parentNodeID).find('#event-like-nbr-'+eventID).html(res['total']+" likes");
        }
        else{
            
            $('#'+parentNodeID).find('#event-like-nbr-'+eventID).html(res['total']+" likes");
        }

        if(res['status']==1){
            $(imgLikeElement).attr("src","media/icons/iconsRed.png");
        }
        else if(res['status']==2){
            $(imgLikeElement).attr("src","media/icons/like.png");
        }
    }
    else{
        //something prevent action to work fine
        //alert(res['action_error']+"\nETC...");
        let popHtmlContent = '<p>Sorry! You are not logged in.<br><br><a href="lsrs_login.html"><button class="main-action-btn">LOGIN NOW</button></a></p>';
        $("#id-content-popup1").html(popHtmlContent);
        $("#pop-up-box1").addClass('model-open');
    }

}