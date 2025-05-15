import Loading from "@/components/global/Loading"
import React from "react"

type Props = {}

const LoadingAgencyPage = ({}: Props) => {
    return (
    <div className="h-screen w-screen flex justify-center items-center">
        <Loading />
    </div>
    )
}

export default LoadingAgencyPage