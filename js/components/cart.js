var cart_page = {
    "loader": '.loader',
    "pre_loader": "#preloder",
    "sign_in_profile": ".sign-in-profile",
    "sign_out_profile": ".sign-out-profile",
    "signed_in_profile": ".signed-in-profile",
    "product_section": ".product-section",
    "quantity": ".quantity-option",
    "product_item": ".product-item",
    'prop_qty': '.pro-qty',
    'product_price': '.product-price',
    'empty_cart': '.empty-cart',
    'cart_table': '.cart-table',
    "shopping_card": ".shopping-card",
    "sign_out_profile": ".sign-out-profile",
    "add_cart": ".add-card",
    "product_section": '.product-slider'
}

var isAnonymous;

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        isAnonymous = user.isAnonymous;
        if (!user.isAnonymous) {
            $(cart_page.sign_in_profile).hide();
            $(cart_page.sign_out_profile).show();
            $(cart_page.signed_in_profile).show();
            $(cart_page.signed_in_profile).find('a').html("Welcome");
        } else {

            $(cart_page.sign_in_profile).show();
            $(cart_page.sign_out_profile).hide();
            $(cart_page.signed_in_profile).hide();
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
    getCartItems();
    $getCartItem();
    $loadAllProducts(250)
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
            $(cart_page.shopping_card).find("span").text(index);
        }
    });

}

$(cart_page.sign_out_profile).click(function() {
    firebase.auth().signOut().then(function() {
        window.location.href = "index.html"
    }, function(error) {
        console.error('Sign Out Error', error);
    });
});

function $fadeInLoader() {
    $(cart_page.loader).show();
    $(cart_page.pre_loader).show();
}

function $fadeOutLoader() {
    $(cart_page.loader).fadeOut();
    $(cart_page.pre_loader).delay(1000).fadeOut("slow");
}

function getCartItems() {
    return firebase.database().ref('/Cart/' + firebase.auth().currentUser.uid).once('value').then(function(snapshot) {
        if (snapshot.val()) {
            $(cart_page.empty_cart).hide();
            $(cart_page.cart_table).show();
            snapshot.forEach(function(product) {
                var productId = product.key;
                product.forEach(function(quantity) {
                    var productQuantity = quantity.key;
                    var productNoOfItems = quantity.val().no_of_items;
                    getProductDetails(productId, productQuantity, productNoOfItems)
                });
            });
            $fadeOutLoader();
        } else {
            $(cart_page.empty_cart).show();
            $(cart_page.cart_table).hide();
            $fadeOutLoader();
        }
    });
}

function getProductDetails(productId, quantity, productNoOfItems) {
    return firebase.database().ref('/Products/' + productId).once('value').then(function(products) {
        if (products.val()) {
            let productName = products.val().productName;
            let productImage = products.val().productURL;
            let productAvailability = products.val().quantity[quantity] !== undefined ? products.val().productAvailability : "Out Of Stock";
            let productPrice = productAvailability === 'Out Of Stock' ? 0 : products.val().quantity[parseInt(quantity)];
            appendCartItems(productName, productImage, productPrice, productAvailability, productId, quantity, productNoOfItems);
            getTotalCartAmount("add");
        }
    });
}


function appendCartItems(productName, productImage, productPrice, productAvailability, productId, quantity, productNoOfItems) {
    $('tbody').append(
        '<tr><td class="product-col"> <img src=' + productImage + '  alt=' + productName + '> <div class="pc-title"><h4>' + productName + '</h4><p>₹' + productPrice + '</p><p>' + quantity + 'ml</p></div></td>' +
        '<td class="quy-col"><div class="quantity"><div class="pro-qty"><span class="dec qtybtn">-</span><input type="text" value=' + productNoOfItems + ' productquantity=' + quantity + ' productid=' + productId + ' productprice=' + productPrice + '><span class="inc qtybtn">+</span></div></div></td>' +
        '<td class="total-col product-availability"><h4>' + productAvailability + '</h4></td><td class="total-col product-price"><h4>₹' + productPrice * productNoOfItems + '</h4></td></tr>');
}



$(document).on('click', '.qtybtn', function() {
    var type;
    var $button = $(this);
    var oldValue = $button.parent().find('input').val();
    var productId = $button.parent().find('input').attr('productId');
    var productQuantity = $button.parent().find('input').attr('productquantity');
    if ($button.hasClass('inc')) {
        var newVal = parseFloat(oldValue) + 1;
        type = "add";
        updateCart($button, type, productId, productQuantity, newVal);
    } else {
        type = "subtract"
        if (oldValue > 1) {
            var newVal = parseFloat(oldValue) - 1;
            updateCart($button, type, productId, productQuantity, newVal)
        } else {
            newVal = 1;
        }
    }
});

function updateCart($button, type, productId, productQuantity, newVal) {

    firebase.database().ref('Cart/' + firebase.auth().currentUser.uid + "/" + productId + "/" + productQuantity).set({
        productQuantity: productQuantity,
        no_of_items: newVal
    }).then((snapshot) => {
        $button.parent().find('input').val(newVal);
        let productPrice = $button.parent().find('input').attr('productprice');
        let currentPrice = $button.parents('.quy-col').siblings(cart_page.product_price).find('h4').text().split('₹')[1]
        $button.parents('.quy-col').siblings(cart_page.product_price).find('h4').text('₹' + parseFloat(type === "add" ? parseFloat(currentPrice) + parseFloat(productPrice) : parseFloat(currentPrice) - parseFloat(productPrice)));
        getTotalCartAmount(type);

    });
}

function getTotalCartAmount(type) {
    let totalAmount = 0;
    for (var i = 0; i < $('.product-price h4').length; i++) {
        if ($($('.product-price h4')[i]).text() !== '₹undefined') {
            totalAmount = totalAmount + parseFloat($($('.product-price h4')[i]).text().split('₹')[1]);
        }

    }
    $('.total-cost h4').text('₹' + totalAmount);
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
    $(cart_page.product_section).children().remove();
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
        $(cart_page.product_section).append('<div class="product-item" id="' + productId + '">' +
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

$(document).on('click', cart_page.add_cart, function(e) {
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
        $('tbody').children().remove();
        getCartItems();
        $fadeOutLoader();
    })
}

$(document).on('click', '.product-item', function() {
    let hashValue = $(this).attr('id') + "/" + $(this).find('.pi-text').attr('productQuantity');
    window.location.href = "productdetails.html#" + hashValue
})