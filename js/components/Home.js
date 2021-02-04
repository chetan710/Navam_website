var home_page = {
    "product_slider": ".product-slider",
    "loader": '.loader',
    "pre_loader": "#preloder",
    "hero_slider": ".hero-slider",
    "sign_in_profile": ".sign-in-profile",
    "sign_out_profile": ".sign-out-profile",
    "signed_in_profile": ".signed-in-profile",
    "shopping_card": ".shopping-card",
    "product_section": ".product-section",
    "add_cart": ".add-card"
}

var isAnonymous;
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        isAnonymous = user.isAnonymous;
        if (!user.isAnonymous) {
            $getUserDetails();
            $(home_page.sign_in_profile).hide();
            $(home_page.sign_out_profile).show();
            $(home_page.signed_in_profile).show();
        } else {

            $(home_page.sign_in_profile).show();
            $(home_page.sign_out_profile).hide();
            $(home_page.signed_in_profile).hide();
        }

    } else {
        firebase.auth().signInAnonymously()
            .then(() => {})
            .catch((error) => {
                var errorCode = error.code;
                var errorMessage = error.message;
            });
        console.log("oops something went wrong")
    }
    $getCartItem();
    $loadHeroSlider();
});
function $getUserDetails() {
    return firebase.database().ref('users/' + firebase.auth().currentUser.uid).once('value').then(function(snapshot) {
        if (snapshot.val())
        $(home_page.signed_in_profile).find('a').html("Welcome " +snapshot.val().name);
    });
}
$(home_page.sign_out_profile).click(function() {
    firebase.auth().signOut().then(function() {window.location.href="index.html"}, function(error) {
        console.error('Sign Out Error', error);
    });
});

function $getCartItem() {
    return firebase.database().ref('Cart/' + firebase.auth().currentUser.uid).once('value').then(function(snapshot) {
        if (snapshot.val()) {
            let index = 0;
            snapshot.forEach(function(items) {
                items.forEach(function(subItems){
                 index++
                });
            });
            $(home_page.shopping_card).find("span").text(index);
        }
    }); 

}

function $loadHeroSlider() {
    return firebase.database().ref('/Sliders/').once('value').then(function(snapshot) {
        if (snapshot.val()) {
            snapshot.forEach(function(sliders) {
                if (sliders.val()) {
                    $(home_page.hero_slider).append(createHeroSliderHTML(sliders.val().sliderImageURL, sliders.val().sliderTitle, sliders.val().sliderDesc))
                }
            });
            createOwlCarouselForHeroSlider();
       }
    });
}

function $fadeInLoader() {
    $(home_page.loader).show();
    $(home_page.pre_loader).show();
}


function $fadeOutLoader() {
    $(home_page.loader).fadeOut();
    $(home_page.pre_loader).delay(1000).fadeOut("slow");
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
    }).on('translate.owl.carousel', function(e) {
        $('.owl-item video').each(function() {
            $(this).get(0).pause();
        });
    }).on('translated.owl.carousel', function(e) {
        if ($('.owl-item.active video').length) {
            $('.owl-item.active video').get(0).play();
        }
    });
    if (!isMobile()) {
        $('.owl-item .item').each(function() {
            var attr = $(this).attr('data-videosrc');
            if (typeof attr !== typeof undefined && attr !== false) {
                console.log('hit');
                var videosrc = $(this).attr('data-videosrc');
                $(this).prepend('<video><source src="' + videosrc + '" type="video/mp4"></video>');
            }
        });
        $('.owl-item.active video').attr('autoplay', true).attr('loop', true);
    }


    function isMobile(width) {
        if (width == undefined) {
            width = 719;
        }
        if (window.innerWidth <= width) {
            return true;
        } else {
            return false;
        }
    }

    $(home_page.hero_slider).append('<div class="slider-nav-warp"><div class="slider-nav"></div></div>');
    $(".hero-slider .owl-nav, .hero-slider .owl-dots").appendTo('.slider-nav');
    $loadAllProducts(250);
   
}

function createHeroSliderHTML(image, title, desc) {
    if (image.indexOf('.mp4') > -1) {
        return '<div class="item hs-item set-bg" data-videosrc=' + image + '>' +
            '</div>'
    } else {
        return '<div class="item">' +
            '<div class="hs-item set-bg" data-setbg=' + image + ' style="background-image: url(&quot;' + image + '&quot;)";">' +
            '<div class="container">' +
            '<div class="row">' +
            '<div class="col-xl-6 col-lg-7 text-white">' +
            '<h2>' + title + '</h2>' +
            '<p>' + desc + '</p>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>'
    }
}

function $loadAllProducts(quantity) {
    $(home_page.product_section).children().remove();
    return firebase.database().ref('/Products/').once('value').then(function(snapshot) {
        if (snapshot.val()) {
            snapshot.forEach(function(products) {
                $appendProductsSection(products, quantity)
            });
            $fadeOutLoader();
            
        }
    });
}

function $appendProductsSection(products, quantity) {
    if (products.val()) {
        let productName = products.val().productName;
        let productImage = products.val().productURL;
        let productId = products.key;
        let productAvailability = products.val().quantity[quantity] !== undefined ? products.val().productAvailability : "Out Of Stock";
        $(home_page.product_section).append('<div class="col-lg-3 col-sm-6 " id="' + productId + '">' +
            '<div class="product-item">' +
            '<div class="pi-pic"> <div class="tag-sale">' + productAvailability + '</div>' +
            '<img src="' + productImage + '" alt="' + productName + '" width="263px" height="408px">' +
            '<div class="pi-links"><a href="javascript:void(0)" class="add-card"><i class="flaticon-bag"></i><span>ADD TO CART</span></a></div></div>' +
            '<div class="pi-text" productQuantity =' + quantity + ' productAmount=' + products.val().quantity[quantity] + '>' + addPrice(products, quantity) + '<p>' + productName + '</p></div></div></div>')
          
    }

}

function addPrice(products, quantity) {
    if (products.val().quantity[quantity] !== undefined) {
        return '<h6>' + quantity + 'ml</h6><h6>₹' + products.val().quantity[quantity] + '</h6>'
    }
    return "<h6>" + quantity + "ml</h6>";
}

$(document).on('click', home_page.add_cart, function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (isAnonymous) {
        window.location.href = "account.html"
    } else {
        $fadeInLoader();
        let productId = $(this).closest('.product-item').parent().attr('id');
        let productQuantity = $(this).closest('.product-item').find('.pi-text').attr('productQuantity');
        let productAmount = $(this).closest('.product-item').find('.pi-text').attr('productAmount');
        addToCart(productId, productQuantity, productAmount)
    }
});

function addToCart(productId, productQuantity, productAmount) {
    firebase.database().ref('Cart/' + firebase.auth().currentUser.uid + "/" + productId+"/"+productQuantity).set({
        productQuantity: productQuantity,
        no_of_items: 1
    }).then((snapshot) => {
        $getCartItem();
        $fadeOutLoader();
    })
}
