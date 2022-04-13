if(window.location.pathname=="/trans"){
    $ondelete=$(".table tbody td a.delete");
    $ondelete.click(function(){
        var id=$(this).attr("data-id")

        var request={
            "url":`http://localhost:3000/user/${id}`,
            "method":"DELETE"
        }
        if(confirm("do you realy want to delete this record?")){
            $.ajax(request).done(function(response){
                alert("Data Deleted Successfully");
                location.reload();
            })
        }
    })
}