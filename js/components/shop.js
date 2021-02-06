var shop_page = {
    "loader": '.loader',
    "pre_loader": "#preloder",
    "sign_in_profile": ".sign-in-profile",
    "sign_out_profile": ".sign-out-profile",
    "signed_in_profile": ".signed-in-profile",
    "product_section": ".product-section",
    "quantity": ".quantity-option",
    "product_item": ".product-item",
    "add_cart": ".add-card",
    "shopping_card": ".shopping-card",
    "sign_out_profile": ".sign-out-profile"
}

var isAnonymous;

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        isAnonymous = user.isAnonymous;
        if (!user.isAnonymous) {
            $getUserDetails();
            $(shop_page.sign_in_profile).hide();
            $(shop_page.sign_out_profile).show();
            $(shop_page.signed_in_profile).show();
        } else {
            $(shop_page.sign_in_profile).show();
            $(shop_page.sign_out_profile).hide();
            $(shop_page.signed_in_profile).hide();
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
    $(shop_page.quantity).eq(0).find('label').css('background-color','#f51167')
    $loadAllProducts(250);
});

function $getUserDetails() {
    return firebase.database().ref('users/' + firebase.auth().currentUser.uid).once('value').then(function(snapshot) {
        if (snapshot.val())
        $(shop_page.signed_in_profile).find('a').html("Welcome " +snapshot.val().name);
    });
}

$(shop_page.sign_out_profile).click(function() {
    firebase.auth().signOut().then(function() {window.location.href="index.html"}, function(error) {
        console.error('Sign Out Error', error);
    });
});

function $fadeInLoader() {
    $(shop_page.loader).show();
    $(shop_page.pre_loader).show();
}
$(shop_page.quantity).click(function(e) {
    e.preventDefault()
    $(shop_page.quantity).find('label').css('background-color','')
    $(this).find('label').css('background-color','#f51167')
    let $selectedQuantity = $(this).find('label').text().split("ml")[0].trim();
    $fadeInLoader();
    $loadAllProducts(parseInt($selectedQuantity))

});
$(document).on('click', shop_page.product_item, function() {
    let hashValue = $(this).parent().attr('id') +"/"+ $(this).find('.pi-text').attr('productQuantity');
    window.location.href = "productdetails.html#" + hashValue
})

function $fadeOutLoader() {
    $(shop_page.loader).fadeOut();
    $(shop_page.pre_loader).delay(1000).fadeOut("slow");
}

function $loadAllProducts(quantity) {
    $(shop_page.product_section).children().remove();
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
        $(shop_page.product_section).append('<div class="col-lg-4 col-sm-6 " id="' + productId + '">' +
            '<div class="product-item">' +
            '<div class="pi-pic"> <div class="tag-sale">' + productAvailability + '</div>' +
            '<img src="' + productImage + '" alt="' + productName + '" width="263px" height="408px">' +
            '<div class="pi-links"><a href="javascript:void(0)" class="add-card"><i class="flaticon-bag"></i><span>ADD TO CART</span></a></div></div>' +
            '<div class="pi-text" productQuantity =' + quantity + ' productAmount=' + products.val().quantity[quantity] + '>' + addPrice(products, quantity) + '<p>' + productName + '</p></div></div></div>')
        
    productAvailability === "Out Of Stock" ? $('.add-card').attr('disabled','disabled') : $('.add-card').attr('disabled','');
    }

}

function addPrice(products, quantity) {
    if (products.val().quantity[quantity] !== undefined) {
        return '<h6>' + quantity + 'ml</h6><h6>₹' + products.val().quantity[quantity] + '</h6>'
    }
    return "<h6>" + quantity + "ml</h6>";
}

$(document).on('click', shop_page.add_cart, function(e) {
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

function $getCartItem() {
    return firebase.database().ref('Cart/' + firebase.auth().currentUser.uid).once('value').then(function(snapshot) {
        if (snapshot.val()) {
            let index = 0;
            snapshot.forEach(function(items) {
                items.forEach(function(subItems){
                 index++
                });
            });
            $(shop_page.shopping_card).find("span").text(index);
        }
    }); 

}