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
        displayEventToCatalogue(response);
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
        eventID = eventID.replace("event-unit-btn-","");
        let url = "etc_display_event.html?e=" +eventID;
        window.location.href = url;    
    });
});

function getPastdayDate() {

    return new Date(new Date().getTime() - 2*(24*60*60*1000)).toUTCString();
  }
  
function displayEventToCatalogue(res){
    let arrEventFollowing = res['arr_events_following'];
    
    if(arrEventFollowing.length>0){
        for(let i = 0; i<arrEventFollowing.length; i++){
            let arrEF = arrEventFollowing[i];
            let event_unit = '<div class="event-unit" id="id-'+ arrEF['idEvent']+'">\
            <div class="unit-head">';

            //Take care of profile picture
            if(arrEF['avatar']!="NONE"){
                event_unit+='<img src="'+arrEF['avatar']+'"/>';
            }
            else{
                event_unit+='<img src="media/icons/pro.png"/>';
            }

            //take care of user_infos
            event_unit+='<span class="user_infos">\
            <span>'+arrEF['username']+'</span>\
            <span>'+arrEF['address']+'</span>\
            </span>\
            </div>\
            <div class="poster-display">';

            //Take care of posters
            let arrPosters = arrEF['posters'];
            if(arrPosters.length>0){
                event_unit+='<img src="'+arrPosters[0]+'"/>';
            }
            else{
                event_unit+='<img src="media/posters/belPrestans.jpg"/>';
            }
            
            //Continue concatination
            event_unit+='</div>\
            <div class="box-details">\
            <span>'+arrEF['title']+'</span>\
            <span>'+arrEF['location']+'</span>\
            <span>'+arrEF['dateTime']+'</span>';

                //Take care of price
                let priceArr = arrEF['prices'];
                if(priceArr.length>0){
                    //There is price for that event
                    if(priceArr.length>1){
                        event_unit+='<span>'+priceArr[0]+'</span><span>'+priceArr[1]+'</span>';
                    }
                    else{
                        event_unit+='<span>'+priceArr[0]+'</span>';
                    }
                }
                
                //Finish contruction
                event_unit+='</div><div class="btn-unit-actions"><button id="event-unit-btn-'+arrEF['idEvent']+'">Buy Ticket</button></div></div>';
    
            //Append this event
            $("#idCatalogue").append(event_unit);
        }
    }else{
        //No events from following
        $("#idCatalogue").append("<h4>No events</h4>");
    }
}