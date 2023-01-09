import React from "react"
import Navbar from "../../organisms/Navbar"

const PageHOC = ({ children }: any) => {
	return (
		<div className={`bg-[#60C1ED] min-h-screen min-w-screen h-screen`}>
			<Navbar />
			<div className="h-[90%]">{children}</div>
		</div>
	)
}

export default PageHOC
