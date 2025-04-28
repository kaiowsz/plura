import Navigation from "@/components/global/Navigation";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import React from "react"

type Props = {
    children: React.ReactNode;
}

const MainLayout = ({children}: Props) => {
    return (
    <ClerkProvider appearance={{baseTheme: dark}}>
        <main className="h-full">
            <Navigation />
            {children}
        </main> 
    </ClerkProvider>
    )
}

export default MainLayout