var bio ="";
var arrCateg=[];
var arrCateg_trash = [];
var arrPoters_trash = [];
var quotaPosters = 3;

$(document).ready(function(){

    //Display categories From db But this request should be done on click on manage event button 
    //Also in the categories box should be displayed the event already set categories and then added global categArr
    //Variables acting like triggers
    let idEventToBeModified ="";
    let title_modified = false;
    let postMessage_modified = false;
    let description_modified = false;
    let newPoster_update = false;
    let oldPoster_delete = false;
    let city_modified = false;
    let address_modified = false;
    let eventDate_modified = false;
    let eventCateg_modified = false;
    let eventPrice_modified = false;

    $(".field-has-changed").on("keypress change", function(){
        //Display save change button
        $("#btn-save-changes").css("display", "block");

    });

    $("#field-event-title").on("focusout", function(){
        title_modified = true;
        //alert($("#field-event-title").val());
    });

    $("#field-event-post-msg").on("focusout", function(){
        postMessage_modified = true;
        //alert($("#field-event-title").val());
    });

    $("#field-event-description").on("focusout", function(){
        description_modified = true;
        //alert($("#field-event-title").val());
    });

    $("#id-city").on("focusout", function(){
        city_modified = true;
    });

    $("#field-event-address").on("focusout", function(){
        address_modified = true;
    });

    $("#id-date-time").on("focusout", function(){
        eventDate_modified = true;
    });

    $("#field-event-price").on("focusout", function(){
        eventPrice_modified = true;
    });

    $("#idCategList").on("change", function(){
        eventCateg_modified = true;
    });

    //HANDLE DELETION OF POSTERS
    $("#ancient-posters").on("click", ".remove-poster", function(event){
        event.preventDefault();
        // let parentNodeID = $(this).closest(".unit-ancient-poster").prop("id");
        let parentElement = $(this).closest(".unit-ancient-poster");
        let src= $(parentElement).find("img").attr("src");
        
        //Send poster link to trash
        arrPoters_trash.push(src);
        //Remove the the poster
        $(parentElement).remove();
        //Modify the quota of image to be uploaded
        quotaPosters = quotaPosters + 1;
        //Notify that old poster(s) is deleted
        oldPoster_delete = true;
        $("#btn-save-changes").css("display", "block");

    });

    //NOTIFY OF UPLOAD OF NEW IMAGE FILES
    $("#new-event-pictures").on("change", function(){
        newPoster_update = true;
    });


    $("#btn-save-changes").on("click", function(){

        //Send request for editing
        //Form data for submission 
        //We are using formData submission because of the need to upload images
        let formData = new FormData();
        //Append the mendatory post variables
        formData.append("action_type", "T_UPDATE");
        formData.append("config_type", "update_event_details");
        formData.append("editDateTime", currentDateAndTime());
        formData.append("idEvent", idEventToBeModified);

        //let dataObj ={action_type:"T_UPDATE", config_type:"update_event_details", idEvent:idEventToBeModified};

        //Set conditional updated field
        //Set param for title update
        if(title_modified){
            let newValue = $("#field-event-title").val().trim();
            if(newValue!=""){
                //dataObj.update_title = newValue;
                formData.append("update_title", newValue);
            }
        }

        if(postMessage_modified){
            let newValue = $("#field-event-post-msg").val().trim();
            //dataObj.update_postMessage = newValue;
            formData.append("update_postMessage", newValue);
        }

        if(description_modified){
            let newValue = $("#field-event-description").val().trim();
            //dataObj.update_description = newValue;
            formData.append("update_description", newValue);
        }

        if(city_modified){
            let newValue = $("#id-city").val().trim();
            let countryVal = $("#event-country").val().trim();
            //dataObj.update_city = newValue;
            formData.append("update_city", newValue);
            //dataObj.event_country = countryVal;
            formData.append("event_country", countryVal);
        }

        if(address_modified){
            let newValue = $("#field-event-address").val().trim();
            //dataObj.update_address = newValue;
            formData.append("update_address", newValue);
        }

        if(eventDate_modified){
            let newValue = $("#id-date-time").val().trim();
            //dataObj.update_date_time = newValue;
            formData.append("update_date_time", newValue);
        }

        if(eventPrice_modified){
            let newValue = $("#field-event-price").val().trim();
            //I will just send the amount, i will get the currency from php
            //dataObj.update_price = newValue;
            formData.append("update_price", newValue);
        }

        if(eventCateg_modified){
            //Prepare arrCateg and arrCateg_trash
            arrCateg_trash = arrCateg_trash.filter(x => arrCateg.indexOf(x) === -1);

            //Append arrCateg to formData
            if(arrCateg.length!==0){
                for( let i=0; i<arrCateg.length; i++){
                    formData.append('update_categories[]', arrCateg[i]);
                }
            }

            //Append arrCateg_trash to formData
            if(arrCateg_trash.length!==0){
                for( let i=0; i<arrCateg_trash.length; i++){
                    formData.append('delete_categories[]', arrCateg_trash[i]);
                }
            }

        }

        //Append image files
        if(newPoster_update){
            //Get images
            if($('#new-event-pictures').get(0).files.length !== 0){
                let files = $('#new-event-pictures')[0].files;
                for(let i = 0; i < files.length; i++) {
                    formData.append('posters[]', files[i]);
                }
            }
        }

        //Append array posters link to be deleted
        if(oldPoster_delete){
            if(arrPoters_trash.length!==0){
                for( let i=0; i<arrPoters_trash.length; i++){
                    formData.append('delete_posters[]', arrPoters_trash[i]);
                }
            }
        }
       

        let destinationReq = "api_php/api_configuration_module1.php";
        requestSenderFormData(destinationReq, formData, MPREditingProcess);
    });
   
    //Bottom menu jquery
   $('.app-navigation-toggle').click(function() {

    $('.app-navigation-container').toggleClass('open', 300);

    $(this).toggleClass('active');

    });

    //api destination file
    let destination = "api_php/api_profile.php";
     //Get the user ID from the URL
     let userID = getParameter("e");
     let obj ={idUser:userID};
    //let obj ={idUser:2};
    requestSender(destination, obj, stdDisplayUserInfo);
    //standardFunctionRequest(destination, obj, stdDisplayUserInfo);

    //Onclick on see-more
    $("#see-more").on("click", function(){
        let bioReprocessed = displayFullBio(bio);
        $("#user_bio_text").text(bioReprocessed);
    });

    //OnClick on see-less
    $("#see-less").on("click", function(){
        let bioReprocessed = displayBio(bio);
        $("#user_bio_text").text(bioReprocessed);
    });

    //To show fullscreen profile picture
    $("#user_main_avatar").on("click", function(){
        let linkImgProfile = $("#user_main_avatar_img").attr('src');
        $("#fullPageDisplay-img").attr("src",linkImgProfile);
        $("#fullPageDisplay").css("display", "flex");
        $("#fullPageDisplay").fadeIn();
    });

    //To hide fullscreen profile picture
    $("#close-full-screen").on("click", function(){
        
       $("#fullPageDisplay").fadeOut();
    });

    //HANDLE BUTTONS ACTIONS CLICKS
    $("#button-action").on("click", ".follow_unfollow", function(e){
        e.preventDefault();
        let userID = e.target.id;
        userID = userID.replace("btn-un-follow-id-","");
        let actionType = "FOLLOW_UNFOLLOW";

        $.ajax({
            url: "api_php/api_btn_action.php",
            data: {actionType: actionType, user_to_follow_unfollow: userID, actionDateTime: currentDateAndTime()},
            type: "POST",
            dataType : "json",
        })
        .done(function( response ) {
            console.log(response);
            MPBtnFollowUnfollow(response);
        })
        .fail(function( xhr, status, errorThrown ) {
            alert( "Sorry, there was a problem!" );
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + status );
            console.dir( xhr );
        });

    });

    //HANDLE EVENT-MANAGE BUTTON CLICK
    $("#manage-event").on("click", function(){
        //Display modal manage event
        $("#modal-manage-event").css("display", "flex");
        //Hide the editing status modal
        $("#illustration-editing-result").css("display", "none");

        //Display Categories from DB
        let dataObj ={family_suggest:"EVENT_CATEGORIES", query_data:""};
        let destinationReq = "api_php/api_etc_suggestion_v2.php";
        requestSender(destinationReq, dataObj, PRCategDisplay);


    });

    //HANDLE EVENT SUGGESTION
    $("#id-search-event").on("keyup", function(){
        let resultDisplayDestination = "box-suggestion-events";
        if($("#"+resultDisplayDestination).css("display")!="flex"){
            $("#"+resultDisplayDestination).css("display","flex");
        }

        //Get data entered
        let inputValueToQuery = $("#id-search-event").val();
        //Function suggestion + request function
        if(inputValueToQuery!=""){
            let dataObj ={family_suggest:"USER_EVENTS", query_data:inputValueToQuery};
            let destinationReq = "api_php/api_etc_suggestion_v2.php";
            requestSender(destinationReq, dataObj, PREventSuggestions);
    
        }
        else{
            $("#box-suggestion-events").empty();
            $("#box-suggestion-events").css("display", "none");
        }
    
    });
    //On click on suggested element in box-suggestion
    $("#box-suggestion-events").on("click", "span", function(e){
        e.preventDefault();
        let choosenEvent = $(this).find("strong").text();
        let idChosenEvent = $(this).find("em").text();
        //Global idEventToBeModified
        idEventToBeModified = idChosenEvent;
       
        $("#id-search-event").val(choosenEvent);
        //Set input read only
        //display edit button
        $("#id-search-event").attr("readonly", true);
        $("#box-suggestion-events").css("display", "none");
        $("#change-event").css("display","block");

        //Reset variables in case they have been set already
        resetGlobalsEditing();

        //Show fields of information
        $("#wrapper-fields-to-edit").css("display", "block");
        $("#illustration-modify-event").css("display", "none");

        //Display event to be edited
        let dataObj = {idEvent:idChosenEvent};
        let destinationReq = "api_php/api_etc_display_one.php";
        requestSender(destinationReq, dataObj, PREventDisplayToEdit2);

    });
     //On click on change event button
     $("#change-event").on("click", function(){
        $("#id-search-event").attr("readonly", false); 
        $("#id-search-event").val("");
        $("#change-event").css("display", "none");
    });
    //HANDLE EVENT SUGGESTION---END---

    //MANAGE PICTURE UPLOAD
    //Control click on button to upload images
    $("#upload-new-posters").on("click", function(){
        $("#new-event-pictures").trigger("click");
        $('#new-posters').empty();
       $("#new-event-pictures").val(null);
    });

    $('#new-event-pictures').on('change', function() {
        imagesPreview(this, 'new-posters');
    });

     //MANAGE CITY CHOICE---START
     $("#id-city").on("keyup", function(){
            let resultDisplayDestination = "box-suggestion-cities";
            if($("#"+resultDisplayDestination).css("display")!="flex"){
                $("#"+resultDisplayDestination).css("display","flex");
            }

            //Get data entered
            let inputValueToQuery = $("#id-city").val();
            countryName = $("#event-country").val().trim();
            //Function suggestion + request function
            if(inputValueToQuery!="" && countryName!=""){
                let dataObj ={family_suggest: "COUNTRY_CITY", query_data: inputValueToQuery, countryName: countryName};
                let destinationReq = "api_php/api_etc_suggestion_v2.php";
                requestSender(destinationReq, dataObj, PRCCSuggestions);
    
            }
            else{
                $("#box-suggestion-cities").empty();
                $("#box-suggestion-cities").css("display", "none");
            }


    });

     //On click on suggested element in box-suggestion
     $("#box-suggestion-cities").on("click", "span", function(e){
        e.preventDefault();
        let choosenCities = $(this).text();
        $("#id-city").val(choosenCities);
        //Set input read only
        //display edit button
       // $("#id-city").attr("readonly", true);
        $("#box-suggestion-cities").css("display", "none");
        //$("#edit-city").css("display","block");

    });
    //On click on Edit country button
    $("#edit-city").on("click", function(){
        $("#id-city").attr("readonly", false); 
        $("#id-city").val("");
        $("#edit-city").css("display", "none");
    });
    //MANAGE CITY CHOICE ---END

       //MANAGE THE CHOICE OF CATEG
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

    //Delete a categ from chosen list than add it to trashed categ list
    $( "#event-categ" ).on( "click", "a", function( event ) {
        event.preventDefault();
        //Notify of change
        eventCateg_modified = true;
        $("#btn-save-changes").css("display", "block");

        //alert(arrCateg[event.target.id]);
        //Push this category to trash
        //First verify if such categ were intented to be deleted
        let alreadyTrashed = false;
        for(let i=0; i<arrCateg_trash.length;i++){
            if(arrCateg_trash[i] == arrCateg[event.target.id].trim()){
                alreadyTrashed = true;
                break;
            }
        }

        if(!alreadyTrashed){
            arrCateg_trash.push(arrCateg[event.target.id].trim());
        }
        //console.log(arrCateg_trash);

        //alert(event.target.id);
        //Remove categ to arrCateg
        arrCateg.splice(event.target.id, 1);
        //console.log(arrCateg);
        $("#event-categ").empty();
        arrCateg.forEach(displayCateg);
    });
     //MANAGE THE CHOICE OF CATEG--END

    //Handle cancel button of configuration-modal-manage-event
    $("#cancel-modal-manage-event").on("click", function(){
        $("#modal-manage-event").css("display", "none");
        $("#wrapper-fields-to-edit").css("display", "none");
        $("#illustration-modify-event").css("display", "flex");

        //empy the search event bar
        $("#id-search-event").attr("readonly", false); 
        $("#id-search-event").val("");
        $("#change-event").css("display", "none");

        //Reset variables
        resetGlobalsEditing();
        
    });

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
            logoutHelper(response);
        })
        .fail(function( xhr, status, errorThrown ) {
            alert( "Sorry, there was a problem!" );
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + status );
            console.dir( xhr );
        });
    });

});

function voidFunction(res){

}

function resetGlobalsEditing(){
    //RESET VARIABLES
    idEventToBeModified ="";
    title_modified = false;
    postMessage_modified = false;
    description_modified = false;
    newPoster_update = false;
    oldPoster_delete = false;
    city_modified = false;
    address_modified = false;
    eventDate_modified = false;
    eventCateg_modified = false;
    eventPrice_modified = false;

    //Re-initiate quota image per event var
    quotaPosters = 3;

    //Reset arrays
    arrCateg=[];
    arrCateg_trash = [];
    arrPoters_trash = [];

    //Empty input file
    $("#new-event-pictures").val(null);
}

//Function that process return of the editing functionality
function MPREditingProcess(res){
    $("#wrapper-fields-to-edit").css("display","none");
    $("#btn-save-changes").css("display","none");
    $("#cancel-modal-manage-event").text("Close");
    $("#illustration-editing-result").css("display", "flex");

    //Reset variables
    resetGlobalsEditing();

    let returnStatuses = res['arr_status'];
    //title
    if(returnStatuses['is_title_updated'] ==1){
        let notiText = '<span class="noti-text success">Title successfully edited</span>';
        $("#editing-infos").append(notiText);
    }
    else if(returnStatuses['is_title_updated'] ==0){
        let notiText = '<span class="noti-text failure">Title failed to be edited</span>';
        $("#editing-infos").append(notiText);
    }

    //postMessage
    if(returnStatuses['is_postMessage_updated'] ==1){
        let notiText = '<span class="noti-text success">Post message successfully edited</span>';
        $("#editing-infos").append(notiText);
    }
    else if(returnStatuses['is_postMessage_updated'] ==0){
        let notiText = '<span class="noti-text failure">Post message failed to be edited</span>';
        $("#editing-infos").append(notiText);
    }

    //description
    if(returnStatuses['is_description_updated'] ==1){
        let notiText = '<span class="noti-text success">Event description successfully edited</span>';
        $("#editing-infos").append(notiText);
    }
    else if(returnStatuses['is_description_updated'] ==0){
        let notiText = '<span class="noti-text failure">Event description failed to be edited</span>';
        $("#editing-infos").append(notiText);
    }

    //Posters updated
    if(returnStatuses['is_posters_updated'] ==1){
        let notiText = '<span class="noti-text success">Poster(s) successfully updpated</span>';
        $("#editing-infos").append(notiText);
    }
    else if(returnStatuses['is_posters_updated'] ==0){
        let notiText = '<span class="noti-text failure">Poster(s) failed to be updated</span>';
        $("#editing-infos").append(notiText);
    }

    //Poster deletion
    if(returnStatuses['is_posters_deleted'] ==1){
        let notiText = '<span class="noti-text success">Poster(s) successfully deleted</span>';
        $("#editing-infos").append(notiText);
    }
    else if(returnStatuses['is_posters_deleted'] ==0){
        let notiText = '<span class="noti-text failure">Poster(s) failed to be deleted</span>';
        $("#editing-infos").append(notiText);
    }

    //City update
    if(returnStatuses['is_city_updated'] ==1){
        let notiText = '<span class="noti-text success">Event city successfully updated</span>';
        $("#editing-infos").append(notiText);
    }
    else if(returnStatuses['is_city_updated'] ==0){
        let notiText = '<span class="noti-text failure">Event city failed to be updated</span>';
        $("#editing-infos").append(notiText);
    }

    //Address update
    if(returnStatuses['is_address_updated'] ==1){
        let notiText = '<span class="noti-text success">Event address successfully updated</span>';
        $("#editing-infos").append(notiText);
    }
    else if(returnStatuses['is_address_updated'] ==0){
        let notiText = '<span class="noti-text failure">Event address failed to be updated</span>';
        $("#editing-infos").append(notiText);
    }

    //Event dateTime
    if(returnStatuses['is_dateTime_updated'] ==1){
        let notiText = '<span class="noti-text success">Event date successfully updated</span>';
        $("#editing-infos").append(notiText);
    }
    else if(returnStatuses['is_dateTime_updated'] ==0){
        let notiText = '<span class="noti-text failure">Event date failed to be updated</span>';
        $("#editing-infos").append(notiText);
    }

    //Categories update
    if(returnStatuses['is_categories_updated'] ==1){
        let notiText = '<span class="noti-text success">Event categories successfully updated</span>';
        $("#editing-infos").append(notiText);
    }
    else if(returnStatuses['is_categories_updated'] ==0){
        let notiText = '<span class="noti-text failure">Event categories failed to be updated</span>';
        $("#editing-infos").append(notiText);
    }

    //Categories deleted
    if(returnStatuses['is_categories_deleted'] ==1){
        let notiText = '<span class="noti-text success">Event categories successfully deleted</span>';
        $("#editing-infos").append(notiText);
    }
    else if(returnStatuses['is_categories_deleted'] ==0){
        let notiText = '<span class="noti-text failure">Event categories failed to be deleted</span>';
        $("#editing-infos").append(notiText);
    }

    //Price update
    if(returnStatuses['is_price_updated'] ==1){
        let notiText = '<span class="noti-text success">Event ticket price successfully updated</span>';
        $("#editing-infos").append(notiText);
    }
    else if(returnStatuses['is_price_updated'] ==0){
        let notiText = '<span class="noti-text failure">Event ticket price failed to be updated</span>';
        $("#editing-infos").append(notiText);
    }

}

//Function to uplad pictures
//Upload images show preview and save them in array to be sent
var imagesPreview = function(input, placeToInsertImagePreview) {

    if (input.files) {
        var filesAmount = input.files.length;
        if(filesAmount<=quotaPosters){
            for (i = 0; i < filesAmount; i++) {
                var reader = new FileReader();

                reader.onload = function(event) {
                    let htmlImgEl = '<span class="unit-new-poster">\
                        <span>New</span>\
                        <img src="'+event.target.result+'"/>\
                        </span>';
                    
                    $("#"+placeToInsertImagePreview).append(htmlImgEl);

                    //$($.parseHTML('<img class="images">')).attr('src', event.target.result).appendTo(placeToInsertImagePreview);
                }

                reader.readAsDataURL(input.files[i]);
            }
        }
        else{
            //Empty files iput
            $("#event-pictures").val(null);
            alert("There is a quota of 3 images per event. "+(3-quotaPosters)+" poster(s) has been detected for this event. The number of poster you can upload now is: "+quotaPosters);
            
        }
    }

};

//display categories into box
function displayCateg(categ, index){
    let addedCateg = "<span class='categ-unit'>"+categ+"<a class='x-delete' id='"+index+"'>X</a></span>";
    $("#event-categ").append(addedCateg);
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

function PRCategDisplay(res){
    let arrCateg = res['arr_categ'];
    $("#idCategList").empty();
    let resultArrCateg = displayCategories(arrCateg, "idCategList");
    if(!resultArrCateg){
        $("#idCategList").append('<option selected="true" disabled="disabled">Categories not found</option>'); 
    }
}
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

function logoutHelper(res){
    if(res['succ_logout']==1){
        window.location.replace("lsrs_login.html");
    }
}

function displayBio(bio){
    let bioLength = bio.length;
    let sliceBio = bio;
    if(bioLength>150){
        sliceBio = bio.slice(0,150);
        sliceBio = sliceBio + "...";
        $("#see-more").css("display", "block");
        $("#see-less").css("display", "none");
    }

    return sliceBio;
}

function displayFullBio(biographie){
    $("#see-more").css("display", "none");
    $("#see-less").css("display", "block");
    return biographie;
}


function displayTotalNumber(total){
    let myTot = parseInt(total);
    let myTotStr ="";
    if(myTot>999 && myTot<1499){
        myTotStr = myTot.toString();
        myTotStr = myTotStr.slice(0,1) + "k";
    }
    else if(myTot>1499 && myTot<9999){
        myTotStr = myTot.toString();
        myTotStr = myTotStr.slice(0,1)+"." + myTotStr.slice(1,2) + "k";
    }
    else if(myTot>9999 && myTot<99999){
        myTotStr = myTot.toString();
        if(parseInt(myTotStr.charAt(2))>0){
            myTotStr = myTotStr.slice(0,2) + "." +myTotStr.slice(2,3) + "k";
        }
        else{
            myTotStr = myTotStr.slice(0,2) + "k";
        }
        
    }
    else if(myTot>99999 && myTot<999999){
        myTotStr = myTot.toString();
        myTotStr = myTotStr.slice(0,3) + "k";
    }
    else if(myTot>999999 && myTot<9999999){
        myTotStr = myTot.toString();
        myTotStr = myTotStr.slice(0,1) + "M";
    }
    else{
        myTotStr = myTot.toString();
    }

    return myTotStr;
}

function MPBtnFollowUnfollow(res){
    if(res['status']==1){
        //Update number of followers
        let totFollowers = '';
        if(res['total']>1){
            totFollowers = '<h2>'+displayTotalNumber(res['total'])+'</h2> <span>FOLLOWERS</span>';
        }
        else{
            totFollowers = '<h2>'+displayTotalNumber(res['total'])+'</h2> <span>FOLLOWER</span>';
        }
        $("#followers-tot").html(totFollowers);
      
        if(res['actionType']=="FOLLOW"){
            $("#button-action .follow_unfollow").text("UNFOLLOW");
        }
        else{
            $("#button-action .follow_unfollow").text("FOLLOW"); 
        }
    }
}

function stdDisplayUserInfo(res){
  if(res['user_found']==1){
        //Handle user avar
        if(res['avatar'] =="NONE"){
            $("#userimage").attr("src", "media/icons/user-icon.png");
        }
        else{
            $("#userimage").attr("src", res['avatar']);
        }

        $("#user-fname-lname").text(res['firstName']+" "+ res['lastName']);
        $("#username").text(res['username']);

        //Display bio
        bio = res['bio']==null? "NONE" : res['bio']; //Pay attention to what might return null to avoid bugs
        $("#user_bio_text").text(displayBio(bio));

        //Take care of total user events
        let totEvent ='';
        if(res['events']>1){
            totEvent ='<h2>'+res['events']+'</h2> <span>EVENTS</span>';
        }
        else{
            totEvent ='<h2>'+res['events']+'</h2> <span>EVENT</span>';
        }
        $("#event-tot").html(totEvent);

        //Take care of total following
        let totFollowing ='<h2>'+displayTotalNumber(res['following'])+'</h2> <span>FOLLOWING</span>';
        $("#following-tot").html(totFollowing);

        //take care of total followers
        let totFollowers = '';
        if(res['followers']>1){
            totFollowers = '<h2>'+displayTotalNumber(res['followers'])+'</h2> <span>FOLLOWERS</span>';
        }
        else{
            totFollowers = '<h2>'+displayTotalNumber(res['followers'])+'</h2> <span>FOLLOWER</span>';
        }
        $("#followers-tot").html(totFollowers);

        if(res['actor']=="SELF"){
            //$("#btn-follow").css("display","none");
            //$("#btn-unfollow").css("display","none");
            let groupBtn = '<button id="btn-edit-id-'+res['idUser']+'">EDIT</button>\
                            <button id="btn-share-id-'+res['idUser']+'">SHARE</button>';
            $("#button-action").append(groupBtn);
        }
        else{
            //$("#btn-edit").css("display","none");
            if(res['alreadyFollower']==1){
                //$("#btn-follow").css("display","none");
                $("#button-action").append('<button class="follow_unfollow" id="btn-un-follow-id-'+res['idUser']+'">UNFOLLOW</button> ');
            }
            else{
                //$("#btn-unfollow").css("display","none");
                $("#button-action").append('<button class="follow_unfollow" id="btn-un-follow-id-'+res['idUser']+'">FOLLOW</button>');
            }
            $("#button-action").append('<button id="btn-share-id-'+res['idUser']+'">SHARE</button>');

        }

        //Append event card into corresponding catalogue
        requestHandlerEventCard(res);

    }
    
}

//Function for requests
function requestSender(destinationToRequest, obj, processorFunc){
    $.ajax({
        url: destinationToRequest,
        data: obj,
        type: "POST",
        dataType : "json",
    })
    .done(function( response ) {
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

function requestSenderFormData(destination, formData, helperFunc){
    $.ajax({
        url:destination,
        method:"POST",
        data: formData,
        contentType: false,
        //dataType : 'json',
        cache: false,
        processData: false,
        beforeSend:function(){
           //void
        },   
        success:function(data)
        {
            console.log(data);
            helperFunc(data);
        }
       });

}

function consoleDisplay(res){
    console.log(res);
}

function appendEventsCardTo(arr){
    if(arr.length>0){
        for(let i=0; i<arr.length;i++){
            let unitEvent = arr[i];
            let posterLink = unitEvent['posterLink'];
            if(posterLink == "NONE"){
                posterLink = "media/icons/cover 11.png";
            }

            let HTMLEventUnit = ' <div class="post">\
            <h3 class="info">'+unitEvent['title']+'</h3>\
            <img class="post-image" src="media/icons/loadingSpinner.gif" data-src="'+posterLink+'" data-srcset="'+posterLink+'" width="100%"/>\
            <div class="btns-container-prof">\
            <a href="etc_display_event.html?e='+unitEvent['idEvent']+'"><button class="main-action-btn-profile">View event</button></a>\
            </div>\
        </div>';

            let HTMLEventElement = '<div class="wrapper-flip-card">\
            <div class="scene scene--card">\
                <div class="card-event">\
                  <div class="card__face card__face--front">\
                      <img id="img-poster-flip" class="lazy" src="media/icons/loadingSpinner.gif" data-src="'+posterLink+'" data-srcset="'+posterLink+'" width="100%" height="100%"/>\
                  </div>\
                  <div class="card__face card__face--back" id="back-card-flip">\
                    <span>'+unitEvent['title']+'</span>\
                      <span><span><img src="media/icons/clock.png"/></span>'+unitEvent['dateTime']+'</span>\
                      <span><span><img src="media/icons/location.png"/></span>'+unitEvent['location']+'</span>\
                      <span><span><img src="media/icons/price.png"/></span>'+unitEvent['price']+'</span>\
                  </div>\
                </div>\
            </div>\
            <div class="container-btn">\
                <a href="etc_display_event.html?e='+unitEvent['idEvent']+'"><button>View event</button></a>\
            </div>\
        </div>';

        //Append event card to the catalogue
        $("#container-events-flip-card").append(HTMLEventUnit);

        }
        return 1;
    }
    return 0;
}

function requestHandlerEventCard(res){
   if(res['actor']!="SELF"){
        let arrEvent = res['arrEvent'];
        let resultArrEvent = appendEventsCardTo(arrEvent);

        //Lazy load handling
        let Lazyimages = [].slice.call($(".post-image"));
        
        if("IntersectionObserver" in window){
            let observer = new IntersectionObserver((entries, observer)=>{
                entries.forEach(function(entry){
                    if(entry.isIntersecting){
                        let lazyimage = entry.target;
                        lazyimage.src = lazyimage.dataset.src;
                        lazyimage.srcset = lazyimage.dataset.srcset;
                        lazyimage.classList.remove("post-image");
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

}

//FUNCTIONS FOR CONFIGURATIONS FUNCTIONALITIES
//Function to display events into box-suggestion-events
function displaySuggestionsEvent(arr, desDis){
    if(arr.length>0){
        for(let i=0; i<arr.length; i++){
            let unitSuggest = arr[i];
            let HTMLUnitSuggest = '<span><strong>'+unitSuggest['title']+'</strong><b> -->id: </b><em>'+unitSuggest['idEvent']+'</em></span>';
            $("#"+desDis).append(HTMLUnitSuggest);
        }
        return 1;
    }
    return 0;
}

//Function to handle event display in pop-up suggestion box HTTP part
function PREventSuggestions(res){
    $("#box-suggestion-events").empty();
    let arrStatus = res['arr_status'];
    
    if(!(arrStatus['divers_error']=="USER_OFFLINE")){
        let arrEvents = res['arr_my_events'];
        let resultArrEvent = displaySuggestionsEvent(arrEvents,"box-suggestion-events");
        if(!resultArrEvent){
            $("#box-suggestion-events").append("<strong>No event found</strong");
        } 
    }
    else{
        $("#box-suggestion-events").append("<strong>You are offline. Login to see your events</strong");
    }    
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

function PRCCSuggestions(res){
    
    let arrCities = res['arr_cities'];
        $("#box-suggestion-cities").empty();
        let resultArrCities = displaySuggestionsCity(arrCities,"box-suggestion-cities");
        if(!resultArrCities){
            $("#box-suggestion-cities").append("<strong class='content'>No city found</strong");
        }  

}

function displayEventToEdit(arr){
        let eventUnit = arr;
        //pass title, short msg, description
        $("#field-event-title").val(eventUnit['title']);
        $("#field-event-post-msg").val(eventUnit['postMessage']);
        $("#field-event-description").val(eventUnit['description']);

        //Add posters
        let postersArr = eventUnit['linkPosters'];
        if(postersArr.length>0){
            //Get the posters quota images to be updloaded per event
            quotaPosters = quotaPosters - (postersArr.length);
            $("#ancient-posters").empty();
            for(let i=0; i<postersArr.length;i++){
                let onePoster = '<span class="unit-ancient-poster">\
                    <span class="remove-poster">Delete</span>\
                    <img src="'+postersArr[i]+'"/>\
                    </span>';
                
                //Add it to arrPosters
                //arrPoters.push(postersArr[i]);
                //Append it to ancient poster box
                $("#ancient-posters").append(onePoster);
            }
        }
        else{
            $("#ancient-posters").empty();
            let noPoster ='<span class="unit-ancient-poster">\
                <span>No poster(s)</span>\
                <img src="media/icons/nothing1.gif"/>\
                </span>';

            $("#ancient-posters").append(noPoster);  
        }
        
        //Add country and city value
        $("#event-country").val(eventUnit['location_country']);
        $("#id-city").val(eventUnit['location_city']);

        //Address and datetime
        $("#field-event-address").val(eventUnit['location']);
        //Treat the datetime string
        eventDateTime = eventUnit['dateTime'].replace(" ", "T");
        $("#id-date-time").val(eventDateTime);

        //Add categories already set
        let arrEventCateg = eventUnit['categories'];
        if(arrEventCateg.length>0){
            $("#event-categ").empty();
            for(let i=0; i<arrEventCateg.length;i++){
                let oneCateg = '<span class="categ-unit">'+arrEventCateg[i]+'<a class="x-delete" id="'+i+'">X</a></span>';
                $("#event-categ").append(oneCateg);
                arrCateg.push(arrEventCateg[i]);

            }
        }

        //Add price and currency
        let arrPrice = eventUnit['prices'];
        if(arrPrice.length>0){
            let currentPrice = arrPrice[0];
            $("#field-event-price").val(currentPrice['price']);
            $("#price-currency").text(currentPrice['currency']);
        }
        else{
            //$("#price-currency").text(currentPrice['currency']);
            $("#field-event-price").attr("readonly", true);
            $("#field-event-price").val("Price unavailable");
            $("#price-currency").text("X");
        }

        //Add default add new poster unit
        $("#new-posters").empty();
        let HTMLDefaultAddNewPoster = '<span class="unit-new-poster">\
                <span>Upload New</span>\
                <img src="media/posters/post1.jpg"/>\
                </span>';
        $("#new-posters").append(HTMLDefaultAddNewPoster);
        

}

function PREventDisplayToEdit2(res){
    
    let arrEvents = res['arr_event'];
    
    if(arrEvents['isOnline']==1){
        displayEventToEdit(arrEvents);
    }
    else{
        alert("You cannot edit event. You are offline");
    }    
}
//To work this function depend on some external libraries
//<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script> (must be included in the <head> section of the html page)
//I must have installed locally easyqrcode because it is fetch inside the function
// The function might need some editing of html tag and ids where it will get and append data
/*
//Here is the HTML markup when it was being programmed for the first time
<h1>QRCODE TEST</h1>
        <input type="text" placeholder="Enter text to generate QRCODE" id="text-qrcode"/>
        <button id="btn-test">Generate QRcode</button>
           
            <div class="ticket-preview" id="ticket-preview">
                <div class="ticket-info">
                    <h3>Some title</h3>
                    <p>
                        This div could contain the firt posters as background<br>
                        The main information of the ticket<br>
                        The username, the platform name<br>
                        + some good design to make it beautiful.
                    </p>
                </div>
                <div class = "qrcode" id="qrcode">

                </div>
            </div>

            <div id="previewImg">

            </div>

//CSS code related to the HTML markup
<style>
 body{ background-color: ivory; }
 canvas{border:1px solid red;}

            /*Ticket CSS */
           // .ticket-preview{display:flex; flex-direction: row; width:700px; height:250px; /*border:1px solid blue;*/}
           // .ticket-info{display:flex; flex-direction:column; width: 60%; /*border:1px solid red;*/}
           // .ticket-info h3 {padding:2px; margin-bottom:2px;}
           // .ticket-info p{padding:2px; margin-top:2px;}
          //  .qrcode{/*border:1px solid yellow; */width:270px;}</style>

 //*/

/*function createQRcode(codeTicket, logoLink="media/icons/user-temp.png"){

    //TEST QRCODE
    $.getScript("easyqrcodejs/src/easy.qrcode.js", function() {
        //Show to allow screenshot
        //$("#ticket-preview").show();
        $("#myModal").css("display","block");

        var qrcode = new QRCode(document.getElementById("qrcode"), {
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

        html2canvas(document.getElementById("ticket-content"),		{
            allowTaint: true,
            useCORS: true
        }).then(function (canvas) {
            var anchorTag = document.createElement("a");
            document.body.appendChild(anchorTag);
            //document.getElementById("previewImg").appendChild(canvas);	
            anchorTag.download = "filename.jpg";
            anchorTag.href = canvas.toDataURL();
            anchorTag.target = '_blank';
            anchorTag.click();
        });

        //clear
        qrcode.clear();
        //$("#ticket-preview").hide();
        $("#myModal").css("display","none");

    });

}*/