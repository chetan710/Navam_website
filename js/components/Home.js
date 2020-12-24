var home_page = {
    "product_slider": ".product-slider",
    "loader": '.loader',
    "pre_loader": "#preloder",
    "hero_slider": ".hero-slider"
}

firebase.auth().signInAnonymously()
    .then(() => {})
    .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
    });


firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        $loadHeroSlider();
    } else {
        console.log("oops something went wrong")
    }
});

function $loadHeroSlider() {
    return firebase.database().ref('/Sliders/').once('value').then(function(snapshot) {
        if (snapshot.val()) {
            snapshot.forEach(function(sliders) {
                if (sliders.val()) {
                    $(home_page.hero_slider).append(createHeroSliderHTML(sliders.val().sliderImageURL, sliders.val().sliderTitle,sliders.val().sliderDesc))
                }
            });
            createOwlCarouselForHeroSlider();
            setTimeout(function(){
                $fadeOutLoader();
            }, 3000);
            //$loadLatestDesigns();
        }
    });
}

function $loadLatestDesigns() {
    return firebase.database().ref('/Products/').once('value').then(function(snapshot) {
        if (snapshot.val()) {
            snapshot.forEach(function(category) {
                if (category.val() && category.val().productLatest) {
                    $(home_page.product_slider).append(createLatestDesignsHTML(category.val().productURL, category.val().productName))
                }
            });
            createOwlCarouselForProductSlider();
            $fadeOutLoader();
        }
    });
}

function $fadeOutLoader() {
    $(home_page.loader).fadeOut();
    $(home_page.pre_loader).delay(1000).fadeOut("slow");
}

function createOwlCarouselForProductSlider() {
    $(home_page.product_slider).owlCarousel({
        loop: true,
        nav: true,
        dots: false,
        margin: 30,
        autoplay: true,
        navText: ['<i class="flaticon-left-arrow-1"></i>', '<i class="flaticon-right-arrow-1"></i>'],
        responsive: {
            0: {
                items: 1,
            },
            480: {
                items: 2,
            },
            768: {
                items: 3,
            },
            1200: {
                items: 4,
            }
        }
    });
}

function createOwlCarouselForHeroSlider() {
    $(home_page.hero_slider).owlCarousel({
        loop: true,
        margin: 0,
        nav: true,
        items: 1,
        dots: true,
        animateOut: 'fadeOut',
        animateIn: 'fadeIn',
        navText: ['<i class="flaticon-left-arrow-1"></i>', '<i class="flaticon-right-arrow-1"></i>'],
        autoHeight: false,
        onInitialized: function() {
            var a = this.items().length;
            $("#snh-1").html("<span>1</span><span>" + a + "</span>");
        }
    }).on("changed.owl.carousel", function(a) {
        var b = --a.item.index,
            a = a.item.count;
        $("#snh-1").html("<span> " + (1 > b ? b + a : b > a ? b - a : b) + "</span><span>" + a + "</span>");
    }).on('translate.owl.carousel',function(e){
        $('.owl-item video').each(function(){
          $(this).get(0).pause();
        });
    }).on('translated.owl.carousel',function(e){
        if($('.owl-item.active video').length){
          $('.owl-item.active video').get(0).play();
        }
    });
    if(!isMobile()){
        $('.owl-item .item').each(function(){
            var attr = $(this).attr('data-videosrc');
            if (typeof attr !== typeof undefined && attr !== false) {
                console.log('hit');
                var videosrc = $(this).attr('data-videosrc');
                $(this).prepend('<video muted><source src="'+videosrc+'" type="video/mp4"></video>');
            }
        });
        $('.owl-item.active video').attr('autoplay',true).attr('loop',true);
    }


    function isMobile(width) {
        if(width == undefined){
          width = 719;
        }
        if(window.innerWidth <= width) {
          return true;
        } else {
          return false;
        }
    }

    $(home_page.hero_slider).append('<div class="slider-nav-warp"><div class="slider-nav"></div></div>');
    $(".hero-slider .owl-nav, .hero-slider .owl-dots").appendTo('.slider-nav');
}

function createHeroSliderHTML(image,title,desc) {
   if(image.indexOf('.mp4') > -1) {
        return '<div class="item hs-item set-bg" data-videosrc='+image+'>'+
               '</div>'
   } else {
        return  '<div class="item">'+
                '<div class="hs-item set-bg" data-setbg='+image+' style="background-image: url(&quot;'+image+'&quot;)";">' +
                '<div class="container">' +
                '<div class="row">' +
                '<div class="col-xl-6 col-lg-7 text-white">' +
                '<h2>'+title+'</h2>' +
                '<p>'+desc+'</p>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>'
   }
}
