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
            $getUserDetails();
            $(myorders_page.sign_in_profile).hide();
            $(myorders_page.sign_out_profile).show();
            $(myorders_page.signed_in_profile).show();
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

function $getUserDetails() {
    return firebase.database().ref('users/' + firebase.auth().currentUser.uid).once('value').then(function(snapshot) {
        if (snapshot.val())
        $(myorders_page.signed_in_profile).find('a').html("Welcome " +snapshot.val().name);
    });
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
            $(myorders_page.shopping_card).find("span").text(index);
        }
    });

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

function getOrders() {
    return firebase.database().ref('/orders/' + firebase.auth().currentUser.uid).once('value').then(function(snapshot) {
        if (snapshot.val()) {
            $(myorders_page.empty_cart).hide();
            $(myorders_page.cart_table).show();
            snapshot.forEach(function(orders) {
                var orderId = orders.key;
                var totalAmount = orders.val().total_amount;
                var orderDate = orders.val().order_date;
                appendCartItems(orderId, totalAmount, orderDate)
            });
            $fadeOutLoader();
        } else {
            $(myorders_page.empty_cart).show();
            $(myorders_page.cart_table).hide();
            $fadeOutLoader();
        }
    });
}

function appendCartItems(orderId, totalAmount, orderDate) {
    var detailsLink= "orderdetails.html#"+orderId;
    $('tbody').append(
        '<tr><td class="product-col"> <img src="img/product-1.jpg"  alt="product"> </td>' +
        '<td class="total-col product-availability"><h4>#' + orderId + '</h4></td>' +
        '<td class="total-col product-availability"><h4>' + orderDate + '</h4></td><td class="total-col product-price"><h4>' + totalAmount + '</h4></td><td class="total-col product-price"><h4><a href='+detailsLink+'>view</a></h4></td></tr>');
}
