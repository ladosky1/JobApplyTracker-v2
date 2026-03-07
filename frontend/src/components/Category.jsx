
function Category({ icon: Icon, title, count, onAdd}){
    return(
            <div className="flex flex-col items-center text-center py-12">
            
                <div className="w-28 h-28 rounded-full bg-white/5 flex items-center justify-center mb-6 transition duration-300 hover:scale-105">
                    <Icon size={28} weight="duotone" className="text-orange-400"/>
                </div>

                <h2 className="text-2xl tracking-[0.3em] text-white font-medium">
                    {title.toUpperCase()}
                </h2>

                <p className="text-white/50 text-sm mt-2">({count} job{count !== 1 && "s"})</p>

                <button 
                    className="mt-6 px-8 py-2 rounded-lg  border border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900"
                    onClick={() => onAdd(title)}>
                    Add Job
                </button>
            </div>
    )
}

export default Category