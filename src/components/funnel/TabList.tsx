import React from "react"
import { TabsList, TabsTrigger } from "../ui/tabs"
import { Database, Plus, SettingsIcon, SquareStackIcon } from "lucide-react"

type Props = {

}

const TabList = ({}: Props) => {
    return (
    <TabsList className="flex items-center flex-col justify-evenly w-full bg-transparent h-fit gap-4">
        <TabsTrigger value="Settings" className="w-10 h-10 p-0 data-[state=active]:bg-muted">
            <SettingsIcon />
        </TabsTrigger>
        <TabsTrigger value="Components" className="w-10 h-10 p-0 data-[state=active]:bg-muted">
            <Plus />
        </TabsTrigger>
        <TabsTrigger value="Layers" className="w-10 h-10 p-0 data-[state=active]:bg-muted">
            <SquareStackIcon />
        </TabsTrigger>
        <TabsTrigger value="Media" className="w-10 h-10 p-0 data-[state=active]:bg-muted">
            <Database />
        </TabsTrigger>
    </TabsList>
    )
}

export default TabList