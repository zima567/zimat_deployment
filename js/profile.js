var bio ="";

$(document).ready(function(){

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
    standardFunctionRequest(destination, obj, stdDisplayUserInfo);

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

    //Flip card event JS
    
    $("#container-events-flip-card").on("click", ".card-event", function(e){
        e.preventDefault();
        this.classList.toggle('is-flipped');
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
        bio = res['bio'];
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

function standardFunctionRequest(destination, dataObj, helperFunc){
    $.ajax({
        url: destination,
        data: dataObj,
        type: "POST",
        //dataType : "json",
    })
    .done(function( response ) {
        helperFunc(response);
        console.log(response);
    })
    .fail(function( xhr, status, errorThrown ) {
        alert( "Sorry, there was a problem!" );
        console.log( "Error: " + errorThrown );
        console.log( "Status: " + status );
        console.dir( xhr );
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
        $("#container-events-flip-card").append(HTMLEventElement);

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