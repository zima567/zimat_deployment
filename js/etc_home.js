$(document).ready(function(){

    //Unfold events to catalogue //To be modified
    //************************************ */
    $.ajax({
        url: "api_php/api_etc_display.php",
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
});