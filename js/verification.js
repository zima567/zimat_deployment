$(document).ready(function(){
    //Start of processing the sent URL
    let getRps1 = getUrlParameter("m");
    let getRps0 = getUrlParameter("er");
    
    if(getRps1!=false && getRps1!=true){
        //verified or already verified
        if(getRps1 =="VERIFIED"){
            $imgSource ="media/icons/success.gif";
            $("#confirmation-img").attr("src",$imgSource);

            $text = "Congratulations! Email was verified successfully!";
            $("#confirmation-msg").text($text);
        }
        else if(getRps1 == "ALREADY_VERIFIED"){
            $imgSource ="media/icons/failed.gif";
            $("#confirmation-img").attr("src",$imgSource);

            $text = "Oops! This email address has been already verified";
            $("#confirmation-msg").text($text);
        
        }
        else{
            $imgSource ="media/icons/failed.gif";
            $("#confirmation-img").attr("src",$imgSource);

            $text = getRps0;
            $("#confirmation-msg").text($text);
        }
    }
    else if(getRps0!=false && getRps0!=true){
        //couldn't be verified
        if(getRps0 =="VARS_UNMATCHED_OR_NOT_EXIST"){
            $imgSource ="media/icons/failed.gif";
            $("#confirmation-img").attr("src",$imgSource);

            $text = "Oops! Something is wrong here. We have found unmatch details.";
            $("#confirmation-msg").text($text);

        }
        else if(getRps0 =="GET_VARS_NOT_FOUND"){
            $imgSource ="media/icons/failed.gif";
            $("#confirmation-img").attr("src",$imgSource);

            $text = "Oops, sorry! We have found nothing to verify";
            $("#confirmation-msg").text($text);

        }
        else{
            $imgSource ="media/icons/failed.gif";
            $("#confirmation-img").attr("src",$imgSource);

            $text = "Something went wrong. If it persists contact customer service";
            $("#confirmation-msg").text($text);

        }
    }
    else{
        $imgSource ="media/icons/failed.gif";
        $("#confirmation-img").attr("src",$imgSource);

        $text = "Something went wrong with the URL";
        $("#confirmation-msg").text($text);

    }
    //End of processus sent URL

});

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
    return false;
};