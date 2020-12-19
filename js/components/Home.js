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
            $loadLatestDesigns();
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
        smartSpeed: 1200,
        autoHeight: false,
        autoplay: true,
        onInitialized: function() {
            var a = this.items().length;
            $("#snh-1").html("<span>1</span><span>" + a + "</span>");
        }
    }).on("changed.owl.carousel", function(a) {
        var b = --a.item.index,
            a = a.item.count;
        $("#snh-1").html("<span> " + (1 > b ? b + a : b > a ? b - a : b) + "</span><span>" + a + "</span>");
    });

    $(home_page.hero_slider).append('<div class="slider-nav-warp"><div class="slider-nav"></div></div>');
    $(".hero-slider .owl-nav, .hero-slider .owl-dots").appendTo('.slider-nav');
}

function createHeroSliderHTML(image,title,desc) {
   return '<div class="hs-item set-bg" data-setbg='+image+' style="background-image: url(&quot;'+image+'&quot;)";">' +
        '<div class="container">' +
        '<div class="row">' +
       '<div class="col-xl-6 col-lg-7 text-white">' +
        '<h2>'+title+'</h2>' +
        '<p>'+desc+'</p>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' 
}
