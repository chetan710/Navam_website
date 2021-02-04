var checkout_page = {
    "loader": '.loader',
    "pre_loader": "#preloder",
    "sign_in_profile": ".sign-in-profile",
    "sign_out_profile": ".sign-out-profile",
    "signed_in_profile": ".signed-in-profile",
    "shopping_card": ".shopping-card",
    "product_list": ".product-list",
    "price_list": ".price-list",
    "place_order": ".submit-order-btn",
    "message_section": ".message-section",
    "details_section": ".details-section",
    "sign_out_profile": ".sign-out-profile"
}

var isAnonymous;
var isSuccessFull = true;

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        isAnonymous = user.isAnonymous;
        if (!user.isAnonymous) {
            $getUserDetails();
            $(checkout_page.sign_in_profile).hide();
            $(checkout_page.sign_out_profile).show();
            $(checkout_page.signed_in_profile).show();
            $(checkout_page.signed_in_profile).find('a').html("Welcome");
        } else {
            window.location.href = "index.html";
            $(checkout_page.sign_in_profile).show();
            $(checkout_page.sign_out_profile).hide();
            $(checkout_page.signed_in_profile).hide();
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
    getCartItems("get");
});

$(checkout_page.sign_out_profile).click(function() {
    firebase.auth().signOut().then(function() {
        window.location.href = "index.html"
    }, function(error) {
        console.error('Sign Out Error', error);
    });
});

function $getUserDetails() {
    return firebase.database().ref('users/' + firebase.auth().currentUser.uid).once('value').then(function(snapshot) {
        if (snapshot.val()) {
            $("input[name=name]").val(snapshot.val().name);
            $("input[name=phone]").val(snapshot.val().phone);
            $("input[name=address]").val(snapshot.val().address);
            $("input[name=zipcode]").val(snapshot.val().zipCode);
            $("input[name=altaddress]").val(snapshot.val().altAddress);
        }
    });
}

function $fadeInLoader() {
    $(checkout_page.loader).show();
    $(checkout_page.pre_loader).show();
}

function $fadeOutLoader() {
    $(checkout_page.loader).fadeOut();
    $(checkout_page.pre_loader).delay(1000).fadeOut("slow");
}

function $getCartItem() {
    return firebase.database().ref('Cart/' + firebase.auth().currentUser.uid).once('value').then(function(snapshot) {
        if (snapshot.val()) {
            let index = 0;
            snapshot.forEach(function(items) {
                items.forEach(function(subItems) {
                    index++
                });
            });
            $(checkout_page.shopping_card).find("span").text(index);
        }
    });

}

function getCartItems(cartType) {
    return firebase.database().ref('/Cart/' + firebase.auth().currentUser.uid).once('value').then(function(snapshot) {
        if (snapshot.val()) {
            var orderId = new Date().getTime();
            snapshot.forEach(function(product) {
                var productId = product.key;
                product.forEach(function(quantity) {
                    var productQuantity = quantity.key;
                    var productNoOfItems = quantity.val().no_of_items;
                    getProductDetails(productId, productQuantity, productNoOfItems, cartType, orderId)
                });
            });
            $fadeOutLoader();
        }
    });
}

function getProductDetails(productId, quantity, productNoOfItems, cartType, orderId) {
    return firebase.database().ref('/Products/' + productId).once('value').then(function(products) {
        if (products.val()) {
            let productName = products.val().productName;
            let productImage = products.val().productURL;
            let productPrice = products.val().quantity[parseInt(quantity)];
            if (productPrice !== undefined) {
                if (cartType === "get") {
                    appendCartItems(productName, productImage, productPrice, productNoOfItems, quantity);
                    getTotalCartAmount();
                } else {
                    placeOrder(productId, productNoOfItems, quantity, orderId, productPrice,productName);
                }
            }
        }
    });
}

function appendCartItems(productName, productImage, productPrice, productNoOfItems, quantity) {
    $(checkout_page.product_list).append('<li><div class="pl-thumb"><img src=' + productImage + ' alt=' + productName + '></div><h6>' + productName + '</h6><p>' + quantity + ' ml</p><p>QTY :' + productNoOfItems + '</p><p class="pro-amount">₹' + productPrice * productNoOfItems + '</p></li>')

}

function getTotalCartAmount() {
    let totalAmount = 0;
    for (var i = 0; i < $('.pro-amount').length; i++) {
        if ($($('.pro-amount')[i]).text() !== '₹undefined') {
            totalAmount = totalAmount + parseFloat($($('.pro-amount')[i]).text().split('₹')[1]);
        }

    }
    $(checkout_page.price_list).find('li:first').find('span').text('₹' + totalAmount);
    $(checkout_page.price_list).find('li:last').find('span').text('₹' + totalAmount);
}

$(checkout_page.place_order).click(function(e) {
    e.preventDefault();
    $fadeInLoader();
    getCartItems("set");
    if (isSuccessFull) {
        $(checkout_page.message_section).find("h1").text("Thank You for placing order");
        $(checkout_page.message_section).find("p").text("Your order is placed successfully!!! Our customer executive will contact you for payment details");
        $(checkout_page.details_section).hide();
        $(checkout_page.message_section).show();
        $fadeOutLoader();
    } else {

        $(checkout_page.message_section).find("h1").text("Oops something went wrong please try again later");
        $(checkout_page.details_section).show();
        $(checkout_page.message_section).hide();
        $fadeOutLoader();
    }

});

function placeOrder(productId, productNoOfItems, quantity, orderId, productPrice,productName) {
firebase.database().ref('orders/' + firebase.auth().currentUser.uid + "/" + orderId).set({
        total_amount: $(checkout_page.price_list).find('li:last').find('span').text(),
        order_date: new Date().getDay() + "/" + new Date().getMonth() + 1 + "/" + new Date().getFullYear(),
        order_time: new Date().getHours() + ":" + new Date().getMinutes()
    }, (error) => {
        if (error) {
            isSuccessFull = false;
        } else {
        firebase.database().ref('orders/' + firebase.auth().currentUser.uid + "/" + orderId + "/" + productId + "/" + quantity).set({
                productQuantity: quantity,
                no_of_items: productNoOfItems,
                product_name: productName,
                product_amount: productPrice * productNoOfItems
            }, (error) => {
                if (error) {
                    isSuccessFull = false;
                } else {
                    removeCartItems(productId, productNoOfItems, quantity);
                }
            });
        }
    });
}




function removeCartItems(productId, productNoOfItems, quantity) {
    var ref = firebase.database().ref('Cart/' + firebase.auth().currentUser.uid + "/" + productId + "/" + quantity);
    ref.remove();
}