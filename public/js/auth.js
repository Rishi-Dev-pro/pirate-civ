function togglePassword(inputId, button) {

    let input = document.getElementById(inputId);


    if (input.type === "password") {

        input.type = "text";

        button.textContent = "◉";

    } else {

        input.type = "password";

        button.textContent = "◉";

    }

}





