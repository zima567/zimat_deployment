var bio ="";
var arrCateg=[];
var arrCateg_trash = [];
var arrPoters_trash = [];
var quotaPosters = 3;

$(document).ready(function(){
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

    //Variables acting like triggers for user profile
    let lastNameModified = false;
    let firstNameModified = false;
    let aboutModified = false;
    let profilePicModified = false;

    //Event right access variable
    let idEventRightAccess ="";
    let arrUsers =[];
    let sellingRight = 0;
    let scanningRight = 0;

      //Query profile info of user
    //api destination file
    let destination = "api_php/api_profile.php";
     //Get the user ID from the URL
     let userID = getParameter("e");
    
     let obj ={idUser:userID};
    requestSender(destination, obj, stdDisplayUserInfo, "Loading profile info...");

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
    //End of query profile info of user

    //CODE-FOR THE SHARE FUNCTIONALITY
    //Handle share button functionality
    $("#button-action").on("click", "#btn-share-id-"+getParameter("e"), function(event){
        let linkToShare = "https://www.zimaccess.com/profile.html?e="+getParameter("e");
        $("#event-link-val").val(linkToShare);
        $("#pop-up-box3").addClass('model-open');
        
    });
    //Handle the copy of the link once click on the copy link btn
    $("#id-content-popup3").on("click", "#btn-cpy-link", function(event){
        event.preventDefault();
        CopyToClipboard($("#event-link-val").val(), true, "link copied");
        $("#pop-up-box3").removeClass('model-open');
    });

    //+++++++++++[BLOCK-A] TEST PERSONNAL SETTINGS API
    //show modal personnal settings api
    $("#personnal-settings").on("click", function(){
        $("#modal-personnal-settings").css("display", "flex");
    });

    //handle click on config-titles --config-location
    $("#config-location-title").on("click", function(){
        if($("#config-location-box").css("display")=="flex"){
            $("#config-location-box").css("display", "none");
        }
        else{
            $("#config-location-box").css("display", "flex"); 
            //fetch informations to input fields
            let dataObj ={action_type:"T_SELECT", config_type:"select_complete_location_of_user"};
            let destinationReq = "api_php/api_configuration_module1.php";
            requestSender(destinationReq, dataObj, fullUserLocToInput);
        }

    });

     //[BLOCK-A] MANAGE COUNTRY CHOICE---START
     $("#config-country").on("keyup", function(){
        let resultDisplayDestination = "box-suggestion-countries-config";
        if($("#"+resultDisplayDestination).css("display")!="flex"){
            $("#"+resultDisplayDestination).css("display","flex");
        }
        if($("#config-city").val()!=""){
            $("#config-city").val("");
        }
        //Get data entered
        let inputValueToQuery = $("#config-country").val();
        //Function suggestion + request function
        if(inputValueToQuery!=""){
            let dataObj ={family_suggest:"COUNTRY_CITY", query_data:inputValueToQuery};
            let destinationReq = "api_php/api_etc_suggestion_v2.php";
            requestSender(destinationReq, dataObj, displaySuggestionsCountryConfig, "NONE", "Searching country...", "box-suggestion-countries-config");

        }
        else{
            $("#box-suggestion-countries-config").empty();
            $("#box-suggestion-countries-config").css("display", "none");
        }

    });
    //On click on suggested element in box-suggestion
    $("#box-suggestion-countries-config").on("click", "span", function(e){
        e.preventDefault();
        let choosenCountry = $(this).text();
        $("#config-country").val(choosenCountry);

        $("#box-suggestion-countries-config").css("display", "none");
    });
    //MANAGE COUNTRY CHOICE ---END

    //MANAGE CITY CHOICE---START
    $("#config-city").on("keyup", function(){
        if($("#config-country").val()!=""){
            let resultDisplayDestination = "box-suggestion-cities-config";
            if($("#"+resultDisplayDestination).css("display")!="flex"){
                $("#"+resultDisplayDestination).css("display","flex");
            }

            //Get data entered
            let inputValueToQuery = $("#config-city").val();
            let countryName = $("#config-country").val().trim();
            //Function suggestion + request function
            if(inputValueToQuery!=""){
                let dataObj ={family_suggest: "COUNTRY_CITY", query_data: inputValueToQuery, countryName: countryName};
                let destinationReq = "api_php/api_etc_suggestion_v2.php";
                requestSender(destinationReq, dataObj, displaySuggestionsCityConfig, "NONE", "Searching city", "box-suggestion-cities-config");
    
            }
            else{
                $("#box-suggestion-cities-config").empty();
                $("#box-suggestion-cities-config").css("display", "none");
            }

        }
        else{
            //choose country first
            alert("Choose country first");
        }

    });
    //On click on suggested element in box-suggestion
    $("#box-suggestion-cities-config").on("click", "span", function(e){
        e.preventDefault();
        let choosenCities = $(this).text();
        $("#config-city").val(choosenCities);
        $("#btn-save-location-config").css("display", "block");
        
        $("#box-suggestion-cities-config").css("display", "none");
    });
    //MANAGE CITY CHOICE ---END

    //MANAGE ON CLICK ON SAVE CHANGES FOR COUNTRY AND CITY CONFIG
    $("#btn-save-location-config").on("click", function(){
        if($("#config-country").val().trim()!="" && $("#config-city").val().trim()!=""){
            //Update country and city of user
            let dataObj ={action_type:"T_UPDATE", config_type:"update_user_location", city_name:$("#config-city").val().trim()};
            let destinationReq = "api_php/api_configuration_module1.php";
            requestSender(destinationReq, dataObj, RSCUserLocation);
            $("#btn-save-location-config").css("display","none");
        }
        else{
            alert("Empty fields: Country and city fields are required");
        }
    });
    //*************[BLOCK-A]******************/

    //+++++++++++++[BLOCK-B]++++++++++++++ handle click on config-titles --config-preferences
    $("#config-preferences-title").on("click", function(){
        if($("#config-preferences-box").css("display")=="flex"){
            $("#config-preferences-box").css("display", "none");
        }
        else{
            $("#config-preferences-box").css("display", "flex");
            let dataObj ={action_type:"T_SELECT", config_type:"select_categ_of_users"};
            let destinationReq = "api_php/api_configuration_module1.php";
            requestSender(destinationReq, dataObj, displayCategsConfig, "NONE", "Loading supported categories...", "categs-config-box");
        }

    });

    //Handle click on categ unit inside box
    $("#categs-config-box").on("click", "span", function(event){
        event.preventDefault();
        if($(this).hasClass("background-selected")){
            $(this).removeClass("background-selected");
            $(this).addClass("background-not-selected");
        }
        else{
            $(this).removeClass("background-not-selected");
            $(this).addClass("background-selected");
        }

        //Display save button
        if($("#btn-save-preferences-config").css("display")=="none")
            $("#btn-save-preferences-config").css("display", "block");
       
    });

    //Handle click on Button save preferences
    $("#btn-save-preferences-config").on("click", function(){
        let arr_element_selected = $("#categs-config-box").find(".background-selected");
        let arr_categ_titles =[];
        for(let i=0; i<arr_element_selected.length;i++){
            arr_categ_titles.push($(arr_element_selected[i]).text().trim());
        }

        if(arr_categ_titles.length>0){
            //Update country and city of user
            let dataObj ={action_type:"T_UPDATE", config_type:"update_user_categories", arr_user_categs:arr_categ_titles};
            let destinationReq = "api_php/api_configuration_module1.php";
            requestSender(destinationReq, dataObj, RSCUserPreferences);
            $("#btn-save-preferences-config").css("display","none");
        }
        else{
            alert("No categories selected");
        }
    });
    //***************[BLOCK-B]***************/

    //+++++++++++++++[BLOCK-C]++++++++++++++ Handle click on social link configuration
    $("#config-social-links-title").on("click", function(){
        if($("#config-social-links-box").css("display")=="flex"){
            $("#config-social-links-box").css("display", "none");
        }
        else{
            $("#config-social-links-box").css("display", "flex");
            let dataObj ={action_type:"T_SELECT", config_type:"select_user_socials"};
            let destinationReq = "api_php/api_configuration_module1.php";
            requestSender(destinationReq, dataObj, displaySocials); 
        }

    });

    //Handle display of button save changes for social link config
    $("#fb-link, #ig-link, #wsapp-tel").on("change", function(){
        $("#btn-save-user-socials-config").css("display", "block")
    });

    //Handle click on btn save for social links config
    $("#btn-save-user-socials-config").on("click", function(){
        let fbLink = $("#fb-link").val().trim();
        let igLink = $("#ig-link").val().trim();
        let wspTel = $("#wsapp-tel").val().trim();

        if(fbLink!="" && igLink!="" && wspTel!=""){
            let dataObj ={action_type:"T_UPDATE", config_type:"update_user_socials", fbLink:fbLink, igLink:igLink, wspTel:wspTel};
            let destinationReq = "api_php/api_configuration_module1.php";
            requestSender(destinationReq, dataObj, RSCUserSocials);
        }
        else{
            alert("You have empty fields!");
        }
    });
    //*****************[BLOCK-C]***************** */

    //++++++++++++++++[BLOCK-D]+++++++++++++++++ handle click on config-titles --config-acc-verification
    $("#config-acc-verification-title").on("click", function(){
        if($("#config-acc-verification-box").css("display")=="flex"){
            $("#config-acc-verification-box").css("display", "none");
        }
        else{
            //$("#config-acc-verification-box").css("display", "flex");
            $("#config-msg-user-acc-verification").text("");
            let dataObj ={action_type:"T_SELECT", config_type:"select_user_acc_verification_info"};
            let destinationReq = "api_php/api_configuration_module1.php";
            requestSender(destinationReq, dataObj, RCOConfigAcc, "Please wait while we are verifying requirements...");
        }

    });

    $("#config-msg-user-acc-verification").on("click", "#resend-email-link", function(e){
        e.preventDefault();
        let dataObj ={actionType:"REQUEST_EMAIL_VERIFICATION_LINK"};
        let destinationReq = "api_php/api_btn_action.php";
        requestSender(destinationReq, dataObj, RPEmailVerification, "Please wait...Email verification link is being sent");
    });

    //Handle button display for document submission
    $("#file-acc-verification").on("change", function(){
        $("#btn-save-user-acc-verification").css("display","block");
    });

    //Handle click on submit button
    $("#btn-save-user-acc-verification").on("click", function(){
        let formData = new FormData();
        //Append the mendatory post variables
        formData.append("action_type", "T_UPDATE");
        formData.append("config_type", "update_doc_acc_verification");
        formData.append("doc_file", $('#file-acc-verification').get(0).files[0]);

        let destinationReq = "api_php/api_configuration_module1.php";
        requestSenderFormData(destinationReq, formData, RAVRequest, "Please wait... It will take sometimes depending on the file size and the internet connection");

        //Hide button
        $("#btn-save-user-acc-verification").css("display","none");

    });

     //Close modal personnal settings api
     $("#close-modal-perso-settings").on("click", function(){
        $("#modal-personnal-settings").css("display", "none");
        $(".section-config span button").css("display", "none");
        $(".section-config .result-config-msg").text("");
    });
    //***************[BLOCK-D]******************** */

    //++++++++++++++[BLOCK-AA]+++++++++++ TEST WALLET FUNCTIONALITY API
    $("#myWallet").on("click", function(){
        $("#modal-user-wallet").css("display", "flex");

        let destination = "api_php/api_stat_display.php";
        let obj ={stat_type:"WALLET"};
        requestSender(destination, obj, displayEventWallet,"Loading wallet info...");
    });

    //Handle click on red tag payment required wallet cards
    $("#inner-wrapper-wallet").on("click", ".fee-tag-btn-card", function(event){
        event.preventDefault();
        alert("To proceed with payments, contact us directly.\nFirst email: zimaccessm6@gmail.com\nSecond email: zimaware@gmail.com\nPhone (Russia): +7 996 160 5155\nPhone(Haiti): +509 37 23 5549 (Haiti)");
    });

    $("#close-modal-user-wallet").on("click", function(){
        $("#modal-user-wallet").css("display","none");
        $("#inner-wrapper-wallet").empty();
    });
    //****************[BLOCK-AA]****************** */


    //++++++++++++++[BLOCK-AAA]+++++++++++++++++ On click on edit profile button
    $("#button-action").on("click", "#btn-edit", function(event){
        event.preventDefault();
        $("#popup-profile-config").addClass("model-open");

    });

    //Block js for profile pop up box
    $(".modified-prof-input").on("keypress change", function(){
        $("#id-save").css("display", "block");
    });

    $("#id-fn").on("change", function(){
        firstNameModified = true;
    });

    
    $("#id-ln").on("change", function(){
        lastNameModified = true;
    });

    $("#id-about").on("change", function(){
        aboutModified = true;
    });

    $("#id-profile-picture").on("change", function(){
        profilePicModified = true;
    });


    $("#id-save").on("click", function(){
        //Send request for editing
        //Form data for submission 
        let formData = new FormData();
        //Append the mendatory post variables
        formData.append("action_type", "T_UPDATE");
        formData.append("config_type", "update_user_profile_details");

        if(firstNameModified && $("#id-fn").val().trim()!=""){
            formData.append("fname", $("#id-fn").val().trim());
        }

        if(lastNameModified && $("#id-ln").val().trim()!=""){
            formData.append("lname", $("#id-ln").val().trim());
        }

        if(aboutModified && $("#id-about").val().trim()!=""){
            formData.append("about", $("#id-about").val().trim());
        }

        if(profilePicModified){
            let profilePic = $('#id-profile-picture')[0].files[0];
            formData.append("profile-avatar", profilePic);
        }

        let destinationReq = "api_php/api_configuration_module1.php";
        $("#popup-profile-config").removeClass("model-open");
        requestSenderFormData(destinationReq, formData, MPRProfileUpdate, "Please wait... Profile is updating");
    });

    //HANDLE CLOSING OF POPUP BOX TO MODIFY PROFILE DETAILS
    $(".close-btn, .bg-overlay").click(function(){
        $("#popup-profile-config").removeClass("model-open");
        $("#pop-up-box3").removeClass("model-open");
    });

    //******************[BLOCK-AAA]********************** */
    

    //+++++++++++++++++++[BLOCK-AAAA]++++++++++++++++++ SEARCH FOR EVENT TO BE MODIFED
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

    //Handle cancel button of configuration-modal-manage-EVENT
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

    //HANDLE EVENT SUGGESTION MODIFY EVENT
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
            requestSender(destinationReq, dataObj, PREventSuggestions, "NONE", "Searching event...", "box-suggestion-events");
    
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
        requestSender(destinationReq, dataObj, PREventDisplayToEdit2, "Loading event details...");

    });
     //On click on change event button
     $("#change-event").on("click", function(){
        $("#id-search-event").attr("readonly", false); 
        $("#id-search-event").val("");
        $("#change-event").css("display", "none");
    });
    //HANDLE EVENT SUGGESTION---END---


    $(".field-has-changed").on("keypress change", function(){
        //Display save change button
        $("#btn-save-changes").css("display", "block");

    });

    $("#field-event-title").on("focusout", function(){
        title_modified = true;
    });

    $("#field-event-post-msg").on("focusout", function(){
        postMessage_modified = true;
    });

    $("#field-event-description").on("focusout", function(){
        description_modified = true;
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
                requestSender(destinationReq, dataObj, PRCCSuggestions, "NONE", "Searching city...", "box-suggestion-cities");
    
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
        $("#box-suggestion-cities").css("display", "none");

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
       
        //Remove categ to arrCateg
        arrCateg.splice(event.target.id, 1);
        //console.log(arrCateg);
        $("#event-categ").empty();
        arrCateg.forEach(displayCateg);
    });
     //MANAGE THE CHOICE OF CATEG--END

    $("#btn-save-changes").on("click", function(){

        //Send request for editing
        //Form data for submission 
        let formData = new FormData();
        //Append the mendatory post variables
        formData.append("action_type", "T_UPDATE");
        formData.append("config_type", "update_event_details");
        formData.append("editDateTime", currentDateAndTime());
        formData.append("idEvent", idEventToBeModified);

        //Set conditional updated field
        //Set param for title update
        if(title_modified){
            let newValue = $("#field-event-title").val().trim();
            if(newValue!=""){
                formData.append("update_title", newValue);
            }
        }

        if(postMessage_modified){
            let newValue = $("#field-event-post-msg").val().trim();
            formData.append("update_postMessage", newValue);
        }

        if(description_modified){
            let newValue = $("#field-event-description").val().trim();
            formData.append("update_description", newValue);
        }

        if(city_modified){
            let newValue = $("#id-city").val().trim();
            let countryVal = $("#event-country").val().trim();
            formData.append("update_city", newValue);
            formData.append("event_country", countryVal);
        }

        if(address_modified){
            let newValue = $("#field-event-address").val().trim();
            formData.append("update_address", newValue);
        }

        if(eventDate_modified){
            let newValue = $("#id-date-time").val().trim();
            formData.append("update_date_time", newValue);
        }

        if(eventPrice_modified){
            let newValue = $("#field-event-price").val().trim();
            //I will just send the amount, i will get the currency from php
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
        requestSenderFormData(destinationReq, formData, MPREditingProcess, "Please wait... Event is being updated. It will take a while depending on editing fields");
    });
   //************************[BLOCK-AAAA]******************* */

    //+++++++++++++++++++++++[BLOCK-AAAAA]+++++++++++++++++++ MANAGE EVENT-AGENTS BUTTON CLICK
    $("#manage-agent").on("click", function(){
        //Display modal manage agent
        $("#modal-manage-agent").css("display", "flex");
        //Hide event display template
        $("#wrapper-fields-to-edit-2").css("display", "none");
         //Hide the editing status modal
         $("#illustration-agent-config-result").css("display", "none");
         $("#btn-save-changes-agent").css("display", "none");
    });

    //Handle cancel button of configuration-modal-manage-AGENT
    $("#cancel-modal-manage-agent").on("click", function(){
        $("#modal-manage-agent").css("display", "none");
        $('#rights-to-sell').prop('checked', false);
        $('#rights-to-scan').prop('checked', false);
        $("#event-potential-agent").empty();
        $("#wrapper-fields-to-edit-2").css("display", "none");
        $("#illustration-agent-event").css("display", "flex");

        //empy the search event bar
        $("#id-search-event-2").attr("readonly", false); 
        $("#id-search-event-2").val("");
        $("#change-event-2").css("display", "none");

    });

     //MANAGE CHOICE OF EVENT TO BE ASSIGN AGENT TO
     //SEARCH FOR EVENT TO BE ASSIGN AGENT TO
    $("#id-search-event-2").on("keyup", function(){
        let resultDisplayDestination = "box-suggestion-events-2";
        if($("#"+resultDisplayDestination).css("display")!="flex"){
            $("#"+resultDisplayDestination).css("display","flex");
        }

        //Get data entered
        let inputValueToQuery = $("#id-search-event-2").val();
        //Function suggestion + request function
        if(inputValueToQuery!=""){
            let dataObj ={family_suggest:"USER_EVENTS", query_data:inputValueToQuery};
            let destinationReq = "api_php/api_etc_suggestion_v2.php";
            requestSender(destinationReq, dataObj, PREventSuggestions2, "NONE", "Searching event...", "box-suggestion-events-2");
    
        }
        else{
            $("#box-suggestion-events-2").empty();
            $("#box-suggestion-events-2").css("display", "none");
        }
    
    });
    //On click on suggested element in box-suggestion
    $("#box-suggestion-events-2").on("click", "span", function(e){
        e.preventDefault();
        let choosenEvent = $(this).find("strong").text();
        let idChosenEvent = $(this).find("em").text();
        //Global idEventToBeModified
        idEventRightAccess = idChosenEvent;
       
        $("#id-search-event-2").val(choosenEvent);
        //Set input read only
        //display edit button
        $("#id-search-event-2").attr("readonly", true);
        $("#box-suggestion-events-2").css("display", "none");
        $("#change-event-2").css("display","block");

        //Reset variables in case they have been set already
        //resetGlobalsEditing();

        //Show fields of information
        $("#wrapper-fields-to-edit-2").css("display", "block");
        $("#illustration-agent-event").css("display", "none");
        //$("#illustration-modify-event").css("display", "none");

        //Display event to be edited
        let dataObj = {idEvent:idChosenEvent};
        let destinationReq = "api_php/api_etc_display_one.php";
        requestSender(destinationReq, dataObj, PREventDisplayConfigRights, "Loading event details...");

        //Show save changes button for event-agent-rights
        $("#btn-save-changes-agent").css("display","block");

    });
     //On click on change event button
     $("#change-event-2").on("click", function(){
        $("#id-search-event-2").attr("readonly", false); 
        $("#id-search-event-2").val("");
        $("#change-event-2").css("display", "none");
    });
    //HANDLE EVENT SUGGESTION---END---ASSIGN AGENT

    //MANAGE USER APPEND---START-----AGENT
    $("#field-agent-username").on("keyup", function(){
        let resultDisplayDestination = "box-suggestion-users";
        if($("#"+resultDisplayDestination).css("display")!="flex"){
            $("#"+resultDisplayDestination).css("display","flex");
        }

        //Get data entered
        let inputValueToQuery = $("#field-agent-username").val();
        //Function suggestion + request function
        if(inputValueToQuery!=""){
            let dataObj ={family_suggest:"USERS_PLATFORM", query_data:inputValueToQuery};
            let destinationReq = "api_php/api_etc_suggestion_v2.php";
            requestSender(destinationReq, dataObj, PRUserSuggestions, "NONE", "Searching username...", "box-suggestion-users");
    
        }
        else{
            $("#box-suggestion-users").empty();
            $("#box-suggestion-users").css("display", "none");
        }
    
    });
     //On click on suggested element in box-suggestion
    $("#box-suggestion-users").on("click", "span", function(e){
        e.preventDefault();
        let choosenUser = $(this).find("strong").text().trim();
        $("#box-suggestion-users").css("display", "none");
        $("#field-agent-username").val("");

        let userAlreadyChoosen = false;
        for(let i=0; i<arrUsers.length;i++){
            if(arrUsers[i]==choosenUser){
                userAlreadyChoosen=true;
            }
        }

        if(!userAlreadyChoosen){
            arrUsers.push(choosenUser);
        }

        //Re-render users into the user box
        $("#event-potential-agent").empty();
        for(let i=0; i<arrUsers.length;i++){
            displayUsers(arrUsers[i],i);
        }
        
    });

    //Delete a USER from chosen list
    $("#event-potential-agent").on("click", "a", function(event){
        event.preventDefault();
        let removeIndex = event.target.id.replace("user-","");
        arrUsers.splice(removeIndex, 1);
        $("#event-potential-agent").empty();
        if(arrUsers.length>0){
            arrUsers.forEach(displayUsers);
        }
        else{
            $("#event-potential-agent").append("<b>No user selected</b>");
        }
        
    });
    //MANAGE User CHOICE---END----AGENT

    //ON CLICK ON SAVE CHANGES FOR EVENT-AGENT-CONFIG
    $("#btn-save-changes-agent").on("click", function(){
        //Get the checkbox values
        if($('#rights-to-sell').is(':checked')){
            sellingRight = 1;
        }

        if($('#rights-to-scan').is(':checked')){
            scanningRight = 1;
        }

        if(arrUsers.length>0 && idEventRightAccess!=""){
            let dataObj ={action_type:"T_UPDATE", config_type:"config_event_agents", idEvent:idEventRightAccess, arr_agents:arrUsers, sellingRight:sellingRight, scanningRight:scanningRight};
            let destinationReq = "api_php/api_configuration_module1.php";
            requestSender(destinationReq, dataObj, MPRRAgentManagement, "Please wait...Agent(s) configuration processing");
            //Reset global variables related to right access assignments
            idEventRightAccess ="";
            arrUsers =[];
            sellingRight = 0;
            scanningRight = 0;
        
        }
        else{
            alert("Please select user(s) you want to give rights to your event");
        }

    });
    //**********************[BLOCK-AAAAA]************************** */

    //logout of the system
    $("#logout").on("click", function(){
        $.ajax({
            url: "api_php/api_lsrs_logout.php",
            data: {},
            type: "POST",
            dataType : "json",
        })
        .done(function( response ) {
            //console.log(response);
            logoutHelper(response);
        })
        .fail(function( xhr, status, errorThrown ) {
            alert( "Sorry, there was a problem!" );
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + status );
            console.dir( xhr );
        });
    });

    //Bottom menu jquery
    $('.app-navigation-toggle').click(function() {

        $('.app-navigation-container').toggleClass('open', 300);

        $(this).toggleClass('active');

    });

});

function voidFunction(res){
    $("#popup-profile-config").removeClass("model-open");
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
    else{
        if(res['action_error']=="USER_OFFLINE"){
            alert("You are offline. Login first to be able to follow this user");
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
        //Add first name last name to popup
        $("#id-fn").val(res['firstName']);
        $("#id-ln").val(res['lastName']);

        $("#username").text(res['username']);

        //Display verified account tag
        if(res['userVerified']==1){
            $("#tag-user-verification").css("display","block");
        }

        //Display bio
        bio = res['bio']==null? "NONE" : res['bio']; //Pay attention to what might return null to avoid bugs
        //Add about/Bio to popup box
        $("#id-about").val(res['bio']);
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

        //Empty buttons box before append
        $("#button-action > button").length>0? $("#button-action").empty() : void(0);
        if(res['actor']=="SELF"){
            let groupBtn = '<button id="btn-edit">EDIT</button>\
                            <button id="btn-share-id-'+res['idUser']+'">SHARE</button>';
            $("#button-action").append(groupBtn);

            //Display settings box
            $("#id-settings-options").css("display","flex");
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

    //Handle changes on buttom menu icons depending on if user is online or offline
    if(res.is_user_online ==0){
        let loginIcon = '<a href="lsrs_login.html?lr=SET&or=profile.html&keyvar=e&ad='+getParameter("e")+'"><img src="media/icons/login.png" alt="login-icon"/></a>'
        $("#logout").html(loginIcon);
    }
    
}

function requestHandlerEventCard(res){
    if(res['actor']!="SELF"){
         let arrEvent = res['arrEvent'];
         let resultArrEvent = appendEventsCardTo(arrEvent);
         if(!resultArrEvent){
            $("#container-events-flip-card").empty();
            $("#container-events-flip-card").append(' <h2 style="font-style: italic; letter-spacing: 2px;">No event created</h2>');
         }
 
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

        //Append event card to the catalogue
        $("#container-events-flip-card").append(HTMLEventUnit);

        }
        return 1;
    }
    return 0;
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

//[BLOCK-A]
//Handle request return of save-changes location config
function RSCUserLocation(res){
    if(res.arr_status.action_status ==1){
        $("#config-msg-user-location").css("color","#47d447");
        $("#config-msg-user-location").text("Modification saved!");
        $("#config-location-box").css("display","none");
    }
    else{
        $("#config-msg-user-location").css("color","red");
        $("#config-msg-user-location").text("Modification failed to be saved! Make sure your inputs are correct."); 
    }
}
//[BLOCK-A]
//Function to display of countries and cities in the personnal settings
function displaySuggestionsCityConfig(res){
    if(res['arr_cities'].length>1){
        $("#box-suggestion-cities-config").empty();
        for(let i=1; i<res['arr_cities'].length; i++){
            $("#box-suggestion-cities-config").append('<span class="content">'+res.arr_cities[i].name+'</span>');
        }
    }
    else{
        $("#box-suggestion-cities-config").empty();
        $("#box-suggestion-cities-config").append("<b>City not found</b>");
    }
    
}

//[BLOCK-A]
//Function to display of countries and cities in the personnal settings
function displaySuggestionsCountryConfig(res){
    if(res['arr_countries'].length>0){
        $("#box-suggestion-countries-config").empty();
        for(let i=0; i<res['arr_countries'].length; i++){
            $("#box-suggestion-countries-config").append('<span class="content">'+res.arr_countries[i].name+'</span>');
        }
    }
    else{
        $("#box-suggestion-countries-config").empty();
        $("#box-suggestion-countries-config").append("<b>Country not supported</b>");
    }
    
}

//[BLOCK-A]
//FUNCTIONS TO HANDLE PERSONNAL SETTINGS
//CONFIG-LOCATION
function fullUserLocToInput(res){
    if(res['arr_status'].action_status == 1){
        $("#config-country").val(res['arr_return'].location_country);
        $("#config-city").val(res['arr_return'].location_city);
    }
}

//[BLOCK-AA]
function displayEventWallet(res){
    if(res['arr_status'].is_user_online == 1){
         if(res['api_return'].length>0){
             $("#inner-wrapper-wallet").empty();
             let api_return = res['api_return'];
             for(let i=0; i<api_return.length;i++){
                let walletUnit = ' <div class="wallet-event-unit">\
                     <div class="info-wallet-header">\
                     <span class="title-header">'+api_return[i].title+'</span>\
                     <span class="other-header-info">\
                         <span><b>Date & time</b><br/>'+api_return[i].dateTime+'</span>\
                         <span><b>Address</b><br/>'+api_return[i].location+'</span>\
                         <span><b>Location</b><br/>'+api_return[i].location_country+', '+api_return[i].location_city+'</span>\
                     </span></div>\
                     <div class="info-wallet-body">\
                     <div class="info-block">\
                         <span class="title-block"><span class="title">TICKETS -></span> <span class="number">'+api_return[i].total_ticket+'</span></span>\
                         <span class="box-block">\
                             <span>Sold: '+api_return[i].total_sold+'</span>\
                             <span>Scanned: '+api_return[i].total_scanned+'</span>\
                         </span>\
                     </div>\
                     <div class="info-block">\
                         <span class="title-block"><span class="title">REVENUE -></span> <span class="number">'+(api_return[i].revenue!=null? api_return[i].revenue:0)+' '+(api_return[i].prices.length!=0? api_return[i].prices[0].currency : "No currency")+'</span></span>\
                         <span class="box-block">';
                for(let j=0; j<api_return[i].prices.length;j++){
                     walletUnit+='<span>Price: '+api_return[i].prices[j].price+' '+api_return[i].prices[j].currency+' ('+api_return[i].prices[j].qt_ticket_sold+')</span>';
                }
 
                walletUnit+='</span></div>\
                     <div class="info-block">\
                         <span class="title-block"><span class="title">AGENT(S) -></span> <span class="number">'+api_return[i].agents.length+'</span></span>\
                         <span class="box-block">\
                             <table>\
                                 <tr><th>Username</th><th>Sell-Right</th><th>Scan-Right</th><th>Sold</th><th>Scan</th></tr>';
                for(let j=0; j<api_return[i].agents.length;j++){
                     walletUnit+='<tr><td>'+api_return[i].agents[j].username+'</td><td>'+(api_return[i].agents[j].sellingRight==1? "YES":"NO")+'</td><td>'+(api_return[i].agents[j].scanningRight==1? "YES":"NO")+'</td><td>'+api_return[i].agents[j].total_sold+'</td><td>'+api_return[i].agents[j].total_scanned+'</td></tr>';
                }
 
                walletUnit+='</table></span></div>\
                     <div class="info-block">\
                         <span class="title-block"><span class="title">SERVICE FEE -></span> <span class="number">'+(api_return[i].total_commission!=null? api_return[i].total_commission:0)+' '+(api_return[i].prices.length!=0? api_return[i].prices[0].currency : "No currency")+'</span></span>\
                         <span class="box-block">\
                             <span>Status: '+api_return[i].status_commission+'</span>\
                             <span><a href="#">Payment policy</a></span>\
                         </span>\
                     </div></div>';
                 
                //Check expired and unpaid commission fee
                if(api_return[i].status =="OUTDATED" && api_return[i].status_commission=="UNPAID"){
                    walletUnit+='<div class="fee-tag-btn-card" style="margin:4px; padding:12px; border-radius:15px; background-color:#df4759; border:none; color:white; text-align:center">Payment required</div>'
                }

                //Finish append
                walletUnit+='</div>';
                //Append event wallet unit
                $("#inner-wrapper-wallet").append(walletUnit);
            }
         }
         else{
             alert("You have not created any event yet");
         }
    }
    else{
         alert("You are offline. You cannot access your wallet");
    }
 }

 //[BLOCK-AAA]
function MPRProfileUpdate(res){
    let arrStatus = res['arr_status'];
    if(arrStatus['action_status']==1){
        let destination = "api_php/api_profile.php";
        let userID = getParameter("e");
        let obj ={idUser:userID};
        requestSender(destination, obj, stdDisplayUserInfo, "Re-loading profile informations to show last updates...");
    }
    else{
        alert("Profile details update failed: \nMake sure picture is not greater than 1.5MB\nMake sure picture format is among (jpeg, jpg, png)");
    }
}

//[BLOCK-AAAA]
function PRCCSuggestions(res){
    
    let arrCities = res['arr_cities'];
        $("#box-suggestion-cities").empty();
        let resultArrCities = displaySuggestionsCity(arrCities,"box-suggestion-cities");
        if(!resultArrCities){
            $("#box-suggestion-cities").append("<strong class='content'>No city found</strong");
        }  

}

//PAIR-UP
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

//[BLOCK-AAAA]
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

//[BLOCK-AAAA]
function PREventDisplayToEdit2(res){
    
    let arrEvents = res['arr_event'];
    if(arrEvents['isOnline']==1){
        if(arrEvents['status']!="ONGOING" && arrEvents['status']!="OUTDATED"){
            displayEventToEdit(arrEvents);
        }
        else{
            alert("This event is outdated. It cannot be edited anymore");
        }  
    }
    else{
        resetDisplayedFieldsME();
        if(Array.isArray(arrEvents)){alert("Oops! Something went wrong. If this error message persits, reach to customer service.");}
        else{alert("You cannot edit event. You are offline");}
    }    
}

//Function for manage event
function resetDisplayedFieldsME(){
    $("#field-event-title").val("");
    $("#field-event-post-msg").val("");
    $("#field-event-description").val("");
    $("#ancient-posters").empty();
    $("#event-country").val("");
    $("#id-city").val("");
    $("#field-event-address").val("");
    $("#id-date-time").val("");
    $("#event-categ").empty();
    $("#new-posters").empty();
    $("#field-event-price").val("");
    $("#price-currency").text("X");
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
            <img src="media/icons/no-bg-post.jpg"/>\
            </span>';
    $("#new-posters").append(HTMLDefaultAddNewPoster);
}

//[BLOCK-AAAA]
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

////[BLOCK-AAAA]
function PRCategDisplay(res){
    let arrCateg = res['arr_categ'];
    $("#idCategList").empty();
    let resultArrCateg = displayCategories(arrCateg, "idCategList");
    if(!resultArrCateg){
        $("#idCategList").append('<option selected="true" disabled="disabled">Categories not found</option>'); 
    }
}

//[BLOCK-AAAA]
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

//[BLOCK-AAAA]
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

//[BLOCK-AAAAA]
function MPRRAgentManagement(res){
    //Hide fields display
    $("#wrapper-fields-to-edit-2").css("display","none");
    //show box result
    $("#illustration-agent-config-result").css("display","flex");
    //Hide button save changes
    $("#btn-save-changes-agent").css("display", "none");
    //Change text of cancel btn
    $("#cancel-modal-manage-agent").text("close");

    let arr_stats = res['arr_status'];
    $("#agent-config-status").empty();
    if(arr_stats['action_status']==1){
        $("#img-result-agent-config").attr("src","media/icons/success.gif");
        let returnArr = res['arr_return'];
        for(let i=0; i<returnArr.length;i++){
            let pAgentAndStatus = returnArr[i];
            let pAStat ="succeeded";
            if(pAgentAndStatus['status']==0){
                pAStat ="Failed";
            }
            let HTMLElement = '<span>@'+pAgentAndStatus['username']+' | '+pAStat;
            $("#agent-config-status").append(HTMLElement);
        }
    }
    else{
        $("#img-result-agent-config").attr("src","media/icons/failure-scan.png");
        $("#agent-config-status").append("Configuration has been unsuccessful.");
    }
}

//[BLOCK-AAAAA]
//Function to handle user display in pop-up suggestion box HTTP part
function PRUserSuggestions(res){
    let arrUsers = res['arr_users'];
        $("#box-suggestion-users").empty();
        let resultArrUsers = displaySuggestionsUser(arrUsers,"box-suggestion-users");
        if(!resultArrUsers){
            $("#box-suggestion-users").append("<strong>No user found</strong");
        }  

}
//Function to display users into box-suggestion-users ->PAIR-UP
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

//[BLOCK-AAAAA] -->PAIR-DOWN
function displayEventToConfigRights(arr){
    let eventUnit = arr;
    $("#cr-event-title").text(eventUnit['title']);

    let arrPosters = eventUnit['linkPosters'];
    if(arrPosters.length>0){
        $("#cr-poster-pic").attr("src", arrPosters[0]);
    }
    else{
        $("#cr-poster-pic").attr("src", "media/icons/no-bg-post.jpg");
    }

    let eventPriceToAppend = eventUnit['prices'];
    let eventDetailsToAppend = '<span>'+eventUnit['location']+'</span><span>'+eventUnit['dateTime']+'</span>';
    if(eventPriceToAppend.length>0){
        let priceInfo = eventPriceToAppend[0];
        eventDetailsToAppend+='<span>'+priceInfo['price']+" "+priceInfo['currency']+'</span>';
    }
    $("#cr-event-detail").empty();
    $("#cr-event-detail").append(eventDetailsToAppend);

    //Clean those fields
    $("#event-potential-agent").empty();
    $('#rights-to-sell').prop('checked', false);
    $('#rights-to-scan').prop('checked', false);
}

//[BLOCK-AAAAA]
function PREventDisplayConfigRights(res){
    
    let arrEvents = res['arr_event'];
    
    if(arrEvents['isOnline']==1){
        displayEventToConfigRights(arrEvents);
    }
    else{
        resetDisplayedFieldsMA();
        if(Array.isArray(arrEvents)){alert("Oops! Something went wrong. If this error message persits, reach to customer service.");}
        else{alert("You cannot do any configurations now. You are offline");}

    }    
}

function resetDisplayedFieldsMA(){
    $("#cr-event-title").text("");
    $("#cr-poster-pic").attr("src", "#");
    $("#cr-event-detail").empty();
    $("#event-potential-agent").empty();
    $('#rights-to-sell').prop('checked', false);
    $('#rights-to-scan').prop('checked', false);
}

//FUNCTIONS FOR CONFIGURATIONS FUNCTIONALITIES
//Function to display events into box-suggestion-events -->PAIR-DOWN-DOWN
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

//[BLOCK-AAAAA]
function PREventSuggestions2(res){
    $("#box-suggestion-events-2").empty();
    let arrStatus = res['arr_status'];
    
    if(!(arrStatus['divers_error']=="USER_OFFLINE")){
        let arrEvents = res['arr_my_events'];
        let resultArrEvent = displaySuggestionsEvent(arrEvents,"box-suggestion-events-2");
        if(!resultArrEvent){
            $("#box-suggestion-events-2").append("<strong>No event found</strong");
        } 
    }
    else{
        $("#box-suggestion-events-2").append("<strong>You are offline. Login to see your events</strong");
    }    
}


//[BLOCK-AAAAA]
//Diplay users into user-box
function displayUsers(user, index){
    let addedUser = "<span class='categ-unit'>"+user+"<a class='x-delete' id='user-"+index+"'>X</a></span>";
    $("#event-potential-agent").append(addedUser);
}

//[BLOCK-B]
//Function request return of save-changes user preferences
function RSCUserPreferences(res){
    if(res.arr_status.action_status ==1){
        $("#config-msg-user-preferences").css("color","#47d447");
        $("#config-msg-user-preferences").text("Modification saved!");
        $("#config-preferences-box").css("display","none");
    }
    else{
        $("#config-msg-user-preferences").css("color","red");
        $("#config-msg-user-preferences").text("Modification failed to be saved! Make sure your inputs are correct."); 
    }
}

//[BLOCK-B]
//Handle return of categ array for user in personnal settings
function displayCategsConfig(res){
    $("#categs-config-box").empty();
    let arrCategs = res['arr_return'].arr_all_categ;

    if(res['arr_return'].arr_all_categ.length>0){
        for(let i=0; i<res['arr_return'].arr_all_categ.length;i++){
            let HTMLElementCateg = '<span class="categ-unit background-not-selected">'+res['arr_return'].arr_all_categ[i].title+'</span>';
            for(let j=0; j<res['arr_return'].arr_user_categ.length; j++){
                if(res['arr_return'].arr_user_categ[j] == res['arr_return'].arr_all_categ[i].title){
                    HTMLElementCateg = '<span class="categ-unit background-selected">'+res['arr_return'].arr_all_categ[i].title+'</span>';
                }
            }
            $("#categs-config-box").append(HTMLElementCateg);
        }
    }
    else{
        let HTMLElementCateg = '<strong>No categories available</strong>';
        $("#box-categories").append(HTMLElementCateg);
    }
}

//[BLOCK-C]
//Function to display socials to their inputs
function displaySocials(res){
    if(res.arr_status.action_status == 1){
        $("#fb-link").val(res.arr_return.facebook);
        $("#ig-link").val(res.arr_return.instagram);
        $("#wsapp-tel").val(res.arr_return.whatsApp);
    }
    else{
        alert("Oops! Something went wrong. Cannot get user social links");
    }
}

//[BLOCK C]
//Function request return of save-changes user socials
function RSCUserSocials(res){
    if(res.arr_status.action_status ==1){
        $("#config-msg-user-socials").css("color","#47d447");
        $("#config-msg-user-socials").text("Modification saved!");
        $("#config-social-links-box").css("display","none");
    }
    else{
        $("#config-msg-user-socials").css("color","red");
        $("#config-msg-user-socials").text("Modification failed to be saved! Make sure your inputs are correct."); 
    }
}

//[BLOCK-D]
//Fucntion to handle return on click on config-account title
function RCOConfigAcc(res){
    if(res.arr_status.action_status ==1){
        //Action succeed process the return
        if(res.arr_return.is_account_verified==0){
            if(res.arr_return.is_email_verified==1){
                $("#config-acc-verification-box").css("display", "flex");
                $("#acc-email").text(res.arr_return.email);
            }
            else{
                $("#config-msg-user-acc-verification").css("color","black");
                $("#config-msg-user-acc-verification").text("Oops! You cannot request for account verification if you have not confirm your email address on signing up on our platform. Please make sure you verify your email address via the email we sent to you the first time you sign up on our plateform. Or request for email verification right below:");
                $("#config-msg-user-acc-verification").append("<br/><a id='resend-email-link' style='text-decoration:underline; color:blue; cursor:pointer;'>Request email verification</a>");
            }

        }
        else if(res.arr_return.is_account_verified==1){
            $("#config-msg-user-acc-verification").css("color","green");
            $("#config-msg-user-acc-verification").text("Your account have been successfully verified");
        }
        else if(res.arr_return.is_account_verified==2){
            $("#config-msg-user-acc-verification").css("color","black");
            $("#config-msg-user-acc-verification").text("Our team is considering your request for account verification.");
        }
       
    }
    else{
        //Action failed
        $("#config-acc-verification-box").css("display","none");
        $("#config-msg-user-acc-verification").css("color","black");
        $("#config-msg-user-acc-verification").text("Oops! Something went wrong. Make sure you are logged in <br\> If this problem persist logout and login and try the account verification again. <br> If the previous solution does not work, maybe your account has been compromised. Reach for help from our support team.");
    }
}

function RPEmailVerification(res){
    if(res.status==1){
        $("#config-msg-user-acc-verification").css("color","green");
        $("#config-msg-user-acc-verification").text("Email verification link has been successfully sent to your email address("+res.divers_data+"). Please check your inbox and confirm your email address than come back here to continue the proccess of verifying your user account.");
    }
    else{
        $("#config-msg-user-acc-verification").css("color","red");
        $("#config-msg-user-acc-verification").text("Failed to send the email confirmation. Close this option and try later. If you encounter this problem many times reach to customer service.");
        $("#config-msg-user-acc-verification").append("<br/><a href='lsrs_support.html'>Customer support</a>");
    }
}

//[BLOCK-D]
//Function to handle return of docs submission for acc-verification
function RAVRequest(res){
    if(res.arr_status.action_status == 1){
        if(res.arr_return.doc_saved_to_db == 1 && res.arr_return.doc_send_via_email == 1){
            $("#config-acc-verification-box").css("display","none");
            $("#config-msg-user-acc-verification").css("color","black");
            $("#config-msg-user-acc-verification").text("Our team is considering your request for account verification.");
        }
        else{
            $("#config-acc-verification-box").css("display","none");
            $("#config-msg-user-acc-verification").css("color","red");
            $("#config-msg-user-acc-verification").text("Request for account verification failed."); 
        }
         
    }
    else{
        $("#config-acc-verification-box").css("display","none");
        $("#config-msg-user-acc-verification").css("color","red");
        $("#config-msg-user-acc-verification").text("Request for account verification failed. Possible reasons: 1) Document uploaded extensions not jpeg, png or pdf 2) File size greater than 1.5MB 3) System errors. PLEASE TRY AGAIN."); 
    }
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

function requestSenderFormData(destination, formData, helperFunc, msgLoader="NONE"){
    $.ajax({
        url:destination,
        method:"POST",
        data: formData,
        contentType: false,
        dataType : 'json',
        cache: false,
        processData: false,
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
            helperFunc(response)
        })
        .fail(function( xhr, status, errorThrown ) {
            $("#zima-loader").css("display","none");
            alert( "Sorry, there was a problem!" );
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + status );
            console.dir( xhr );
        });

}

