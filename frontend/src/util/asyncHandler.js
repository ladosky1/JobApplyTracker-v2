import toast from "react-hot-toast";

export const asyncHandler = async (fn, options = {}) => {
    const { loadingMsg, successMsg } = options;

    let toastId;

    try {
        if (loadingMsg) {
            toastId = toast.loading(loadingMsg);
        }

        const result = await fn();

        if (successMsg){
            toast.success(successMsg, {
                id: toastId,
            })
        } else if (toastId){
            toast.dismiss(toastId);
        }

        return result;
    } catch (err) {
        toast.error(err.response?.data?.message || "Something went wrong");

        if(toastId) toast.dismiss(toastId);

        throw err;
    }
}