$(document).ready(function(){
   
    let pastLimit = getPastdayDate();
    //Unfold events to catalogue //To be modified
    //************************************ */
    $.ajax({
        url: "api_php/api_etc_display.php",
        data: {pastLimit: pastLimit},
        type: "POST",
        //dataType : "json",
    })
    .done(function( response ) {
        console.log(response);
        displayEventToCatalogue2(response);
    })
    .fail(function( xhr, status, errorThrown ) {
        alert( "Sorry, there was a problem!" );
        console.log( "Error: " + errorThrown );
        console.log( "Status: " + status );
        console.dir( xhr );
    });
    /************************************** */

    //logout of the system
    $("#logout").on("click", function(){
        $.ajax({
            url: "api_php/api_lsrs_logout.php",
            data: {},
            type: "POST",
            dataType : "json",
        })
        .done(function( response ) {
            console.log(response);
            //RPLogin(response);
        })
        .fail(function( xhr, status, errorThrown ) {
            alert( "Sorry, there was a problem!" );
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + status );
            console.dir( xhr );
        });
    });

    //Create event on the platform
    $("#create-event-btn").on("click", function(){
        //Write code to check if user is online
        window.location.href = "etc_create_event.html";
    });

    //Go to display event page
    $("#idCatalogue").on("click", "button", function(event){
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
            data: {actionType: actionType, eventID: eventID, likeDateTime: currentDateAndTime()},
            type: "POST",
            //dataType : "json",
        })
        .done(function( response ) {
            console.log(response);
            likeActionHandler(response, eventID, pointerParent, imgLikeElement);
        })
        .fail(function( xhr, status, errorThrown ) {
            alert( "Sorry, there was a problem!" );
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + status );
            console.dir( xhr );
        });

    })

    //End of hadling page complete load with jquery
});

function getPastdayDate() {

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

  
function displayEventToCatalogue2(res){
    let arrEventFollowing = res['arr_events_following'];
    
    if(arrEventFollowing.length>0){
        for(let i = 0; i<arrEventFollowing.length; i++){
            let arrEF = arrEventFollowing[i];
            let event_unit = '<div class="post">\
            <div class="info">\
                <div class="user">';
            
            //Take care of profile picture
             //Take care of profile picture
             if(arrEF['avatar']!="NONE"){
                event_unit+=' <div class="profile-pic"><img src="'+arrEF['avatar']+'" alt=""></div>';
            }
            else{
                event_unit+=' <div class="profile-pic"><img src="media/icons/pro.png" alt=""></div>';
            }

            //continue concatination
            event_unit+=' <p class="username">'+arrEF['username']+'</p>';
            
            //Check if user if verified
            if(arrEF['verified']==1){
                event_unit+='<span class="username"><img src="media/icons/verified.png" width="20"/></span>';
            }

            //continue concatination
            event_unit+='</div><img src="media/icons/option.PNG" class="options" alt=""></div>';
            
            //Add post image post
            let arrPosters = arrEF['posters'];
            if(arrPosters.length>0){
                event_unit+='<img src="media/icons/loadingSpinner.gif" class="lazy post-image" alt="" data-src="'+arrPosters[0]+'" data-srcset="'+arrPosters[0]+'" ></img>';
            }
            else{
                event_unit+='<img src="media/posters/belPrestans.jpg" class="lazy post-image" alt="" data-src="'+arrPosters[0]+'" data-srcset="'+arrPosters[0]+'"></img>';
            }
                
            
            //Continue concatination
            let imgLink ="media/icons/like.PNG";
            if(arrEF['userLiked']==1){
                imgLink = "media/icons/iconsRed.png";
            }
            event_unit+='<div class="post-content" id="id-post-content-'+arrEF['idEvent']+'">\
            <div class="reaction-wrapper">\
                <img src="'+imgLink+'" class="heart-icon icon" id="event-like-btn-'+arrEF['idEvent']+'" alt="">\
                <img src="media/icons/report.png" class="report icon" alt="">\
            </div>';
            
            //Add the number of likes
            event_unit+='<p class="likes" id="event-like-nbr-'+arrEF['idEvent']+'">'+arrEF['nbrLike']+' likes</p>\
            <p class="description"><span>'+arrEF['username']+'</span>'+arrEF['postMessage']+'</p>\
            <p class="description"><span>'+arrEF['title']+'</span><p>\
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
                <button class="main-action-btn" id="id-main-action-btn-'+arrEF['idEvent']+'">Get your ticket</button>\
                <button class="comment-btn" id="id-share-btn">share</button>\
                </div>\
                </div>';
    
            //Append this event
            $("#idCatalogue").append(event_unit);
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


    }else{
        //No events from following
        $("#idCatalogue").append("<h4>No events</h4>");
    }
}

//Function to handle number of likes displayed
function likeActionHandler(res, eventID, element, imgLikeElement){

    if(res['db_connection'] =="SUCCEED" && res['status']!=0){

        let parentNodeID = $(element).closest(".post-content").prop("id");
       
        if(res['total_likes']>1){
        
            $('#'+parentNodeID).find('#event-like-nbr-'+eventID).html(res['total_likes']+" likes");
        }
        else{
            
            $('#'+parentNodeID).find('#event-like-nbr-'+eventID).html(res['total_likes']+" likes");
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
        alert(res['action_error']+"<br>ETC...");
    }

}