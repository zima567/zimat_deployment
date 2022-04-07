$(document).ready(function(){
    //Start of processing the sent URL
    let getRps1 = getUrlParameter("m");
    let getRps0 = getUrlParameter("er");
    
    if(getRps1!=false && getRps1!=true){
        //verified or already verified
        if(getRps1 =="VERIFIED"){
            $imgSource ="media/icons/verified1.png";
            $("#id-img-verification").attr("src",$imgSource);

            $text = "Congratulations! Your email has been successfully verified.";
            $("#id-text-verification").text($text);

            $("#id-btn-acc").css("display", "block");
            $("#id-btn-home").css("display", "block");
        }
        else if(getRps1 == "ALREADY_VERIFIED"){
            $imgSource ="media/icons/verified2.png";
            $("#id-img-verification").attr("src",$imgSource);

            $text = "Oops! This email address has been already verified";
            $("#id-text-verification").text($text);

            $("#id-btn-acc").css("display", "block");
            $("#id-btn-home").css("display", "block");

        }
        else{
            $imgSource ="media/icons/zimaware-logo-temp.png";
            $("#id-img-verification").attr("src",$imgSource);

            $text = getRps0;
            $("#id-text-verification").text($text);

            $("#id-btn-acc").css("display", "none");
            $("#id-btn-home").css("display", "block");
        }
    }
    else if(getRps0!=false && getRps0!=true){
        //couldn't be verified
        if(getRps0 =="VARS_UNMATCHED_OR_NOT_EXIST"){
            $imgSource ="media/icons/not_verified1.png";
            $("#id-img-verification").attr("src",$imgSource);

            $text = "Oops! Something is wrong here. We have found unmatch details.";
            $("#id-text-verification").text($text);

            $("#id-btn-acc").css("display", "none");
            $("#id-btn-home").css("display", "block");
        }
        else if(getRps0 =="GET_VARS_NOT_FOUND"){
            $imgSource ="media/icons/not_verified1.png";
            $("#id-img-verification").attr("src",$imgSource);

            $text = "Oops, sorry! We have found nothing to verify";
            $("#id-text-verification").text($text);

            $("#id-btn-acc").css("display", "none");
            $("#id-btn-home").css("display", "block");
        }
        else{
            $imgSource ="media/icons/zimaware-logo-temp.png";
            $("#id-img-verification").attr("src",$imgSource);

            $text = "Something went wrong. If it persists contact customer service";
            $("#id-text-verification").text($text);

            $("#id-btn-acc").css("display", "none");
            $("#id-btn-home").css("display", "block");
        }
    }
    else{
        $imgSource ="media/icons/zimaware-logo-temp.png";
        $("#id-img-verification").attr("src",$imgSource);

        $text = "Something went wrong with the URL";
        $("#id-text-verification").text($text);

        $("#id-btn-acc").css("display", "none");
        $("#id-btn-home").css("display", "block");
    }
    //End of processus sent URL

    //Manage button clicks
    //If account button is clicked
    $("#id-btn-acc").on("click", function(){
        let url = "lsrs_login.html";
        window.location.replace(url);
    });

    //If home page button is clicked
    $("#id-btn-home").on("click", function(){
        let url = "lsrs_login.html";
        window.location.replace(url);
    });
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