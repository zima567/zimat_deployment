$(document).ready(function(){
    //array categ
    var arrCateg=[];


    //Get today date and set min-date
    console.log(currentDateAndTime());
    $("#id-date-time").val(currentDateAndTime());
    $("#id-date-time").attr('min', currentDateAndTime());

    //Control click on button to upload images
    $("#idBtnUploadImg").on("click", function(){
        $("#event-pictures").trigger("click");
        $('#preview').empty();
       $("#event-pictures").val(null);
    });

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

    $('#event-pictures').on('change', function() {
        imagesPreview(this, 'div.preview');
    });

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
        
        let eventTitle = $("#event-title").val();
        let postMessage = $("#post-short-msg").val();
        let eventDescription = $("#id-description").val();
        let eventLocation = $("#id-location").val();
        let eventDateTime = $("#id-date-time").val();
        let eventArrCateg = arrCateg;
        let eventNbrTicket = $("#id-nbr-ticket").val();
        let eventTicketPrice = $("#id-unit-price").val();
        let priceCurrency = $("#idCurrency").val();
        let paymentMethod = $("input[name='payment-method']:checked").val();
        let postDateTime = currentDateAndTime();

        if(eventTitle!="" && eventLocation!="" && eventDateTime!=""){
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
            formData.append('dateTime', eventDateTime);
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
                //dataType : 'json',
                cache: false,
                processData: false,
                beforeSend:function(){
                    console.log("Sending to server...");
                },   
                success:function(data)
                {
                    console.log("success response...");
                    console.log(data);
                    RPEventCreation(data);

                }
               });

            //alert(eventTitle + eventLocation + eventDateTime);
        }
        else{
            //alert("Empty required fields");
            let popHtmlContent = '<p>Oops! You have empty required field(s).<br><br>Please make sure everything is correct before submitting event</p>';
            $("#id-content-popup").html(popHtmlContent);
            $(".custom-model-main").addClass('model-open');
        }
    });

    //POPUP Handling 
    //$(".custom-model-main").addClass('model-open');
    $(".close-btn, .bg-overlay").click(function(){
        $(".custom-model-main").removeClass('model-open');
    });


});

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
            //event creation succed
            $("#operation-status-text").text("Your event has been successfully created");
            $("#see-event-iacc-link").attr("href", "profile.html?e="+res['idCreator']);
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
            $("#see-event-iacc-link").css("display", "none");
            $("#event-settings-link").css("display", "none");
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