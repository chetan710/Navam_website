var profile_page = {
    "$create_profile": ".create-profile",
    "$sign_in": ".login",
    "$reset_password": "reset-password",
    "sign_out_profile": ".sign-out-profile",
    "sign_in_profile": ".sign-in-profile",
    "sign_out_profile": ".sign-out-profile",
    "signed_in_profile": ".signed-in-profile",
    "loader": '.loader',
    "pre_loader": "#preloder"

}
$(document).ready(function() {
    $validateForm();
    $validateLoginForm();
    $(profile_page.$create_profile).click(function(e) {
        e.preventDefault();
        if ($("form[name='contact-form']").valid()) {
             $fadeInLoader();
            $craeteUserProfile();
        }
    });
    $(profile_page.$sign_in).click(function(e) {
        e.preventDefault();
        if ($("form[name='login-form']").valid()) {
            $signInUser();
        }
    });
     $(profile_page.$reset_password).click(function(e) {
        e.preventDefault();
        firebase.auth().sendPasswordResetEmail('user@example.com');
        location.reload();
    });
});

function $fadeInLoader() {
    $(profile_page.loader).show();
    $(profile_page.pre_loader).show();
}


function $fadeOutLoader() {
    $(profile_page.loader).fadeOut();
    $(profile_page.pre_loader).delay(1000).fadeOut("slow");
}

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        isAnonymous = user.isAnonymous;
        if (!user.isAnonymous) {
            $(profile_page.sign_in_profile).hide();
            $(profile_page.sign_out_profile).show();
            $(profile_page.signed_in_profile).show();
            $(profile_page.signed_in_profile).find('a').html("Welcome");
        } else {
            $(profile_page.sign_in_profile).show();
            $(profile_page.sign_out_profile).hide();
            $(profile_page.signed_in_profile).hide();
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
         $fadeOutLoader();
    }); 

}

$(profile_page.sign_out_profile).click(function() {
    firebase.auth().signOut().then(function() {window.location.href="index.html"}, function(error) {
        console.error('Sign Out Error', error);
    });
});

function $craeteUserProfile() {
    firebase.auth().createUserWithEmailAndPassword($("input[name=email]").val(), $("input[name=password]").val()).then(function(user) {
        if (user) {
            firebase.database().ref('users/' + firebase.auth().currentUser.uid).set({
                name: $("input[name=name]").val(),
                email: $("input[name=email]").val(),
                lastName: $("input[name=lastName]").val(),
                phone: $("input[name=phone]").val(),
                address: $("textarea[name=address]").val(),
                zipCode: $("input[name=zipCode]").val()
            }).then((user) => {
                window.location.href="index.html"
            
        })
        }
    }).catch(function(error) {
        console.log('there was an error');
        var errorCode = error.code;
        var errorMessage = error.message;
         $(profile_page.$create_profile).parent('form').after('<label class="error">'+errorMessage+'</label>')
         $fadeOutLoader();
        console.log(errorCode + ' - ' + errorMessage);
    });
}

function $signInUser() {
    $fadeInLoader();
    firebase.auth().signInWithEmailAndPassword($("input[name=userName]").val(), $("input[name=userPassword]").val())
        .then((user) => {
            if (user) {
                window.location.href="index.html"
            }
        })
        .catch(function(error) {
            $(profile_page.$sign_in).parent('form').after('<label class="error">'+error.message+'</label>')
            $fadeOutLoader();
        });
}

function $validateForm() {
    $("form[name='contact-form']").validate({
        rules: {
            name: "required",
            lastName: "required",
            address: "required",
            email: {
                required: true,
                email: true
            },
            phone: {
                required: true,
                number: true,
                minlength: 10,
                maxlength: 10
            },
            altPhoneNumber: {
                number: true,
                minlength: 10,
                maxlength: 10
            },
            password: {
                required: true,
                minlength: 8,
            },
            zip_code: "required"
        },
        messages: {
            name: "Please enter your first name",
            lastName: "Please enter your first name",
            address: "Please enter your address",
            email: "Please enter a valid email address",
            password: "Please enter password",
            phone: "Please enter  valid phone number",
            zip_code: "Please enter Zip Code",
            address: "Please enter address"
        },
    });
}


function $validateLoginForm() {
    $("form[name='login-form']").validate({
        rules: {
            userName: {
                required: true,
                email: true
            },
            userPassword: "required"
        },
        messages: {
            userName: "Please enter a valid email address",
            userPassword: "Please enter password"
        },
    });
}

