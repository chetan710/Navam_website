var productDetails_page = {
    "loader": '.loader',
    "pre_loader": "#preloder",
    "sign_in_profile": ".sign-in-profile",
    "sign_out_profile": ".sign-out-profile",
    "signed_in_profile": ".signed-in-profile",
    "product_title": ".p-title",
    "product_price": ".p-price",
    "product_stock": ".p-stock",
    "product_description": ".panel-body",
    "product_image": ".product-big-img",
    "quantity_options": ".quantities",
    "qunatity_radio": ".amount-radio-btn",
    "shopping_card": ".shopping-card",
    "sign_out_profile": ".sign-out-profile",
    "add_cart": ".add-card",
    "add_cart_main": ".add-card-main",
    "product_section": '.product-slider',
    "rating": ".rating",
    "total_count": ".total-count"
}
var isAnonymous;

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        isAnonymous = user.isAnonymous;
        if (!user.isAnonymous) {
            $getUserDetails();
            $(productDetails_page.sign_in_profile).hide();
            $(productDetails_page.sign_out_profile).show();
            $(productDetails_page.signed_in_profile).show();
            $(productDetails_page.signed_in_profile).find('a').html("Welcome");
        } else {

            $(productDetails_page.sign_in_profile).show();
            $(productDetails_page.sign_out_profile).hide();
            $(productDetails_page.signed_in_profile).hide();
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
    getProductDetails();
    getRatings("load");
    $getCartItem();
});
function $getUserDetails() {
    return firebase.database().ref('users/' + firebase.auth().currentUser.uid).once('value').then(function(snapshot) {
        if (snapshot.val())
        $(productDetails_page.signed_in_profile).find('a').html("Welcome " +snapshot.val().name);
    });
}
$(productDetails_page.sign_out_profile).click(function() {
    firebase.auth().signOut().then(function() {
        window.location.href = "index.html"
    }, function(error) {
        console.error('Sign Out Error', error);
    });
});
$(productDetails_page.rating).click(function() {
    $fadeInLoader();
    let rated = $(this).index() + 1;
    firebase.database().ref('product-scores/ratings/' + window.location.hash.substr(1).split("/")[0] + "/" + rated).set({
        rated: eval($(productDetails_page.rating).eq($(this).index()).attr("total-ratings")) + 1,
    }).then((snapshot) => {
        firebase.database().ref('product-scores/ratings/' + window.location.hash.substr(1).split("/")[0] + "/average").set({
        average: 0,
    }).then((snapshot) => {
        getRatings("");
        $fadeOutLoader();
    })
    })

});
function getRatings(type) {
    var totalValues = 0
    var averageRating = 0
    return firebase.database().ref('product-scores/ratings/' + window.location.hash.substr(1).split("/")[0]).once('value').then(function(snapshot) {
        if (snapshot.val()) {
            snapshot.forEach(function(items) {
                if(items.key!=="average") {
                $(productDetails_page.rating).eq(parseInt(items.key) - 1).attr("total-ratings", items.val().rated);
                totalValues = totalValues + (items.key * items.val().rated)
                averageRating = averageRating + items.val().rated
            }
            });

        $(productDetails_page.total_count).text("("+averageRating + ")")
        let average = Math.round((totalValues / averageRating));
        console.log(average)
        for (var i = 0; i < average; i++) {
            $(productDetails_page.rating).eq(i).removeClass('fa-star-o').addClass('fa-star')
        }
        if (type !== 'load') {
            firebase.database().ref('product-scores/ratings/' + window.location.hash.substr(1).split("/")[0] +"/average").set({
                average: average
            })
        }
        }
    });
}

function getProductDetails() {
    let productId = window.location.hash.substr(1).split("/")[0];
    let productQuantity = window.location.hash.substr(1).split("/")[1];
    if (productId !== "" && productQuantity !== "") {
        return firebase.database().ref('/Products/' + productId).once('value').then(function(snapshot) {
            if (snapshot.val()) {
                $(productDetails_page.product_image).attr('src', snapshot.val().productURL);
                $(productDetails_page.product_image).next('img').attr('src', snapshot.val().productURL);
                $(productDetails_page.product_title).text(snapshot.val().productName);
                $(productDetails_page.product_stock).find('span').text(snapshot.val().productAvailability);
                $(productDetails_page.product_description).text(snapshot.val().productDescription);
                appenQuantities(snapshot.val().quantity);
                $('.quantity-option').find("[productQuantity='" + productQuantity + "']").prev().click();
                $loadAllProducts(250);
            }
        });
    }

}

$(document).on('click', productDetails_page.add_cart_main, function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (isAnonymous) {
        window.location.href = "account.html"
    } else {
        $fadeInLoader();
        let productId = window.location.hash.substr(1).split("/")[0];
        let productQuantity = $('input[name="sc"]:checked').parent().find('label').attr("productQuantity")
        let productAmount = $('input[name="sc"]:checked').attr("amount");
        if (productQuantity !== undefined) {
            addToCart(productId, productQuantity, productAmount);

            $('.error').hide();
        } else {
            $('.error').show();
            $fadeOutLoader();
        }
    }
});

function addToCart(productId, productQuantity, productAmount) {
    firebase.database().ref('Cart/' + firebase.auth().currentUser.uid + "/" + productId + "/" + parseInt(productQuantity)).set({
        productQuantity: productQuantity,
        no_of_items: 1
    }).then((snapshot) => {
        $getCartItem();
        $fadeOutLoader();
    })
}


function appenQuantities(quantities) {
    if (quantities[250] !== undefined)
        $(productDetails_page.quantity_options).append('<div class="sc-item quantity-option"><input type="radio" class="amount-radio-btn" name="sc" id="xs-size" amount="' + quantities[250] + '"><label for="xs-size" productQuantity="250">250 ml</label></div>')

    if (quantities[500] !== undefined)
        $(productDetails_page.quantity_options).append('<div class="sc-item quantity-option"><input type="radio" class="amount-radio-btn" name="sc" id="s-size" amount="' + quantities[500] + '"><label for="s-size" productQuantity="500">500 ml</label></div>')
    if (quantities[1000] !== undefined)
        $(productDetails_page.quantity_options).append('<div class="sc-item quantity-option"><input type="radio" class="amount-radio-btn" name="sc" id="m-size" amount="' + quantities[1000] + '"><label for="m-size" productQuantity="1000">1000 ml</label></div>')
    if (quantities[5000] !== undefined)
        $(productDetails_page.quantity_options).append('<div class="sc-item quantity-option"><input type="radio" class="amount-radio-btn" name="sc" id="l-size" amount="' + quantities[5000] + '"><label for="l-size" productQuantity="5000">5000 ml</label></div>')

}

function $fadeInLoader() {
    $(productDetails_page.loader).show();
    $(productDetails_page.pre_loader).show();
}

function $fadeOutLoader() {
    $(productDetails_page.loader).fadeOut();
    $(productDetails_page.pre_loader).delay(1000).fadeOut("slow");
}

$(document).on('click', productDetails_page.qunatity_radio, function() {
    $(productDetails_page.product_price).text("₹" + $(this).attr('amount'));
});

function $getCartItem() {
    return firebase.database().ref('Cart/' + firebase.auth().currentUser.uid).once('value').then(function(snapshot) {
        if (snapshot.val()) {
            let index = 0;
            snapshot.forEach(function(items) {
                items.forEach(function(subItems) {
                    index++
                });
            });
            $(productDetails_page.shopping_card).find("span").text(index);
        }
    });

}

function $createCarouselForProducts() {
    $('.product-slider').owlCarousel({
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

function $loadAllProducts(quantity) {
    $(productDetails_page.product_section).children().remove();
    return firebase.database().ref('/Products/').once('value').then(function(snapshot) {
        if (snapshot.val()) {
            snapshot.forEach(function(products) {
                $appendProductsSection(products, quantity)
            });
            $createCarouselForProducts()
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
        $(productDetails_page.product_section).append('<div class="product-item" id="' + productId + '">' +
            '<div class="pi-pic"> <div class="tag-sale">' + productAvailability + '</div>' +
            '<img src="' + productImage + '" alt="' + productName + '" width="263px" height="408px">' +
            '<div class="pi-links"><a href="javascript:void(0)" class="add-card"><i class="flaticon-bag"></i><span>ADD TO CART</span></a></div></div>' +
            '<div class="pi-text" productQuantity =' + quantity + ' productAmount=' + products.val().quantity[quantity] + '>' + addPrice(products, quantity) + '<p>' + productName + '</p></div></div>')
    }

}

function addPrice(products, quantity) {
    if (products.val().quantity[quantity] !== undefined) {
        return '<h6>' + quantity + 'ml</h6><h6>₹' + products.val().quantity[quantity] + '</h6>'
    }
    return "<h6>" + quantity + "ml</h6>";
}

$(document).on('click', productDetails_page.add_cart, function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (isAnonymous) {
        window.location.href = "account.html"
    } else {
        $fadeInLoader();
        let productId = $(this).closest('.product-item').attr('id');
        let productQuantity = $(this).closest('.product-item').find('.pi-text').attr('productQuantity');
        let productAmount = $(this).closest('.product-item').find('.pi-text').attr('productAmount');
        addToCart(productId, productQuantity, productAmount)
    }
});

function addToCart(productId, productQuantity, productAmount) {
    firebase.database().ref('Cart/' + firebase.auth().currentUser.uid + "/" + productId + "/" + productQuantity).set({
        productQuantity: productQuantity,
        no_of_items: 1
    }).then((snapshot) => {
        $getCartItem();
        $fadeOutLoader();
    })
}

$(document).on('click', '.product-item', function() {
    let hashValue = $(this).attr('id') + "/" + $(this).find('.pi-text').attr('productQuantity');
    window.location.href = "productdetails.html#" + hashValue
    location.reload();
})
