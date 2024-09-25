// Modal for deleting book
$(".delete-btn").on("click", function () {
    const book_title = $(this).data("title");
    const book_id = $(this).data("bookid");
    $(".modal-msg").text(`Are you sure want to delete '${book_title}'?`)
    $("#modal-delete-btn").attr("formaction", "/delete/" + book_id);
});

// Modal for deleting note
$(".delete-note-btn").on("click", function () {
    const noteId = $(this).data("noteid");
    $(".modal-msg").text(`Are you sure want to delete this note?`)
    $("#modal-delete-note-btn").attr("formaction", "/delete-note/" + noteId);
});


