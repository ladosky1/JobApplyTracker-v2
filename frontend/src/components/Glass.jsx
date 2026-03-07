
function Glass({children}){
    return(
        <div
            className="
                bg-white/20
                backdrop-blur-xl
                border
                border-white/20
                rounded-2xl
                p-10">
            {children}
        </div>
    )
}

export default Glass