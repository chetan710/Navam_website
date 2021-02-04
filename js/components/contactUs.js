var contactus_page = {
    "product_slider": ".product-slider",
    "loader": '.loader',
    "pre_loader": "#preloder",
    "hero_slider": ".hero-slider",
    "sign_in_profile": ".sign-in-profile",
    "sign_out_profile": ".sign-out-profile",
    "signed_in_profile": ".signed-in-profile",
    "shopping_card": ".shopping-card",
}

var isAnonymous;
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        isAnonymous = user.isAnonymous;
        if (!user.isAnonymous) {
            $getUserDetails();
            $(contactus_page.sign_in_profile).hide();
            $(contactus_page.sign_out_profile).show();
            $(contactus_page.signed_in_profile).show();
        } else {

            $(contactus_page.sign_in_profile).show();
            $(contactus_page.sign_out_profile).hide();
            $(contactus_page.signed_in_profile).hide();
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
});
function $getUserDetails() {
    return firebase.database().ref('users/' + firebase.auth().currentUser.uid).once('value').then(function(snapshot) {
        if (snapshot.val())
        $(contactus_page.signed_in_profile).find('a').html("Welcome " +snapshot.val().name);
    });
}

$(contactus_page.sign_out_profile).click(function() {
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
            $(contactus_page.shopping_card).find("span").text(index);
        }
        
    $fadeOutLoader();
    }); 

}

function $fadeInLoader() {
    $(contactus_page.loader).show();
    $(contactus_page.pre_loader).show();
}


function $fadeOutLoader() {
    $(contactus_page.loader).fadeOut();
    $(contactus_page.pre_loader).delay(1000).fadeOut("slow");
}