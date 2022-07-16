 //Var for side checks
 var allCorrect=false;

$(document).ready(function(){
    //array categ
    var arrCateg=[];

    //Display Categories from DB
    let dataObj ={family_suggest:"EVENT_CATEGORIES", query_data:""};
    let destinationReq = "api_php/api_etc_suggestion_v2.php";
    requestSender(destinationReq, dataObj, PRCategDisplay);

    //Get today date and set min-date
    //console.log(currentDateAndTime());
    $("#id-date-time").val(currentDateAndTime());
    $("#id-date-time").attr('min', currentDateAndTime());

    //Control click on button to upload images
    $("#idBtnUploadImg").on("click", function(){
        $("#event-pictures").trigger("click");
        $('#preview').empty();
       $("#event-pictures").val(null);
    });

    $('#event-pictures').on('change', function() {
        imagesPreview(this, 'div.preview');
    });

    //MANAGE COUNTRY CHOICE---START
    $("#id-country").on("keyup", function(){
        let resultDisplayDestination = "box-suggestion-countries";
        if($("#"+resultDisplayDestination).css("display")!="flex"){
            $("#"+resultDisplayDestination).css("display","flex");
        }
        if($("#id-city").val()!=""){
            $("#id-city").val("");
            $("#edit-city").css("display", "none");
            $("#id-city").attr("readonly", false);

        }
        //Get data entered
        let inputValueToQuery = $("#id-country").val();
        //Function suggestion + request function
        if(inputValueToQuery!=""){
            let dataObj ={family_suggest:"COUNTRY_CITY", query_data:inputValueToQuery};
            let destinationReq = "api_php/api_etc_suggestion_v2.php";
            requestSender(destinationReq, dataObj, PRCCSuggestions, "NONE", "Searching country...", "box-suggestion-countries");

        }
        else{
            $("#box-suggestion-countries").empty();
            $("#box-suggestion-countries").css("display", "none");
        }

    });
    //On click on suggested element in box-suggestion
    $("#box-suggestion-countries").on("click", "span", function(e){
        e.preventDefault();
        let choosenCountry = $(this).text();
        $("#id-country").val(choosenCountry);
        //Set input read only
        //display edit button
        $("#id-country").attr("readonly", true);
        $("#box-suggestion-countries").css("display", "none");
        $("#edit-country").css("display","block");

        //Display appropriate currency order
        let dataObj ={family_suggest:"TICKET_CURRENCY", query_data:"", countryName:$("#id-country").val().trim()};
        let destinationReq = "api_php/api_etc_suggestion_v2.php";
        requestSender(destinationReq, dataObj, PRCurrencyDisplay);

        //Display appropriate GMT for country selected
        let dataObj2 ={family_suggest:"COUNTRY_TIMEZONE", query_data:"", countryName:$("#id-country").val().trim()};
        let destinationReq2 = "api_php/api_etc_suggestion_v2.php";
        requestSender(destinationReq2, dataObj2, PRGMTDisplay);
    });
    //On click on Edit country button
    $("#edit-country").on("click", function(){
        $("#id-country").attr("readonly", false); 
        $("#id-country").val("");
        $("#edit-country").css("display", "none");
    });
    //MANAGE COUNTRY CHOICE ---END

    //MANAGE CITY CHOICE---START
    $("#id-city").on("keyup", function(){
        if($("#id-country").val()!=""){
            let resultDisplayDestination = "box-suggestion-cities";
            if($("#"+resultDisplayDestination).css("display")!="flex"){
                $("#"+resultDisplayDestination).css("display","flex");
            }

            //Get data entered
            let inputValueToQuery = $("#id-city").val();
            let countryName = $("#id-country").val().trim();
            //Function suggestion + request function
            if(inputValueToQuery!=""){
                let dataObj ={family_suggest: "COUNTRY_CITY", query_data: inputValueToQuery, countryName: countryName};
                let destinationReq = "api_php/api_etc_suggestion_v2.php";
                requestSender(destinationReq, dataObj, PRCCSuggestions, "NONE", "Searching city...", "box-suggestion-cities");
    
            }
            else{
                $("#box-suggestion-cities").empty();
                $("#box-suggestion-cities").css("display", "none");
            }

        }
        else{
            //choose country first
            alert("Choose country first");
        }

    });
    //On click on suggested element in box-suggestion
    $("#box-suggestion-cities").on("click", "span", function(e){
        e.preventDefault();
        let choosenCities = $(this).text();
        $("#id-city").val(choosenCities);
        //Set input read only
        //display edit button
        $("#id-city").attr("readonly", true);
        $("#box-suggestion-cities").css("display", "none");
        $("#edit-city").css("display","block");

    });
    //On click on Edit country button
    $("#edit-city").on("click", function(){
        $("#id-city").attr("readonly", false); 
        $("#id-city").val("");
        $("#edit-city").css("display", "none");
    });
    //MANAGE CITY CHOICE ---END

    //Manage the choice of categories
    $("#idCategList").on("change", function(){
        //alert($("#idCategList").val());
        let checkVar = true;
        for(let i=0; i<arrCateg.length; i++){
            if(arrCateg[i]==$("#idCategList").val()){
                checkVar = false;
            }
        }

        if(checkVar){
            arrCateg.push($("#idCategList").val());
            let addedCateg = "<span class='categ-unit'>"+$("#idCategList").val()+"<a class='x-delete' id='"+(arrCateg.length - 1)+"'>X</a></span>";
            $("#event-categ").append(addedCateg);
        }
        
        
    });

    //Delete a categ from chosen list
    $( "#event-categ" ).on( "click", "a", function( event ) {
        event.preventDefault();
        arrCateg.splice(event.target.id, 1);
        $("#event-categ").empty();
        arrCateg.forEach(displayCateg);
    });

    //Click on submit event
    $("#submit-event").on("click", function(){
        //Reset var allCorrect to true
        allCorrect = false;
        
        let eventTitle = $("#event-title").val().trim();
        let postMessage = $("#post-short-msg").val().trim();
        let eventDescription = $("#id-description").val().trim();
        let eventLocation = $("#id-location").val();
        let eventLocation_country = $("#id-country").val();
        let eventLocation_city = $("#id-city").val();
        let eventDateTime = $("#id-date-time").val();
        let eventTimezone = $("#idTimezone").val();
        let eventArrCateg = arrCateg;
        let eventNbrTicket = $("#id-nbr-ticket").val();
        let eventTicketPrice = $("#id-unit-price").val().trim();
        let priceCurrency = $("#idCurrency").val();
        let paymentMethod = $("input[name='payment-method']:checked").val();
        let postDateTime = currentDateAndTime();

        //Check if currency and price are set correcly
        if((priceCurrency!=null && eventTicketPrice!="" && eventNbrTicket!="") || (eventTicketPrice=="" && eventNbrTicket=="")){
            allCorrect = true;
        }

        if(eventTitle!="" && eventLocation!="" && eventDateTime!="" && allCorrect){
            //Form data for submission
            let formData = new FormData();

             //Get images
            if($('#event-pictures').get(0).files.length !== 0){
                let files = $('#event-pictures')[0].files;
                for(let i = 0; i < files.length; i++) {
                    formData.append('posters[]', files[i]);
                }
            }

            //Get event categories if there is
            if(eventArrCateg.length!==0){
                for( let i=0; i<eventArrCateg.length; i++){
                    formData.append('arrCateg[]', eventArrCateg[i]);
                }
            }
            
            //append other vars
            formData.append('title', eventTitle);
            formData.append('postMessage', postMessage)
            formData.append('description', eventDescription);
            formData.append('location', eventLocation);
            formData.append('location_country', eventLocation_country);
            formData.append('location_city', eventLocation_city);
            formData.append('dateTime', eventDateTime);
            formData.append('eventTimezone', eventTimezone);
            formData.append('nbrTicket', eventNbrTicket);
            formData.append('ticketPrice', eventTicketPrice);
            formData.append('currency', priceCurrency);
            formData.append('paymentMethod', paymentMethod);
            formData.append('postDateTime', postDateTime);

            $.ajax({
                url:"api_php/api_etc_create_event.php",
                method:"POST",
                data: formData,
                contentType: false,
                dataType : 'json',
                cache: false,
                processData: false,
                beforeSend:function(){
                    $("#zima-loader").css("display","flex");
                    $("#text-loading").text("Creating your event...It might take a while depending on poster(s) size and your internet connection");
                },   
                success:function(data)
                {
                    $("#zima-loader").css("display","none");
                    //console.log(data);
                    RPEventCreation(data);

                }
               });

            //alert(eventTitle + eventLocation + eventDateTime);
        }
        else{
            //alert("Empty required fields");
            let popHtmlContent = '<p>Oops! You have empty required field(s).<br><br>Please make sure everything is correct before submitting event</p>';
            $("#id-content-popup").html(popHtmlContent);
            if(allCorrect){
                $(".custom-model-main").addClass('model-open');
            }
            else{
                alert("Number of tickets, Price and currency are incorrectly configured");
            }
           
        }
    });

    //POPUP Handling 
    //$(".custom-model-main").addClass('model-open');
    $(".close-btn, .bg-overlay").click(function(){
        $(".custom-model-main").removeClass('model-open');
    });


});

//Function to uplad pictures
//Upload images show preview and save them in array to be sent
var imagesPreview = function(input, placeToInsertImagePreview) {

    if (input.files) {
        var filesAmount = input.files.length;
        if(filesAmount<=3){
            for (i = 0; i < filesAmount; i++) {
                var reader = new FileReader();

                reader.onload = function(event) {
                    $($.parseHTML('<img class="images">')).attr('src', event.target.result).appendTo(placeToInsertImagePreview);
                }

                reader.readAsDataURL(input.files[i]);
            }
        }
        else{
            //alert("You cannot add more than 3 pictures: "+input.files.length);
            let popHtmlContent = '<p>Oops! You have selected '+input.files.length+'pictures files.<br><br>You can select maximun 3 pictures files</p>';
            $("#id-content-popup").html(popHtmlContent);

            //Empty files iput
            $("#event-pictures").val(null);
            //Show popup
            $(".custom-model-main").addClass('model-open');
            
        }
    }

};

//Void function for testing purposes
function voidFunction(res){

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

function displaySuggestionsCountry(arr, desDis){
    if(arr.length>0){
        for(let i=0; i<arr.length; i++){
            let unitSuggest = arr[i];
            let HTMLUnitSuggest = ' <span class="content">'+unitSuggest['name']+'</span>';
            $("#"+desDis).append(HTMLUnitSuggest);
        }
        return 1;
    }
    return 0;
}

function displaySuggestionsCity(arr, desDis){
    if(arr.length>1){
        for(let i=1; i<arr.length; i++){
            let unitSuggest = arr[i];
            let HTMLUnitSuggest = '<span class="content">'+unitSuggest['name']+'</span>';
            $("#"+desDis).append(HTMLUnitSuggest);
        }
        return 1;
    }
    return 0;
}

function displayCategories(arr, desBis){
    if(arr.length>0){
        for(let i=0; i<arr.length;i++){
            let unitCateg = arr[i];
            let HTMLUnitCateg = ' <option value="'+unitCateg['title']+'">'+unitCateg['title']+'</option>';
            $("#"+desBis).append(HTMLUnitCateg);
        }
        return 1;
    }
    return 0;
}

//Display currencies
function displayCurrencies(arr, desBis){
    if(arr.length>0){
        for(let i=0; i<arr.length;i++){
            let unitCurrency = arr[i];
            let HTMLUnitCurrency = '';
            if(i==0){
                HTMLUnitCurrency = '<option selected="true" value="'+unitCurrency['currencyCode']+'">'+unitCurrency['currencyCode']+' <em> - national currency</em></option>';
                $("#"+desBis).append(HTMLUnitCurrency);
            }
            else{
                HTMLUnitCurrency = ' <option value="'+unitCurrency['currencyCode']+'" disabled>'+unitCurrency['currencyCode']+'</option>';
                $("#"+desBis).append(HTMLUnitCurrency);
            }
        }
        return 1;
    }
    return 0;
}

//Display GMT (timezones)
function displayGMT(arr, desBis){
    if(arr.length>0){
        for(let i=0; i<arr.length;i++){
            if(i==0){
                let HTMLUnitGMT = ' <option selected="true" value="'+arr[i]+'">'+arr[i]+'</option>';
                $("#"+desBis).append(HTMLUnitGMT);
            }
            else{
                let HTMLUnitGMT = ' <option value="'+arr[i]+'">'+arr[i]+'</option>';
                $("#"+desBis).append(HTMLUnitGMT);
            }
        }
        return 1;
    }
    return 0;
}


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

function PRCCSuggestions(res){
    let arrCountries = res['arr_countries'];
        $("#box-suggestion-countries").empty();
        let resultArrCountries = displaySuggestionsCountry(arrCountries, "box-suggestion-countries");
        if(!resultArrCountries){
            $("#box-suggestion-countries").append("<strong class='content'>No country found</strong");
        }

    let arrCities = res['arr_cities'];
        $("#box-suggestion-cities").empty();
        let resultArrCities = displaySuggestionsCity(arrCities,"box-suggestion-cities");
        if(!resultArrCities){
            $("#box-suggestion-cities").append("<strong class='content'>No city found</strong");
        }  

}

function PRCategDisplay(res){
    let arrCateg = res['arr_categ'];
    let resultArrCateg = displayCategories(arrCateg, "idCategList");
    if(!resultArrCateg){
        $("#idCategList").append('<option selected="true" disabled="disabled">Categories not found</option>'); 
    }
}

function PRCurrencyDisplay(res){
    $("#idCurrency").children().not(':first').remove();
    let arrCurrencies = res['arr_currencies'];
    let resultArrCurrencies = displayCurrencies(arrCurrencies, "idCurrency");
    if(!resultArrCurrencies){
        $("#idCurrency").append('<option selected="true" disabled="disabled">Currency not found</option>'); 
    }
}

function PRGMTDisplay(res){
    $("#idTimezone").children().not(':first').remove();
    let arrGMT = res['arr_timezone'];
    let resultArrGMT = displayGMT(arrGMT, "idTimezone");
    if(!resultArrGMT){
        $("#idTimezone").append('<option selected="true" disabled="disabled">No GMT</option>'); 
    }
}

//display categories into box
function displayCateg(categ, index){
    let addedCateg = "<span class='categ-unit'>"+categ+"<a class='x-delete' id='"+index+"'>X</a></span>";
    $("#event-categ").append(addedCateg);
}


//Function to process event creation return
function RPEventCreation(res){
    if(res['db_connection']=="SUCCEED"){
        //Connection to DB succeed
        if(res['status']==1){
            //event creation succeeded
            $("#operation-status-text").text("Your event has been successfully created");
            //Hide event creation wrapper
            $("#event-creation-wrapper").css("display", "none");
            //Show box after event submit
            $("#box-after-event-submit").css("display", "flex");
        }
        else{
            //event creation failed
            $("#operation-status-icon").html('<i class="bi bi-x-circle-fill"></i>')
            $("#operation-status-text").text("Event creation failed");

            //Show potentials errors
            let errorString ="";
            if(res['dbcon_error']!="NONE"){
                errorString+='<span>'+res['dbcon_error']+'<span>';
            }
            if(res['error_msg']!="NONE"){
                errorString+='<span>'+res['error_msg']+'<span>';
            }
            if(res['posters_failed']!="NONE"){
                errorString+='<span>'+res['posters_failed']+'<span>';
            }
            if(res['query_error']!="NONE"){
                errorString+='<span>'+res['query_error']+'<span>';
            }
            $("#error-log").html(errorString);

            //Create buttons and append
            if(res['idCreator']==0){
                let newBtn ='<a href="lsrs_login.html"><button type="button" class="btn btn-light">Log into your account</button></a>';
                $("#box-action-btns").append(newBtn);
                //Hide button create new event
                $("#create-event-link").css("display","none");
            }
            
            //Hide specific buttons
           //Hide event creation wrapper
           $("#event-creation-wrapper").css("display", "none");
           //Show box after event submit 
            $("#box-after-event-submit").css("display", "flex");
        }
    }
    else{
        //connection to DB failed
        alert("Connection to database failed");
    }
}