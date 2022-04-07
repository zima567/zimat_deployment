$(document).ready(function(){

    var bio = "Steven Paul Jobs was born on February 24, 1955 in San Francisco, California. His unwed biological parents, Joanne Schieble and Abdulfattah Jandali\
    California. His unwed biological parents, Joanne Schieble and Abdulfattah Jandali";
    var subs = 5400;
    //Process the bio and display it
    var bioProcessed = displayBio(bio);
    $("#user_bio_text").text(bioProcessed);
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

    //Display the total of followers
    $("#total_subscribers").text(displayTotalSubscribers(subs));

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

});

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

function displayFullBio(bio){
    $("#see-more").css("display", "none");
    $("#see-less").css("display", "block");
    return bio;
}

function displayTotalSubscribers(total){
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