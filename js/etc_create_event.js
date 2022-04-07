$(document).ready(function(){
    //array categ
    var arrCateg=[];


    //Get today date and set min-date
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = yyyy+'-'+ mm + '-' + dd +"T00:00";
    $("#id-date-time").val(today);
    $("#id-date-time").attr('min', today);

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
                alert("You cannot add more than 3 pictures: "+input.files.length);
                $("#event-pictures").val(null);
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
        let eventDescription = $("#id-description").val();
        let eventLocation = $("#id-location").val();
        let eventDateTime = $("#id-date-time").val();
        let eventArrCateg = arrCateg;
        let eventNbrTicket = $("#id-nbr-ticket").val();
        let eventTicketPrice = $("#id-unit-price").val();
        let priceCurrency = $("#idCurrency").val();
        let paymentMethod = $("input[name='payment-method']:checked").val();

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
            formData.append('description', eventDescription);
            formData.append('location', eventLocation);
            formData.append('dateTime', eventDateTime);
            formData.append('nbrTicket', eventNbrTicket);
            formData.append('ticketPrice', eventTicketPrice);
            formData.append('currency', priceCurrency);
            formData.append('paymentMethod', paymentMethod);

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
                }
               });

            //alert(eventTitle + eventLocation + eventDateTime);
        }
        else{
            alert("Empty required fields");
        }
    });


});


//display categories into box
function displayCateg(categ, index){
    let addedCateg = "<span class='categ-unit'>"+categ+"<a class='x-delete' id='"+index+"'>X</a></span>";
    $("#event-categ").append(addedCateg);
}