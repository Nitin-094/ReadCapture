$("#select-sorting").on("change", function () {
    let sorting = $(this).val();
    switch (sorting) {
        case "id":
            window.location.href = "/?sort=id"
            break;
        case "rating":
            window.location.href = "/?sort=rating"
            break;
        default:
            break;
    }
});