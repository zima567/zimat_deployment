$(document).ready(function(){
    var typeSearch = "DEFAULT";

    //GET URL PARAMETERS
    let URLType = getUrlParameter("type");
    if(URLType){
        if(URLType=="user"){
            typeSearch = "USER";
            $(".search-option button").removeClass("btn-active");
            $("#search_for_user").addClass("btn-active");

        }
        else if(URLType=="event"){
            typeSearch = "EVENT";
            $(".search-option button").removeClass("btn-active");
            $("#search_for_event").addClass("btn-active");

        }
        else if(URLType=="all"){
            typeSearch = "DEFAULT";
            $(".search-option button").removeClass("btn-active");
            $("#search_for_all").addClass("btn-active");
        }
    }

    //HANDLE SEARCH FILTER
    $("#search_for_all").on("click", function(){
        $(".search-option button").removeClass("btn-active");
        $("#search_for_all").addClass("btn-active");

        typeSearch = "DEFAULT";
        let search_query = $("#searchQueryInput").val().trim();
        if(search_query!=""){
            HttpRequestSearch(typeSearch, search_query, EOUPReturn);
        }
    });

    $("#search_for_user").on("click", function(){
        $(".search-option button").removeClass("btn-active");
        $("#search_for_user").addClass("btn-active");

        typeSearch = "USER";
        let search_query = $("#searchQueryInput").val().trim();
        if(search_query!=""){
            HttpRequestSearch(typeSearch, search_query, EOUPReturn);
        }
    });

    $("#search_for_event").on("click", function(){
        $(".search-option button").removeClass("btn-active");
        $("#search_for_event").addClass("btn-active");

        typeSearch = "EVENT";
        let search_query = $("#searchQueryInput").val().trim();
        if(search_query!=""){
            HttpRequestSearch(typeSearch, search_query, EOUPReturn);
        }

    });

    $("#searchQueryInput").on("keyup", function(){
        let search_query = $("#searchQueryInput").val().trim();
        if(search_query!=""){
            HttpRequestSearch(typeSearch, search_query, EOUPReturn);
        }
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

function appendCards(arr, type){
    if(arr.length>0){
        //Array contain elements
        if(type=="USER"){
            for(let i=0; i<arr.length;i++){
                let userUnit = arr[i];
                let userProfile = userUnit['avatar'];

                if(userUnit['avatar']=="NONE"){
                    userProfile = "media/icons/user-icon.png";
                }

                let HTMLUserUnit = '<div class="card">\
                    <div class="body">\
                        <div class="row">\
                            <div class="col-lg-4 col-md-4 col-12">\
                                <div class="profile-image float-md-right"> <img src="media/icons/loadingSpinner.gif" class="lazy" data-src="'+userProfile+'" data-srcset="'+userProfile+'" alt="" width="100%"> </div>\
                            </div>\
                            <div class="col-lg-8 col-md-8 col-12">\
                                <h4 class="m-t-0 m-b-0"><strong>'+userUnit['lastName']+'</strong> '+userUnit['firstName']+'</h4>\
                                <span class="job_post">'+userUnit['username']+'</span>\
                                <p>'+userUnit['location']+'</p>\
                            <div>\
                                    <a href="profile.html?e='+userUnit['idUser']+'"><button class="btn btn-primary btn-round">View profile</button></a>\
                                </div>\
                        </div> \
                    </div>\
                    </div>\
                    </div>';

                    //Append user to catalogue
                    $("#catalogue-result").append(HTMLUserUnit);

            }
        }
        else if(type=="EVENT"){
            for(let i=0; i<arr.length;i++){
                let eventUnit = arr[i];
                let eventPoster = eventUnit['poster'];

                if(eventUnit['poster']=="NONE"){
                    eventPoster = "media/icons/no-bg-post.jpg";
                }
                let HTMLEventUnit = '<div class="card event-card">\
                    <div class="body">\
                        <div class="row">\
                            <div class="col-lg-4 col-md-4 col-12">\
                                <div class="profile-image float-md-right"> <img src="media/icons/loadingSpinner.gif" class="lazy" data-src="'+eventPoster+'" data-srcset="'+eventPoster+'"  alt="" width="100%"> </div>\
                            </div>\
                            <div class="col-lg-8 col-md-8 col-12">\
                                <h4 class="m-t-0 m-b-0">'+eventUnit['title']+'</h4>\
                                <span class="job_post">by '+eventUnit['username']+'</span>\
                                <p>'+eventUnit['postMessage']+'</p>\
                                <div>\
                                    <a href="etc_display_event.html?e='+eventUnit['idEvent']+'"><button class="btn btn-primary btn-round">View event</button></a>\
                                </div>\
                                <p class="m-t-5 m-b-0">\
                                    <span style="display: flex; flex-direction: row; align-items:center"><span><img src="media/icons/clock.png" width="16px"/></span><strong>'+eventUnit['dateTime']+'</strong></span>\
                                    <span style="display: flex; flex-direction: row; align-items:center"><span><img src="media/icons/price.png" width="16px"/></span><strong>'+eventUnit['price']+'</strong></span>\
                                    <span style="display: flex; flex-direction: row; align-items:center"><span><img src="media/icons/location.png" width="16px"/></span><strong>'+eventUnit['location']+'</strong></span>\
                                </p>\
                            </div>\
                        </div>\
                    </div>\
                    </div>';

                    //Append user to catalogue
                    $("#catalogue-result").append(HTMLEventUnit);

            }

        }
        return 1;
    }
    return -1;
    
}

function EOUPReturn(res){
    //Clean the result catalogue
    $("#catalogue-result").empty();

    if(res['typeSearch']=="USER"){
        let arrUsers = res['search_user'];
        let returnSearchStatus = appendCards(arrUsers, res['typeSearch']);
        if(returnSearchStatus==-1){
            $("#catalogue-result").append("<h4>No user found...</h4>");
        }

    }
    else if(res['typeSearch']=="EVENT"){
        let arrEvents = res['search_event'];
        let returnSearchStatus = appendCards(arrEvents, res['typeSearch']);
        if(returnSearchStatus==-1){
            $("#catalogue-result").append("<h4>No event found...</h4>");
        }
    }
    else if(res['typeSearch']=="DEFAULT"){
        let arrUsers = res['search_user'];
        let returnSearchStatusUser = appendCards(arrUsers, "USER");

        let arrEvents = res['search_event'];
        let returnSearchStatusEvent = appendCards(arrEvents, "EVENT");

        if(returnSearchStatusUser==-1 && returnSearchStatusEvent==-1){
            $("#catalogue-result").append("<h4>No user or event found...</h4>");
        }

    }

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

function HttpRequestSearch(typeSearchparam, searchQueryparam, funcProcessor){

    $.ajax({
        url: "api_php/api_etc_search.php",
        data: {typeSearch: typeSearchparam, search_query: searchQueryparam},
        type: "POST",
        dataType : "json",
        beforeSend:function(){
            $("#catalogue-result").html("<img src='media/icons/loadingSearch.gif' style='width:100px;'/>");
        }
    })
    .done(function( response ) {
        //console.log(response);
        funcProcessor(response);
    })
    .fail(function( xhr, status, errorThrown ){
        alert( "Sorry, there was a problem!" );
        console.log( "Error: " + errorThrown );
        console.log( "Status: " + status );
        console.dir( xhr );
    });

}
