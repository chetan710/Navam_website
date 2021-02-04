var myorders_page = {
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
    "shopping_card": ".shopping-card",
    "sign_out_profile": ".sign-out-profile",
    "product_list": ".product-list",
    "price_list": ".price-list"
}

var isAnonymous;

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        isAnonymous = user.isAnonymous;
        if (!user.isAnonymous) {
            $(myorders_page.sign_in_profile).hide();
            $(myorders_page.sign_out_profile).show();
            $(myorders_page.signed_in_profile).show();
            $(myorders_page.signed_in_profile).find('a').html("Welcome");
        } else {

            $(myorders_page.sign_in_profile).show();
            $(myorders_page.sign_out_profile).hide();
            $(myorders_page.signed_in_profile).hide();
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
    getOrders();
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
            $(myorders_page.shopping_card).find("span").text(index);
        }
    });

}

function getOrders() {
    var orderId = window.location.hash.substr(1);
    if (orderId !== "") {
        return firebase.database().ref('/orders/' + firebase.auth().currentUser.uid + "/" + orderId).once('value').then(function(snapshot) {
            if (snapshot.val()) {
                snapshot.forEach(function(products) {


                  $(myorders_page.price_list).find('li:first').find('span').text(products.key==="total_amount" ? products.val() :"");
                   $(myorders_page.price_list).find('li:last').find('span').text(products.key==="total_amount" ? products.val() :"");
                    if(products.key!=="order_date" ||products.key!=="order_time"  ||products.key!=="total_amount" ) {
                    products.forEach(function(quantity) {
                        var productName = quantity.val().product_name;
                        var productAmount = quantity.val().product_amount;
                        var productQuantity = quantity.key;
                        var productItems = quantity.val().no_of_items;
                        getProductDetails(products.key,productName, productAmount, productItems, productQuantity)
                    });
                }
                });
                $fadeOutLoader();
            } else {
                $fadeOutLoader();
            }
        });
    } else {
        window.location.href = "index.html"
    }
}

function getProductDetails(productId,productName, productAmount, productItems, productQuantity) {
    return firebase.database().ref('/Products/' + productId).once('value').then(function(products) {
        if (products.val()) {
            let productName = products.val().productName;
            let productImage = products.val().productURL;
            appendCartItems(productName, productImage, productAmount, productItems, productQuantity)
           
        }
    });
}

function appendCartItems(productName, productImage, productPrice, productNoOfItems, quantity) {
    $(myorders_page.product_list).append('<li><div class="pl-thumb"><img src=' + productImage + ' alt=' + productName + '></div><h6>' + productName + '</h6><p>' + quantity + ' ml</p><p>QTY :' + productNoOfItems + '</p><p class="pro-amount">₹' + productPrice  + '</p></li>')

}

$(myorders_page.sign_out_profile).click(function() {
    firebase.auth().signOut().then(function() {
        window.location.href = "index.html"
    }, function(error) {
        console.error('Sign Out Error', error);
    });
});

function $fadeInLoader() {
    $(myorders_page.loader).show();
    $(myorders_page.pre_loader).show();
}

function $fadeOutLoader() {
    $(myorders_page.loader).fadeOut();
    $(myorders_page.pre_loader).delay(1000).fadeOut("slow");
}