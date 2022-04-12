$(document).ready(function(){

    //Test api
    $.ajax({
        url: "api_php/api_etc_display_one.php",
        data: {"idEvent":1},
        type: "POST",
        dataType : "json",
    })
    .done(function( response ) {
        console.log(response);
    })
    .fail(function( xhr, status, errorThrown ) {
        alert( "Sorry, there was a problem!" );
        console.log( "Error: " + errorThrown );
        console.log( "Status: " + status );
        console.dir( xhr );
    });


});