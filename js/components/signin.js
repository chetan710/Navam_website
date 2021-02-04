var profile_page = {
    "$create_profile": ".create-profile",
    "$sign_in": ".login",
    "$reset_password": ""

}
$(document).ready(function() {
    $validateForm();
    $validateLoginForm();
    $(profile_page.$create_profile).click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        if ($("form[name='contact-form']").valid()) {
            $craeteUserProfile();
        }
    });

    $(profile_page.$sign_in).click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        if ($("form[name='login-form']").valid()) {
            $signInUser();
        }
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
            }).catch(function(error) {
                console.log('there was an error');
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log(errorCode + ' - ' + errorMessage);
            });
        }
    }).catch(function(error) {
        console.log('there was an error');
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorCode + ' - ' + errorMessage);
    });
}

function $signInUser() {
    firebase.auth().signInWithEmailAndPassword($("input[name=userName]").val(), $("input[name=userPassword]").val())
        .then((user) => {
            if (user) {
                window.location.href="index.html"
            }
        })
        .catch(() => {
            this.setState({
                error: 'Authentication failed',
                loading: false
            });
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